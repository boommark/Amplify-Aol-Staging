import { AdCopyEditor } from "@/components/ad-copy/ad-copy-editor"

export default function AdCopyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-5xl">
          <AdCopyEditor />
        </div>
      </div>
    </div>
  )
}
