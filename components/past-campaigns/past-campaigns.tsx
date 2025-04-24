"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, ArrowLeft, Clock, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useRouter } from "next/navigation"

// Define the campaign type
interface Campaign {
  id: string
  name: string
  course: string
  date: string
  location: string
  audience: string
  imageUrl: string
}

interface AdCampaign {
  id: string
  creativeUrl: string
}

// Placeholder campaigns for when API fails
const placeholderCampaigns: Campaign[] = [
  {
    id: "placeholder1",
    name: "Summer Reading Challenge",
    course: "English Literature",
    date: "June 1 - August 31, 2023",
    location: "Online & In-person",
    audience: "K-12 Students",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "placeholder2",
    name: "STEM Innovation Week",
    course: "Science & Technology",
    date: "March 15-22, 2023",
    location: "Regional High Schools",
    audience: "High School Students",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
]

// Sort placeholder campaigns by nearest date first
const sortedPlaceholderCampaigns = [...placeholderCampaigns].sort((a, b) => {
  const dateA = new Date(a.date.split(" - ")[0] || a.date)
  const dateB = new Date(b.date.split(" - ")[0] || b.date)
  return dateA.getTime() - dateB.getTime() // Ascending order (nearest date first)
})

export function PastCampaigns() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAds, setIsLoadingAds] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adError, setAdError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/past-campaigns")

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Campaigns data from API:", data)

        // Sort campaigns by nearest date first
        const sortedCampaigns = [...data].sort((a, b) => {
          // Extract dates and convert to comparable format
          const dateA = new Date(a.date.split(" - ")[0] || a.date)
          const dateB = new Date(b.date.split(" - ")[0] || b.date)
          // Sort ascending (nearest date first)
          return dateA.getTime() - dateB.getTime()
        })

        setCampaigns(sortedCampaigns)
        setError(null)
      } catch (err) {
        console.error("Error fetching campaigns:", err)
        setError("Failed to load campaigns. Please try again later.")
        setCampaigns([])
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchAdCampaigns() {
      try {
        setIsLoadingAds(true)
        const response = await fetch("/api/ad-campaigns")

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Ad Campaigns data from API:", data)
        setAdCampaigns(data)
        setAdError(null)
      } catch (err) {
        console.error("Error fetching ad campaigns:", err)
        setAdError("Failed to load ad campaigns. Please try again later.")
        setAdCampaigns([])
      } finally {
        setIsLoadingAds(false)
      }
    }

    fetchCampaigns()
    fetchAdCampaigns()
  }, [])

  // Use placeholder data if no campaigns are fetched and we're not loading
  const displayCampaigns = !isLoading && campaigns.length === 0 ? sortedPlaceholderCampaigns : campaigns

  const handleViewCampaign = (campaignId: string) => {
    console.log(`Navigating to campaign: ${campaignId}`)
    router.push(`/dashboard/past-campaigns/${campaignId}`)
  }

  const handleViewAdCampaign = (campaignId: string) => {
    console.log(`Navigating to ad campaign: ${campaignId}`)
    router.push(`/dashboard/ad-campaigns/${campaignId}`)
  }

  const handleImageError = (campaignId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [campaignId]: true,
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Link href="/dashboard/campaign-options">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Past Campaigns</h1>
      </div>

      <p className="mb-8 text-muted-foreground">Select a campaign to view its assets and content.</p>

      {/* Course Kits Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Course Kits</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayCampaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative h-48 w-full bg-gray-100">
                    {imageErrors[campaign.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span>Image not available</span>
                      </div>
                    ) : (
                      <Image
                        src={campaign.imageUrl || "/placeholder.svg?height=200&width=400"}
                        alt={campaign.name}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(campaign.id)}
                        unoptimized={campaign.imageUrl && !campaign.imageUrl.startsWith("/")}
                      />
                    )}
                  </div>

                  <CardHeader className="p-4 pb-0">
                    <h2 className="text-xl font-bold">{campaign.name}</h2>
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">Course:</span>
                        <span className="ml-2">{campaign.course}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">Date:</span>
                        <span className="ml-2">{campaign.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="ml-2">{campaign.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">Audience:</span>
                        <span className="ml-2">{campaign.audience}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewCampaign(campaign.id)
                      }}
                    >
                      View Campaign
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {!isLoading && campaigns.length === 0 && (
              <div className="mt-8 p-4 border rounded bg-yellow-50">
                <h3 className="font-semibold text-amber-800">Debug Information</h3>
                <p className="text-sm text-amber-700">
                  No campaigns were loaded from Airtable. Using placeholder data instead.
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  Check your browser console for more detailed error information.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ad Campaigns Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Ad Campaigns</h2>

        {isLoadingAds ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {adCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {adCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => handleViewAdCampaign(campaign.id)}
                  >
                    {campaign.creativeUrl ? (
                      <Image
                        src={campaign.creativeUrl || "/placeholder.svg"}
                        alt="Ad Creative"
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized={!campaign.creativeUrl.startsWith("/")}
                        onError={() => handleImageError(campaign.id)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-3 w-full text-white">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewAdCampaign(campaign.id)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500">No ad campaigns available</p>
                {adError && <p className="text-red-500 text-sm mt-2">{adError}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
