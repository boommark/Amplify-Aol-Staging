import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runResearchPipeline, addResearchNote } from '@/lib/pipeline/research'

export const maxDuration = 300

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json()
  const { action, campaignId, region, eventType, note, dimension } = body

  if (!campaignId) {
    return new Response('Campaign ID required', { status: 400 })
  }

  // Validate campaign exists and belongs to user (RLS handles this, but explicit check)
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, region, event_type')
    .eq('id', campaignId)
    .single()
  if (!campaign) {
    return new Response('Campaign not found', { status: 404 })
  }

  if (action === 'add_note') {
    if (!note) return new Response('Note required', { status: 400 })
    await addResearchNote({ campaignId, note, dimension })
    return NextResponse.json({ success: true })
  }

  // Default: run research pipeline
  if (!region || !eventType) {
    return new Response('Region and event type required', { status: 400 })
  }

  try {
    const results = await runResearchPipeline({
      campaignId,
      region,
      eventType,
    })

    return NextResponse.json({
      success: true,
      dimensions: results.length,
      results: results.map((r) => ({
        dimension: r.dimension,
        findings: r.findings,
        sources: r.sources,
      })),
    })
  } catch (error) {
    console.error('Research pipeline error:', error)
    return new Response(
      JSON.stringify({ error: 'Research pipeline failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
