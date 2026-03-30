export interface Campaign {
  id: string
  user_id: string
  title: string | null
  status: 'draft' | 'active' | 'archived'
  region: string | null
  event_type: string | null
  share_token: string | null
  created_at: string
  updated_at: string
}

export interface CampaignMessage {
  id: string
  campaign_id: string
  role: 'user' | 'assistant' | 'system'
  content: string | null
  parts: unknown[] | null
  model: string | null
  created_at: string
}
