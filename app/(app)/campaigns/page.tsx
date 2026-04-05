import { CampaignBrowser } from '@/components/campaigns/CampaignBrowser'

export default function CampaignsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Work Sans, sans-serif' }}>
        Campaigns
      </h1>
      <CampaignBrowser />
    </div>
  )
}
