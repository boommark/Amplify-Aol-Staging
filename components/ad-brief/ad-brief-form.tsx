"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Wand2, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AdBriefForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    product: "",
    adOrientation: "",
    color: "",
    adType: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Call the webhook with form data
      const webhookUrl = "https://boommk.app.n8n.cloud/webhook/caf9abe3-6c38-43f7-ae76-ae754c2b9d0e"
      const queryParams = new URLSearchParams({
        product: formData.product,
        adOrientation: formData.adOrientation,
        color: formData.color,
        adType: formData.adType,
      }).toString()

      const response = await fetch(`${webhookUrl}?${queryParams}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to submit ad brief")
      }

      const data = await response.json()

      // Store the airtable_rec_id in sessionStorage
      if (data && data.id) {
        sessionStorage.setItem("airtable_rec_id", data.id)
      }

      // Navigate to ad copy page
      router.push("/dashboard/ad-copy")
    } catch (error) {
      console.error("Error submitting ad brief:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold">Ad Brief</CardTitle>
        <CardDescription className="text-base">
          Enter a few details and watch AI work at wrap speed to turn your awesome idea into kickass campaign creative!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="product">Product</Label>
          <Select value={formData.product} onValueChange={(value) => handleChange("product", value)}>
            <SelectTrigger id="product">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="art-of-living-part-1">Art of Living Part 1</SelectItem>
              <SelectItem value="sahaj-samadhi">Sahaj Samadhi</SelectItem>
              <SelectItem value="sri-sri-yoga-foundation">Sri Sri Yoga Foundation</SelectItem>
              <SelectItem value="sleep-and-anxiety-protocol">Sleep and Anxiety Protocol</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="adOrientation">Ad Orientation</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-xs">
                    ?
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Square means 1080 X 1080 px, Vertical means 1080 X 1920 px.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={formData.adOrientation} onValueChange={(value) => handleChange("adOrientation", value)}>
            <SelectTrigger id="adOrientation">
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Select value={formData.color} onValueChange={(value) => handleChange("color", value)}>
            <SelectTrigger id="color">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peach">Peach</SelectItem>
              <SelectItem value="yellow">Yellow</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="adType">Ad Type</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4">
                  <div className="space-y-2">
                    <p className="font-semibold">Problem-Solution Ad:</p>
                    <p className="text-sm">
                      Examples: "Deals getting stuck? It's not you. Your customers want payment flexibility." "80% of
                      marketers are using AI. The smart ones use Jasper", "Struggling to Hire a Match? You need
                      TestGorilla"
                    </p>
                    <p className="font-semibold">Benefit First Ad:</p>
                    <p className="text-sm">
                      Examples: "Get up to 7x more orders with automated journeys", "Strong Bones Support: Features
                      Aquamin - upto 250% more effective than regular Calcium and Magnesium"
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={formData.adType} onValueChange={(value) => handleChange("adType", value)}>
            <SelectTrigger id="adType">
              <SelectValue placeholder="Select ad type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="problem-solution">Problem-Solution Ad</SelectItem>
              <SelectItem value="benefit-first">Benefit-First Ad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full text-base font-medium"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !formData.product || !formData.adOrientation || !formData.color || !formData.adType}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Go Create!
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
