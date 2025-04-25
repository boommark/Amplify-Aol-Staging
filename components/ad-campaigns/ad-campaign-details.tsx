"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, FileText, MessageSquare, Type, MousePointer, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface AdCampaignDetails {
  id: string
  headline: string
  subheadline: string
  bodyCopy: string
  buttonText: string
  prompt: string
  rawImageUrl: string
  creativeUrl: string
}

export function AdCampaignDetails({ id }: { id: string }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<AdCampaignDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHoveringCreative, setIsHoveringCreative] = useState(false)
  const [isHoveringRaw, setIsHoveringRaw] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    async function fetchCampaignDetails() {
      try {
        setLoading(true)
        const response = await fetch(`/api/ad-campaigns/${id}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setCampaign(data)
      } catch (error) {
        console.error("Error fetching campaign details:", error)
        setError("Failed to load campaign details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCampaignDetails()
    }
  }, [id])

  const handleBack = () => {
    router.push("/dashboard/past-campaigns")
  }

  const handleDownload = (url: string) => {
    if (url) {
      window.open(url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error || "Failed to load campaign details."}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="sm" className="mr-4 rounded-full" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold">Ad Campaign Details</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Creative Image Full Display */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex items-center">
            <h2 className="text-xl font-semibold">Final Creative</h2>
          </div>

          <div
            className="relative w-full flex justify-center image-frame shadow-card"
            onMouseEnter={() => setIsHoveringCreative(true)}
            onMouseLeave={() => setIsHoveringCreative(false)}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {campaign.creativeUrl ? (
              <img
                src={campaign.creativeUrl || "/placeholder.svg"}
                alt="Final Creative"
                className="max-w-full h-auto"
                style={{ maxHeight: "80vh" }}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-[60vh] bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No creative image available</p>
              </div>
            )}

            {isHoveringCreative && imageLoaded && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full shadow-md"
                  onClick={() => handleDownload(campaign.creativeUrl)}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Creative
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Column - Campaign Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Headline */}
          <Card className="modern-card gradient-border">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Headline</h3>
              </div>
              <p className="text-lg font-semibold">{campaign.headline}</p>
            </CardContent>
          </Card>

          {/* Subheadline */}
          <Card className="modern-card gradient-border gradient-border-purple">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Type className="mr-2 h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium">Subheadline</h3>
              </div>
              <p>{campaign.subheadline}</p>
            </CardContent>
          </Card>

          {/* Body Copy */}
          <Card className="modern-card gradient-border gradient-border-green">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium">Body Copy</h3>
              </div>
              <p className="whitespace-pre-line">{campaign.bodyCopy}</p>
            </CardContent>
          </Card>

          {/* Button Text */}
          <Card className="modern-card gradient-border gradient-border-amber">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <MousePointer className="mr-2 h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-medium">Button Text</h3>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-2 inline-block border border-gray-100">
                {campaign.buttonText}
              </div>
            </CardContent>
          </Card>

          {/* Prompt */}
          <Card className="modern-card gradient-border gradient-border-pink">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Lightbulb className="mr-2 h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-medium">AI Prompt</h3>
              </div>
              <p className="italic text-gray-700">{campaign.prompt}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Raw Image Section */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="modern-card">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-medium">Raw AI Image</h3>
            </div>
            <div
              className="relative w-full max-w-2xl mx-auto image-frame"
              style={{ height: "400px" }}
              onMouseEnter={() => setIsHoveringRaw(true)}
              onMouseLeave={() => setIsHoveringRaw(false)}
            >
              <Image
                src={campaign.rawImageUrl || "/placeholder.svg"}
                alt="Raw AI Image"
                fill
                className="object-contain"
              />
              {isHoveringRaw && (
                <motion.div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="secondary"
                    className="rounded-full shadow-md"
                    onClick={() => handleDownload(campaign.rawImageUrl)}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Raw Image
                  </Button>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
