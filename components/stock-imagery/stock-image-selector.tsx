"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type StockImage = {
  id: string
  awsS3Url: string
  name?: string
}

export function StockImageSelector() {
  const router = useRouter()
  const [images, setImages] = useState<StockImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordId, setRecordId] = useState<string | null>(null)

  useEffect(() => {
    // Get the record ID from session storage
    const storedRecordId = sessionStorage.getItem("airtable_rec_id")
    if (storedRecordId) {
      setRecordId(storedRecordId)
    }

    // Fetch stock images from Airtable
    const fetchStockImages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/airtable/stock-images")

        if (!response.ok) {
          throw new Error("Failed to fetch stock images")
        }

        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error("Error fetching stock images:", error)
        toast({
          title: "Error",
          description: "Failed to load stock images. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockImages()
  }, [])

  const handleImageSelect = (id: string) => {
    setSelectedImageId(id)
  }

  const handleGenerateCreative = async () => {
    if (!selectedImageId || !recordId) {
      toast({
        title: "Error",
        description: "Please select an image first.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Find the selected image
      const selectedImage = images.find((img) => img.id === selectedImageId)

      if (!selectedImage) {
        throw new Error("Selected image not found")
      }

      // Call the webhook to generate creative with stock image
      const webhookUrl = "https://boommk.app.n8n.cloud/webhook/bfb4d391-679f-4c61-826e-eca2f9570910"

      // Format the query parameters
      const queryParams = new URLSearchParams({
        airtable_rec_id: recordId,
        aws_s3_url: selectedImage.awsS3Url,
      }).toString()

      console.log(`Calling webhook: ${webhookUrl}?${queryParams}`)

      // Make the GET request with query parameters
      const response = await fetch(`${webhookUrl}?${queryParams}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: "Ad creative generation started. You will be redirected shortly.",
      })

      // Redirect to the ad campaign details page after a short delay
      setTimeout(() => {
        if (recordId) {
          router.push(`/dashboard/ad-campaigns/${recordId}`)
        }
      }, 1500)
    } catch (error) {
      console.error("Error generating creative:", error)
      toast({
        title: "Error",
        description: "Failed to generate ad creative. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading stock images...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Choose the subject</h1>
          <p className="text-lg text-gray-600">Please select the image you wish to use as the subject of your ad.</p>
        </div>
        <Button size="lg" className="px-6" onClick={handleGenerateCreative} disabled={!selectedImageId || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Generate Ad Creative"
          )}
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">No stock images available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                selectedImageId === image.id
                  ? "border-blue-600 ring-2 ring-blue-600 ring-opacity-50"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => handleImageSelect(image.id)}
            >
              <Image
                src={image.awsS3Url || "/placeholder.svg"}
                alt={image.name || "Stock image"}
                fill
                className="object-cover"
              />
              {selectedImageId === image.id && (
                <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button size="lg" className="px-8" onClick={handleGenerateCreative} disabled={!selectedImageId || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Generate Ad Creative"
          )}
        </Button>
      </div>
    </div>
  )
}
