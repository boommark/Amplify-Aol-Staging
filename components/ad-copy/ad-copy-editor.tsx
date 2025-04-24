"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heading, Type, FileText, Save, Edit2, Loader2, CheckCircle, MousePointer, ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type AdCopyData = {
  id: string
  headline: string
  subheadline: string
  buttonText: string
  bodyCopy: string
}

// Mapping between our field names and Airtable column names
const airtableFieldMapping: Record<string, string> = {
  headline: "Headline",
  subheadline: "Subheadline",
  buttonText: "ButtonText", // Fixed: "ButtonText" instead of "Button Text"
  bodyCopy: "Body Copy",
}

// Mapping between field names and webhook URLs
const webhookUrlMapping: Record<string, string> = {
  headline: "https://boommk.app.n8n.cloud/webhook/86972ed5-4d8f-4088-b007-7bce339f4c3e",
  subheadline: "https://boommk.app.n8n.cloud/webhook/5ae06819-d637-43a1-aee5-c42127deacdf",
  buttonText: "https://boommk.app.n8n.cloud/webhook/93b64d22-f6f1-44b0-bff6-5718d05cbb78",
  bodyCopy: "https://boommk.app.n8n.cloud/webhook/ad355a5d-da1f-4317-9e9d-67068b5e976d",
}

export function AdCopyEditor() {
  const router = useRouter()
  const [adCopyData, setAdCopyData] = useState<AdCopyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState({
    headline: false,
    subheadline: false,
    buttonText: false,
    bodyCopy: false,
  })
  const [isSaving, setIsSaving] = useState({
    headline: false,
    subheadline: false,
    buttonText: false,
    bodyCopy: false,
  })
  const [saveSuccess, setSaveSuccess] = useState({
    headline: false,
    subheadline: false,
    buttonText: false,
    bodyCopy: false,
  })

  useEffect(() => {
    const fetchAdCopyData = async () => {
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
          throw new Error("Failed to fetch ad copy data")
        }

        const data = await response.json()
        setAdCopyData({
          ...data,
          buttonText: data.buttonText || "Learn More", // Only use default if not provided
        })
      } catch (error) {
        console.error("Error fetching ad copy data:", error)
        toast({
          title: "Error",
          description: "Failed to load ad copy data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdCopyData()
  }, [])

  const handleEdit = (field: keyof typeof editMode) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: true,
    }))
    // Reset success state
    setSaveSuccess((prev) => ({
      ...prev,
      [field]: false,
    }))
  }

  const handleSave = async (field: keyof typeof editMode) => {
    if (!adCopyData) return

    setIsSaving((prev) => ({
      ...prev,
      [field]: true,
    }))

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

      // Get the appropriate webhook URL for this field
      const webhookUrl = webhookUrlMapping[field]

      // Format the query parameters
      const queryParams = new URLSearchParams({
        airtable_rec_id: recordId,
        updated_value: adCopyData[field],
      }).toString()

      console.log(`Calling webhook for ${field}: ${webhookUrl}?${queryParams}`)

      // Make the GET request with query parameters
      const response = await fetch(`${webhookUrl}?${queryParams}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`)
      }

      // Show success state
      setSaveSuccess((prev) => ({
        ...prev,
        [field]: true,
      }))

      // Exit edit mode after a short delay to show success state
      setTimeout(() => {
        setEditMode((prev) => ({
          ...prev,
          [field]: false,
        }))

        // Reset success state after exiting edit mode
        setTimeout(() => {
          setSaveSuccess((prev) => ({
            ...prev,
            [field]: false,
          }))
        }, 1000)
      }, 1000)

      toast({
        title: "Success",
        description: `${airtableFieldMapping[field]} updated successfully.`,
      })
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      toast({
        title: "Error",
        description: `Failed to save changes to ${airtableFieldMapping[field]}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSaving((prev) => ({
        ...prev,
        [field]: false,
      }))
    }
  }

  const handleChange = (field: keyof AdCopyData, value: string) => {
    if (!adCopyData) return

    setAdCopyData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const handleReviewImage = async () => {
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

      // Call the webhook to generate the image
      const webhookUrl = "https://boommk.app.n8n.cloud/webhook/8672f0de-01bd-407b-9d84-844985a0c173"

      // Format the query parameters
      const queryParams = new URLSearchParams({
        airtable_rec_id: recordId,
      }).toString()

      console.log(`Calling webhook: ${webhookUrl}?${queryParams}`)

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
      let data
      try {
        data = await response.json()
        console.log("Webhook response data:", data)
      } catch (e) {
        // If it's not JSON, just use the text
        const text = await response.text()
        console.log("Webhook response text:", text)
      }

      // Navigate to the review image page
      router.push("/dashboard/review-image")
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
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
        <span className="ml-2 text-lg">Loading ad copy...</span>
      </div>
    )
  }

  if (!adCopyData) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-500">Failed to load ad copy data. Please try again.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Ad Copy</h1>
        <p className="text-muted-foreground mt-2">Review and edit your ad copy below</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Heading className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Ad Headline</CardTitle>
            <CardDescription>The main headline for your ad</CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            {!editMode.headline ? (
              <Button size="sm" variant="outline" onClick={() => handleEdit("headline")}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <Button size="sm" variant="default" onClick={() => handleSave("headline")} disabled={isSaving.headline}>
                {isSaving.headline ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess.headline ? (
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
          {editMode.headline ? (
            <Textarea
              value={adCopyData.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <div className="p-3 border rounded-md bg-muted/50 min-h-[80px]">{adCopyData.headline}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Ad Sub-headline</CardTitle>
            <CardDescription>Supporting text for your headline</CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            {!editMode.subheadline ? (
              <Button size="sm" variant="outline" onClick={() => handleEdit("subheadline")}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleSave("subheadline")}
                disabled={isSaving.subheadline}
              >
                {isSaving.subheadline ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess.subheadline ? (
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
          {editMode.subheadline ? (
            <Textarea
              value={adCopyData.subheadline}
              onChange={(e) => handleChange("subheadline", e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <div className="p-3 border rounded-md bg-muted/50 min-h-[80px]">{adCopyData.subheadline}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <MousePointer className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Button Text</CardTitle>
            <CardDescription>Call-to-action text for your ad button</CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            {!editMode.buttonText ? (
              <Button size="sm" variant="outline" onClick={() => handleEdit("buttonText")}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleSave("buttonText")}
                disabled={isSaving.buttonText}
              >
                {isSaving.buttonText ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess.buttonText ? (
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
          {editMode.buttonText ? (
            <Textarea
              value={adCopyData.buttonText}
              onChange={(e) => handleChange("buttonText", e.target.value)}
              className="min-h-[60px]"
            />
          ) : (
            <div className="p-3 border rounded-md bg-muted/50 min-h-[60px]">{adCopyData.buttonText}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Body Copy</CardTitle>
            <CardDescription>Main content for your ad</CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            {!editMode.bodyCopy ? (
              <Button size="sm" variant="outline" onClick={() => handleEdit("bodyCopy")}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <Button size="sm" variant="default" onClick={() => handleSave("bodyCopy")} disabled={isSaving.bodyCopy}>
                {isSaving.bodyCopy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess.bodyCopy ? (
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
          {editMode.bodyCopy ? (
            <Textarea
              value={adCopyData.bodyCopy}
              onChange={(e) => handleChange("bodyCopy", e.target.value)}
              className="min-h-[120px]"
            />
          ) : (
            <div className="p-3 border rounded-md bg-muted/50 min-h-[120px] whitespace-pre-wrap">
              {adCopyData.bodyCopy}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button size="lg" className="px-8" onClick={handleReviewImage} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="h-5 w-5 mr-2" />
              Review AI Image
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
