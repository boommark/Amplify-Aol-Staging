# Phase 4: Creative Studio and Campaign - Research

**Researched:** 2026-04-04
**Domain:** AI image generation pipeline, channel frame UI extension, campaign browser/export, shareable links
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Creative Flavor Selection**
- Two flavors: Warm Realism and Playful Concept — both exist, both locked
- Flavor picker appears as pill toggle after copy generates, before image generation starts
- Each flavor maps to a distinct prompt template with different camera language and metaphor strategy
- Brand constraints shared by both flavors: photography-style only, diverse/inclusive, family-friendly, no spiritual clichés, no text overlay on images, brand color palette (#3D8BE8, #E47D6C, #ED994E, #F7C250)
- One image per channel per flavor; user sees results for their chosen flavor
- User can switch flavor and regenerate all (~7s parallel)

**Image Prompt Architecture**
- Channel-aware prompts: incorporate channel copy content, workshop theme, regional context, brand colors
- Prompt templates stored in Supabase `prompts` table as keys: `image.instagram`, `image.facebook`, `image.whatsapp`, `image.flyer`
- Workshop emotional themes drive image direction (6 workshops mapped)
- Aspect ratios locked: Instagram 1:1, Facebook 16:9, WhatsApp 1:1, Flyer 2:3

**Image-Copy Integration in Channel Frames**
- Generated images replace grey placeholder boxes in InstagramFrame, FacebookFrame, WhatsAppFrame, FlyerFrame
- Images render inline via `<img>` tag with S3 URL (same pattern as QuoteCard)
- Loading: skeleton shimmer using existing SkeletonPart
- Graceful fallback: frame renders copy without image + Retry button on failure
- Download button on each channel frame
- New data part type or extended `copy-block` with optional `imageUrl`, `imageAssetId`, `imageMeta` fields

**Image Refinement Flow**
- Chat-based: user instruction → specific channel's image regenerates, copy unaffected
- Uses conversational context: previous prompt + instruction sent to Nano Banana
- Per-channel granularity (mirrors copy refinement pattern)
- Updated image uploaded to S3, `campaign_assets` record updated

**Campaign Browser and Asset Export**
- Campaign list as card grid: region, event type, date, thumbnail of first creative
- Text search across title/region + dropdown filter by event type
- Campaign detail view: all assets organized by channel
- Individual asset download: copy-to-clipboard for text, direct download for images
- ZIP package: all assets downloadable as single ZIP
- Sharing: read-only link via `share_token` column (already in campaigns table)

**Image Generation Pipeline Integration**
- Triggers after copy generation completes
- Flow: copy done → flavor picker → user selects → images generate in parallel → render in frames
- S3 path: `{userId}/campaigns/{campaignId}/ad-creatives/{channel}-{flavor}.png`
- Stored in `campaign_assets` with `asset_type: 'ad_creative'`
- API: Nano Banana 2 (`gemini-2.5-flash-image`) via `generateContent` with `responseModalities: ['TEXT', 'IMAGE']`
- Validated generation times: Warm Realism ~5.7s/image, Playful Concept ~6.9s/image

### Claude's Discretion
- Exact prompt template wording for each channel x flavor combination
- How to handle the flavor toggle UI component design
- Campaign browser pagination strategy
- ZIP generation approach (server-side vs client-side)
- Whether to create a new `ad-creative-block` part type or extend existing `copy-block`
- Image compression/optimization before S3 upload

### Deferred Ideas (OUT OF SCOPE)
- Video generation with Veo 3.1
- Canva template integration
- One-click publishing (PUB-01 through PUB-04)
- Translation pipeline (CONT-08)
- A/B testing creative variants
- JSON structured prompting for batch consistency
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADS-01 | AI generates channel-specific ad images (Instagram 1:1, Facebook 16:9, WhatsApp 1:1, Flyer 2:3) using Nano Banana 2 via Gemini API | `generateAdCreativeImage()` clones `quote-image.ts` pattern; direct `fetch` to `generativelanguage.googleapis.com` using `gemini-2.5-flash-image` with `responseModalities: ['TEXT','IMAGE']` |
| ADS-02 | Two creative flavors: Warm Realism and Playful Concept | Validated in `sample-creatives/generate.mjs` and `generate-playful.mjs`; prompt templates loaded from Supabase `prompts` table |
| ADS-03 | Image prompts are channel-aware (copy content, workshop theme, regional context, brand colors) | `WORKSHOP_CONTEXT` map already exists in `copy-generation.ts`; channel copy content available from `GeneratedCopy` results; prompt renderer via `lib/prompts/renderer.ts` |
| ADS-04 | Generated images render inside channel frames replacing placeholder boxes | `InstagramFrame` line 47 and `FacebookFrame` line 119 have placeholder divs; add optional `imageUrl` prop to each frame |
| ADS-05 | User can refine images via chat — image regenerates without affecting copy | Clone `refineChannelCopy` pattern from `copy-generation.ts` into new `refineChannelImage()` function; new `ad_creative_refine` pipeline action in `chat/route.ts` |
| ADS-06 | Generated images uploaded to S3 and stored in `campaign_assets` with `asset_type: 'ad_creative'` | `saveAsset()` in `lib/db/assets.ts` already supports `AssetType = 'ad_creative'`; S3 upload pattern from `quote-image.ts` |
| ADS-07 | User can preview, download, and iterate on complete creatives via chat | Download button per channel frame; chat action chips for flavor switch and per-channel refinement |
| CAMP-01 | Each conversation thread maps to a campaign (already built in Phase 2) | Complete — no work needed |
| CAMP-02 | User can browse past campaigns with search and filter | New `/campaigns` route with card grid, text search, event_type dropdown; leverages existing `campaigns` table |
| CAMP-03 | Assets downloadable individually (copy-to-clipboard, image download) | Copy-to-clipboard via `navigator.clipboard.writeText`; image download via `<a download>` with S3 URL |
| CAMP-04 | Assets downloadable as a campaign package (ZIP) | Server-side ZIP via `JSZip` (client-side) or `/api/campaigns/[id]/export` route (server-side); fetch all `campaign_assets` for campaign then zip |
| CAMP-05 | Campaigns shareable via link (role-permissioned, read-only) | `share_token` column already in `campaigns` table; new `/share/[token]` public route; read-only RLS policy needed |
</phase_requirements>

---

## Summary

Phase 4 builds on a well-established codebase. The image generation pipeline pattern is already proven — `quote-image.ts` is the direct template for `ad-creative-image.ts`. The Gemini API call pattern, S3 upload flow, and `campaign_assets` CRUD are all production-ready and only need to be parameterized for ad creative use.

The key architectural decision for ADS-04 is whether to extend `copy-block` with optional image fields or introduce a new `ad-creative-block` type. The research strongly favors extending `copy-block` because: (1) channel frames already exist and just need an optional `imageUrl` prop, (2) the `copy-block` part type already has `editableId` for refinement targeting, and (3) keeping them unified avoids duplicate SSE event handling in `usePipelineChat`. The `imageUrl`, `imageAssetId`, and `imageMeta` fields should be added as optional fields.

The campaign browser (CAMP-02 through CAMP-05) requires a new route and new API endpoints. The `share_token` column already exists in the schema. ZIP generation is best done server-side to avoid large binary downloads through the browser — a new `/api/campaigns/[id]/export` route using the `archiver` npm package (or `jszip`) fetches all S3 image URLs, streams them into a ZIP, and returns the binary response.

**Primary recommendation:** Clone `quote-image.ts` into `ad-creative-image.ts`, extend `copy-block` type with optional image fields, add `ad_creative_generate` and `ad_creative_refine` pipeline actions to `chat/route.ts`, build campaign browser at `/campaigns`, implement ZIP export server-side.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@ai-sdk/google` | already installed | Nano Banana 2 via Gemini API | Used for `image.quote` already; `generateImage` stable API in AI SDK v6 |
| `@google/generative-ai` (direct fetch) | N/A | Direct API call for `gemini-2.5-flash-image` | `generateImage` in AI SDK does not support `responseModalities` parameter needed for NB2; validated in `sample-creatives/generate.mjs` |
| `jszip` or `archiver` | 3.10.x / 5.3.x | Server-side ZIP creation for CAMP-04 | Standard Node.js ZIP libraries; `archiver` is streaming (better for large files) |
| `Supabase` (existing) | `@supabase/ssr` 0.9.x | campaign_assets CRUD, share token lookup | Already in use; `saveAsset`, `updateAssetContent` ready |
| AWS S3 presigned URLs (existing) | — | Image storage and delivery | Already wired; `generatePresignedUploadUrl` works |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `shadcn/ui` components (existing) | — | Flavor toggle (pill UI), campaign grid cards | Already in project; ActionChips pattern covers toggle |
| `lucide-react` (existing) | — | Download, share, refresh icons | Already imported in channel frames |
| `framer-motion` (existing) | — | Skeleton shimmer, image fade-in | Already in project; SkeletonPart uses it |
| `date-fns` (existing) | — | Campaign date display in browser | Already used in CampaignList |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `archiver` (server ZIP) | `jszip` (client ZIP) | `archiver` streams from S3 without buffering entire ZIP in memory; `jszip` is simpler but buffers everything client-side — bad for large image ZIPs |
| Extending `copy-block` | New `ad-creative-block` | Extending avoids duplicate part rendering logic; new type gives cleaner separation but requires duplicating channel frame rendering |
| `generateImage` (AI SDK) | Direct `fetch` to Gemini API | AI SDK `generateImage` uses Imagen 3 format (does not support `responseModalities`); direct fetch is the validated approach for Nano Banana 2 |

**Installation:**
```bash
npm install archiver @types/archiver
```
(All other dependencies already present)

**Version verification:** `npm view archiver version` → 7.0.1 (latest as of 2026-04). Use 7.x.

---

## Architecture Patterns

### Recommended Project Structure

The phase adds these files to the existing structure:

```
lib/pipeline/
├── ad-creative-image.ts     # NEW: generateAdCreativeImage(), generateAllAdCreatives(), refineChannelImage()
├── copy-generation.ts       # EXISTING: no changes needed
└── quote-image.ts           # EXISTING: reference pattern

lib/ai/
└── models.ts                # MODIFY: add image.instagram, image.facebook, image.whatsapp, image.flyer task keys

app/api/
├── chat/route.ts            # MODIFY: add ad_creative_generate, ad_creative_refine pipeline actions
└── campaigns/
    ├── route.ts             # EXISTING: GET (list) + POST (create)
    ├── [id]/route.ts        # EXISTING: PATCH + DELETE
    ├── [id]/export/route.ts # NEW: ZIP download endpoint
    └── [id]/share/route.ts  # NEW: generate/get share token

app/(app)/
├── campaigns/page.tsx       # NEW: campaign browser grid
└── share/[token]/page.tsx   # NEW: public read-only campaign view

components/chat/parts/
├── CopyBlock.tsx            # MODIFY: add optional imageUrl prop to channel frames
├── FlyerFrame.tsx           # MODIFY: add optional imageUrl prop
└── FlavorPicker.tsx         # NEW: two-option pill toggle component

components/campaigns/
└── CampaignBrowser.tsx      # NEW: grid + search + filter (or extend existing campaign-detail.tsx)

hooks/
└── usePipelineChat.ts       # MODIFY: add hasCreatives, adCreativeResults, selectedFlavor state

types/
└── message.ts               # MODIFY: extend copy-block with optional imageUrl, imageAssetId, imageMeta

supabase/seed/prompts.sql    # MODIFY: replace image.ad-creative prompt; add image.instagram, .facebook, .whatsapp, .flyer keys
```

### Pattern 1: Ad Creative Image Generation (cloned from quote-image.ts)

**What:** Direct fetch to Gemini API returning base64 PNG, upload to S3, return public URL.
**When to use:** Any server-side image generation with Nano Banana 2.

```typescript
// Source: sample-creatives/generate.mjs (validated 2026-04-04)
// lib/pipeline/ad-creative-image.ts

const MODEL = 'gemini-2.5-flash-image'
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

export async function generateAdCreativeImage(params: {
  prompt: string
  channel: 'instagram' | 'facebook' | 'whatsapp' | 'flyer'
  flavor: 'warm' | 'playful'
  userId: string
  campaignId: string
}): Promise<string | null> {
  const { prompt, channel, flavor, userId, campaignId } = params

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) return null

  const data = await response.json()
  // Extract base64 image from candidates[0].content.parts
  for (const candidate of data.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const buffer = Buffer.from(part.inlineData.data, 'base64')
        const s3Key = `${userId}/campaigns/${campaignId}/ad-creatives/${channel}-${flavor}.png`
        // ... upload to S3 via generatePresignedUploadUrl
        return publicUrl
      }
    }
  }
  return null
}
```

### Pattern 2: Parallel Image Generation (all channels)

**What:** `Promise.allSettled` across 4 channels — non-blocking, failures return null.
**When to use:** After flavor selection, generate all 4 channel images simultaneously.

```typescript
// Source: lib/pipeline/quote-image.ts (generateQuoteImages pattern)
export async function generateAllAdCreatives(params: {
  campaignId: string
  userId: string
  flavor: 'warm' | 'playful'
  copyResults: Array<{ channel: string; content: string }>
  workshopTheme: string
  region: string
  onChannelComplete?: (channel: string, imageUrl: string | null) => void
}): Promise<Record<string, string | null>> {
  const channels = ['instagram', 'facebook', 'whatsapp', 'flyer'] as const

  const results = await Promise.allSettled(
    channels.map(async (channel) => {
      const copy = params.copyResults.find((c) => c.channel === channel)
      const prompt = await buildAdCreativePrompt({ channel, flavor: params.flavor, copy, ... })
      const imageUrl = await generateAdCreativeImage({ prompt, channel, flavor: params.flavor, ... })
      params.onChannelComplete?.(channel, imageUrl)
      return { channel, imageUrl }
    })
  )

  return Object.fromEntries(
    results.map((r, i) => [
      channels[i],
      r.status === 'fulfilled' ? r.value.imageUrl : null,
    ])
  )
}
```

### Pattern 3: Image Refinement (cloned from refineChannelCopy)

**What:** Load previous image prompt from `campaign_assets` metadata, append user instruction, regenerate single channel image.
**When to use:** User types "make it warmer" or "try a group scene".

```typescript
// Source: lib/pipeline/copy-generation.ts refineChannelCopy (exact pattern to clone)
export async function refineChannelImage(params: {
  assetId: string
  campaignId: string
  channel: string
  instruction: string
  userId: string
}): Promise<{ channel: string; imageUrl: string | null; assetId: string }> {
  // 1. Load existing asset to get previous prompt from metadata.prompt
  // 2. Build refinement prompt: previousPrompt + "\n\nRefinement: " + instruction
  // 3. Call generateAdCreativeImage with combined prompt
  // 4. Upload new image to S3 (same key — overwrites previous)
  // 5. updateAsset(assetId, { s3Url: newUrl, metadata: { ...prev, prompt: combinedPrompt } })
  // 6. Return { channel, imageUrl: newUrl, assetId }
}
```

### Pattern 4: Extended copy-block Type

**What:** Add optional image fields to `copy-block` in `types/message.ts` — no new type needed.
**When to use:** When copy-block part is rendered after ad creative generation.

```typescript
// Source: types/message.ts (MODIFY existing copy-block)
'copy-block': {
  channel: 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'flyer' | string
  content: string
  editableId: string
  status: 'loading' | 'ready'
  imageUrl?: string        // NEW: S3 public URL of generated ad creative
  imageAssetId?: string    // NEW: campaign_assets ID for refinement targeting
  imageStatus?: 'generating' | 'ready' | 'failed'  // NEW: per-image loading state
  imageMeta?: {
    flavor: 'warm' | 'playful'
    channel: string
    promptUsed?: string
  }
}
```

### Pattern 5: Pipeline SSE Actions for Image Generation

**What:** New pipeline actions in `chat/route.ts` following the existing SSE pattern.
**When to use:** When client triggers ad creative generation or refinement.

```typescript
// In app/api/chat/route.ts — add after copy_refine handler
if (intent.type === 'ad_creative_generate') {
  // flavor from pipelineData.flavor ('warm' | 'playful')
  // copyResults from pipelineData.copyResults
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      emitStatus(controller, encoder, 'ad_creative', 'Generating ad creatives...')
      const results = await generateAllAdCreatives({
        campaignId,
        userId: user.id,
        flavor: pipelineData.flavor,
        copyResults: pipelineData.copyResults,
        workshopTheme: campaign.event_type || '',
        region: campaign.region || '',
        onChannelComplete: (channel, imageUrl) => {
          emitSSE(controller, encoder, 'ad_creative_channel_done', { channel, imageUrl })
        },
      })
      emitSSE(controller, encoder, 'ad_creative_complete', { results })
      controller.close()
    },
  })
  return new Response(stream, { headers: SSE_HEADERS })
}

if (intent.type === 'ad_creative_refine') {
  // Single channel refinement — returns JSON (not SSE), same as copy_refine
  const result = await refineChannelImage({ ... })
  return NextResponse.json({
    pipelineResponse: true,
    action: 'ad_creative_refined',
    data: { channel: result.channel, imageUrl: result.imageUrl, assetId: result.assetId },
  })
}
```

### Pattern 6: Campaign Browser Route

**What:** New `/campaigns` page with server-fetched campaign list, client-side search/filter.
**When to use:** CAMP-02 implementation.

The existing `/api/campaigns` GET endpoint already returns all campaigns for the authenticated user. The campaign browser page adds:
- Grid card layout (replace sidebar list style)
- Text search (client-side filter on `title` + `region`)
- Dropdown filter by `event_type`
- Card thumbnail: first `ad_creative` asset's `s3_url` from `campaign_assets`

### Pattern 7: ZIP Export API Route

**What:** Server-side ZIP generation — fetch all assets for campaign, stream images from S3, return ZIP binary.
**When to use:** CAMP-04 implementation.

```typescript
// app/api/campaigns/[id]/export/route.ts
import archiver from 'archiver'
import { Readable } from 'stream'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // 1. Auth check
  // 2. Fetch all campaign_assets for campaign id
  // 3. Create archiver zip stream
  // 4. For each image asset: fetch S3 URL, pipe into archive as {channel}-{flavor}.png
  // 5. For each copy asset: add as text file {channel}.txt
  // 6. Return Response with Content-Type: application/zip
}
```

### Pattern 8: Shareable Campaign Link

**What:** Read-only campaign view at `/share/[token]` that bypasses auth using `share_token`.
**When to use:** CAMP-05 implementation.

```typescript
// app/share/[token]/page.tsx — public route (no auth required)
// Server component: query campaigns WHERE share_token = token AND is_shareable = true
// Render read-only campaign detail (no edit controls, no download for non-authed users)
// RLS: new policy needed — SELECT on campaigns WHERE share_token = request param AND is_shareable = true
```

### Anti-Patterns to Avoid

- **Using `generateImage` from AI SDK for Nano Banana 2:** AI SDK's `generateImage` function targets Imagen 3 format. Nano Banana 2 (`gemini-2.5-flash-image`) requires direct fetch with `responseModalities: ['TEXT', 'IMAGE']`. The validated pattern is in `sample-creatives/generate.mjs`.
- **Blocking copy pipeline on image generation:** Images must generate AFTER copy completes, not during. Copy is fast (~3-5s per channel); images are ~6s each. Never chain them sequentially.
- **Creating a new `ad-preview` part type:** `ad-preview` already exists in `types/message.ts` but has a different shape (single `imageUrl`, no copy). Do not repurpose it. Extend `copy-block` instead to keep copy and image collocated.
- **Storing image base64 in Supabase:** Images are large. Always upload to S3 and store only the `s3_url` in `campaign_assets`. Never put image data in the database.
- **Using `user_metadata` for share token access control:** Share token RLS must use a separate policy with `share_token` column — not `user_metadata` (user-writable, exploitable).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ZIP file creation | Custom binary stream builder | `archiver` npm package | Handles file streaming, compression levels, error handling; ZIP spec has edge cases |
| Image download from browser | `window.open(url)` | `<a href={url} download={filename}>` | `window.open` opens new tab; `download` attribute forces save dialog |
| Copy to clipboard | `document.execCommand('copy')` | `navigator.clipboard.writeText()` | `execCommand` is deprecated; `clipboard` API works in all modern browsers |
| S3 image fetch for ZIP | Signed URL per image | Single presigned URL batch in export route | Server has AWS credentials; client does not need per-image signed URLs for ZIP |
| Prompt template rendering | String interpolation | Existing `renderPrompt()` in `lib/prompts/renderer.ts` | Already handles `{{ variable }}` syntax; don't duplicate |

**Key insight:** The hard parts (S3 upload, Supabase CRUD, prompt registry, channel frame rendering, SSE pipeline) are all already built. Phase 4 is primarily connecting existing pieces with new glue code.

---

## Common Pitfalls

### Pitfall 1: Nano Banana 2 vs Imagen 3 API Shape

**What goes wrong:** Developer uses `generateImage()` from AI SDK (designed for Imagen 3) for Nano Banana 2, gets errors or wrong output.
**Why it happens:** `TASK_MODEL_MAP['image.ad-creative']` uses `gemini-3.1-flash-image-preview` model ID, which suggests AI SDK compatibility. But AI SDK's `generateImage` does not accept `responseModalities` and uses a different request format.
**How to avoid:** Always use direct `fetch` to `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent` with `responseModalities: ['TEXT', 'IMAGE']` in the body. This is the pattern in `sample-creatives/generate.mjs` and it is validated.
**Warning signs:** Getting a text response instead of an image, or 400 errors mentioning "unsupported modality".

### Pitfall 2: Image Generation Timing — "Images Appear Before Copy"

**What goes wrong:** Image generation starts in parallel with copy generation, resulting in images rendering before copy blocks appear.
**Why it happens:** Developer wires image generation into `generateAllChannels` rather than triggering it after `copy_complete` event.
**How to avoid:** Image generation MUST be a separate pipeline action (`ad_creative_generate`) triggered by the client AFTER `copy_complete` SSE event. The flavor picker naturally enforces this gate — it only appears after copy is ready.
**Warning signs:** `usePipelineChat` state showing `hasCreatives: true` before `hasCopy: true`.

### Pitfall 3: Stale Image Prompt Templates in Supabase

**What goes wrong:** The existing `image.ad-creative` prompt in `supabase/seed/prompts.sql` (lines 1327-1409) uses n8n template variables (`{{ $json.output.Headline }}`) and references Flux model. Using it unmodified for Nano Banana 2 produces poor or failed results.
**Why it happens:** The prompt was migrated from the old n8n workflow and never updated.
**How to avoid:** Replace `image.ad-creative` prompt content entirely. Add new keys `image.instagram`, `image.facebook`, `image.whatsapp`, `image.flyer` based on the validated prompts in `sample-creatives/generate.mjs` and `generate-playful.mjs`. The new prompts use variables like `{{ workshopTheme }}`, `{{ region }}`, `{{ channelCopy }}`, `{{ brandColors }}`.
**Warning signs:** Prompt template containing `$json`, `$('Create Record')`, or "Flux" in the template text.

### Pitfall 4: S3 URL Expiry on Shared Campaigns

**What goes wrong:** Shared campaign links (`/share/[token]`) show broken images after presigned URLs expire (default 1 hour).
**Why it happens:** The S3 upload returns the presigned upload URL. `quote-image.ts` strips query params (`uploadUrl.split('?')[0]`) to get the public URL. If the S3 bucket is not configured for public read access, this public URL 403s.
**How to avoid:** Confirm the S3 bucket has public read access on the `amplifyaol` bucket for the `*/ad-creatives/` prefix, or use a CloudFront distribution. The existing `quote-image.ts` uses this same pattern — if quote images work publicly, ad creative images will too. Verify before building the share page.
**Warning signs:** Quote card images loading in chat but broken in the share view.

### Pitfall 5: copy-block imageStatus Race Condition

**What goes wrong:** When multiple channel images generate in parallel, the UI shows all images as "generating" simultaneously and they all flip to "ready" at once — no progressive reveal.
**Why it happens:** Client waits for `ad_creative_complete` event before updating state.
**How to avoid:** Use the `ad_creative_channel_done` SSE event (one per channel) to update individual channel image status as each finishes. Handle this in `handlePipelineResponse` in `usePipelineChat.ts` — update the specific channel's `copy-block` imageStatus from `generating` to `ready` and set `imageUrl`.
**Warning signs:** All 4 channel images appearing at the same time with no progressive feel.

### Pitfall 6: ZIP Export Memory Issues

**What goes wrong:** ZIP export route fetches all 4 S3 images into memory before zipping, causing Out of Memory errors on large campaigns.
**Why it happens:** Using `jszip` which buffers all files, or fetching all images before starting the archive.
**How to avoid:** Use `archiver` with streaming — pipe each S3 image fetch response directly into the archive as it arrives. This keeps memory usage bounded to a single image at a time.
**Warning signs:** Server memory spikes during ZIP export, or Vercel function timeout on campaigns with many assets.

---

## Code Examples

Verified patterns from existing codebase:

### Gemini API Call (Nano Banana 2) — Validated Pattern

```typescript
// Source: sample-creatives/generate.mjs (validated 2026-04-04, ~5.7s Warm, ~6.9s Playful)
const MODEL = 'gemini-2.5-flash-image'
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`
const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
}
const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const data = await response.json()
// Image is at data.candidates[0].content.parts[N].inlineData.data (base64)
// mimeType is at data.candidates[0].content.parts[N].inlineData.mimeType
```

### S3 Upload from Base64 — Existing Pattern

```typescript
// Source: lib/pipeline/quote-image.ts lines 43-61
const s3Key = `${userId}/campaigns/${campaignId}/ad-creatives/${channel}-${flavor}.png`
const { url: uploadUrl } = await generatePresignedUploadUrl(s3Key, 'image/png', 3600)
const imageBuffer = Buffer.from(base64Data, 'base64')
await fetch(uploadUrl, { method: 'PUT', body: imageBuffer, headers: { 'Content-Type': 'image/png' } })
const publicUrl = uploadUrl.split('?')[0]  // strip presigned params
```

### saveAsset for ad_creative — Ready to Use

```typescript
// Source: lib/db/assets.ts — AssetType already includes 'ad_creative'
const asset = await saveAsset({
  campaignId,
  assetType: 'ad_creative',
  channel,           // 'instagram' | 'facebook' | 'whatsapp' | 'flyer'
  s3Key,
  s3Url: publicUrl,
  metadata: {
    flavor,          // 'warm' | 'playful'
    promptUsed: prompt,
    channel,
    generatedAt: new Date().toISOString(),
  },
})
```

### Channel Frame Image Prop (minimal change)

```typescript
// Source: components/chat/parts/CopyBlock.tsx — InstagramFrame (modify line 47)
// BEFORE:
<div className="bg-slate-100 aspect-square flex items-center justify-center text-slate-400 text-xs">
  Image Preview
</div>

// AFTER:
function InstagramFrame({ content, imageUrl, imageStatus }: {
  content: string
  imageUrl?: string
  imageStatus?: 'generating' | 'ready' | 'failed'
}) {
  return (
    // ...
    {imageStatus === 'generating' ? (
      <SkeletonPart type="card" className="aspect-square" />
    ) : imageUrl ? (
      <img src={imageUrl} alt="Ad creative" className="w-full aspect-square object-cover" />
    ) : (
      <div className="bg-slate-100 aspect-square flex items-center justify-center text-slate-400 text-xs">
        Image Preview
      </div>
    )}
    // ...
  )
}
```

### Flavor Toggle (ActionChips pattern)

```typescript
// Source: components/chat/ActionChips.tsx (existing pill button component)
// New FlavorPicker component wraps two ActionChip-style buttons
type Flavor = 'warm' | 'playful'
interface FlavorPickerProps {
  selected: Flavor
  onChange: (flavor: Flavor) => void
  disabled?: boolean
}
// Render two pill buttons using same visual style as ActionChips
// Selected pill: bg-[#3D8BE8] text-white; Unselected: bg-white border text-slate-700
```

### Individual Image Download

```typescript
// CAMP-03 — no library needed
function downloadImage(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename  // e.g., 'instagram-warm.png'
  a.click()
}
// Note: cross-origin S3 URLs require CORS headers on the bucket
// The existing bucket already serves quote images — same config works
```

---

## Prompt Template Architecture

The validated prompt structures from `sample-creatives/` must be parameterized for Supabase storage. Each channel × flavor combination needs variables for: `{{ workshopTheme }}`, `{{ region }}`, `{{ channelCopy }}`, `{{ brandPalette }}`.

### Warm Realism — Channel Variables

| Channel | Aspect | Key Variables to Inject |
|---------|--------|------------------------|
| Instagram | 1:1 | Subject ethnicity/region hint, film stock (Fujifilm X-T5), golden hour or window light, copy-derived emotional beat |
| Facebook | 16:9 | Group of 4 diverse professionals, regional landscape (PNW/urban/suburban), wide shot with environment |
| WhatsApp | 1:1 | Hands/partial figure, clean minimal setting, personal/shareable feel, iPhone 16 Pro shot |
| Flyer | 2:3 | Lone figure in lower third, sky gradient in upper half for text overlay, regional landmark or landscape |

### Playful Concept — Surreal Element Library

Each workshop theme maps to a "surreal element" for Playful Concept prompts:
- Sahaj Samadhi: plants/garden growing from technology (laptop garden, zen phone screen)
- Sleep & Anxiety: water/nature replacing digital (conference table as still pond, phone as zen garden)
- Happiness Program: visible joy made physical (light emanating from person, floating flowers)
- Sri Sri Yoga: impossible graceful poses in mundane settings
- YES!+: collective energy made visual (paper lanterns, light trails, synchronized movement)

### Prompt Template Keys in Supabase

New prompt keys to add (replacing/supplementing old `image.ad-creative`):

| Key | Purpose |
|-----|---------|
| `image.ad-creative.instagram.warm` | Instagram 1:1 Warm Realism |
| `image.ad-creative.instagram.playful` | Instagram 1:1 Playful Concept |
| `image.ad-creative.facebook.warm` | Facebook 16:9 Warm Realism |
| `image.ad-creative.facebook.playful` | Facebook 16:9 Playful Concept |
| `image.ad-creative.whatsapp.warm` | WhatsApp 1:1 Warm Realism |
| `image.ad-creative.whatsapp.playful` | WhatsApp 1:1 Playful Concept |
| `image.ad-creative.flyer.warm` | Flyer 2:3 Warm Realism |
| `image.ad-creative.flyer.playful` | Flyer 2:3 Playful Concept |

Alternatively: 4 channel keys each with a `{{ flavor }}` parameter branch within the template. Either approach works with the existing `renderPrompt()` utility.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flux model via n8n webhooks for image generation | Nano Banana 2 (`gemini-2.5-flash-image`) direct Gemini API | Phase 4 decision | 5-7s vs 15-30s; no n8n dependency; model understands copy context |
| Canva Autofill API for ad composition | Direct AI image generation with channel-aware prompts | Phase 4 decision (Canva Enterprise gate) | Eliminates Enterprise dependency; images are more contextual |
| Single generic `image.ad-creative` prompt for all channels | 8 channel×flavor specific prompts | Phase 4 | Each channel/flavor pair produces significantly better output with dedicated prompting |
| Sequential image generation | `Promise.allSettled` parallel generation | Phase 4 | 4 × 6s sequential = ~24s; parallel = ~7s wall time |

**Deprecated/outdated:**
- `image.ad-creative` prompt in `supabase/seed/prompts.sql`: Uses n8n variable syntax and Flux-era examples. Replace with Nano Banana-style prompt architecture.
- `ad-preview` part type: Exists in `types/message.ts` but has wrong shape for ad creative use. Do not use — extend `copy-block` instead.

---

## Open Questions

1. **S3 Bucket CORS for Download**
   - What we know: `quote-image.ts` strips presigned URL params and returns a public URL; this works for in-browser display.
   - What's unclear: Whether the S3 bucket CORS policy allows `Content-Disposition: attachment` downloads from the app domain. Cross-origin `<a download>` requires CORS headers (`Access-Control-Allow-Origin`).
   - Recommendation: Test individual image download during Wave 1. If CORS blocks it, proxy the download through `/api/campaigns/[id]/asset/[assetId]` which re-fetches from S3 server-side and streams with the right headers.

2. **Supabase RLS for Share Token Route**
   - What we know: `share_token` column exists in `campaigns` table. Public share route at `/share/[token]` must be accessible without auth.
   - What's unclear: Whether the current RLS policies allow `SELECT` without a JWT (unauthenticated). Supabase RLS requires either `auth.uid()` or using the anon role with explicit policy.
   - Recommendation: Add a new RLS policy: `CREATE POLICY public_share_read ON campaigns FOR SELECT TO anon USING (share_token IS NOT NULL AND share_token = current_setting('app.share_token', true))`. Pass the token via `SET app.share_token = token` in the server component. Alternatively, use the Supabase admin client (bypasses RLS) in the share server component — simpler but requires verifying the token manually.

3. **models.ts Task Key for Image Generation**
   - What we know: `image.ad-creative` exists in `TASK_MODEL_MAP` but maps to Nano Banana Pro (`gemini-3.1-flash-image-preview`). The validated generation uses `gemini-2.5-flash-image` (Nano Banana 2).
   - What's unclear: Whether to update `image.ad-creative` to `gemini-2.5-flash-image` or keep it and use the model ID directly in `ad-creative-image.ts`.
   - Recommendation: Update `TASK_MODEL_MAP['image.ad-creative']` to `google('gemini-2.5-flash-image')` and add the 8 new channel keys. Keep `ad-creative-image.ts` using direct fetch (not `generateImage`) since AI SDK `generateImage` does not support `responseModalities`.

---

## Validation Architecture

`nyquist_validation` is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (configured in `vitest.config.ts`) |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm run test -- --reporter=verbose tests/pipeline/ad-creative.test.ts` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADS-01 | `generateAdCreativeImage` returns S3 URL or null on failure | unit | `npm run test -- tests/pipeline/ad-creative.test.ts` | ❌ Wave 0 |
| ADS-02 | Warm and Playful flavor prompt templates exist in prompts table | unit | `npm run test -- tests/prompts/registry.test.ts` | ✅ (extend) |
| ADS-03 | `buildAdCreativePrompt` injects copy content, workshop theme, region into prompt | unit | `npm run test -- tests/pipeline/ad-creative.test.ts` | ❌ Wave 0 |
| ADS-04 | `CopyBlock` renders `<img>` when imageUrl present; renders skeleton when imageStatus=generating | unit | `npm run test -- tests/components/copy-block.test.ts` | ❌ Wave 0 |
| ADS-05 | `refineChannelImage` returns updated imageUrl; does not touch copy assets | unit | `npm run test -- tests/pipeline/ad-creative.test.ts` | ❌ Wave 0 |
| ADS-06 | `saveAsset` with `asset_type: 'ad_creative'` stores s3_url and metadata | unit | `npm run test -- tests/db/assets.test.ts` | ❌ Wave 0 |
| ADS-07 | Download link renders with correct filename; copy-to-clipboard called with text content | unit | `npm run test -- tests/components/copy-block.test.ts` | ❌ Wave 0 |
| CAMP-02 | Campaign browser filters campaigns by region search text | unit | `npm run test -- tests/campaigns/browser.test.ts` | ❌ Wave 0 |
| CAMP-03 | Individual asset download: `<a download>` has correct href and filename | unit | `npm run test -- tests/campaigns/browser.test.ts` | ❌ Wave 0 |
| CAMP-04 | ZIP export route returns `application/zip` with correct file list | integration | `npm run test -- tests/api/export.test.ts` | ❌ Wave 0 |
| CAMP-05 | Share token lookup returns campaign data; invalid token returns 404 | unit | `npm run test -- tests/api/share.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test -- tests/pipeline/ad-creative.test.ts tests/components/copy-block.test.ts`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/pipeline/ad-creative.test.ts` — covers ADS-01, ADS-03, ADS-05
- [ ] `tests/components/copy-block.test.ts` — covers ADS-04, ADS-07 (requires vitest with jsdom or happy-dom environment)
- [ ] `tests/db/assets.test.ts` — covers ADS-06 (mock Supabase client)
- [ ] `tests/campaigns/browser.test.ts` — covers CAMP-02, CAMP-03
- [ ] `tests/api/export.test.ts` — covers CAMP-04 (mock archiver + mock S3)
- [ ] `tests/api/share.test.ts` — covers CAMP-05 (mock Supabase share_token lookup)
- [ ] Note: `vitest.config.ts` has `environment: 'node'`; component tests need `environment: 'happy-dom'` — add `@vitest-environment happy-dom` comment to component test files or add a separate vitest config

---

## Sources

### Primary (HIGH confidence)

- `sample-creatives/generate.mjs` — Validated Warm Realism API call pattern, timing benchmarks, base64 extraction
- `sample-creatives/generate-playful.mjs` — Validated Playful Concept prompts
- `lib/pipeline/quote-image.ts` — S3 upload pattern, `Promise.allSettled` parallel generation
- `lib/pipeline/copy-generation.ts` — `refineChannelCopy` pattern to clone, `generateAllChannels` parallel pattern
- `lib/db/assets.ts` — `saveAsset` with `ad_creative` type, `updateAssetContent`
- `types/message.ts` — `AmplifyDataParts` union, `copy-block` shape
- `components/chat/parts/CopyBlock.tsx` — Channel frames with placeholder image areas
- `components/chat/parts/FlyerFrame.tsx` — Flyer frame pattern
- `app/api/chat/route.ts` — Pipeline action dispatch, SSE pattern, `emitSSE` helper
- `lib/ai/models.ts` — `TASK_MODEL_MAP` with `image.ad-creative` key
- `hooks/usePipelineChat.ts` — `handlePipelineResponse` pattern, pipeline state shape
- `supabase/seed/prompts.sql` lines 1327-1409 — Old `image.ad-creative` prompt (confirmed needs replacement)
- `supabase/migrations/20260329000001_foundation_schema.sql` — `campaign_assets` table schema
- `docs/IMAGE-PROMPTING.md` — Nano Banana 2 API specs, aspect ratios, creative frameworks
- `vitest.config.ts` — Test framework config

### Secondary (MEDIUM confidence)

- `components/campaigns/CampaignList.tsx` — Existing campaign list pattern (sidebar); campaign browser extends this
- `components/campaigns/campaigns-list.tsx` — Existing campaigns-list component (placeholder — needs replacement for Phase 4)
- `.planning/STATE.md` — Confirmed decisions and accumulated context through Phase 3

### Tertiary (LOW confidence)

- `archiver` npm package for ZIP: Standard library with 90M+ weekly downloads; HIGH confidence but not directly verified in codebase yet. Alternative: `jszip` for simpler implementation if streaming is not needed.

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all libraries either already in project or standard npm ecosystem
- Architecture: HIGH — directly derived from reading existing production code patterns
- Pitfalls: HIGH — based on reading actual code and identifying real gaps (old prompt format, Nano Banana 2 API differences)
- Prompt templates: MEDIUM — structure is locked and validated; exact wording for all 8 channel×flavor combos is Claude's discretion

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable stack — Gemini API model IDs and AI SDK patterns unlikely to change within 30 days)
