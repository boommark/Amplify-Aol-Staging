# Phase 4: Creative Studio and Campaign - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Channel-specific AI image generation (Instagram 1:1, Facebook 16:9, WhatsApp 1:1, Flyer 2:3) rendered inside existing channel frames, with two creative flavors (Warm Realism, Playful Concept), conversational image refinement, and campaign browsing/download/sharing. Uses Nano Banana 2 (`gemini-2.5-flash-image`) via Gemini API for image generation. Does NOT include: video generation (Veo 3.1 — future phase), one-click publishing, or translation.

</domain>

<decisions>
## Implementation Decisions

### Creative Flavor Selection
- Two flavors available: **Warm Realism** (cinematic lifestyle photography, film stock aesthetics, natural light, candid moments) and **Playful Concept** (gentle surrealism with visual metaphors, witty/surprising, pattern-breaking)
- Flavor selection appears as a two-option pill toggle after copy generates, before image generation begins
- Each flavor maps to a distinct prompt template architecture with different camera language, scene direction, and metaphor strategy
- Both flavors share the same brand constraints: photography-style only, diverse/inclusive, family-friendly, no spiritual clichés, no text overlay on images, brand color palette (#3D8BE8 Blue, #E47D6C Peach, #ED994E Orange, #F7C250 Yellow)
- One image generated per channel per flavor — user sees results for their chosen flavor
- User can switch flavor and regenerate all images (~24s for 4 channels sequential, ~7s parallel)

### Image Prompt Architecture
- Image prompts are channel-aware: each incorporates the channel's copy content, workshop theme (from WORKSHOP_CONTEXT), regional context, and brand colors
- Prompt templates stored in Supabase `prompts` table as new keys: `image.instagram`, `image.facebook`, `image.whatsapp`, `image.flyer` (each with `.warm` and `.playful` variants, or a single template with flavor parameter)
- Workshop emotional themes drive image direction:
  - Happiness Program → joy, vibrant energy, laughter, movement
  - Sahaj Samadhi → serenity, effortless stillness, quiet moments
  - Sleep & Anxiety → calm, safety, warmth, soft textures
  - Sri Sri Yoga → balance, flexibility, vitality, physical grace
  - Art of Silence → depth, vastness, expansive landscapes
  - YES!+ → purpose, energy, community, young adults in action
- Channel-specific aspect ratios: Instagram 1:1, Facebook 16:9, WhatsApp 1:1, Flyer 2:3 (portrait with negative space for text overlay)

### Image-Copy Integration in Channel Frames
- Generated images replace the grey placeholder boxes ("Image Preview" / "Ad Image") in InstagramFrame, FacebookFrame, WhatsAppFrame, FlyerFrame
- Images render inline via `<img>` tag with S3 URL — same pattern as QuoteCard background images
- Loading state: skeleton shimmer in image area while generating (~6s per image) — uses existing SkeletonPart pattern
- Graceful fallback: if image generation fails, channel frame renders copy without image + a "Retry" button — non-blocking, matches quote-image.ts error handling
- Download button on each channel frame for individual image download
- New data part type needed: extend `copy-block` to include optional `imageUrl`, `imageAssetId`, and `imageMeta` fields (or create new `ad-creative-block` part type)

### Image Refinement Flow
- Chat-based refinement: user types instruction ("make it warmer", "try a group scene", "different angle") and the specific channel's image regenerates
- Image refinement is independent from copy refinement — changing an image does not affect copy, and vice versa
- Refinement uses conversational context: previous image prompt + user instruction sent to Nano Banana for iteration (leveraging the model's conversational image editing capability)
- Per-channel granularity: user can regenerate just one channel's image without affecting others — matches copy refinement pattern from Phase 3
- Image refinement persists: updated image uploaded to S3, `campaign_assets` record updated with new URL

### Campaign Browser & Asset Export
- Campaign list as card grid: each card shows region, event type, date, and thumbnail of first generated creative
- Text search across campaign title/region + dropdown filters for event type
- Campaign detail view: shows all generated assets (copy blocks + images) organized by channel
- Individual asset download: copy-to-clipboard for text, direct download for images
- Campaign ZIP package: all assets (images + copy as markdown/text files) downloadable as single ZIP
- Campaign sharing: generate read-only link with role-based access check (uses `share_token` column already in campaigns table)

### Image Generation Pipeline Integration
- Image generation triggers after copy generation completes for selected channels
- Generation flow: copy generates → flavor picker appears → user selects flavor → images generate in parallel for all channels → images render in channel frames
- Images uploaded to S3 at path: `{userId}/campaigns/{campaignId}/ad-creatives/{channel}-{flavor}.png`
- Stored in `campaign_assets` with `asset_type: 'ad_creative'`, channel, s3_url, and metadata including prompt used and flavor
- API model: Nano Banana 2 (`gemini-2.5-flash-image`) via `generateContent` endpoint with `responseModalities: ['TEXT', 'IMAGE']`
- Average generation time: ~6s per image (validated in sample-creatives testing on 2026-04-04)

### Claude's Discretion
- Exact prompt template wording for each channel × flavor combination
- How to handle the flavor toggle UI component design
- Campaign browser pagination strategy
- ZIP generation approach (server-side vs client-side)
- Whether to create a new `ad-creative-block` part type or extend existing `copy-block`
- Image compression/optimization before S3 upload

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Image Prompting & Generation
- `docs/IMAGE-PROMPTING.md` — Comprehensive Nano Banana prompting guide: 5 frameworks, creative director controls, JSON structured prompting, tech specs for NB2 and NB Pro, character consistency rules
- `sample-creatives/generate.mjs` — Warm Realism flavor: validated prompt architecture, API call pattern, timing benchmarks
- `sample-creatives/generate-playful.mjs` — Playful Concept flavor: validated prompt architecture, surreal metaphor approach, timing benchmarks
- `lib/pipeline/quote-image.ts` — Existing image generation pattern: Nano Banana API → S3 upload → return URL

### Existing Channel Frames
- `components/chat/parts/CopyBlock.tsx` — Channel frame components (WhatsAppFrame, InstagramFrame, EmailFrame, FacebookFrame) with placeholder image areas at lines 47 (Instagram), 119 (Facebook)
- `components/chat/parts/FlyerFrame.tsx` — Flyer frame component
- `components/chat/parts/QuoteCard.tsx` — Working example of image integration in a chat part (imageUrl rendering)

### Data Layer
- `lib/db/assets.ts` — Asset CRUD utilities, supports `ad_creative` asset type
- `supabase/migrations/20260329000001_foundation_schema.sql` — `campaign_assets` table schema, `campaigns.share_token` column
- `lib/ai/models.ts` — `image.ad-creative` task key mapped to Nano Banana Pro
- `supabase/seed/prompts.sql` lines 1327-1409 — Existing `image.ad-creative` prompt (needs rewrite from old Flux/n8n format to Nano Banana)

### Pipeline & State
- `lib/pipeline/copy-generation.ts` — Copy generation pipeline, `WORKSHOP_CONTEXT` map, `BRAND_VOICE_PREAMBLE`, `generateAllChannels` pattern
- `hooks/usePipelineChat.ts` — Client state machine (stages, flags, results tracking)
- `app/api/chat/route.ts` — Chat route with pipeline action dispatch
- `types/message.ts` — `AmplifyDataParts` union type, existing part types including `copy-block`, `image-carousel`, `ad-preview`

### Requirements
- `.planning/REQUIREMENTS.md` — ADS-01 through ADS-07, CAMP-01 through CAMP-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **quote-image.ts pattern**: Proven image generation → S3 upload → return URL flow. Clone for ad creative images.
- **CopyBlock channel frames**: 5 channel-specific frames already rendering copy. Need to add optional image prop.
- **SkeletonPart**: Loading skeleton component — reuse for image generation loading state.
- **ActionChips**: Pill button component — reuse for flavor toggle.
- **campaign_assets CRUD** (`lib/db/assets.ts`): `saveAsset`, `updateAssetContent` — ready for `ad_creative` type.
- **ImageCarousel** (`components/chat/parts/ImageCarousel.tsx`): Horizontal swipe with tap-to-select — potential reuse for flavor comparison.

### Established Patterns
- **Non-blocking image generation**: quote-image.ts uses `Promise.allSettled` — failures return null, cards render without images. Apply same pattern.
- **Chat-based refinement**: `refineChannelCopy` in copy-generation.ts loads existing content, applies instruction, updates in-place. Clone for image refinement.
- **Progressive rendering**: Copy channels generate email first (sequential), then others in parallel. Image generation should be fully parallel across channels.
- **Asset persistence**: Copy saved to `campaign_assets` with `assetId` returned to client for refinement. Images follow same pattern.

### Integration Points
- **CopyBlock.tsx**: Add optional `imageUrl` prop to each channel frame component
- **copy-generation.ts → generateAllChannels**: After copy completes, trigger image generation with copy content as input
- **chat/route.ts**: New pipeline action `ad_creative_generate` or extend `copy_generate` to include image generation step
- **usePipelineChat.ts**: Track `hasCreatives` flag and `adCreativeResults` array
- **MessageBubble.tsx → renderDataPart**: Handle new or extended part type with image rendering
- **campaigns table**: `share_token` column exists — use for shareable links

</code_context>

<specifics>
## Specific Ideas

- Two validated creative flavors tested against real campaign data (Sahaj Samadhi / Kirkland / Tech Workers):
  - **Warm Realism**: Film stock aesthetics (Fujifilm, Kodak Portra), natural golden hour light, candid poses, region-specific settings (PNW lakes, rain-dotted windows). Average 5.7s per image.
  - **Playful Concept**: Visual metaphors (laptop garden, water conference table, zen phone, paper lanterns), clean bright photography, gentle humor. Average 6.9s per image.
- Both flavors consistently avoid spiritual clichés (no lotus, no crossed-legs-on-mountaintop) and produce diverse, inclusive subjects
- Flyer images should have generous negative space in upper portion for text overlay — validated in sample generation
- WhatsApp images should feel "forwardable" — personal, clean, like something a friend would share
- Facebook 16:9 format gives room for environmental storytelling alongside subjects
- Image prompts should reference specific camera gear (Fujifilm X-T5, Sony A7IV, iPhone 16 Pro) for photographic authenticity
- Old `image.ad-creative` prompt in Supabase references Flux model and n8n template variables — needs complete rewrite for Nano Banana

</specifics>

<deferred>
## Deferred Ideas

- **Video generation with Veo 3.1** — model wired in models.ts but no pipeline. Future phase.
- **Canva template integration** — original plan required Enterprise Autofill API. Dropped in favor of direct Nano Banana generation. Revisit if Canva Enterprise access obtained.
- **One-click publishing** — PUB-01 through PUB-04, v2 feature
- **Translation pipeline** — CONT-08, deferred until English quality confirmed
- **A/B testing creative variants** — generate multiple images per channel for user selection. Future enhancement.
- **JSON structured prompting for batch consistency** — use Nano Banana JSON format with `consistency_id` for visual coherence across channels. Noted for future enhancement.

</deferred>

---

*Phase: 04-creative-studio-and-campaign*
*Context gathered: 2026-04-04*
