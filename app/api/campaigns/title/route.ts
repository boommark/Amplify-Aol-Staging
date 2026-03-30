import { createClient } from '@/lib/supabase/server'
import { generateCampaignTitle } from '@/lib/ai/auto-title'
import { updateCampaignTitle } from '@/lib/db/campaigns'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { campaignId, firstMessage } = await req.json()
  if (!campaignId || !firstMessage) return new Response('Missing fields', { status: 400 })

  const title = await generateCampaignTitle(firstMessage)
  await updateCampaignTitle(campaignId, title)

  return NextResponse.json({ title })
}
