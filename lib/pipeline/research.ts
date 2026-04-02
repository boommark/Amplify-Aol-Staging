import { generateText } from 'ai'
import { perplexity } from '@ai-sdk/perplexity'
import { saveResearchDimension, type ResearchDimension } from '@/lib/db/research'

// Re-export for convenience
export type { ResearchDimension } from '@/lib/db/research'

/**
 * Perplexity system prompt — proven n8n workflow prompt for Art of Living research.
 */
const PERPLEXITY_SYSTEM_PROMPT = `You are a marketing and content researcher who works for the Art of Living foundation. Try to bring in specific examples, illustrations, facts, anecdotes and data in your responses. Limit responses to under 150 words and use bullets. Do not write opening or closing sentences. Write clearly and precisely.`

const DIMENSION_QUERIES: Record<ResearchDimension, (region: string, eventType: string, courseDate?: string) => string> = {
  spirituality: (region, eventType) =>
    `What are the main reasons (include data if available) for pursuing spiritual practices and meditation among residents in ${region} and why? Which of these should Art of Living copywriters prioritize in their messaging for ${eventType} and how? Share as clear, simple instructions for copywriters in 200 words or less.`,
  mental_health: (region, eventType) =>
    `Is there a prevalence of mental health issues among residents in ${region} and why? Which of these should Art of Living copywriters prioritize in their messaging for ${eventType} and how? Share as clear, simple instructions for copywriters in 200 words or less.`,
  sleep_health: (region, eventType) =>
    `Is there a prevalence of sleeplessness and other physical health issues among residents in ${region} and why? Which of these should Art of Living copywriters prioritize in their messaging for ${eventType} and how? Share as clear, simple instructions for copywriters in 200 words or less.`,
  relationships: (region, eventType) =>
    `Is there a prevalence of relationship related issues among residents in ${region} and why? Which of these should Art of Living copywriters prioritize in their messaging for ${eventType} and how? Share as clear, simple instructions for copywriters in 200 words or less.`,
  local_idioms: (region, eventType) =>
    `What are some local idioms, sayings or expressions of ${region} (clean and family friendly) that Art of Living copywriters can use when promoting the ${eventType} to residents? Share as clear, simple instructions in less than 200 words.`,
  cultural_sensitivities: (region, eventType) =>
    `What are some etiquette or ways of talking about spirituality, mental health, stress, relationships and meditation in ${region} that Art of Living's copywriters may incorporate in their content for ${eventType}? What should they avoid and why? Share as clear, simple instructions for copywriters in 200 words or less.`,
  seasonal: (region, eventType, courseDate) =>
    `Are there expressions or attitudes related to moments of cultural, environmental and/or political significance around ${courseDate || 'the coming months'} in ${region} that Art of Living copywriters should incorporate in their copy for ${eventType}? If yes, share typical copy examples. Write simply and clearly, as instructions.`,
}

interface ResearchFinding {
  label: string
  value: string
  source?: string
}

export interface DimensionResult {
  dimension: ResearchDimension
  findings: ResearchFinding[]
  sources: string[]
  rawText: string
}

/**
 * Run all 7 research dimension queries in parallel using Perplexity Sonar Pro.
 * Each query is independent and persisted individually to campaign_research as it completes.
 * Returns results as they resolve (caller can use onDimensionComplete callback for progressive rendering).
 */
export async function runResearchPipeline(params: {
  campaignId: string
  region: string
  eventType: string
  courseDate?: string
  onDimensionComplete?: (result: DimensionResult) => void
}): Promise<DimensionResult[]> {
  const { campaignId, region, eventType, courseDate, onDimensionComplete } = params

  const dimensions = Object.keys(DIMENSION_QUERIES) as ResearchDimension[]

  // Fire all 7 queries in parallel
  const results = await Promise.allSettled(
    dimensions.map(async (dimension) => {
      const query = DIMENSION_QUERIES[dimension](region, eventType, courseDate)

      const { text } = await generateText({
        model: perplexity('sonar-pro'),
        system: PERPLEXITY_SYSTEM_PROMPT,
        prompt: query,
        maxTokens: 600,
      })

      // Parse the text response into structured findings
      const findings = parseResearchFindings(text)
      const sources = extractSources(text)

      const result: DimensionResult = {
        dimension,
        findings,
        sources,
        rawText: text,
      }

      // Persist via the DB utility layer (not direct Supabase calls)
      await saveResearchDimension(
        campaignId,
        dimension,
        { items: findings, raw: text },
        { urls: sources }
      )

      onDimensionComplete?.(result)
      return result
    })
  )

  // Collect successful results, log failures
  return results
    .filter((r): r is PromiseFulfilledResult<DimensionResult> => r.status === 'fulfilled')
    .map((r) => r.value)
}

/**
 * Parse Perplexity text response into structured findings array.
 * Perplexity returns bullet-pointed text; split on bullets/newlines.
 */
function parseResearchFindings(text: string): ResearchFinding[] {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter((l) => l.length > 0)

  return lines.map((line, i) => {
    // Try to split on colon for label:value format
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0 && colonIdx < 60) {
      return {
        label: line.slice(0, colonIdx).trim(),
        value: line.slice(colonIdx + 1).trim(),
      }
    }
    return { label: `Finding ${i + 1}`, value: line }
  })
}

/**
 * Extract URLs from text (Perplexity often includes source links).
 */
function extractSources(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)]+/g
  return [...new Set(text.match(urlRegex) || [])]
}

/**
 * Add a user's research note to the campaign.
 * Stores as a special 'user_note' type in campaign_research findings.
 * Note: This inserts with the closest matching dimension. If no dimension matches,
 * default to 'cultural_sensitivities' as the catch-all.
 */
export async function addResearchNote(params: {
  campaignId: string
  note: string
  dimension?: ResearchDimension
}): Promise<void> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const dimension = params.dimension || 'cultural_sensitivities'

  // Upsert: if dimension already exists, append note to findings
  const { data: existing } = await supabase
    .from('campaign_research')
    .select('id, findings')
    .eq('campaign_id', params.campaignId)
    .eq('dimension', dimension)
    .single()

  if (existing) {
    const currentFindings = existing.findings as { items?: ResearchFinding[]; raw?: string; userNotes?: string[] }
    const userNotes = currentFindings.userNotes || []
    userNotes.push(params.note)
    await supabase
      .from('campaign_research')
      .update({ findings: { ...currentFindings, userNotes } })
      .eq('id', existing.id)
  } else {
    // For new notes without existing research, use saveResearchDimension
    await saveResearchDimension(
      params.campaignId,
      dimension,
      { items: [], raw: '', userNotes: [params.note] },
      undefined
    )
  }
}

/**
 * Package all research for a campaign into a single context string
 * for downstream content generation (wisdom questions, copy writing).
 */
export async function packageResearchContext(campaignId: string): Promise<string> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: research } = await supabase
    .from('campaign_research')
    .select('dimension, findings')
    .eq('campaign_id', campaignId)
    .order('created_at')

  if (!research || research.length === 0) return ''

  return research
    .map((r) => {
      const findings = r.findings as { items?: ResearchFinding[]; raw?: string; userNotes?: string[] }
      const dimensionLabel = r.dimension.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      let text = `## ${dimensionLabel}\n`
      if (findings.items && findings.items.length > 0) {
        text += findings.items.map((f: ResearchFinding) => `- **${f.label}**: ${f.value}`).join('\n')
      } else if (findings.raw) {
        text += findings.raw
      }
      if (findings.userNotes && findings.userNotes.length > 0) {
        text += '\n\n### User Notes\n' + findings.userNotes.map((n: string) => `- ${n}`).join('\n')
      }
      return text
    })
    .join('\n\n')
}
