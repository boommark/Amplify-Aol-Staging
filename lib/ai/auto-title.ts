import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export async function generateCampaignTitle(firstUserMessage: string): Promise<string> {
  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5'),
    schema: z.object({ title: z.string().max(60) }),
    prompt: `Generate a concise campaign title (max 60 chars) from this user message about a marketing campaign. Format: "[City/Topic] [Event Type] — [Date/Detail]". Example: "Bangalore Yoga Workshop — March 2026". Message: "${firstUserMessage}"`,
  })
  return object.title
}
