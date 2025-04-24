import { MarketingContent } from "@/components/past-campaigns/marketing-content"

export default function MarketingContentPage({ params }: { params: { id: string } }) {
  return <MarketingContent id={params.id} />
}
