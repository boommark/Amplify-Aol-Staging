import { AdCopyEditor } from "@/components/ad-copy/ad-copy-editor"
import { CampaignSelectionHeader } from "@/components/campaign-selection/campaign-selection-header"

export default function AdCopyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CampaignSelectionHeader />
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-5xl">
          <AdCopyEditor />
        </div>
      </div>
    </div>
  )
}
