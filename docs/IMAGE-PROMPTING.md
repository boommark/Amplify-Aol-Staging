# Image & Video Generation — Models & Prompting

## Models

| Task | Model ID | Label |
|---|---|---|
| Image (quotes, ad creatives) | `gemini-3.1-flash-image-preview` | Nano Banana Pro |
| Video (ads) | `veo-3.1-generate-preview` | Veo 3.1 |

API docs: [Image generation](https://ai.google.dev/gemini-api/docs/image-generation) · [Video generation](https://ai.google.dev/gemini-api/docs/video)

---

## Nano Banana — Image Prompting Best Practices

Sources: [Ultimate Prompting Guide (Google Cloud)](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana) · [JSON Prompt Format Guide](https://aiformarketings.com/blog/nano-banana-json-guide/) · [NB2 Prompt Guide (ImagineArt)](https://www.imagine.art/blogs/nano-banana-2-prompt-guide)

### Core Rules
1. **Be specific** — describe subject, lighting, composition, texture, and color palette concretely. Avoid vague terms like "nice" or "good".
2. **Positive framing** — say what you want, not what you don't ("empty street" not "no cars")
3. **Control the camera** — use photographic/cinematic terms ("low angle", "aerial view", "f/1.8")
4. **Iterate** — refine with follow-up prompts conversationally; Flash speed makes rapid iteration practical
5. **Start with a strong verb** — tell the model the primary operation upfront
6. **Stack complex instructions** — NB2 handles nuance well; don't simplify unnecessarily

### Prompting Frameworks

#### 1. Text-to-Image (no references)
```
[Subject] + [Action] + [Location/context] + [Composition] + [Style]
```
Example: `[Subject] A striking fashion model wearing a tailored brown dress, sleek boots, and holding a structured handbag. [Action] Posing with a confident, statuesque stance. [Location] A seamless, deep cherry red studio backdrop. [Composition] Medium-full shot, center-framed. [Style] Fashion magazine editorial, shot on medium-format analog film, pronounced grain, cinematic lighting.`

#### 2. Multimodal Generation (with references)
Up to 14 reference images in one prompt.
```
[Reference images] + [Relationship instruction] + [New scenario]
```
Example: `Using the attached napkin sketch as the structure and the attached fabric sample as the texture [References], transform this into a high-fidelity 3D armchair render [Relationship]. Place it in a sun-drenched, minimalist living room [New Scenario].`

#### 3. Image Editing
- **Semantic masking (inpainting):** Define a mask through text to edit a specific part. Be explicit about what to keep the same. Example: `"Remove the man from the photo"`
- **Composition transfer:** Upload a base image + object image, tell the model to combine them
- **Style transfer:** Upload a photo and ask to recreate in a different artistic style

#### 4. Real-Time Web Search Grounding
NB2 can search the web to generate images based on real-time information.
```
[Source/Search request] + [Analytical task] + [Visual translation]
```
Example: `[Search for current weather in San Francisco] + [Use this data to modify the scene] + [Visualize in a miniature city-in-a-cup concept within a realistic smartphone UI]`

#### 5. Text Rendering & Localization
- Enclose text in quotes: `"HAPPY BIRTHDAY"` or `"URBAN EXPLORER"`
- Specify font style: `"bold white sans-serif"` or `"Century Gothic 12px"`
- **Text-first hack:** Generate the text content in conversation first, then ask for the image with that text
- **Multilingual:** Write prompt in one language, specify target language for output (10+ languages supported)
- Specify use case (greeting card, mockup, signage) for better formatting

### Creative Director Controls

**Lighting:** `"three-point softbox setup"` / `"Chiaroscuro, harsh high contrast"` / `"golden hour backlighting"` / `"soft key light from upper left, deep shadows on right"`

**Camera & Lens:** GoPro (immersive), Fujifilm (color science), Hasselblad (studio), disposable (nostalgic) — `"wide-angle"`, `"macro lens"`, `"85mm f/1.4"`, `"shallow depth of field (f/1.8)"`

**Film Stock:** `"Kodak Portra 400"` (warm skin tones) / `"Fujifilm Superia 400"` (green shadow shift) / `"1980s color film, slightly grainy"`

**Color Grading:** `"cinematic color grading with muted teal tones"` / `"teal-and-orange Hollywood grade"` / `"deep indigo, silver, and black palette"`

**Materiality:** Be precise — not "jacket" → `"navy blue tweed jacket"`. Not "armor" → `"ornate elven plate armor, etched with silver leaf patterns"`.

### Character & Subject Consistency
- Describe up to **5 characters** with consistent visual attributes across a workflow
- Define up to **14 objects** with clear physical traits for narrative storyboarding
- Lock core features (face shape, eye color, distinctive marks) while varying clothes, pose, and background
- Use a `consistency_id` when using JSON format to maintain identity across images

### Prompt Templates by Category

**Cinematic portrait:** `A cinematic portrait of [subject] in [setting]. Shot on [camera/film stock]. [Lighting]. [Depth of field]. [Mood].`

**Product photography:** `A hero product image of [product] on [surface]. Camera: [lens], [aperture], [angle]. Lighting: [setup]. [Color palette]. Negative space for text overlay. 4K output.`

**Editorial fashion:** `[Magazine style] photo of [subject] in [clothing details]. [Camera angle]. [Film stock or color grading]. [Background]. [Mood].`

**Infographic:** `[Style] infographic showing [topic]. [Layout description]. Labels in [font style]. [Color palette]. [Format/aspect ratio].`

**UI/UX mockup:** `[Page type] for [brand/product]. Components: [list]. Typography: [font]. [Layout details]. [Color scheme]. [Device/format].`

### JSON Structured Prompting (Advanced)

For production workflows needing precision, consistency, and batch processing, use JSON format. JSON achieves ~92% precision for color/lighting/composition vs ~68% for natural language. Best for: product catalogs, character consistency, automation pipelines.

**Core schema:**
```json
{
  "prompt": "description of the image",
  "consistency_id": "unique-id-for-consistency",
  "style_parameters": {
    "genre": "product photography",
    "art_movement": "minimalism",
    "color_palette": ["#FFFFFF", "#F0F0F0"],
    "mood": "clean and professional"
  },
  "technical_specifications": {
    "camera": { "type": "DSLR", "lens": "85mm prime", "aperture": "f/2.8" },
    "lighting": {
      "setup": "three-point lighting",
      "main_light": { "type": "softbox", "position": "45 degrees", "intensity": "high" },
      "color_temperature": "5500K"
    }
  },
  "composition": {
    "framing": "close_up",
    "perspective": "eye_level",
    "aspect_ratio": "16:9"
  },
  "output_settings": {
    "format": "png",
    "resolution": { "width": 2048, "height": 2048 }
  }
}
```

**Enumerated fields (accepted values):**

| Field | Values |
|---|---|
| aspect_ratio | 1:1, 4:3, 16:9, 9:16, 3:2, 2:3 |
| aperture | f/1.4, f/2.0, f/2.8, f/4.0, f/5.6, f/8.0, f/11, f/16 |
| focal_length | wide, normal, portrait, telephoto |
| lighting.type | natural, studio, dramatic, soft, rim, backlit, ambient |
| lighting.direction | front, side, back, top, bottom, three-quarter |
| lighting.color_temperature | warm, neutral, cool, daylight, tungsten, fluorescent |
| framing | close_up, medium_shot, full_shot, long_shot, extreme_long_shot, establishing |
| perspective | eye_level, high_angle, low_angle, dutch_angle, bird_eye, worm_eye |
| depth_of_field | shallow, medium, deep |

**Batch processing:** Use `vary_parameters` to change specific fields (color, angle, time) while keeping style/subject/lighting fixed. Ideal for A/B tests and multi-variant campaigns.

**When to use JSON vs natural language:**
- **JSON:** Product photography, character consistency, batch generation, API automation, brand catalogs
- **Natural language:** Brainstorming, creative exploration, quick iterations, one-off images
- **Hybrid:** Start with natural language to explore, convert best results to JSON for production

### Tech Specs

**Nano Banana 2** (`gemini-3.1-flash-image-preview`):
- Context: 131,072 input tokens / 32,768 output tokens
- Resolutions: 512px, 1K, 2K, 4K
- Aspect ratios: 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, 1:4, 4:1, 1:8, 8:1
- Up to 14 reference images (PNG, JPEG, WebP, HEIC, HEIF) + PDF/text inputs
- Real-time web search grounding
- Knowledge cutoff: January 2025
- All outputs include C2PA Content Credentials + SynthID watermark

**Nano Banana Pro** (`gemini-3-pro-image`):
- Context: 65,536 input tokens / 32,768 output tokens
- Resolutions: 1K, 2K, 4K (no 512px)
- Same aspect ratios minus 1:4, 4:1, 1:8, 8:1

### Model Combinations
1. **Nano Banana + Gemini:** Use Gemini 3 for creative direction and prompt crafting
2. **Nano Banana + Veo:** Create keyframes with Nano Banana, then generate video between them with Veo
3. **Nano Banana + Veo + Lyria:** Add custom AI soundtrack with Lyria

---

## Veo 3.1 — Video Generation Notes

- **Async API** — poll for `done` status; latency ranges 11s–6 min
- **Video retention** — downloads expire after 2 days; save immediately
- **Aspect ratios:** 16:9 (landscape), 9:16 (portrait)
- **Resolutions:** 720p, 1080p, 4K
- **Durations:** 4, 6, or 8 seconds
- **Inputs:** text-to-video, image-to-video, video extension (max 20 extensions × 7s)
- All outputs include SynthID watermark
