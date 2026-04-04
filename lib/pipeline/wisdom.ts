import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { packageResearchContext } from '@/lib/pipeline/research'
import { loadPrompt } from '@/lib/prompts/registry'
import { renderPrompt } from '@/lib/prompts/renderer'

const ASK_GURUDEV_API = 'https://askgurudev.me/public_search/'
const ASK_GURUDEV_TIMEOUT_MS = 15000 // 15 second timeout

interface AskGurudevMatch {
  content: string
  category: string // text/archive, text/web, video/web, honeypot, manual
  source: string
  date: string
  location: string
  event: string
}

interface AskGurudevResponse {
  matches: AskGurudevMatch[]
  meta?: string
}

export interface WisdomQuote {
  quoteId: string
  short: string
  medium: string
  long: string
  source: string
  category: string
  date?: string
  location?: string
  event?: string
  isManual: boolean
  isCrisisFlag: boolean
}

/**
 * Query the Ask Gurudev API with a question.
 * Returns matched quotes or null on timeout/error.
 */
export async function queryAskGurudev(question: string): Promise<{
  matches: AskGurudevMatch[]
  hasCrisisFlag: boolean
} | null> {
  const apiKey = process.env.ASK_GURUDEV_API_KEY || 'test'

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), ASK_GURUDEV_TIMEOUT_MS)

    const response = await fetch(
      `${ASK_GURUDEV_API}?question=${encodeURIComponent(question)}`,
      {
        headers: { 'X-API-KEY': apiKey },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Ask Gurudev API error: ${response.status}`)
      return null
    }

    const data: AskGurudevResponse = await response.json()

    // Check for suicide/crisis meta flag (meta is a string like "suicide" or "low match")
    if (data.meta === 'suicide') {
      return { matches: [], hasCrisisFlag: true }
    }

    // Filter out honeypot results
    const validMatches = data.matches.filter((m) => m.category !== 'honeypot')

    return { matches: validMatches, hasCrisisFlag: false }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('Ask Gurudev API timed out')
    } else {
      console.error('Ask Gurudev API error:', error)
    }
    return null
  }
}

/**
 * Generate 5 contextually relevant questions for Ask Gurudev based on research context.
 * Uses Claude Haiku for fast, cheap question generation.
 */
async function generateWisdomQuestions(researchContext: string): Promise<string[]> {
  const promptData = await loadPrompt('wisdom.questions')
  const systemPrompt = renderPrompt(promptData.template, { research: researchContext })

  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5'),
    system: systemPrompt,
    prompt: `Based on this research context, generate 5 questions to ask a spiritual teacher about topics that would resonate with this audience. Questions should be about life topics (stress, relationships, purpose, sleep, happiness) not about the teacher directly.\n\nResearch:\n${researchContext}`,
    schema: z.object({
      questions: z.array(z.string()).describe('Generate exactly 5 questions about life topics'),
    }),
  })

  return object.questions
}

/**
 * Curate a quote into short/medium/long formats.
 * Uses Claude Haiku to extract key sentences at different lengths.
 * The original quote text is preserved verbatim — the AI only selects which sentences to include.
 */
async function curateQuoteFormats(fullContent: string): Promise<{
  short: string
  medium: string
  long: string
}> {
  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5'),
    system: 'You are selecting excerpts from Gurudev Sri Sri Ravi Shankar quotes. CRITICAL: Use ONLY the exact words from the original text. Never paraphrase, rephrase, or add words. Select the most impactful sentences verbatim.',
    prompt: `From this quote, select excerpts at three lengths. Use ONLY exact sentences from the original — do not modify any words:\n\n"${fullContent}"`,
    schema: z.object({
      short: z.string().describe('1-2 sentences, the most impactful core message verbatim'),
      medium: z.string().describe('2-3 sentences, expanding on the core message verbatim'),
      long: z.string().describe('The full quote or 4+ sentences if very long, verbatim'),
    }),
  })

  return object
}

/**
 * Run the full wisdom pipeline:
 * 1. Generate 5 questions from research context
 * 2. Query Ask Gurudev API with each question
 * 3. Deduplicate and curate top 3+ quotes into short/medium/long formats
 * 4. Return structured wisdom quotes for rendering
 */
export async function runWisdomPipeline(params: {
  campaignId: string
  onQuoteReady?: (quote: WisdomQuote) => void
}): Promise<{
  quotes: WisdomQuote[]
  crisisFlag: boolean
  timedOut: boolean
}> {
  const { campaignId, onQuoteReady } = params

  // 1. Package research context
  const researchContext = await packageResearchContext(campaignId)
  if (!researchContext) {
    return { quotes: [], crisisFlag: false, timedOut: false }
  }

  // 2. Generate 5 contextual questions
  const questions = await generateWisdomQuestions(researchContext)

  // 3. Query Ask Gurudev for each question (parallel)
  const apiResults = await Promise.allSettled(
    questions.map((q) => queryAskGurudev(q))
  )

  // Check for crisis flag in any response
  const crisisFlag = apiResults.some(
    (r) => r.status === 'fulfilled' && r.value?.hasCrisisFlag
  )
  if (crisisFlag) {
    return { quotes: [], crisisFlag: true, timedOut: false }
  }

  // Check if all timed out
  const allTimedOut = apiResults.every(
    (r) => r.status === 'rejected' || r.value === null
  )
  if (allTimedOut) {
    return { quotes: [], crisisFlag: false, timedOut: true }
  }

  // 4. Collect and deduplicate matches
  const allMatches: AskGurudevMatch[] = []
  const seenContent = new Set<string>()

  for (const result of apiResults) {
    if (result.status === 'fulfilled' && result.value?.matches) {
      for (const match of result.value.matches) {
        // Deduplicate by first 100 chars of content
        const key = match.content.slice(0, 100).toLowerCase()
        if (!seenContent.has(key)) {
          seenContent.add(key)
          allMatches.push(match)
        }
      }
    }
  }

  // 5. Take top 3-5 quotes (prefer text/archive and text/web over manual)
  const sorted = allMatches.sort((a, b) => {
    const priority: Record<string, number> = { 'text/archive': 0, 'text/web': 1, 'video/web': 2, 'manual': 3 }
    return (priority[a.category] ?? 4) - (priority[b.category] ?? 4)
  })
  const topQuotes = sorted.slice(0, 5)

  // 6. Curate each into short/medium/long (parallel)
  const curatedResults = await Promise.allSettled(
    topQuotes.map(async (match, i) => {
      const formats = await curateQuoteFormats(match.content)
      const quote: WisdomQuote = {
        quoteId: `wisdom-${campaignId}-${i}`,
        ...formats,
        source: match.source,
        category: match.category,
        date: match.date || undefined,
        location: match.location || undefined,
        event: match.event || undefined,
        isManual: match.category === 'manual',
        isCrisisFlag: false,
      }
      onQuoteReady?.(quote)
      return quote
    })
  )

  const quotes = curatedResults
    .filter((r): r is PromiseFulfilledResult<WisdomQuote> => r.status === 'fulfilled')
    .map((r) => r.value)

  return { quotes, crisisFlag: false, timedOut: false }
}
