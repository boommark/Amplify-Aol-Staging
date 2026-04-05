import { adminClient } from '@/lib/supabase/admin'
import { ShareableCampaignView } from '@/components/campaigns/ShareableCampaignView'
import { notFound } from 'next/navigation'

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Use admin/service-role client to bypass RLS for share token lookup
  // This is safe because we validate via share_token (unguessable UUID)
  const { data: campaign } = await adminClient
    .from('campaigns')
    .select('id, title, region, event_type, created_at')
    .eq('share_token', token)
    .single()

  if (!campaign) notFound()

  const { data: assets } = await adminClient
    .from('campaign_assets')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('created_at')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <p className="text-sm text-slate-500 mb-1">Shared Campaign</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {campaign.title || 'Untitled Campaign'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {campaign.region}
            {campaign.event_type ? ` \u00B7 ${campaign.event_type}` : ''}
          </p>
        </div>
        <ShareableCampaignView assets={assets || []} />
      </div>
    </div>
  )
}
