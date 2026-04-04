import { generateText } from 'ai'
import { TASK_MODEL_MAP, type TaskKey } from '@/lib/ai/models'
import { loadPrompt } from '@/lib/prompts/registry'
import { renderPrompt } from '@/lib/prompts/renderer'
import { packageResearchContext } from '@/lib/pipeline/research'
import { saveAsset, updateAssetContent } from '@/lib/db/assets'

// Brand voice enforcement preamble — prepended to ALL copy generation prompts
// Full principles documented in docs/COPY-PRINCIPLES.md
const BRAND_VOICE_PREAMBLE = `
BRAND VOICE & COPY PRINCIPLES (Art of Living — MANDATORY):

POSTURE: You are a friend sharing something genuinely wonderful you discovered. Not a therapist diagnosing. Not a salesperson pushing. Not a guru lecturing. Stand beside the reader, not above them.

MESSAGING ARC — Follow this order in every piece:
1. FEEL: Open with a felt experience the reader recognizes from daily life. Name it, don't diagnose it. "You know that feeling when..." not "Do you suffer from..."
2. SEE: Drop ONE Gurudev quote that crystallizes what they were already feeling. Give it its own line. Never open with the quote — earn it with 1-2 sentences of context first.
3. BELIEVE: One line of proof (millions of practitioners, 100+ studies, 40+ years). Maximum two proof points.
4. ACT: Date, location in a clean block. Single soft CTA ("Find out more" / "Save your spot").

QUOTE RULES:
- One quote per piece. Maximum. Multiple quotes become a sermon.
- Must be VERBATIM from Gurudev Sri Sri Ravi Shankar. Never paraphrase.
- Must be a COMPLETE standalone thought (passes the "wall poster test").
- Place AFTER 1-2 sentences of context. Never open with it.
- Give it its own line with attribution. Let it breathe.

CONSTRAINTS:
- Average sentence: 14-16 words. Vary for rhythm.
- Paragraphs: 20-40 words each.
- Understate. Say less, mean more. No exclamation marks.
- One CTA per piece. Logistics in a separate visual block.

NEVER USE: unlock, transform, journey, empower, elevate, harness, leverage, holistic, emojis, hashtags in body, exclamation marks, "Did you know...", "Here's what most people don't know...", urgency theater ("Only 5 spots left!").
NEVER: Lead with the organization. Diagnose the reader. Dump research statistics as scare tactics. Produce multiple copies per channel unless asked. Warm up — start with the point.

OUTPUT: Return ONLY the copy. No meta-commentary, no "here is your copy," no explanations.
`.trim()

type StandardChannel = 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'flyer'

const CHANNEL_TASK_MAP: Record<StandardChannel, TaskKey> = {
  email: 'copy.email',
  whatsapp: 'copy.whatsapp',
  instagram: 'copy.instagram',
  facebook: 'copy.facebook',
  flyer: 'copy.flyer',
}

export interface GeneratedCopy {
  channel: string
  content: string
  assetId: string // ID from campaign_assets for later refinement
}

/**
 * Generate copy for a single channel using the channel-specific prompt and model.
 * English only — translation support deferred per user decision.
 */
export async function generateChannelCopy(params: {
  campaignId: string
  channel: string
  researchContext: string
  wisdomContext: string
  region: string
  eventType: string
  eventDate?: string
}): Promise<GeneratedCopy> {
  const { campaignId, channel, researchContext, wisdomContext, region, eventType, eventDate } = params

  const isStandardChannel = channel in CHANNEL_TASK_MAP
  const taskKey = isStandardChannel
    ? CHANNEL_TASK_MAP[channel as StandardChannel]
    : ('copy.custom' as TaskKey)

  // Load channel-specific prompt or use custom channel prompt
  const promptData = await loadPrompt(taskKey)
  const variables: Record<string, string> = {
    region,
    eventType,
    eventDate: eventDate || 'TBD',
    research: researchContext,
    wisdom: wisdomContext,
    channel: channel, // Used by copy.custom for channel-specific adaptation
  }
  const channelPrompt = renderPrompt(promptData.template, variables)

  // Build system prompt with brand voice
  const systemPrompt = `${BRAND_VOICE_PREAMBLE}\n\n${channelPrompt}`

  // Use the model from TASK_MODEL_MAP
  const { model } = TASK_MODEL_MAP[taskKey]

  let userPrompt = `Generate ${channel} marketing copy for an Art of Living ${eventType} event in ${region}.`
  if (eventDate) {
    userPrompt += ` Event date: ${eventDate}.`
  }
  userPrompt += `\n\nResearch Context:\n${researchContext}\n\nWisdom & Quotes:\n${wisdomContext}`

  // For custom channels, add channel-specific best practices
  if (!isStandardChannel) {
    userPrompt += `\n\nThis is for ${channel}. Follow best practices for ${channel} content: appropriate length, tone, and format conventions for this platform.`
  }

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
  })

  // Persist to campaign_assets via the DB utility layer
  const asset = await saveAsset({
    campaignId,
    assetType: 'copy',
    channel,
    content: text,
    metadata: { taskKey },
  })

  return {
    channel,
    content: text,
    assetId: asset.id,
  }
}

/**
 * Generate copy for all selected channels in parallel.
 * Email is generated first (premium Claude Sonnet model), then remaining channels in parallel.
 * Calls onChannelComplete for progressive rendering as each channel finishes.
 */
export async function generateAllChannels(params: {
  campaignId: string
  channels: string[]
  region: string
  eventType: string
  eventDate?: string
  wisdomContext?: string
  onChannelComplete?: (copy: GeneratedCopy) => void
}): Promise<GeneratedCopy[]> {
  const { campaignId, channels, region, eventType, eventDate, wisdomContext, onChannelComplete } = params

  // Package research context once for all channels
  const researchContext = await packageResearchContext(campaignId)

  // Email is premium (Claude Sonnet) so generate it first, then rest in parallel
  const emailChannels = channels.filter((c) => c === 'email')
  const otherChannels = channels.filter((c) => c !== 'email')

  const results: GeneratedCopy[] = []

  // Generate email first if selected
  for (const channel of emailChannels) {
    try {
      const copy = await generateChannelCopy({
        campaignId,
        channel,
        researchContext,
        wisdomContext: wisdomContext || '',
        region,
        eventType,
        eventDate,
      })
      results.push(copy)
      onChannelComplete?.(copy)
    } catch (error) {
      console.error(`Copy generation failed for ${channel}:`, error)
    }
  }

  // Generate remaining channels in parallel
  const parallelResults = await Promise.allSettled(
    otherChannels.map(async (channel) => {
      const copy = await generateChannelCopy({
        campaignId,
        channel,
        researchContext,
        wisdomContext: wisdomContext || '',
        region,
        eventType,
        eventDate,
      })
      onChannelComplete?.(copy)
      return copy
    })
  )

  for (const result of parallelResults) {
    if (result.status === 'fulfilled') {
      results.push(result.value)
    }
  }

  return results
}

/**
 * Refine a specific channel's copy based on user instruction.
 * Loads existing copy from campaign_assets, sends to AI with refinement instruction.
 * Updates only the specified asset — does not regenerate other channels.
 */
export async function refineChannelCopy(params: {
  assetId: string
  campaignId: string
  channel: string
  instruction: string
}): Promise<GeneratedCopy> {
  const { assetId, campaignId, channel, instruction } = params
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  // Load existing copy
  const { data: asset } = await supabase
    .from('campaign_assets')
    .select('content, metadata')
    .eq('id', assetId)
    .single()

  if (!asset) throw new Error('Asset not found')

  const isStandardChannel = channel in CHANNEL_TASK_MAP
  const taskKey = isStandardChannel
    ? CHANNEL_TASK_MAP[channel as StandardChannel]
    : ('copy.custom' as TaskKey)

  const { model } = TASK_MODEL_MAP[taskKey]

  const refinementPrompt = `Here is existing ${channel} marketing copy:\n\n${asset.content}\n\nUser instruction: ${instruction}\n\nApply the user's instruction to improve this copy. Return ONLY the updated copy, nothing else.`

  const { text } = await generateText({
    model,
    system: BRAND_VOICE_PREAMBLE,
    prompt: refinementPrompt,
  })

  // Update the asset in place via DB utility
  await updateAssetContent(assetId, text)

  // Suppress unused variable warning — campaignId kept for signature completeness
  void campaignId

  return {
    channel,
    content: text,
    assetId,
  }
}
