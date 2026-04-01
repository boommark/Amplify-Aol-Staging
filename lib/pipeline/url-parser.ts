import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export interface ParsedWorkshopData {
  title?: string
  date?: string
  location?: string
  region?: string
  eventType?: string
  description?: string
  price?: string
  source: string
}

const ART_OF_LIVING_DOMAIN = 'artofliving.org'

/**
 * Fetch page HTML with a browser-like User-Agent.
 * Returns empty string on network failure.
 */
async function fetchPageHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return ''
    return await response.text()
  } catch {
    return ''
  }
}

/**
 * Extract a meta tag value from HTML.
 */
function extractMeta(html: string, property: string): string | undefined {
  // Match both property and name attributes
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return undefined
}

/**
 * Extract the <title> tag value from HTML.
 */
function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1]?.trim()
}

/**
 * Strip HTML tags from a string, collapsing whitespace.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Infer region from location/address text by looking for known city/country names.
 * Returns undefined if region cannot be determined.
 */
function inferRegion(text: string): string | undefined {
  if (!text) return undefined
  // US state abbreviations and major cities
  const usStatePattern = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/
  const usStateMatch = text.match(usStatePattern)
  if (usStateMatch) return `${usStateMatch[1]}, USA`

  // Indian cities
  const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'India']
  for (const city of indianCities) {
    if (text.toLowerCase().includes(city.toLowerCase())) return city
  }

  // Canadian provinces
  const canadaPattern = /\b(Ontario|Quebec|British Columbia|Alberta|Manitoba|Saskatchewan|Nova Scotia|New Brunswick|Canada)\b/i
  const canadaMatch = text.match(canadaPattern)
  if (canadaMatch) return canadaMatch[1]

  // UK
  if (/\b(London|Manchester|Birmingham|UK|United Kingdom|England|Scotland|Wales)\b/i.test(text)) {
    const match = text.match(/\b(London|Manchester|Birmingham|UK|United Kingdom|England|Scotland|Wales)\b/i)
    return match?.[1] || 'UK'
  }

  // Australia
  if (/\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Australia)\b/i.test(text)) {
    const match = text.match(/\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Australia)\b/i)
    return match?.[1] || 'Australia'
  }

  return undefined
}

/**
 * Infer event type from title/description text.
 */
function inferEventType(text: string): string | undefined {
  const lower = text.toLowerCase()
  if (lower.includes('sudarshan kriya') || lower.includes('happiness program') || lower.includes('art of living part 1') || lower.includes('part 1 course')) {
    return 'Happiness Program'
  }
  if (lower.includes('art of living part 2') || lower.includes('part 2 course') || lower.includes('advanced meditation')) {
    return 'Advanced Meditation'
  }
  if (lower.includes('silence program') || lower.includes('sahaj samadhi') || lower.includes('art excel')) {
    return lower.includes('art excel') ? 'Art Excel (Youth)' : 'Silence Program'
  }
  if (lower.includes('sri sri yoga') || lower.includes('yoga retreat')) {
    return 'Yoga Retreat'
  }
  if (lower.includes('meditation') && lower.includes('workshop')) {
    return 'Meditation Workshop'
  }
  if (lower.includes('meditation')) {
    return 'Meditation Program'
  }
  if (lower.includes('yoga')) {
    return 'Yoga Program'
  }
  if (lower.includes('workshop')) {
    return 'Workshop'
  }
  if (lower.includes('retreat')) {
    return 'Retreat'
  }
  if (lower.includes('seminar') || lower.includes('conference')) {
    return 'Seminar'
  }
  return undefined
}

/**
 * Parse Art of Living event page specifically.
 * artofliving.org event pages have a consistent structure we can target.
 */
function parseArtOfLivingPage(html: string, url: string): ParsedWorkshopData {
  const result: ParsedWorkshopData = { source: url }

  // Title: og:title or <title>
  result.title =
    extractMeta(html, 'og:title') ||
    extractTitle(html)

  // Description: og:description or meta description
  result.description =
    extractMeta(html, 'og:description') ||
    extractMeta(html, 'description')

  // Strip to plain text for pattern matching
  const plainText = stripHtml(html).slice(0, 8000)

  // Date: look for date patterns in the page
  // Art of Living uses formats like "Jan 15 – 17, 2025" or "January 15-17, 2025"
  const datePatterns = [
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:\s*[-–]\s*\d{1,2})?,?\s+\d{4})/i,
    /(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/,
    /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:\s*[-–]\s*\d{1,2})?,?\s+\d{4})/i,
  ]
  for (const pattern of datePatterns) {
    const match = plainText.match(pattern)
    if (match?.[1]) {
      result.date = match[1].trim()
      break
    }
  }

  // Location: look for city/state or address patterns
  // Art of Living often has "Location:" labels
  const locationPattern = /(?:location|venue|place|address)[:\s]+([^\n,]+(?:,\s*[^\n,]+){0,2})/i
  const locationMatch = plainText.match(locationPattern)
  if (locationMatch?.[1]) {
    result.location = locationMatch[1].trim()
    result.region = inferRegion(locationMatch[1]) || inferRegion(plainText.slice(0, 2000))
  } else {
    result.region = inferRegion(plainText.slice(0, 2000))
  }

  // Price: look for price/fee patterns
  const pricePattern = /(?:\$\s*\d+(?:\.\d{2})?|\d+\s*(?:USD|INR|CAD|AUD|GBP|EUR)|\bfree\b)/i
  const priceMatch = plainText.match(pricePattern)
  if (priceMatch) {
    result.price = priceMatch[0].trim()
  }

  // Infer event type from title and description
  const textForInference = [result.title, result.description].filter(Boolean).join(' ')
  result.eventType = inferEventType(textForInference) || inferEventType(plainText.slice(0, 3000))

  return result
}

/**
 * Use Claude Haiku to extract structured event data from generic page text.
 */
async function extractWithAI(pageText: string, url: string): Promise<ParsedWorkshopData> {
  const truncated = pageText.slice(0, 4000)

  try {
    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5'),
      system: `You extract structured event/workshop details from webpage text.
Return only what is explicitly stated on the page — do not invent or guess values.
For fields you cannot find, omit them (leave undefined).`,
      prompt: `Extract event details from this webpage text:

URL: ${url}

TEXT:
${truncated}

Extract: event title, date, location/city, event type (e.g. "Meditation Workshop", "Yoga Retreat", "Wellness Seminar"), description (1-2 sentences), and price if mentioned.`,
      schema: z.object({
        title: z.string().optional(),
        date: z.string().optional(),
        location: z.string().optional(),
        eventType: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
      }),
    })

    return {
      title: object.title,
      date: object.date,
      location: object.location,
      region: object.location ? inferRegion(object.location) || object.location : undefined,
      eventType: object.eventType,
      description: object.description,
      price: object.price,
      source: url,
    }
  } catch {
    // AI extraction failed — return partial data with source only
    return { source: url }
  }
}

/**
 * Parse a workshop URL and extract structured event data.
 * - Art of Living URLs: domain-specific parsing
 * - Generic URLs: fetch HTML, extract meta tags, fall back to AI extraction
 * - Graceful degradation: partial data on any failure
 */
export async function parseWorkshopUrl(url: string): Promise<ParsedWorkshopData> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return { source: url }
  }

  const hostname = parsedUrl.hostname.replace(/^www\./, '')
  const html = await fetchPageHtml(url)

  if (!html) {
    // Network failure — return source only
    return { source: url }
  }

  // Art of Living: use domain-specific parser
  if (hostname.includes(ART_OF_LIVING_DOMAIN)) {
    return parseArtOfLivingPage(html, url)
  }

  // Generic page: try meta tags first, then AI extraction for the rest
  const title = extractMeta(html, 'og:title') || extractTitle(html)
  const description = extractMeta(html, 'og:description') || extractMeta(html, 'description')
  const plainText = stripHtml(html)

  // If we got useful meta data, try to extract more from plain text
  if (title) {
    // Use AI to extract structured details from page text
    const aiResult = await extractWithAI(plainText, url)
    return {
      ...aiResult,
      // Prefer meta tags over AI extraction for title/description (more reliable)
      title: title || aiResult.title,
      description: description || aiResult.description,
      source: url,
    }
  }

  // Last resort: pure AI extraction from full page text
  return extractWithAI(plainText, url)
}
