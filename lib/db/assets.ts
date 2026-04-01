import { createClient } from '@/lib/supabase/server'

export type AssetType = 'image' | 'copy' | 'ad_creative' | 'quote_image'

export interface CampaignAsset {
  id: string
  campaign_id: string
  asset_type: AssetType
  channel: string | null
  content: string | null
  s3_key: string | null
  s3_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

/**
 * Insert a campaign asset into campaign_assets.
 * Returns the inserted row. Throws on Supabase error.
 */
export async function saveAsset(params: {
  campaignId: string
  assetType: AssetType
  channel?: string
  content?: string
  s3Key?: string
  s3Url?: string
  metadata?: Record<string, unknown>
}): Promise<CampaignAsset> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_assets')
    .insert({
      campaign_id: params.campaignId,
      asset_type: params.assetType,
      channel: params.channel ?? null,
      content: params.content ?? null,
      s3_key: params.s3Key ?? null,
      s3_url: params.s3Url ?? null,
      metadata: params.metadata ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`saveAsset failed: ${error.message}`)
  return data as CampaignAsset
}

/**
 * Retrieve all assets for a campaign, optionally filtered by asset type.
 * Results ordered by created_at ascending.
 */
export async function getAssetsForCampaign(
  campaignId: string,
  assetType?: AssetType
): Promise<CampaignAsset[]> {
  const supabase = await createClient()

  let query = supabase
    .from('campaign_assets')
    .select('*')
    .eq('campaign_id', campaignId)

  if (assetType) {
    query = query.eq('asset_type', assetType)
  }

  const { data, error } = await query.order('created_at', { ascending: true })

  if (error) throw new Error(`getAssetsForCampaign failed: ${error.message}`)
  return (data ?? []) as CampaignAsset[]
}

/**
 * Update the content of an existing asset by ID.
 */
export async function updateAssetContent(
  assetId: string,
  content: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('campaign_assets')
    .update({ content })
    .eq('id', assetId)

  if (error) throw new Error(`updateAssetContent failed: ${error.message}`)
}
