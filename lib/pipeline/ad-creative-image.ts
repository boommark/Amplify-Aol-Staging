import { TASK_MODEL_MAP } from '@/lib/ai/models'
import { loadPrompt } from '@/lib/prompts/registry'
import { renderPrompt } from '@/lib/prompts/renderer'
import { generatePresignedUploadUrl } from '@/lib/s3/presigned-url'
import { saveAsset, updateAssetContent, getAssetsForCampaign } from '@/lib/db/assets'

// Brand color palette — injected into every ad creative prompt
const BRAND_PALETTE = '#3D8BE8 Blue, #E47D6C Peach, #ED994E Orange, #F7C250 Yellow'

// Channel-specific aspect ratios
const CHANNEL_ASPECT_RATIO: Record<string, string> = {
  instagram: '1:1',
  facebook: '16:9',
  whatsapp: '1:1',
  flyer: '2:3',
}

/**
 * Build an ad creative prompt by loading the channel+flavor template from Supabase
 * and rendering it with campaign-specific variables.
 *
 * Template key format: image.ad-creative.{channel}.{flavor}
 * Variables injected: workshopTheme, region, channelCopy, brandPalette, aspectRatio
 */
export async function buildAdCreativePrompt(params: {
  channel: string
  flavor: 'warm' | 'playful'
  workshopTheme: string
  region: string
  channelCopy: string
}): Promise<string> {
  const { channel, flavor, workshopTheme, region, channelCopy } = params
  const aspectRatio = CHANNEL_ASPECT_RATIO[channel] ?? '1:1'

  // Try channel+flavor specific prompt first, then channel-only, then base key
  const keysToTry = [
    `image.ad-creative.${channel}.${flavor}`,
    `image.ad-creative.${channel}`,
    'image.ad-creative',
  ]

  let promptData = await loadPrompt(keysToTry[0])
  // loadPrompt returns a generic fallback when the key doesn't exist in DB.
  // Detect that fallback (starts with "You are Amplify") and try next key.
  for (let i = 1; i < keysToTry.length; i++) {
    if (promptData.template.startsWith('You are Amplify')) {
      promptData = await loadPrompt(keysToTry[i])
    } else {
      break
    }
  }

  // The Supabase prompt may be a meta-prompt (designed for n8n with $json variables).
  // If it contains n8n-style variables, build a direct image prompt instead.
  const isN8nTemplate = promptData.template.includes('$json') || promptData.template.includes('$node')
  if (isN8nTemplate || promptData.template.startsWith('You are Amplify')) {
    return buildDirectImagePrompt({ channel, flavor, workshopTheme, region, channelCopy, aspectRatio })
  }

  return renderPrompt(promptData.template, {
    workshopTheme,
    region,
    channelCopy,
    channelName: channel,
    flavor,
    brandPalette: BRAND_PALETTE,
    aspectRatio,
  })
}

/**
 * Build a direct image generation prompt for Nano Banana when no app-compatible
 * Supabase template exists. Follows IMAGE-PROMPTING.md best practices.
 */
function buildDirectImagePrompt(params: {
  channel: string
  flavor: 'warm' | 'playful'
  workshopTheme: string
  region: string
  channelCopy: string
  aspectRatio: string
}): string {
  const { channel, flavor, workshopTheme, region, channelCopy, aspectRatio } = params

  const flavorStyle = flavor === 'warm'
    ? 'Warm golden-hour lighting, soft focus, earthy natural tones with brand blue (#3D8BE8) accents. Serene, uplifting, aspirational mood.'
    : 'Bright playful lighting, vibrant energy, dynamic composition with brand palette (#3D8BE8 Blue, #E47D6C Peach, #ED994E Orange, #F7C250 Yellow). Joyful, inviting, community-oriented mood.'

  const channelComposition: Record<string, string> = {
    instagram: 'Square 1:1 composition. Bold, eye-catching, scroll-stopping. Clean with negative space for text overlay.',
    facebook: 'Landscape 16:9 composition. Editorial feel, wider scene, professional quality.',
    whatsapp: 'Square 1:1 composition. Intimate, personal, conversational feel. Clear focal point.',
    flyer: 'Portrait 2:3 composition. Print-ready, structured layout space, high contrast for readability.',
  }

  // Extract a brief description from the copy for context
  const copySnippet = channelCopy.slice(0, 200).replace(/\n/g, ' ')

  return [
    `Create a photography-style advertising image for a ${workshopTheme || 'wellness'} workshop${region ? ` in ${region}` : ''}.`,
    ``,
    `Ad copy context: "${copySnippet}"`,
    ``,
    `Style: ${flavorStyle}`,
    `${channelComposition[channel] || `Aspect ratio ${aspectRatio}.`}`,
    ``,
    `Requirements:`,
    `- Photography style (not illustration or 3D render)`,
    `- Diverse, inclusive subjects — front-facing, natural expressions`,
    `- Connected to themes of meditation, breathwork, inner peace, and community`,
    `- Family-friendly, positive, aspirational yet achievable`,
    `- No text overlays, no watermarks`,
    `- Shot with 85mm lens, f/2.8 aperture, natural lighting`,
    `- 4K resolution, highly detailed, crisp focus`,
  ].join('\n')
}

/**
 * Generate a single ad creative image using Nano Banana 2 (gemini-2.5-flash-image)
 * via direct Gemini API fetch with responseModalities.
 *
 * Model ID is read from TASK_MODEL_MAP (never hardcoded here) per CLAUDE.md rule.
 * Uploads result to S3 and persists in campaign_assets with ad_creative type.
 *
 * Returns { imageUrl, assetId } on success, or null on failure (non-blocking).
 */
export async function generateAdCreativeImage(params: {
  prompt: string
  channel: string
  flavor: 'warm' | 'playful'
  campaignId: string
  userId: string
}): Promise<{ imageUrl: string; assetId: string } | null> {
  const { prompt, channel, flavor, campaignId, userId } = params

  try {
    // Read model ID from TASK_MODEL_MAP — never hardcoded per CLAUDE.md
    const modelEntry = TASK_MODEL_MAP['image.ad-creative']
    // Extract the model ID string from the provider model object
    const modelId = (modelEntry.model as unknown as { modelId: string }).modelId ?? 'gemini-2.5-flash-image'

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.warn('GOOGLE_GENERATIVE_AI_API_KEY not set')
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey ?? ''}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`Ad creative generation API error (${response.status}): ${errText.slice(0, 300)}`)
      return null
    }

    const data = await response.json()
    const candidates = data.candidates ?? []

    // Extract base64 image from response
    let base64Data: string | null = null
    let mimeType = 'image/png'

    for (const candidate of candidates) {
      const parts = candidate.content?.parts ?? []
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          base64Data = part.inlineData.data
          mimeType = part.inlineData.mimeType
          break
        }
      }
      if (base64Data) break
    }

    if (!base64Data) {
      console.warn(`Ad creative generation returned no image for channel=${channel} flavor=${flavor}`)
      return null
    }

    // Upload to S3
    const ext = mimeType === 'image/png' ? 'png' : 'jpg'
    const s3Key = `${userId}/campaigns/${campaignId}/ad-creatives/${channel}-${flavor}.${ext}`
    const { url: uploadUrl } = await generatePresignedUploadUrl(s3Key, mimeType, 3600)

    const imageBuffer = Buffer.from(base64Data, 'base64')
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: imageBuffer,
      headers: { 'Content-Type': mimeType },
    })

    if (!uploadResponse.ok) {
      console.error(`Failed to upload ad creative image to S3 for channel=${channel}`)
      return null
    }

    // Strip query params from presigned URL to get the public URL
    const publicUrl = uploadUrl.split('?')[0]

    // Persist in campaign_assets
    const asset = await saveAsset({
      campaignId,
      assetType: 'ad_creative',
      channel,
      s3Key,
      s3Url: publicUrl,
      metadata: {
        flavor,
        promptUsed: prompt,
        channel,
        generatedAt: new Date().toISOString(),
      },
    })

    return { imageUrl: publicUrl, assetId: asset.id }
  } catch (error) {
    console.error(`Ad creative image generation error for channel=${channel}:`, error)
    return null
  }
}

/**
 * Generate ad creative images for all 4 channels in parallel using Promise.allSettled.
 * Non-blocking — individual channel failures return null without aborting others.
 * Calls onChannelComplete as each channel finishes (suitable for streaming updates to UI).
 */
export async function generateAllAdCreatives(params: {
  campaignId: string
  userId: string
  flavor: 'warm' | 'playful'
  workshopTheme: string
  region: string
  copyResults: Array<{ channel: string; content: string }>
  onChannelComplete?: (channel: string, result: { imageUrl: string | null; assetId: string | null }) => void
}): Promise<Record<string, { imageUrl: string | null; assetId: string | null }>> {
  const { campaignId, userId, flavor, workshopTheme, region, copyResults, onChannelComplete } = params

  const channels = ['instagram', 'facebook', 'whatsapp', 'flyer'] as const

  const channelResults = await Promise.allSettled(
    channels.map(async (channel) => {
      const copyForChannel = copyResults.find((c) => c.channel === channel)
      const channelCopy = copyForChannel?.content ?? ''

      const prompt = await buildAdCreativePrompt({
        channel,
        flavor,
        workshopTheme,
        region,
        channelCopy,
      })

      const result = await generateAdCreativeImage({
        prompt,
        channel,
        flavor,
        campaignId,
        userId,
      })

      const channelResult = {
        imageUrl: result?.imageUrl ?? null,
        assetId: result?.assetId ?? null,
      }

      onChannelComplete?.(channel, channelResult)
      return { channel, ...channelResult }
    })
  )

  const output: Record<string, { imageUrl: string | null; assetId: string | null }> = {}

  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i]
    const result = channelResults[i]
    if (result.status === 'fulfilled') {
      output[channel] = { imageUrl: result.value.imageUrl, assetId: result.value.assetId }
    } else {
      output[channel] = { imageUrl: null, assetId: null }
    }
  }

  return output
}

/**
 * Refine an existing channel image by appending a user instruction to the previous prompt.
 * Loads the existing asset's metadata.promptUsed, combines with instruction,
 * regenerates via generateAdCreativeImage, and updates the asset record.
 */
export async function refineChannelImage(params: {
  assetId: string
  campaignId: string
  channel: string
  instruction: string
  userId: string
}): Promise<{ channel: string; imageUrl: string | null; assetId: string | null }> {
  const { assetId, campaignId, channel, instruction, userId } = params

  // Load existing asset to get previous prompt and flavor
  const assets = await getAssetsForCampaign(campaignId, 'ad_creative')
  const existingAsset = assets.find((a) => a.id === assetId)

  if (!existingAsset) {
    console.warn(`refineChannelImage: asset ${assetId} not found in campaign ${campaignId}`)
    return { channel, imageUrl: null, assetId: null }
  }

  const meta = existingAsset.metadata ?? {}
  const previousPrompt = (meta.promptUsed as string) ?? ''
  const flavor = ((meta.flavor as string) ?? 'warm') as 'warm' | 'playful'

  // Build refinement prompt by appending instruction to previous
  const refinementPrompt = `${previousPrompt}\n\nRefinement instruction: ${instruction}`

  // Generate new image with the combined prompt
  const result = await generateAdCreativeImage({
    prompt: refinementPrompt,
    channel,
    flavor,
    campaignId,
    userId,
  })

  if (result) {
    // Update existing asset with new URL and updated metadata
    await updateAssetContent(assetId, {
      s3Url: result.imageUrl,
      metadata: {
        ...meta,
        promptUsed: refinementPrompt,
        refinedAt: new Date().toISOString(),
      },
    })
  }

  return {
    channel,
    imageUrl: result?.imageUrl ?? null,
    assetId: result?.assetId ?? null,
  }
}
