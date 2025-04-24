import { CuratedWisdom } from "@/components/past-campaigns/curated-wisdom"

export default function WisdomPage({ params }: { params: { id: string } }) {
  return <CuratedWisdom id={params.id} />
}
