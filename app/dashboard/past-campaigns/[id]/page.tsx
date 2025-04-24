import { CampaignDetails } from "@/components/past-campaigns/campaign-details"

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  return <CampaignDetails id={params.id} />
}
