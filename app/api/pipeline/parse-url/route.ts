import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseWorkshopUrl } from '@/lib/pipeline/url-parser'

export const maxDuration = 60

export async function POST(req: Request) {
  // Auth guard
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.url || !body?.campaignId) {
    return NextResponse.json({ error: 'url and campaignId are required' }, { status: 400 })
  }

  const { url, campaignId } = body as { url: string; campaignId: string }

  // Validate campaign belongs to user
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, region, event_type, title')
    .eq('id', campaignId)
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  // Parse the workshop URL
  const parsed = await parseWorkshopUrl(url)

  // Update campaign with extracted data (only overwrite if not already set)
  const updates: Record<string, string> = {}
  if (parsed.region && !campaign.region) {
    updates.region = parsed.region
  }
  if (parsed.eventType && !campaign.event_type) {
    updates.event_type = parsed.eventType
  }
  // Update title if campaign has no custom title and we extracted one
  if (parsed.title && (!campaign.title || campaign.title === 'New Campaign')) {
    updates.title = parsed.title
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('campaigns').update(updates).eq('id', campaignId)
  }

  return NextResponse.json({
    parsed,
    campaignUpdated: Object.keys(updates).length > 0,
    updates,
  })
}
