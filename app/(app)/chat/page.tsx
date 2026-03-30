import { CampaignTypeSelector } from '@/components/campaigns/CampaignTypeSelector'

// New campaign page — renders campaign type selector
// Server Component that wraps the client CampaignTypeSelector
export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-slate-900 md:text-3xl"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            Start a New Campaign
          </h1>
          <p className="mt-1 text-slate-500" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Choose a campaign type to begin
          </p>
        </div>

        <CampaignTypeSelector />
      </div>
    </div>
  )
}
