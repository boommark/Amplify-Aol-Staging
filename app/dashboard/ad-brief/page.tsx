import { AdBriefForm } from "@/components/ad-brief/ad-brief-form"

export default function AdBriefPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-4xl">
          <AdBriefForm />
        </div>
      </div>
    </div>
  )
}
