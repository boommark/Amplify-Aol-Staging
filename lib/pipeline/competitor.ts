import { generateText } from 'ai'
import { perplexity } from '@ai-sdk/perplexity'

const COMPETITOR_BRANDS = {
  meditation_apps: ['Headspace', 'Calm', 'Mindvalley'],
  spiritual_leaders: ['Isha Foundation / Sadhguru', 'Deepak Chopra', 'Eckhart Tolle'],
  yoga_brands: [
    'Kripalu Center', 'Yoga Journal', 'Yoga International',
    'Judith Hanson Lasater', 'Adriene Mishler', 'B.K.S. Iyengar',
  ],
} as const

/**
 * Scan competitor content for marketing inspiration.
 * Fires a single Perplexity query (not parallel) searching for recent marketing
 * content from specified competitor brands relevant to the region and event type.
 */
export async function runCompetitorScan(params: {
  region: string
  eventType: string
}): Promise<{
  findings: Array<{ label: string; value: string; source?: string }>
  rawText: string
}> {
  const { region, eventType } = params

  const allBrands = [
    ...COMPETITOR_BRANDS.meditation_apps,
    ...COMPETITOR_BRANDS.spiritual_leaders,
    ...COMPETITOR_BRANDS.yoga_brands,
  ]

  const query = `Search for recent marketing content, social media posts, email campaigns, and promotional materials from these wellness and spirituality brands: ${allBrands.join(', ')}. Focus on content that promotes meditation, yoga, breathwork, or wellness workshops/retreats in or relevant to ${region}. What messaging themes, headlines, calls to action, and visual styles are they using for ${eventType}-type events? Include specific examples of successful posts or campaigns from the last 6 months.`

  const { text } = await generateText({
    model: perplexity('sonar-pro'),
    system: 'You are a competitive intelligence analyst for a wellness marketing team. Provide specific, actionable examples of competitor marketing content. Use bullet points. Include source URLs when available.',
    prompt: query,
  })

  // Parse into findings
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter((l) => l.length > 0)

  const urlRegex = /https?:\/\/[^\s)]+/g
  const findings = lines.map((line, i) => {
    const urls = line.match(urlRegex)
    const cleanLine = line.replace(urlRegex, '').trim()
    const colonIdx = cleanLine.indexOf(':')
    if (colonIdx > 0 && colonIdx < 60) {
      return {
        label: cleanLine.slice(0, colonIdx).trim(),
        value: cleanLine.slice(colonIdx + 1).trim(),
        source: urls?.[0],
      }
    }
    return { label: `Insight ${i + 1}`, value: cleanLine, source: urls?.[0] }
  })

  return { findings, rawText: text }
}
