import { Navbar } from "@/components/navbar"
import { AdCampaignDetails } from "@/components/ad-campaigns/ad-campaign-details"

export default function AdCampaignDetailsPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <AdCampaignDetails id={params.id} />
    </>
  )
}
