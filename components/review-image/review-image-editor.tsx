"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Save, Edit2, Loader2, CheckCircle, RefreshCw, CheckSquare, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type ImageData = {
  id: string
  prompt: string
  rawImageUrl: string
}

export function ReviewImageEditor() {
  const router = useRouter()
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [renderCount, setRenderCount] = useState(2)
  const [isRendering, setIsRendering] = useState(false)
  const [isHoveringImage, setIsHoveringImage] = useState(false)

  useEffect(() => {
    const fetchImageData = async () => {
      try {
        setIsLoading(true)
        const recordId = sessionStorage.getItem("airtable_rec_id")

        if (!recordId) {
          console.error("No record ID found in session storage")
          return
        }

        // Fetch data from Airtable
        const response = await fetch(`/api/airtable/ad-copy?recordId=${recordId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch image data")
        }

        const data = await response.json()

        setImageData({
          id: data.id,
          prompt: data.prompt || "",
          rawImageUrl: data.rawImageUrl || "",
        })
      } catch (error) {
        console.error("Error fetching image data:", error)
        toast({
          title: "Error",
          description: "Failed to load image data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchImageData()
  }, [])

  const handleEdit = () => {
    setEditMode(true)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!imageData) return

    setIsSaving(true)

    try {
      const recordId = sessionStorage.getItem("airtable_rec_id")

      if (!recordId) {
        console.error("No record ID found in session storage")
        toast({
          title: "Error",
          description: "No record ID found. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Call the webhook to update the prompt
      const webhookUrl = "https://boommk.app.n8n.cloud/webhook/1d2d7fdd-fd4f-44ca-b14c-27bc9f01850d"
      const queryParams = new URLSearchParams({
        airtable_rec_id: recordId,
        updated_value: imageData.prompt,
      }).toString()

      const response = await fetch(`${webhookUrl}?${queryParams}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to update prompt")
      }

      // Show success state
      setSaveSuccess(true)

      // Exit edit mode after a short delay to show success state
      setTimeout(() => {
        setEditMode(false)

        // Reset success state after exiting edit mode
        setTimeout(() => {
          setSaveSuccess(false)
        }, 1000)
      }, 1000)

      toast({
        title: "Success",
        description: "Image prompt updated successfully.",
      })
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast({
        title: "Error",
        description: "Failed to save changes to image prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (value: string) => {
    if (!imageData) return

    setImageData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        prompt: value,
      }
    })
  }

  const handleRerender = async () => {
    if (renderCount <= 0 || isRendering) return

    setIsRendering(true)

    try {
      const recordId = sessionStorage.getItem("airtable_rec_id")

      if (!recordId) {
        console.error("No record ID found in session storage")
        toast({
          title: "Error",
          description: "No record ID found. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Call the webhook to re-render the image
      const webhookUrl = "https://boommk.app.n8n.cloud/webhook/8672f0de-01bd-407b-9d84-844985a0c173"
      const queryParams = new URLSearchParams({
        airtable_rec_id: recordId,
      }).toString()

      const response = await fetch(`${webhookUrl}?${queryParams}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to re-render image")
      }

      // Decrease render count
      setRenderCount((prev) => prev - 1)

      // Refresh the image data
      const dataResponse = await fetch(`/api/airtable/ad-copy?recordId=${recordId}`)

      if (!dataResponse.ok) {
        throw new Error("Failed to fetch updated image data")
      }

      const data = await dataResponse.json()

      setImageData({
        id: data.id,
        prompt: data.prompt || "",
        rawImageUrl: data.rawImageUrl || "",
      })

      toast({
        title: "Success",
        description: "Image re-rendered successfully.",
      })
    } catch (error) {
      console.error("Error re-rendering image:", error)
      toast({
        title: "Error",
        description: "Failed to re-render image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRendering(false)
    }
  }

  const handleFinalize = async () => {
    setIsSubmitting(true)

    try {
      const recordId = sessionStorage.getItem("airtable_rec_id")

      if (!recordId) {
        console.error("No record ID found in session storage")
        toast({
          title: "Error",
          description: "No record ID found. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Call the webhook to finalize the creative
      const webhookUrl = "https://boommk.app.n8n.cloud/webhook/fdd6608f-e1d6-4c72-9ec7-767a1df7438c"

      // Format the query parameters
      const queryParams = new URLSearchParams({
        airtable_rec_id: recordId,
      }).toString()

      console.log(`Calling finalize webhook: ${webhookUrl}?${queryParams}`)

      // Make the direct GET request to the webhook
      const response = await fetch(`${webhookUrl}?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`Webhook responded with status: ${response.status}`)
        // Try to get more details about the error
        let errorDetails = ""
        try {
          const errorText = await response.text()
          errorDetails = errorText
        } catch (e) {
          errorDetails = "Could not retrieve error details"
        }
        console.error("Error details:", errorDetails)

        throw new Error(`Webhook responded with status: ${response.status}`)
      }

      // For successful responses, try to parse JSON but don't fail if it's not JSON
      let responseData
      try {
        responseData = await response.json()
        console.log("Webhook response data:", responseData)
      } catch (e) {
        // If it's not JSON, just use the text
        const text = await response.text()
        console.log("Webhook response text:", text)
      }

      // Navigate to the ad campaign details page using the record ID
      router.push(`/dashboard/ad-campaigns/${recordId}`)

      toast({
        title: "Success",
        description: "Creative finalized successfully!",
      })
    } catch (error) {
      console.error("Error finalizing creative:", error)
      toast({
        title: "Error",
        description: "Failed to finalize creative. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadImage = () => {
    if (imageData?.rawImageUrl) {
      window.open(imageData.rawImageUrl, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading image data...</span>
      </div>
    )
  }

  if (!imageData) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-500">Failed to load image data. Please try again.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Review AI Image</h1>
        <p className="text-muted-foreground mt-2">Review and refine your AI-generated image</p>
      </div>

      {/* Image Display */}
      <div className="flex justify-center mb-6">
        <div
          className="relative w-[600px] h-[600px] rounded-lg shadow-xl overflow-hidden border border-gray-200 group"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        >
          {imageData.rawImageUrl ? (
            <>
              <Image
                src={imageData.rawImageUrl || "/placeholder.svg"}
                alt="AI-generated image"
                fill
                className="object-cover"
              />
              {/* Download button overlay */}
              <div
                className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 ${
                  isHoveringImage ? "opacity-100" : "opacity-0"
                }`}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white"
                  onClick={handleDownloadImage}
                >
                  <Download className="h-5 w-5" />
                  <span className="sr-only">Download image</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Section */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Image Prompt</CardTitle>
            <CardDescription>Description for generating the ad image</CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            {!editMode ? (
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <Button size="sm" variant="default" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <Textarea
              value={imageData.prompt}
              onChange={(e) => handleChange(e.target.value)}
              className="min-h-[120px]"
            />
          ) : (
            <div className="p-3 border rounded-md bg-muted/50 min-h-[120px] whitespace-pre-wrap">
              {imageData.prompt}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          size="lg"
          variant="outline"
          onClick={handleRerender}
          disabled={renderCount <= 0 || isRendering}
          className="px-6"
        >
          {isRendering ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Rendering...
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              Re-render Image {renderCount > 0 ? `(${renderCount})` : ""}
            </>
          )}
        </Button>
        <Button size="lg" className="px-6" onClick={handleFinalize} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckSquare className="h-5 w-5 mr-2" />
              Finalize and Publish Creative
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
