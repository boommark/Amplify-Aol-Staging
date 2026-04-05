import { createClient } from '@/lib/supabase/server'
import { getUserCampaigns, createCampaign } from '@/lib/db/campaigns'
import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const campaigns = await getUserCampaigns()

  // Enrich each campaign with thumbnail_url (first ad_creative asset) and asset_count
  const enriched = await Promise.all(
    campaigns.map(async (campaign) => {
      const [thumbnailRes, countRes] = await Promise.all([
        supabase
          .from('campaign_assets')
          .select('s3_url')
          .eq('campaign_id', campaign.id)
          .eq('asset_type', 'ad_creative')
          .order('created_at', { ascending: true })
          .limit(1),
        supabase
          .from('campaign_assets')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id),
      ])

      const thumbnail_url = thumbnailRes.data?.[0]?.s3_url ?? null
      const asset_count = countRes.count ?? 0

      return { ...campaign, thumbnail_url, asset_count }
    })
  )

  return NextResponse.json(enriched)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { eventType, region } = await req.json()
  if (!eventType) return new Response('eventType required', { status: 400 })

  const campaign = await createCampaign({
    userId: user.id,
    eventType,
    region,
  })
  return NextResponse.json(campaign, { status: 201 })
}
