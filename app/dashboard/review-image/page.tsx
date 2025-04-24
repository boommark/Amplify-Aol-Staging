import { CampaignSelectionHeader } from "@/components/campaign-selection/campaign-selection-header"
import { ReviewImageEditor } from "@/components/review-image/review-image-editor"

export default function ReviewImagePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CampaignSelectionHeader />
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-5xl">
          <ReviewImageEditor />
        </div>
      </div>
    </div>
  )
}
