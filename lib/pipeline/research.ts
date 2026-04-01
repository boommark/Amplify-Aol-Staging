import { generateText } from 'ai'
import { perplexity } from '@ai-sdk/perplexity'
import { loadPrompt } from '@/lib/prompts/registry'
import { renderPrompt } from '@/lib/prompts/renderer'
import { saveResearchDimension, type ResearchDimension } from '@/lib/db/research'

// Re-export for convenience
export type { ResearchDimension } from '@/lib/db/research'

const DIMENSION_QUERIES: Record<ResearchDimension, (region: string, eventType: string) => string> = {
  spirituality: (region, _eventType) =>
    `What is the current interest in spirituality, meditation, and mindfulness in ${region}? Include recent trends, popular practices, and any notable spiritual movements. Focus on data from the last 2 years.`,
  mental_health: (region, _eventType) =>
    `What are the most pressing mental health concerns in ${region}? Include statistics on anxiety, depression, stress levels, and demand for wellness programs. Focus on data from the last 2 years.`,
  sleep_health: (region, _eventType) =>
    `What are the sleep and general health issues prevalent in ${region}? Include data on sleep disorders, lifestyle diseases, and interest in holistic health solutions.`,
  relationships: (region, _eventType) =>
    `What are common relationship and social connection concerns in ${region}? Include data on loneliness, community needs, family dynamics, and social wellness trends.`,
  local_idioms: (region, eventType) =>
    `What are popular local idioms, phrases, and cultural expressions used in ${region} that relate to wellness, peace of mind, inner peace, or personal growth? Include colloquial phrases that would resonate in marketing for a ${eventType} event.`,
  cultural_sensitivities: (region, eventType) =>
    `What cultural sensitivities should a wellness organization be aware of when marketing a ${eventType} event in ${region}? Include religious considerations, taboo topics, communication norms, and respectful messaging guidelines.`,
  seasonal: (region, eventType) =>
    `What seasonal events, festivals, holidays, or significant dates are happening in ${region} in the next 3 months that could be relevant for marketing a ${eventType} event? Include both major and regional observances.`,
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
  onDimensionComplete?: (result: DimensionResult) => void
}): Promise<DimensionResult[]> {
  const { campaignId, region, eventType, onDimensionComplete } = params

  // Load the research prompt template
  const promptData = await loadPrompt('research.regional')
  const systemPrompt = renderPrompt(promptData.template, { region, eventType })

  const dimensions = Object.keys(DIMENSION_QUERIES) as ResearchDimension[]

  // Fire all 7 queries in parallel
  const results = await Promise.allSettled(
    dimensions.map(async (dimension) => {
      const query = DIMENSION_QUERIES[dimension](region, eventType)

      const { text } = await generateText({
        model: perplexity('sonar-pro'),
        system: systemPrompt,
        prompt: query,
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
