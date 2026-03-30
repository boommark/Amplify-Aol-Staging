import { redirect } from 'next/navigation'
import { getCampaignWithMessages, deserializeCampaignMessages } from '@/lib/db/campaigns'

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>
}

// Dynamic route: loads campaign history and renders chat thread
// Server Component — data fetched server-side, initial messages passed as props
export default async function CampaignPage({ params }: CampaignPageProps) {
  const { campaignId } = await params
  const { campaign, messages } = await getCampaignWithMessages(campaignId)

  // Campaign not found or unauthorized — redirect to new campaign page
  if (!campaign) {
    redirect('/chat')
  }

  // Deserialize DB messages to AI SDK UIMessage format for client consumption
  const initialMessages = deserializeCampaignMessages(messages)

  return (
    <div className="flex flex-col min-h-screen p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto">
        {/* Campaign header — Plan 03 will replace this with ChatInterface */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1
            className="text-xl font-semibold text-slate-900"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            {campaign.title ?? 'Untitled Campaign'}
          </h1>
          {campaign.event_type && (
            <p className="mt-1 text-sm text-slate-500" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              {campaign.event_type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
          )}
        </div>

        {/* Placeholder — ChatInterface component added in Plan 03 */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            {initialMessages.length > 0
              ? `${initialMessages.length} message${initialMessages.length === 1 ? '' : 's'} in this campaign.`
              : 'No messages yet. Chat interface coming in Plan 03.'}
          </p>
          <p className="text-xs text-slate-400 mt-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Campaign ID: {campaign.id}
          </p>
        </div>
      </div>
    </div>
  )
}
