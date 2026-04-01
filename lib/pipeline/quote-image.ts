import { generateImage } from 'ai'
import { google } from '@ai-sdk/google'
import { generatePresignedUploadUrl } from '@/lib/s3/presigned-url'
import { loadPrompt } from '@/lib/prompts/registry'
import { renderPrompt } from '@/lib/prompts/renderer'

/**
 * Generate a background image for a Gurudev wisdom quote.
 * Uses the image.quote prompt from the prompts table + Imagen 3.
 * Uploads the result to S3 and returns the public URL.
 */
export async function generateQuoteImage(params: {
  quoteText: string
  userId: string
  campaignId: string
  quoteIndex: number
}): Promise<string | null> {
  const { quoteText, userId, campaignId, quoteIndex } = params

  try {
    // Load the image.quote prompt template
    const promptData = await loadPrompt('image.quote')
    const imagePrompt = renderPrompt(promptData.template, {
      quote: quoteText,
    })

    // Generate image using Imagen 3
    const { image } = await generateImage({
      model: google.image('imagen-3.0-generate-002'),
      prompt: imagePrompt,
      size: '1024x1024',
      providerOptions: {
        google: { aspectRatio: '1:1' },
      },
    })

    if (!image || !image.base64) {
      console.warn('Quote image generation returned no image')
      return null
    }

    // Upload to S3
    const s3Key = `${userId}/campaigns/${campaignId}/quote-images/quote-${quoteIndex}.png`
    const { url: uploadUrl } = await generatePresignedUploadUrl(s3Key, 'image/png', 3600)

    // Convert base64 to buffer and upload
    const imageBuffer = Buffer.from(image.base64, 'base64')
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: imageBuffer,
      headers: { 'Content-Type': 'image/png' },
    })

    if (!uploadResponse.ok) {
      console.error('Failed to upload quote image to S3')
      return null
    }

    // Return the public S3 URL (strip query params from presigned URL)
    const publicUrl = uploadUrl.split('?')[0]
    return publicUrl
  } catch (error) {
    console.error('Quote image generation error:', error)
    return null // Non-critical — quote cards work without background images
  }
}

/**
 * Generate background images for multiple quotes in parallel.
 * Non-blocking — failures return null and the quote card renders without an image.
 */
export async function generateQuoteImages(params: {
  quotes: Array<{ quoteText: string; quoteIndex: number }>
  userId: string
  campaignId: string
}): Promise<Array<string | null>> {
  const { quotes, userId, campaignId } = params

  const results = await Promise.allSettled(
    quotes.map(({ quoteText, quoteIndex }) =>
      generateQuoteImage({ quoteText, userId, campaignId, quoteIndex })
    )
  )

  return results.map((r) => (r.status === 'fulfilled' ? r.value : null))
}
