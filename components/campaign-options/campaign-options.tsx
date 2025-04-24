"use client"

import { useRouter } from "next/navigation"
import { Clock, FileText, PlusCircle } from "lucide-react"

export function CampaignOptions() {
  const router = useRouter()

  const handleStartNewCampaign = () => {
    router.push("/dashboard/campaign-selection")
  }

  const handleFetchCampaign = () => {
    router.push("/dashboard/past-campaigns")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF]">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-6 w-6 rounded-full bg-primary"></div>
            <span className="text-xl font-bold text-secondary-800">Amplify</span>
          </div>
        </div>
        <nav className="flex items-center gap-4 md:gap-6">
          <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" href="#">
            Help
          </a>
          <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" href="#">
            Settings
          </a>
          <div className="h-8 w-8 rounded-full bg-muted"></div>
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-secondary-800">Campaign Options</h1>
            <p className="mt-1 text-muted-foreground">Choose what you'd like to do with your marketing campaigns</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Review Past Campaigns */}
            <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="absolute top-0 left-0 h-1 w-full bg-blue-500"></div>
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-secondary-800">Review Past Campaigns</h3>
                <p className="mb-4 text-muted-foreground">Review assets and campaign content for previous campaigns</p>
                <button
                  onClick={handleFetchCampaign}
                  className="inline-flex items-center justify-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Fetch campaign
                </button>
              </div>
            </div>

            {/* Start New Campaign */}
            <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="absolute top-0 left-0 h-1 w-full bg-primary"></div>
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-secondary-800">Start New Campaign</h3>
                <p className="mb-4 text-muted-foreground">
                  Create a new marketing campaign from scratch with our guided process
                </p>
                <button
                  onClick={handleStartNewCampaign}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Create Campaign
                </button>
              </div>
            </div>

            {/* View Catalog */}
            <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500"></div>
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-secondary-800">View Catalog</h3>
                <p className="mb-4 text-muted-foreground">
                  Browse campaign templates and examples from other Art of Living centers
                </p>
                <button className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Explore Catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
