import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runStreamingTask } from '@/lib/ai/orchestrator'
import { detectPipelineIntent } from '@/lib/pipeline/orchestrator'
import { runResearchPipeline, addResearchNote, packageResearchContext } from '@/lib/pipeline/research'
import { runCompetitorScan } from '@/lib/pipeline/competitor'
import { runWisdomPipeline } from '@/lib/pipeline/wisdom'
import { generateAllChannels, refineChannelCopy } from '@/lib/pipeline/copy-generation'
import { generateQuoteImages } from '@/lib/pipeline/quote-image'
import { findReusableResearch, getResearchForCampaign } from '@/lib/db/research'
import { parseWorkshopUrl } from '@/lib/pipeline/url-parser'

export const maxDuration = 300

export async function POST(req: Request) {
  // AUTH FIRST — before any AI SDK usage
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, campaignId, tone = 'inspiring', pipelineAction, pipelineData } = await req.json()

  // Validate required fields
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response('Messages required', { status: 400 })
  }
  if (!campaignId) {
    return new Response('Campaign ID required', { status: 400 })
  }

  // Validate campaign exists AND fetch region/event_type for pipeline routing
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, region, event_type')
    .eq('id', campaignId)
    .single()
  if (!campaign) {
    return new Response('Campaign not found', { status: 404 })
  }

  // Persist user message (the latest one) after campaign validation
  const lastUserMsg = messages[messages.length - 1]
  if (lastUserMsg?.role === 'user') {
    // Extract text content — handle both UIMessage (parts[]) and plain (content) formats
    const textContent = lastUserMsg.content
      || lastUserMsg.parts?.filter((p: { type: string }) => p.type === 'text')
          .map((p: { text: string }) => p.text).join('\n')
      || ''

    await supabase.from('campaign_messages').insert({
      campaign_id: campaignId,
      role: 'user',
      content: textContent,
      parts: [{ type: 'text', text: textContent }],
    })
  }

  // Update campaign updated_at to support sidebar recency sorting
  await supabase
    .from('campaigns')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', campaignId)

  // --- PIPELINE ROUTING ---
  const userText = lastUserMsg?.content
    || lastUserMsg?.parts?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text).join('\n')
    || ''

  // Determine pipeline context from DB (what has been completed for this campaign)
  const existingResearch = await getResearchForCampaign(campaignId)
  const hasResearch = existingResearch.length > 0

  const { data: wisdomAssets } = await supabase
    .from('campaign_assets')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('asset_type', 'quote_image')
    .limit(1)
  const hasWisdom = (wisdomAssets?.length || 0) > 0

  const { data: copyAssets } = await supabase
    .from('campaign_assets')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('asset_type', 'copy')
    .limit(1)
  const hasCopy = (copyAssets?.length || 0) > 0

  // Use explicit pipelineAction (from client action chips) or detect intent from message
  const intent = pipelineAction
    ? ({ type: pipelineAction, ...pipelineData } as Awaited<ReturnType<typeof detectPipelineIntent>>)
    : await detectPipelineIntent(userText, {
        hasResearch,
        hasWisdom,
        hasCopy,
        campaignRegion: campaign.region || undefined,
        campaignEventType: campaign.event_type || undefined,
      })

  // --- URL PARSE: Parse workshop URL, update campaign, then stream research ---
  if (intent.type === 'url_parse' && 'url' in intent) {
    const urlIntent = intent as { type: 'url_parse'; url: string }
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Emit parsing-started event so UI can show progress
          const parsingEvent = JSON.stringify({
            pipelineResponse: true,
            action: 'url_parsing',
            data: { url: urlIntent.url },
          })
          controller.enqueue(encoder.encode(`data: ${parsingEvent}\n\n`))

          // Parse the URL
          const parsed = await parseWorkshopUrl(urlIntent.url)

          // Update campaign with extracted data
          const updates: Record<string, string> = {}
          if (parsed.region && !campaign.region) updates.region = parsed.region
          if (parsed.eventType && !campaign.event_type) updates.event_type = parsed.eventType
          if (parsed.title) updates.title = parsed.title
          if (Object.keys(updates).length > 0) {
            await supabase.from('campaigns').update(updates).eq('id', campaignId)
          }

          // Emit parsed event with extracted data
          const parsedEvent = JSON.stringify({
            pipelineResponse: true,
            action: 'url_parsed',
            data: { parsed, updates },
          })
          controller.enqueue(encoder.encode(`data: ${parsedEvent}\n\n`))

          // Emit completion and close — do NOT auto-trigger research.
          // Let the user review parsed details and decide when to start research.
          const doneEvent = JSON.stringify({
            pipelineResponse: true,
            action: 'url_parse_complete',
            data: { parsed },
          })
          controller.enqueue(encoder.encode(`data: ${doneEvent}\n\n`))
          controller.close()
        } catch (error) {
          console.error('URL parse + research error:', error)
          const errorEvent = JSON.stringify({
            pipelineResponse: true,
            action: 'error',
            data: { message: 'Failed to parse URL or run research. Please try again.' },
          })
          controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  // --- RESEARCH: Progressive streaming via ReadableStream ---
  // Each research dimension streams as a separate SSE event as it completes.
  // This implements the user decision: "progressive, not batch"
  if (intent.type === 'research' && 'region' in intent) {
    // Check for reusable research first
    const reusable = await findReusableResearch(intent.region, campaignId)

    // Update campaign region/event_type if not set
    if (!campaign.region || !campaign.event_type) {
      await supabase.from('campaigns').update({
        region: intent.region,
        event_type: (intent as { region: string; eventType: string }).eventType,
      }).eq('id', campaignId)
    }

    if (reusable) {
      // Return reuse prompt (single response, not progressive)
      return NextResponse.json({
        pipelineResponse: true,
        action: 'research_reuse_prompt',
        data: {
          reusableCampaignId: reusable.campaignId,
          reusableCampaignTitle: reusable.campaignTitle,
          region: intent.region,
          eventType: (intent as { region: string; eventType: string }).eventType,
        },
      })
    }

    // Progressive streaming: return a ReadableStream that emits
    // newline-delimited JSON events as each dimension completes
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await runResearchPipeline({
            campaignId,
            region: intent.region,
            eventType: (intent as { region: string; eventType: string }).eventType,
            courseDate: (intent as { eventDate?: string }).eventDate || undefined,
            onDimensionComplete: (result) => {
              // Stream each dimension as it resolves
              const event = JSON.stringify({
                pipelineResponse: true,
                action: 'research_dimension',
                data: {
                  dimension: result.dimension,
                  findings: result.findings,
                  sources: result.sources,
                },
              })
              controller.enqueue(encoder.encode(`data: ${event}\n\n`))
            },
          })

          // Send completion event after all dimensions resolve
          const doneEvent = JSON.stringify({
            pipelineResponse: true,
            action: 'research_complete',
            data: { dimensionCount: 7 },
          })
          controller.enqueue(encoder.encode(`data: ${doneEvent}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Research pipeline error:', error)
          const errorEvent = JSON.stringify({
            pipelineResponse: true,
            action: 'error',
            data: { message: 'Research pipeline failed. Please try again.' },
          })
          controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  if (intent.type === 'add_note' && 'note' in intent) {
    await addResearchNote({ campaignId, note: (intent as { type: 'add_note'; note: string }).note })
    return NextResponse.json({
      pipelineResponse: true,
      action: 'note_added',
      data: { note: (intent as { type: 'add_note'; note: string }).note },
    })
  }

  if (intent.type === 'competitor_scan') {
    const result = await runCompetitorScan({
      region: campaign.region || '',
      eventType: campaign.event_type || '',
    })
    return NextResponse.json({
      pipelineResponse: true,
      action: 'competitor_complete',
      data: { findings: result.findings },
    })
  }

  // --- WISDOM: Await quote images and merge URLs into response ---
  // generateQuoteImages is AWAITED (not fire-and-forget) so imageUrls are
  // included in the response and QuoteCard can render images on first paint.
  if (intent.type === 'wisdom' || intent.type === 'different_topic') {
    const result = await runWisdomPipeline({ campaignId })

    if (result.crisisFlag) {
      return NextResponse.json({
        pipelineResponse: true,
        action: 'crisis_flag',
        data: {
          message: 'I noticed this topic may touch on emotional crisis. Here are some support resources:',
          helplines: [
            { name: 'iCall', number: '9152987821', country: 'India' },
            { name: 'National Suicide Prevention Lifeline', number: '988', country: 'US' },
            { name: 'Crisis Text Line', text: 'HOME to 741741', country: 'US' },
          ],
        },
      })
    }

    if (result.timedOut) {
      return NextResponse.json({
        pipelineResponse: true,
        action: 'wisdom_timeout',
        data: { message: 'Wisdom unavailable — continuing with your research context.' },
      })
    }

    // Generate quote images and AWAIT them so URLs can be included in the response.
    // If image generation fails for any quote, that quote renders without an image (imageUrl remains undefined).
    const quoteTexts = result.quotes.map((q, i) => ({ quoteText: q.medium, quoteIndex: i }))
    const imageUrls = await generateQuoteImages({
      quotes: quoteTexts,
      userId: user.id,
      campaignId,
    })

    // Merge imageUrls into quotes
    const quotesWithImages = result.quotes.map((quote, i) => ({
      ...quote,
      imageUrl: imageUrls[i] || undefined,
    }))

    return NextResponse.json({
      pipelineResponse: true,
      action: 'wisdom_complete',
      data: { quotes: quotesWithImages },
    })
  }

  if (intent.type === 'copy_generate') {
    const channels = pipelineData?.channels?.length
      ? pipelineData.channels
      : ['email', 'whatsapp', 'instagram', 'facebook', 'flyer']

    // Package research context for copy generation (unused var suppressed — passed to generateAllChannels)
    await packageResearchContext(campaignId)

    const results = await generateAllChannels({
      campaignId,
      channels,
      region: campaign.region || '',
      eventType: campaign.event_type || '',
      // No language parameter — translation support deferred (CONT-08)
    })

    return NextResponse.json({
      pipelineResponse: true,
      action: 'copy_complete',
      data: { copies: results },
    })
  }

  if (intent.type === 'copy_refine' && 'channel' in intent && 'instruction' in intent) {
    const refineIntent = intent as { type: 'copy_refine'; channel: string; instruction: string }

    // Find the most recent copy asset for this channel
    const { data: assets } = await supabase
      .from('campaign_assets')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('asset_type', 'copy')
      .eq('channel', refineIntent.channel)
      .order('created_at', { ascending: false })
      .limit(1)

    if (assets && assets.length > 0) {
      const result = await refineChannelCopy({
        assetId: assets[0].id,
        campaignId,
        channel: refineIntent.channel,
        instruction: refineIntent.instruction,
      })
      return NextResponse.json({
        pipelineResponse: true,
        action: 'copy_refined',
        data: { copy: result },
      })
    }
  }

  // --- STANDARD CHAT (fallback) ---
  // Delegate ALL AI logic to the orchestrator — model lookup, prompt loading,
  // rendering, and sliding window are handled inside runStreamingTask.
  try {
    const result = await runStreamingTask('chat.orchestrate', {
      messages,
      variables: { tone },
      onFinish: async ({ text }) => {
        // Persist assistant message ONLY after stream completes (not mid-stream)
        await supabase.from('campaign_messages').insert({
          campaign_id: campaignId,
          role: 'assistant',
          content: text,
          parts: [{ type: 'text', text }],
          model: 'claude-sonnet-4-5',
        })
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
