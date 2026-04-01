import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAllChannels, refineChannelCopy } from '@/lib/pipeline/copy-generation'

export const maxDuration = 300

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json()
  const { action, campaignId } = body

  if (!campaignId) {
    return new Response('Campaign ID required', { status: 400 })
  }

  // Validate campaign exists and belongs to user (RLS handles access control)
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, region, event_type')
    .eq('id', campaignId)
    .single()
  if (!campaign) {
    return new Response('Campaign not found', { status: 404 })
  }

  if (action === 'refine') {
    const { assetId, channel, instruction } = body
    if (!assetId || !channel || !instruction) {
      return new Response('Asset ID, channel, and instruction required', { status: 400 })
    }

    try {
      const result = await refineChannelCopy({
        assetId,
        campaignId,
        channel,
        instruction,
      })
      return NextResponse.json({ success: true, copy: result })
    } catch (error) {
      console.error('Copy refinement error:', error)
      return new Response(
        JSON.stringify({ error: 'Copy refinement failed. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Default: generate all selected channels
  const { channels, region, eventType, eventDate, wisdomContext } = body
  if (!channels || !Array.isArray(channels) || channels.length === 0) {
    return new Response('At least one channel required', { status: 400 })
  }
  if (!region || !eventType) {
    return new Response('Region and event type required', { status: 400 })
  }

  try {
    const results = await generateAllChannels({
      campaignId,
      channels,
      region: region || campaign.region,
      eventType: eventType || campaign.event_type,
      eventDate,
      wisdomContext,
    })

    return NextResponse.json({
      success: true,
      copies: results,
    })
  } catch (error) {
    console.error('Copy generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Copy generation failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
