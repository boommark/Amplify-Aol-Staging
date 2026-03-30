import { redirect } from 'next/navigation'
import { getCampaignWithMessages, deserializeCampaignMessages } from '@/lib/db/campaigns'
import { ChatInterface } from './ChatInterface'

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>
}

// Server Component — fetches campaign data server-side, passes serializable props to client
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
    <ChatInterface
      campaignId={campaignId}
      initialMessages={initialMessages}
      campaignTitle={campaign.title ?? null}
    />
  )
}
