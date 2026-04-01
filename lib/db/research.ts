import { createClient } from '@/lib/supabase/server'

export type ResearchDimension =
  | 'spirituality'
  | 'mental_health'
  | 'sleep_health'
  | 'relationships'
  | 'local_idioms'
  | 'cultural_sensitivities'
  | 'seasonal'

export interface ResearchResult {
  id: string
  campaign_id: string
  dimension: ResearchDimension
  findings: Record<string, unknown>
  sources: Record<string, unknown> | null
  created_at: string
}

/**
 * Insert a research dimension result into campaign_research.
 * Returns the inserted row. Throws on Supabase error.
 */
export async function saveResearchDimension(
  campaignId: string,
  dimension: ResearchDimension,
  findings: Record<string, unknown>,
  sources?: Record<string, unknown>
): Promise<ResearchResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaign_research')
    .insert({
      campaign_id: campaignId,
      dimension,
      findings,
      sources: sources ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`saveResearchDimension failed: ${error.message}`)
  return data as ResearchResult
}

/**
 * Retrieve all research dimensions for a campaign, ordered by creation time.
 */
export async function getResearchForCampaign(
  campaignId: string
): Promise<ResearchResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaign_research')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`getResearchForCampaign failed: ${error.message}`)
  return (data ?? []) as ResearchResult[]
}

/**
 * Find reusable research from a previous campaign in the same region.
 * Returns the most recent matching campaign's research, or null if none found.
 * Excludes the current campaign (excludeCampaignId).
 */
export async function findReusableResearch(
  region: string,
  excludeCampaignId: string
): Promise<{ campaignId: string; campaignTitle: string; research: ResearchResult[] } | null> {
  const supabase = await createClient()

  // Find the most recent campaign in the same region (excluding current)
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id, title')
    .eq('region', region)
    .neq('id', excludeCampaignId)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (campError || !campaigns || campaigns.length === 0) return null

  const campaign = campaigns[0]

  // Fetch up to 7 dimensions from that campaign
  const { data: research, error: resError } = await supabase
    .from('campaign_research')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('created_at', { ascending: true })
    .limit(7)

  if (resError || !research || research.length === 0) return null

  return {
    campaignId: campaign.id,
    campaignTitle: campaign.title ?? 'Untitled campaign',
    research: research as ResearchResult[],
  }
}
