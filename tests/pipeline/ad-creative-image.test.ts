import { describe, it } from 'vitest'

describe('ad-creative-image pipeline', () => {
  describe('generateAdCreativeImage (ADS-01)', () => {
    it.todo('returns S3 URL on successful generation')
    it.todo('returns null when API returns non-ok response')
    it.todo('calls fetch with gemini-2.5-flash-image:generateContent endpoint')
    it.todo('includes responseModalities TEXT and IMAGE in request body')
    it.todo('uploads image to S3 at correct path pattern')
    it.todo('saves asset to campaign_assets with ad_creative type')
  })

  describe('generateAllAdCreatives (ADS-01)', () => {
    it.todo('generates images for all 4 channels in parallel via Promise.allSettled')
    it.todo('calls onChannelComplete callback as each channel finishes')
    it.todo('returns Record with instagram, facebook, whatsapp, flyer keys')
  })

  describe('buildAdCreativePrompt (ADS-03)', () => {
    it.todo('incorporates channel copy, workshop theme, region, and brand colors')
    it.todo('includes aspect ratio guidance per channel')
    it.todo('fetches prompt template from Supabase prompts table')
    it.todo('renders template with correct variables via renderPrompt')
  })

  describe('flavor selection (ADS-02)', () => {
    it.todo('warm flavor uses film stock and golden hour lighting in prompt')
    it.todo('playful flavor uses visual metaphors and surreal elements in prompt')
    it.todo('both flavors include brand constraint keywords')
  })
})
