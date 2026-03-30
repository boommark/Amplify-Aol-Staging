import { createClient } from '@/lib/supabase/server'
import { getUserCampaigns, createCampaign } from '@/lib/db/campaigns'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const campaigns = await getUserCampaigns()
  return NextResponse.json(campaigns)
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
