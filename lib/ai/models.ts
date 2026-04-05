import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'

export const TASK_MODEL_MAP = {
  'chat.orchestrate':    { model: anthropic('claude-sonnet-4-5'), label: 'Claude Sonnet' },
  'copy.premium':        { model: anthropic('claude-sonnet-4-5'), label: 'Claude Sonnet' },
  'copy.volume':         { model: google('gemini-2.0-flash'), label: 'Gemini Flash' },
  'research.regional':   { model: perplexity('sonar-pro'), label: 'Perplexity Sonar' },
  'image.quote':         { model: google('gemini-3.1-flash-image-preview'), label: 'Nano Banana Pro' },
  'image.ad-creative':   { model: google('gemini-3.1-flash-image-preview'), label: 'Nano Banana Pro' },
  'video.ad':            { model: google('veo-3.1-generate-preview'), label: 'Veo 3.1' },
  'wisdom.questions':    { model: anthropic('claude-haiku-4-5'), label: 'Claude Haiku' },
  'copy.email':          { model: anthropic('claude-sonnet-4-5'), label: 'Claude Sonnet' },
  'copy.whatsapp':       { model: google('gemini-2.0-flash'), label: 'Gemini Flash' },
  'copy.instagram':      { model: google('gemini-2.0-flash'), label: 'Gemini Flash' },
  'copy.facebook':       { model: google('gemini-2.0-flash'), label: 'Gemini Flash' },
  'copy.flyer':          { model: google('gemini-2.0-flash'), label: 'Gemini Flash' },
  'copy.custom':         { model: google('gemini-2.0-flash'), label: 'Gemini Flash' },
  'research.competitor': { model: perplexity('sonar-pro'), label: 'Perplexity Sonar' },
} as const

export type TaskKey = keyof typeof TASK_MODEL_MAP

export function getModelForTask(taskKey: TaskKey) {
  return TASK_MODEL_MAP[taskKey]
}
