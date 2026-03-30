// Providers are initialized once at module load time.
// Each reads its API key from process.env automatically:
//   ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY,
//   OPENAI_API_KEY, PERPLEXITY_API_KEY
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'

export { anthropic, google, openai, perplexity }
