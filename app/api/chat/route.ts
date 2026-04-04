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

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
} as const

function emitSSE(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  action: string,
  data: Record<string, unknown>
) {
  const event = JSON.stringify({ pipelineResponse: true, action, data })
  controller.enqueue(encoder.encode(`data: ${event}\n\n`))
}

function emitStatus(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  phase: string,
  text: string
) {
  emitSSE(controller, encoder, 'pipeline_status', { phase, text })
}

function emitPhaseSummary(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  summary: {
    phase: string
    stepNumber: number
    totalSteps: number
    summaryText: string
    nextPhaseDescription: string | null
  }
) {
  emitSSE(controller, encoder, 'phase_summary', summary)
}

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
          emitSSE(controller, encoder, 'url_parsing', { url: urlIntent.url })
          emitStatus(controller, encoder, 'url_parse', 'Extracting workshop details...')

          // Parse the URL
          const parsed = await parseWorkshopUrl(urlIntent.url)
          emitStatus(controller, encoder, 'url_parse', `Found: ${parsed.title || 'workshop'} in ${parsed.region || 'your area'}`)

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

          // Emit completion and phase summary
          emitSSE(controller, encoder, 'url_parse_complete', { parsed })
          emitPhaseSummary(controller, encoder, {
            phase: 'url_parse',
            stepNumber: 1,
            totalSteps: 4,
            summaryText: `Extracted details for **${parsed.title || 'workshop'}** in **${parsed.region || 'your area'}**${parsed.date ? ' on ' + parsed.date : ''}.${parsed.teacher ? ' Teacher: ' + parsed.teacher + '.' : ''}`,
            nextPhaseDescription: 'Research will analyze your local market across 6 dimensions: mental health trends, spiritual interests, cultural context, seasonal events, relationships, and wellness patterns.',
          })
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
    const skipReuse = pipelineData?.skipReuse === true

    // Check for reusable research first (skip if user chose "Run fresh")
    const reusable = skipReuse ? null : await findReusableResearch(intent.region, campaignId)

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
          const dimensionLabels: Record<string, string> = {
            mental_health: 'mental health trends',
            spirituality: 'spiritual interests',
            cultural_sensitivities: 'cultural context',
            seasonal: 'seasonal events',
            relationships: 'relationship dynamics',
            sleep_health: 'sleep and wellness',
          }

          emitStatus(controller, encoder, 'research', `Starting research for ${intent.region}...`)

          const results = await runResearchPipeline({
            campaignId,
            region: intent.region,
            eventType: (intent as { region: string; eventType: string }).eventType,
            courseDate: (intent as { eventDate?: string }).eventDate || undefined,
            onDimensionStart: (dimension) => {
              emitStatus(controller, encoder, 'research', `Researching ${dimensionLabels[dimension] || dimension} in ${intent.region}...`)
            },
            onDimensionComplete: (result) => {
              emitSSE(controller, encoder, 'research_dimension', {
                dimension: result.dimension,
                findings: result.findings,
                sources: result.sources,
              })
              emitStatus(controller, encoder, 'research', `Found insights on ${dimensionLabels[result.dimension] || result.dimension}`)
            },
          })

          // Send completion event with phase summary
          emitSSE(controller, encoder, 'research_complete', { dimensionCount: results.length })
          emitPhaseSummary(controller, encoder, {
            phase: 'research',
            stepNumber: 2,
            totalSteps: 4,
            summaryText: `Completed research across ${results.length} dimensions for ${intent.region}. Key insights are ready for review.`,
            nextPhaseDescription: `Wisdom will find relevant Gurudev quotes that resonate with your audience's needs.`,
          })
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
    try {
      const result = await runCompetitorScan({
        region: campaign.region || '',
        eventType: campaign.event_type || '',
      })
      return NextResponse.json({
        pipelineResponse: true,
        action: 'competitor_complete',
        data: { findings: result.findings },
      })
    } catch (error) {
      console.error('Competitor scan error:', error)
      return NextResponse.json({
        pipelineResponse: true,
        action: 'error',
        data: { message: 'Competitor scan failed. Please try again.' },
      })
    }
  }

  // --- WISDOM: Stream status updates, then emit quotes with images ---
  if (intent.type === 'wisdom' || intent.type === 'different_topic') {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          emitStatus(controller, encoder, 'wisdom', 'Starting wisdom pipeline...')

          const result = await runWisdomPipeline({
            campaignId,
            onStatus: (text) => emitStatus(controller, encoder, 'wisdom', text),
          })

          if (result.crisisFlag) {
            emitSSE(controller, encoder, 'crisis_flag', {
              message: 'I noticed this topic may touch on emotional crisis. Here are some support resources:',
              helplines: [
                { name: 'iCall', number: '9152987821', country: 'India' },
                { name: 'National Suicide Prevention Lifeline', number: '988', country: 'US' },
                { name: 'Crisis Text Line', text: 'HOME to 741741', country: 'US' },
              ],
            })
            controller.close()
            return
          }

          if (result.timedOut) {
            emitSSE(controller, encoder, 'wisdom_timeout', {
              message: 'Wisdom unavailable. You can continue to copy generation with just the research context.',
            })
            controller.close()
            return
          }

          // Generate quote images
          emitStatus(controller, encoder, 'wisdom', 'Creating quote images...')
          const quoteTexts = result.quotes.map((q, i) => ({ quoteText: q.medium, quoteIndex: i }))
          const imageUrls = await generateQuoteImages({
            quotes: quoteTexts,
            userId: user.id,
            campaignId,
          })

          const quotesWithImages = result.quotes.map((quote, i) => ({
            ...quote,
            imageUrl: imageUrls[i] || undefined,
          }))

          emitSSE(controller, encoder, 'wisdom_complete', { quotes: quotesWithImages })
          emitPhaseSummary(controller, encoder, {
            phase: 'wisdom',
            stepNumber: 3,
            totalSteps: 4,
            summaryText: `Found ${quotesWithImages.length} relevant Gurudev quotes with images.`,
            nextPhaseDescription: 'Copy generation will create channel-specific marketing content using your research insights and wisdom quotes.',
          })
          controller.close()
        } catch (error) {
          console.error('Wisdom pipeline error:', error)
          emitSSE(controller, encoder, 'wisdom_timeout', {
            message: 'Wisdom unavailable right now. You can continue to copy generation with just the research context.',
          })
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: SSE_HEADERS })
  }

  if (intent.type === 'copy_generate') {
    const channels = pipelineData?.channels?.length
      ? pipelineData.channels
      : ['email', 'whatsapp', 'instagram', 'facebook', 'flyer']

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          emitStatus(controller, encoder, 'copy', 'Packaging research and wisdom context...')

          const results = await generateAllChannels({
            campaignId,
            channels,
            region: campaign.region || '',
            eventType: campaign.event_type || '',
            workshopDetails: pipelineData?.workshopDetails,
            onStatus: (text) => emitStatus(controller, encoder, 'copy', text),
            onChannelComplete: (copy) => {
              emitStatus(controller, encoder, 'copy', `${copy.channel} copy ready`)
            },
          })

          emitSSE(controller, encoder, 'copy_complete', { copies: results })
          emitPhaseSummary(controller, encoder, {
            phase: 'copy',
            stepNumber: 4,
            totalSteps: 4,
            summaryText: `Generated copy for ${results.length} channel${results.length !== 1 ? 's' : ''}: ${[...new Set(results.map(r => r.channel))].join(', ')}.`,
            nextPhaseDescription: null,
          })
          controller.close()
        } catch (error) {
          console.error('Copy generation error:', error)
          emitSSE(controller, encoder, 'error', { message: 'Copy generation failed. Please try again.' })
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: SSE_HEADERS })
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
