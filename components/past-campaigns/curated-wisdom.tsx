"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Quote } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CuratedWisdomProps {
  id: string
}

interface WisdomData {
  id: string
  name: string
  course: string
  date: string
  location: string
  audience: string
  imageUrl: string

  // Topic captions
  topic1: string
  topic2: string
  topic3: string

  // Topic 1 quotes
  shortQuote1: string
  mediumQuote1: string
  rawWisdom1: string

  // Topic 2 quotes
  shortQuote2: string
  mediumQuote2: string
  rawWisdom2: string

  // Topic 3 quotes
  shortQuote3: string
  mediumQuote3: string
  rawWisdom3: string

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

interface QuoteBlockProps {
  title: string
  quote: string
  variant?: "short" | "medium"
}

function QuoteBlock({ title, quote, variant = "short" }: QuoteBlockProps) {
  // Clean the quote text
  const cleanedQuote = cleanText(quote)

  return (
    <Card
      className={cn(
        "border border-slate-200 bg-white transition-all duration-200 hover:shadow-md hover:border-blue-200",
        variant === "short" ? "h-auto" : "h-auto",
      )}
    >
      <CardContent className="p-6">
        <h4 className="text-sm font-medium text-blue-700 mb-2">{title}</h4>
        <div className="flex">
          <Quote className="h-6 w-6 text-blue-400 mr-2 flex-shrink-0 mt-1" />
          <p className={cn("text-slate-700 italic break-words", variant === "short" ? "text-lg" : "text-base")}>
            {cleanedQuote}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface RawWisdomPillProps {
  content: string
}

function RawWisdomPill({ content }: RawWisdomPillProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Clean the content
  const cleanedContent = cleanText(content)

  // Split content into sentences and take first 2
  const sentences = cleanedContent.split(". ").filter(Boolean)
  const previewSentences = sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "")
  const hasMoreContent = sentences.length > 2

  return (
    <div className="mt-4">
      <div
        className={cn(
          "border border-blue-100 rounded-full px-4 py-2 bg-blue-50 inline-flex items-center cursor-pointer transition-all duration-200",
          isExpanded ? "rounded-3xl w-full" : "hover:bg-blue-100",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium text-blue-700 mr-2">Raw Wisdom</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-100"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <div className={cn("mt-2 transition-all duration-300", isExpanded ? "block" : "hidden")}>
        <Card className="border border-blue-100 bg-white p-4">
          <div className="text-slate-700 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: "thin" }}>
            {parseMarkdown(cleanedContent)}
          </div>
        </Card>
      </div>

      {!isExpanded && hasMoreContent && (
        <div
          className="mt-2 text-slate-600 text-sm pl-4 cursor-pointer hover:text-blue-700 break-words"
          onClick={() => setIsExpanded(true)}
        >
          {previewSentences} <span className="text-blue-600 font-medium">Click to read more...</span>
        </div>
      )}
    </div>
  )
}

export function CuratedWisdom({ id }: CuratedWisdomProps) {
  const [wisdom, setWisdom] = useState<WisdomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWisdom() {
      try {
        setLoading(true)
        console.log(`Fetching wisdom data for campaign with ID: ${id}`)
        const response = await fetch(`/api/past-campaigns/${id}/wisdom`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("API error response:", errorData)
          throw new Error(`Failed to fetch wisdom data: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Wisdom data from API:", data)
        setWisdom(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching wisdom data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch wisdom data")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWisdom()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/dashboard/past-campaigns/${id}`}>
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
        </div>
      </div>
    )
  }

  if (error || !wisdom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/dashboard/past-campaigns/${id}`}>
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error || "Wisdom data not found"}</p>
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
          <Link href={`/dashboard/past-campaigns/${id}`}>
            <Button variant="ghost" size="sm" className="mr-4 hover:bg-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">{wisdom.name}</h1>
        </div>
        <Link href={`/dashboard/past-campaigns/${id}/marketing-content`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Marketing Content
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-1">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
            <Image
              src={wisdom.imageUrl || "/placeholder.svg?height=200&width=400"}
              alt={wisdom.name}
              fill
              className="object-cover"
              unoptimized={wisdom.imageUrl && !wisdom.imageUrl.startsWith("/")}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Course</h3>
                  <p className="mt-1 font-semibold text-slate-800">{wisdom.course}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Date</h3>
                  <p className="mt-1 font-semibold text-slate-800">{wisdom.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Location</h3>
                  <p className="mt-1 font-semibold text-slate-800">{wisdom.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Audience</h3>
                  <p className="mt-1 font-semibold text-slate-800">{wisdom.audience}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center mb-8">
          <Quote className="h-8 w-8 text-blue-500 mr-3" />
          <h2 className="text-3xl font-bold text-blue-800">Curated Wisdom from Gurudev</h2>
        </div>

        {/* Topic 1 */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 border-b border-blue-100 pb-2">
            Topic 1 - {wisdom.topic1}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <QuoteBlock title="Short Quote" quote={wisdom.shortQuote1} variant="short" />
            <QuoteBlock title="Medium Quote" quote={wisdom.mediumQuote1} variant="medium" />
          </div>

          <RawWisdomPill content={wisdom.rawWisdom1} />
        </div>

        {/* Topic 2 */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 border-b border-blue-100 pb-2">
            Topic 2 - {wisdom.topic2}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <QuoteBlock title="Short Quote" quote={wisdom.shortQuote2} variant="short" />
            <QuoteBlock title="Medium Quote" quote={wisdom.mediumQuote2} variant="medium" />
          </div>

          <RawWisdomPill content={wisdom.rawWisdom2} />
        </div>

        {/* Topic 3 */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 border-b border-blue-100 pb-2">
            Topic 3 - {wisdom.topic3}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <QuoteBlock title="Short Quote" quote={wisdom.shortQuote3} variant="short" />
            <QuoteBlock title="Medium Quote" quote={wisdom.mediumQuote3} variant="medium" />
          </div>

          <RawWisdomPill content={wisdom.rawWisdom3} />
        </div>
      </div>
      <div className="flex justify-center mt-12 mb-8">
        <Link href={`/dashboard/past-campaigns/${id}/marketing-content`}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
            <FileText className="mr-2 h-5 w-5" />
            Marketing Content
          </Button>
        </Link>
      </div>
    </div>
  )
}
