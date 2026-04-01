import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export type PipelineIntent =
  | { type: 'chat' }
  | { type: 'url_parse'; url: string }
  | { type: 'research'; region: string; eventType: string; eventDate?: string }
  | { type: 'add_note'; note: string }
  | { type: 'competitor_scan' }
  | { type: 'wisdom' }
  | { type: 'copy_generate'; channels: string[] }
  | { type: 'copy_refine'; channel: string; instruction: string }
  | { type: 'different_topic' }

/**
 * Detect what pipeline action the user's message implies.
 * Uses fast-path exact matching for action chip prompts, then falls back
 * to Claude Haiku for AI classification of ambiguous messages.
 */
export async function detectPipelineIntent(
  userMessage: string,
  conversationContext: {
    hasResearch: boolean
    hasWisdom: boolean
    hasCopy: boolean
    campaignRegion?: string
    campaignEventType?: string
  }
): Promise<PipelineIntent> {
  // URL detection — FIRST check, before all others.
  // If the message contains a URL, extract it and return url_parse intent.
  const urlMatch = userMessage.match(/https?:\/\/[^\s]+/)
  if (urlMatch) {
    return { type: 'url_parse', url: urlMatch[0] }
  }

  // Fast path: check for action chip prompts (exact matches from ActionChips)
  const normalizedMsg = userMessage.trim().toLowerCase()

  // Action chip exact matches
  if (normalizedMsg === 'continue to wisdom' || normalizedMsg === 'continue to wisdom stage') {
    return { type: 'wisdom' }
  }
  if (normalizedMsg === 'scan competitor content for inspiration' || normalizedMsg === 'scan competitors') {
    return { type: 'competitor_scan' }
  }
  if (normalizedMsg.startsWith('generate copy') || normalizedMsg === 'continue to copy') {
    return { type: 'copy_generate', channels: [] } // Channels determined by ChannelSelector, not message
  }
  if (normalizedMsg === 'different topic' || normalizedMsg === 'try different topic') {
    return { type: 'different_topic' }
  }

  // AI classification for ambiguous messages
  try {
    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5'),
      system: `You classify user messages in a marketing content pipeline.
The pipeline has stages: research → wisdom → copy.
Current state: hasResearch=${conversationContext.hasResearch}, hasWisdom=${conversationContext.hasWisdom}, hasCopy=${conversationContext.hasCopy}`,
      prompt: `Classify this user message: "${userMessage}"

If the user describes a workshop/event with a location/region and event type, classify as "research".
If the user adds a note like "Also, there's a Diwali event that week", classify as "add_note".
If the user asks to refine specific channel copy (e.g. "make the email headline shorter"), classify as "copy_refine".
If the message is general conversation, classify as "chat".`,
      schema: z.discriminatedUnion('type', [
        z.object({ type: z.literal('chat') }),
        z.object({
          type: z.literal('research'),
          region: z.string(),
          eventType: z.string(),
          eventDate: z.string().optional(),
        }),
        z.object({ type: z.literal('add_note'), note: z.string() }),
        z.object({ type: z.literal('copy_refine'), channel: z.string(), instruction: z.string() }),
      ]),
    })
    return object as PipelineIntent
  } catch {
    // On classification failure, default to chat
    return { type: 'chat' }
  }
}
