/**
 * Generate "Playful Concept" flavor creatives for Sahaj Samadhi / Kirkland / Tech Workers
 * using Nano Banana 2 (gemini-2.5-flash-image) via Gemini API
 *
 * Usage: GOOGLE_GENERATIVE_AI_API_KEY=... node generate-playful.mjs
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY
if (!API_KEY) {
  console.error('Set GOOGLE_GENERATIVE_AI_API_KEY')
  process.exit(1)
}

const MODEL = 'gemini-2.5-flash-image'

const prompts = {
  instagram: {
    name: 'playful-instagram-1x1',
    prompt: `Generate a 1:1 square photograph. A bright, high-production photograph of a South Asian woman in business casual sitting peacefully at her desk in a modern tech office. One surreal element: small lush green plants, wildflowers, and soft moss are growing directly out of her closed laptop, spilling gently across her desk. She has her eyes closed with a slight smile, completely at ease, a coffee mug in hand. Her coworkers in the blurred background are still typing furiously. Clean warm lighting from large office windows, sharp focus on her and the growing laptop garden. Color accents: soft sage greens, warm peach tones, brand blue (#3D8BE8) on her mug. The image should feel imaginative and gently funny — not bizarre. Shot on Canon R5, 50mm f/2.0. Photorealistic. No text overlay.`,
  },

  facebook: {
    name: 'playful-facebook-16x9',
    prompt: `Generate a 16:9 widescreen photograph. A bright photograph of a diverse group of four tech professionals sitting around a conference table in a modern glass-walled office. One surreal element: instead of laptops and papers, the entire conference table surface is a perfectly calm, reflective pool of shallow water with small smooth stones and a few floating lily pads. The four people — one Black woman with braids, one East Asian man in a hoodie, one white woman with glasses, one South Asian man in a kurta — are dipping their fingers in the water table contentedly, as if this is perfectly normal. Afternoon light through floor-to-ceiling windows. The whiteboard behind them still has sprint planning notes. Clean, warm, sharp photography. Brand accent: peach (#E47D6C) on one person's scarf. Gently humorous, not surreal-dark. Shot on Sony A7IV, 35mm f/4. No text overlay.`,
  },

  whatsapp: {
    name: 'playful-whatsapp-1x1',
    prompt: `Generate a 1:1 square photograph. A clean, bright close-up photograph of a person's hands holding an open smartphone. On the phone screen, instead of apps and notifications, there is a tiny serene zen garden with miniature raked sand, small stones, and a tiny bonsai tree — all rendered photorealistically as if actually growing inside the phone. The person's hands are relaxed. Background: a warm, minimal apartment setting with natural window light, slightly out of focus. Color palette: warm whites, natural wood, with the zen garden providing pops of green and sand-beige. Feels clever and shareable — the kind of image someone would forward to a friend. Shot on iPhone 16 Pro. No text overlay.`,
  },

  flyer: {
    name: 'playful-flyer-portrait',
    prompt: `Generate a 2:3 vertical portrait photograph with generous sky in the upper half for text overlay. A young professional in a casual jacket sits on a park bench by a lake in the Pacific Northwest. One surreal element: a dozen glowing warm paper lanterns float gently upward from the area around the bench into the dusky sky, as if the person's sense of calm is radiating outward and upward. The lanterns create a beautiful trail from the lower third into the upper sky area, providing visual interest but leaving space for text. Lake Washington and evergreen hills in the background. Golden hour transitioning to blue hour. The person watches the lanterns rise with quiet wonder. Shot on Sony A7IV, 24mm wide-angle, f/5.6. Warm amber lantern glow against cool blue-grey sky. Mood: magical, hopeful, weightless. No text on the image.`,
  },
}

async function generateImage(key, config) {
  const start = Date.now()
  console.log(`\nGenerating ${key}...`)

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

  const body = {
    contents: [{ parts: [{ text: config.prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    if (!response.ok) {
      const errText = await response.text()
      console.error(`  ✗ API error (${response.status}) after ${elapsed}s: ${errText.slice(0, 300)}`)
      return { path: null, elapsed }
    }

    const data = await response.json()
    const candidates = data.candidates || []
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || []
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          const buffer = Buffer.from(part.inlineData.data, 'base64')
          const ext = part.inlineData.mimeType === 'image/png' ? 'png' : 'jpg'
          const outPath = resolve(__dirname, `${config.name}.${ext}`)
          writeFileSync(outPath, buffer)
          console.log(`  ✓ Saved ${config.name}.${ext} (${(buffer.length / 1024).toFixed(0)}KB) in ${elapsed}s`)
          return { path: outPath, elapsed }
        }
      }
    }

    const textParts = candidates[0]?.content?.parts?.filter((p) => p.text) || []
    if (textParts.length > 0) {
      console.log(`  ✗ Got text instead of image (${elapsed}s): ${textParts[0].text.slice(0, 200)}`)
    } else {
      console.log(`  ✗ No image in response (${elapsed}s). Finish reason: ${candidates[0]?.finishReason || 'unknown'}`)
    }
    return { path: null, elapsed }
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.error(`  ✗ Error (${elapsed}s): ${err.message}`)
    return { path: null, elapsed }
  }
}

async function main() {
  const totalStart = Date.now()

  console.log('═══════════════════════════════════════════════════════════')
  console.log('Flavor: PLAYFUL CONCEPT')
  console.log('Campaign: Sahaj Samadhi / Kirkland, WA / Tech Workers')
  console.log('Theme: Tech burnout → work-life harmony')
  console.log(`Model: ${MODEL}`)
  console.log('═══════════════════════════════════════════════════════════')

  const results = {}
  for (const [key, config] of Object.entries(prompts)) {
    results[key] = await generateImage(key, config)
  }

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1)

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('Summary:')
  for (const [key, result] of Object.entries(results)) {
    console.log(`  ${key}: ${result.path ? '✓' : '✗'} ${result.elapsed}s`)
  }
  console.log(`\n  Total wall time: ${totalElapsed}s`)
  console.log('═══════════════════════════════════════════════════════════')
}

main()
