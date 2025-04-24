"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AdCampaign {
  id: string
  headline: string
  subheadline?: string
  creativeUrl?: string
  buttonText?: string
}

export function AdCampaigns() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true)
        const response = await fetch("/api/ad-campaigns")

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setCampaigns(data)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
        setError("Failed to load campaigns. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/ad-campaigns/${id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No ad campaigns found.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ad Campaigns</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaigns.map((campaign) => (
          <Card
            key={campaign.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            style={{ backgroundColor: getRandomPastelColor() }}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-bold mb-2">{campaign.headline}</h3>
              {campaign.subheadline && <p className="text-sm mb-4">{campaign.subheadline}</p>}

              <div className="relative w-full h-48 mb-4 bg-white rounded-md overflow-hidden">
                {campaign.creativeUrl ? (
                  <img
                    src={campaign.creativeUrl || "/placeholder.svg"}
                    alt={campaign.headline}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-400">No image available</p>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <Button className="w-full" onClick={() => handleViewDetails(campaign.id)}>
                  {campaign.buttonText || "View Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helper function to generate random pastel colors for cards
function getRandomPastelColor() {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 70%, 90%)`
}
