"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, ArrowRight, Quote } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CampaignDetailsProps {
  id: string
}

interface CampaignData {
  id: string
  name: string
  course: string
  date: string
  location: string
  audience: string
  imageUrl: string
  spiritualityAndMeditationResearch: string
  mentalHealthResearch: string
  sleepAndPhysicalHealthResearch: string
  relationshipsResearch: string
  localIdioms: string
  copywritingIdeas: string
  seasonalGuidance: string
  rawFields?: Record<string, any>
}

// Function to clean text by removing links and unwanted characters
function cleanText(text: string): string {
  if (!text) return ""

  // Remove links (text between < and >)
  let cleaned = text.replace(/<[^>]+>/g, "")

  // Remove any URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/g, "")

  // Remove any text after a + sign that looks like a link or email
  cleaned = cleaned.replace(/\+\s*[\w.-]+@[\w.-]+\.\w+/g, "+")
  cleaned = cleaned.replace(/\+\s*https?:\/\/\S+/g, "+")

  // Clean up any remaining + signs that are isolated
  cleaned = cleaned.replace(/\+\s*$/gm, "")

  return cleaned.trim()
}

// Function to parse simple markdown
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null

  // Clean the text first
  const cleanedText = cleanText(text)

  // Split the text into lines to handle bullet points
  const lines = cleanedText.split("\n")

  return (
    <>
      {lines.map((line, lineIndex) => {
        // Skip empty lines
        if (!line.trim()) return null

        // Check if the line is a bullet point
        const isBulletPoint = line.trim().startsWith("- ")

        // Remove the bullet point marker for processing
        const processedLine = isBulletPoint ? line.trim().substring(2) : line

        // Process bold text
        const segments = []
        let lastIndex = 0
        const boldRegex = /\*\*(.*?)\*\*/g
        let match

        while ((match = boldRegex.exec(processedLine)) !== null) {
          // Add text before the bold part
          if (match.index > lastIndex) {
            segments.push(processedLine.substring(lastIndex, match.index))
          }

          // Add the bold part
          segments.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>)

          lastIndex = match.index + match[0].length
        }

        // Add any remaining text
        if (lastIndex < processedLine.length) {
          segments.push(processedLine.substring(lastIndex))
        }

        // If no bold text was found, just use the line as is
        const content = segments.length > 0 ? segments : processedLine

        // Return the appropriate element based on whether it's a bullet point
        return isBulletPoint ? (
          <li key={lineIndex} className="ml-5 break-words">
            {content}
          </li>
        ) : (
          <p key={lineIndex} className={cn("break-words", lineIndex > 0 ? "mt-2" : "")}>
            {content}
          </p>
        )
      })}
    </>
  )
}

interface CollapsibleCardProps {
  title: string
  content: string
  className?: string
  variant?: "blue1" | "blue2" | "blue3" | "blue4"
}

function CollapsibleCard({ title, content, className, variant = "blue1" }: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasContent = content && content.trim().length > 0

  // Clean and split content into lines and take first 3
  const cleanedContent = cleanText(content || "")
  const lines = cleanedContent.split("\n").filter((line) => line.trim().length > 0)
  const previewLines = lines.slice(0, 3).join("\n")
  const hasMoreContent = lines.length > 3

  // Define variant-specific styles with different shades of blue
  const variantStyles = {
    blue1: {
      card: "border-slate-200 hover:border-blue-200 bg-white",
      title: "text-blue-700",
      button: "text-blue-600",
      readMore: "text-blue-600",
    },
    blue2: {
      card: "border-slate-200 hover:border-sky-200 bg-white",
      title: "text-sky-700",
      button: "text-sky-600",
      readMore: "text-sky-600",
    },
    blue3: {
      card: "border-slate-200 hover:border-indigo-200 bg-white",
      title: "text-indigo-700",
      button: "text-indigo-600",
      readMore: "text-indigo-600",
    },
    blue4: {
      card: "border-slate-200 hover:border-cyan-200 bg-white",
      title: "text-cyan-700",
      button: "text-cyan-600",
      readMore: "text-cyan-600",
    },
  }

  const styles = variantStyles[variant]

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md border overflow-hidden", styles.card, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <span className={styles.title}>{title}</span>
          {hasContent && hasMoreContent && (
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0 rounded-full", styles.button)}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">{isExpanded ? "Collapse" : "Expand"}</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {!hasContent ? (
          <p className="text-muted-foreground italic">No data available</p>
        ) : hasMoreContent ? (
          <div className="overflow-hidden">
            {isExpanded ? (
              <div className="animate-slideUp overflow-hidden">{parseMarkdown(cleanedContent)}</div>
            ) : (
              <>
                <div className="overflow-hidden">{parseMarkdown(previewLines)}</div>
                <div
                  className={cn("mt-2 text-sm font-medium cursor-pointer", styles.readMore)}
                  onClick={() => setIsExpanded(true)}
                >
                  Read more...
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">{parseMarkdown(cleanedContent)}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function CampaignDetails({ id }: CampaignDetailsProps) {
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true)
        console.log(`Fetching campaign with ID: ${id}`)
        const response = await fetch(`/api/past-campaigns/${id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("API error response:", errorData)
          throw new Error(`Failed to fetch campaign: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Campaign data from API:", data)
        setCampaign(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching campaign:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch campaign")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCampaign()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard/past-campaigns">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-8">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard/past-campaigns">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error || "Campaign not found"}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/dashboard/past-campaigns">
            <Button variant="ghost" size="sm" className="mr-4 hover:bg-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">{campaign.name}</h1>
        </div>
        <Link href={`/dashboard/past-campaigns/${id}/wisdom`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Quote className="mr-2 h-4 w-4" />
            Curated Wisdom from Gurudev
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-1">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
            <Image
              src={campaign.imageUrl || "/placeholder.svg?height=200&width=400"}
              alt={campaign.name}
              fill
              className="object-cover"
              unoptimized={campaign.imageUrl && !campaign.imageUrl.startsWith("/")}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Course</h3>
                  <p className="mt-1 font-semibold text-slate-800">{campaign.course}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Date</h3>
                  <p className="mt-1 font-semibold text-slate-800">{campaign.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Location</h3>
                  <p className="mt-1 font-semibold text-slate-800">{campaign.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Audience</h3>
                  <p className="mt-1 font-semibold text-slate-800">{campaign.audience}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-8 text-blue-800">Market Research</h2>

      <div className="space-y-16">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700">Needs Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CollapsibleCard
              title="Spirituality and Meditation Research"
              content={campaign.spiritualityAndMeditationResearch || ""}
              variant="blue1"
            />
            <CollapsibleCard
              title="Mental Health Research"
              content={campaign.mentalHealthResearch || ""}
              variant="blue2"
            />
            <CollapsibleCard
              title="Sleep and Physical Health Research"
              content={campaign.sleepAndPhysicalHealthResearch || ""}
              variant="blue3"
            />
            <CollapsibleCard
              title="Relationships Research"
              content={campaign.relationshipsResearch || ""}
              variant="blue4"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700">Messaging Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CollapsibleCard title="Local Idioms" content={campaign.localIdioms || ""} variant="blue1" />
            <CollapsibleCard title="Copywriting Ideas" content={campaign.copywritingIdeas || ""} variant="blue2" />
            <CollapsibleCard title="Seasonal Guidance" content={campaign.seasonalGuidance || ""} variant="blue3" />
          </div>
        </div>

        {/* Bottom button for Curated Wisdom from Gurudev */}
        <div className="flex justify-center mt-12">
          <Link href={`/dashboard/past-campaigns/${id}/wisdom`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-md">
              <BookOpen className="mr-3 h-5 w-5" />
              Curated Wisdom from Gurudev
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
