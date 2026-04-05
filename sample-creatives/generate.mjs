/**
 * Generate sample campaign creatives for Sahaj Samadhi / Kirkland / Tech Workers
 * using Nano Banana Pro (gemini-2.0-flash-preview-image-generation) via Gemini API
 *
 * Usage: GOOGLE_GENERATIVE_AI_API_KEY=... node generate.mjs
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
    name: 'instagram-1x1',
    prompt: `Generate a 1:1 square photograph. A candid lifestyle photograph of a South Asian woman in her early 30s, wearing a casual olive linen shirt, sitting cross-legged on a mid-century modern chair by a large window in a Pacific Northwest apartment. Morning light streams through rain-dotted glass, casting soft diffused patterns on her face. Her eyes are gently closed, a slight smile, a half-finished cup of coffee on the side table beside a closed laptop. Lush green trees visible through the window — the unmistakable overcast-yet-luminous light of Kirkland, Washington. Shot on Fujifilm X-T5, 56mm f/1.2 lens. Shallow depth of field, the laptop and coffee in soft bokeh. Warm amber and sage green color palette. Authentic film grain. Mood: quiet relief, a moment of stillness carved out of a busy tech career. No text overlay.`,
  },

  facebook: {
    name: 'facebook-16x9',
    prompt: `Generate a 16:9 widescreen landscape photograph. A wide lifestyle photograph of a diverse group of four tech professionals — one Black man in a Patagonia vest, one East Asian woman in a denim jacket, one white man with glasses and a flannel, one South Asian woman in athleisure — walking together along a lakeside trail at golden hour. Lake Washington and distant evergreen-covered hills in the soft background. They are laughing naturally, mid-conversation, shoulders relaxed, phones nowhere in sight. One carries a reusable water bottle, another a yoga mat tucked under her arm. Shot from eye level on Sony A7IV, 35mm f/2.8, deep depth of field capturing both the group and the Pacific Northwest landscape. Color grading: warm golden tones on skin, cool blue-grey water and sky. Mood: genuine connection, post-work decompression, the feeling of finally exhaling after a long sprint. No text overlay.`,
  },

  whatsapp: {
    name: 'whatsapp-1x1',
    prompt: `Generate a 1:1 square photograph. A bright, airy close-up photograph of a person's hands resting palms-up on their lap in a simple meditation mudra. They are wearing comfortable dark joggers. A laptop is visible but closed on the cushion beside them. Soft natural light from a nearby window, clean white and warm wood surroundings — a minimal apartment living room. A small succulent plant and a ceramic mug in the soft background bokeh. Shot on iPhone 16 Pro in portrait mode. Clean, warm, personal — like a photo someone would share with a friend. Color palette: warm whites, natural wood tones, with one accent of soft sage green from the plant. No face visible, just hands and lap. Mood: approachable calm, effortless simplicity. No text overlay.`,
  },

  flyer: {
    name: 'flyer-portrait',
    prompt: `Generate a 2:3 vertical portrait photograph with generous empty sky in the upper third for text overlay. A lone figure sits peacefully on a wooden bench at a Pacific Northwest waterfront park, gazing out at a calm lake with distant mountains and evergreen trees. Late afternoon golden light. The bench is positioned in the lower third of the frame. The upper two-thirds is a gradient sky — deep blue-grey clouds at the very top transitioning to warm peach and amber near the horizon. This natural gradient provides perfect contrast for white text overlay. The figure is a young professional, seen from behind, wearing a casual jacket. Shot on Sony A7IV, 24mm wide-angle, f/8 for deep focus throughout. Color palette: deep navy sky, warm peach horizon, cool green evergreens, golden light on the bench. Mood: expansive possibility, the peace after putting down the weight of work. No text on the image.`,
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
  console.log('Flavor: WARM REALISM')
  console.log('Campaign: Sahaj Samadhi / Kirkland, WA / Tech Workers')
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
