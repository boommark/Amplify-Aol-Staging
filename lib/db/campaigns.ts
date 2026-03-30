import { createClient } from '@/lib/supabase/server'
import type { Campaign, CampaignMessage } from '@/types/campaign'
import type { UIMessage } from 'ai'

export async function getUserCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('id, title, status, region, event_type, created_at, updated_at, user_id, share_token')
    .order('updated_at', { ascending: false })
    .limit(50)
  return (data ?? []) as Campaign[]
}

export async function getCampaignWithMessages(campaignId: string) {
  const supabase = await createClient()
  const [campaignRes, messagesRes] = await Promise.all([
    supabase.from('campaigns').select('*').eq('id', campaignId).single(),
    supabase
      .from('campaign_messages')
      .select('id, campaign_id, role, content, parts, model, created_at')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true }),
  ])
  return {
    campaign: campaignRes.data as Campaign | null,
    messages: (messagesRes.data ?? []) as CampaignMessage[],
  }
}

/**
 * Deserialize CampaignMessage[] (from Supabase) into AI SDK Message[] format.
 * CampaignMessage.parts is stored as unknown[] (jsonb). This function casts each
 * part back to the typed AI SDK message part format so useChat can consume them.
 */
export function deserializeCampaignMessages(dbMessages: CampaignMessage[]): UIMessage[] {
  return dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as UIMessage['role'],
    content: msg.content ?? '',
    parts: (msg.parts ?? []) as UIMessage['parts'],
    createdAt: new Date(msg.created_at),
  }))
}

export async function createCampaign(params: {
  userId: string
  eventType: string
  region?: string
}): Promise<Campaign> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: params.userId,
      event_type: params.eventType,
      region: params.region ?? null,
      status: 'draft',
    })
    .select()
    .single()
  if (error) throw error
  return data as Campaign
}

export async function updateCampaignTitle(campaignId: string, title: string) {
  const supabase = await createClient()
  await supabase.from('campaigns').update({ title }).eq('id', campaignId)
}
