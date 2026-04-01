# Phase 3: Content Pipeline - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Regional research (7 Perplexity parallel queries + competitor content tracking), Gurudev wisdom curation (Ask Gurudev API + quote image generation), and multi-channel marketing copy generation (email, WhatsApp, Instagram, Facebook, flyer + custom channels) — all flowing through the existing chat interface with progressive rendering and user checkpoints between stages. Includes cross-campaign research reuse. Does NOT include: ad creative image generation (Phase 4), campaign browsing/export UI (Phase 4), or one-click publishing (v2).

</domain>

<decisions>
## Implementation Decisions

### Research Pipeline Flow
- Auto-trigger all 7 Perplexity queries in parallel when user describes a workshop with sufficient context (region + event type)
- If missing info, ask clarifying questions first, then auto-trigger
- Research dimensions: spirituality interest, mental health prevalence, sleep/health issues, relationship concerns, local idioms, cultural sensitivities, seasonal significance
- Results render as expandable research cards (ResearchCard component from Phase 2) as each query completes — progressive, not batch
- Results persisted to `campaign_research` table with dimension type, findings (JSONB), and sources
- Users can add inline research notes via chat: "Also, there's a Diwali event that week" — note attached to campaign_research and fed into copy generation context

### Competitor Content Tracking
- Separate step after the 7-dimension research — NOT part of the Perplexity queries
- Focused search against specific competitor brands/accounts:
  - **Meditation/wellness apps:** Headspace, Calm, Mindvalley
  - **Spiritual leaders:** Isha/Sadhguru, Deepak Chopra, Eckhart Tolle
  - **Yoga brands:** Kripalu Center, Yoga Journal, Yoga International, Judith Hanson Lasater, Adriene Mishler, B.K.S. Iyengar
- Use Perplexity if it can handle targeted brand searches; otherwise use direct scraping (Jina Reader or Firecrawl)
- Offered as an action chip after research: "Scan competitor content for inspiration"
- Results feed into copy generation as reference material

### Gurudev Wisdom Curation
- **Ask Gurudev API integration:**
  - Endpoint: `https://askgurudev.me/public_search/?question={query}`
  - Auth: `X-API-KEY` header (production key to be obtained; test key: "test_text")
  - Response: `matches[]` array with `content`, `category`, `source`, `date`, `location`, `event`
  - Categories: text/archive, text/web, video/web, honeypot, manual
  - For "manual" category: prepend "This text is not from Gurudev, but written by the AskGurudev Team"
  - Handle timeout with fallback copy
  - Handle "suicide" meta flag with crisis helpline information
- Wisdom queries derived from research context — craft 5 questions based on regional concerns (using `wisdom.questions` prompt pattern from n8n)
- Display 3+ quotes in short/medium/long formats as quote cards with auto-generated background images
- Quote cards: elegant typography, generated background image (using image.quote prompt + Nano Banana/Imagen), copy/download buttons
- Quotes used VERBATIM — never paraphrased or modified

### Multi-Channel Copy Generation
- After research + wisdom, present channel selector:
  - Preset chips (all pre-selected by default): Email, WhatsApp, Instagram, Facebook, Flyer
  - "+ Custom" chip for additional channels (TikTok, SMS, LinkedIn, etc.)
  - User toggles which channels they want, then clicks "Generate Copy"
- Each channel uses its dedicated seeded prompt (copy.email, copy.whatsapp, copy.instagram, copy.facebook)
- Flyer copy is a new prompt to be created — short, punchy, designed for physical posting
- Custom channels: AI generates based on channel name + best practices for that platform
- Copy renders in channel-native preview cards (CopyBlock component from Phase 2)
- Chat-based refinement: "Make the email headline shorter" updates ONLY that channel's card — no full regeneration

### Cross-Campaign Research Reuse
- When creating a new campaign for a region with existing research, Amplify offers: "I found research from your [campaign name] campaign. Want me to use that or run fresh?"
- Query `campaign_research` table for matching region from user's past campaigns
- If reused, research cards render immediately (no Perplexity queries needed)
- User can choose to augment reused research with fresh queries

### Pipeline Orchestration
- Progressive stages with user checkpoints between each:
  1. User describes workshop → 7 research cards stream in progressively (~15s) → action chips: "Add notes" / "Scan competitors" / "Continue to wisdom"
  2. User continues → Gurudev quotes appear (3+ cards with images) → action chips: "Different topic" / "Continue to copy"
  3. User continues → Channel selector chips appear → user picks channels + generates → copy cards stream per channel
- Progressive rendering throughout: each card appears as its query/generation completes — user always sees progress, never a blank screen
- Each stage persists to Supabase before the next begins (research → campaign_research, copy → campaign_messages with parts)

### Claude's Discretion
- Exact Perplexity query formulation per dimension
- Quote image generation prompt and style
- How to handle Ask Gurudev API rate limits or slow responses
- Flyer copy prompt design
- Custom channel prompt adaptation logic
- Research similarity matching for cross-campaign reuse

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research Pipeline
- `supabase/seed/prompts.sql` — `research.regional` and `research.translated` prompt templates
- `supabase/migrations/20260329000001_foundation_schema.sql` — `campaign_research` table schema with 7 dimension types
- `.planning/research/ARCHITECTURE.md` §Data Flow — research pipeline flow
- `.planning/research/PITFALLS.md` §Pitfall 6 — context window exhaustion (research stored as records, not chat messages)

### Gurudev Wisdom
- `supabase/seed/prompts.sql` — `wisdom.questions` and `wisdom.quotes` prompt templates
- `supabase/seed/prompts.sql` — `image.quote` prompt for quote image generation
- Ask Gurudev API docs captured in this CONTEXT.md (endpoint, auth, response format, error handling)

### Content Generation
- `supabase/seed/prompts.sql` — `copy.email`, `copy.whatsapp`, `copy.instagram`, `copy.facebook`, `copy.intro-talk` prompts
- `.planning/phases/02-chat-core/02-CONTEXT.md` — channel-native preview specs (WhatsApp phone frame, Instagram post, email client)

### Existing Code
- `lib/ai/orchestrator.ts` — `runStreamingTask` with TASK_MODEL_MAP
- `lib/ai/models.ts` — task keys including research.regional, copy.volume
- `components/chat/parts/ResearchCard.tsx` — expandable research card renderer
- `components/chat/parts/CopyBlock.tsx` — channel-native preview renderer (WhatsApp, Instagram, Email, Facebook)
- `components/chat/ActionChips.tsx` — action chip pill buttons
- `types/message.ts` — AmplifyDataParts discriminated union for all part types

### Requirements
- `.planning/REQUIREMENTS.md` — RSRCH-01 through RSRCH-05, WSDM-01 through WSDM-04, CONT-01 through CONT-08

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ResearchCard** (`components/chat/parts/ResearchCard.tsx`): expandable card with blue left accent — ready for research results
- **CopyBlock** (`components/chat/parts/CopyBlock.tsx`): channel-native frames for WhatsApp, Instagram, Email, Facebook — needs flyer frame added
- **ActionChips** (`components/chat/ActionChips.tsx`): pill button row — used for stage transitions and channel selection
- **ImageCarousel** (`components/chat/parts/ImageCarousel.tsx`): horizontal swipe with tap-to-select — usable for quote images
- **Orchestrator** (`lib/ai/orchestrator.ts`): `runStreamingTask` with model routing — add new task keys for research, wisdom, copy per channel
- **Prompt registry** (`lib/prompts/registry.ts`): loads from Supabase with 5-min cache — 14 prompts already seeded for all pipeline tasks
- **Perplexity provider** (`lib/ai/providers.ts`): wired in TASK_MODEL_MAP as sonar-pro

### Established Patterns
- UIMessage custom data parts for rich content rendering (Phase 2)
- Progressive streaming with skeleton loaders
- Chat-based refinement of specific content pieces
- Prompt versioning in Supabase (immutable, is_active flag)

### Integration Points
- `app/api/chat/route.ts`: needs pipeline orchestration logic (detect intent → trigger research/wisdom/copy)
- `campaign_research` table: ready for research result persistence
- `campaign_assets` table: ready for quote image storage
- TASK_MODEL_MAP: needs new task keys for each pipeline stage

</code_context>

<specifics>
## Specific Ideas

- Progressive stage-based flow with user checkpoints mirrors the proven n8n workflow but adds interactivity
- Competitor content tracking against 14 specific brands (Headspace, Calm, Mindvalley, Sadhguru, Deepak Chopra, Eckhart Tolle, Kripalu, Yoga Journal, Yoga International, Judith Hanson Lasater, Adriene Mishler, B.K.S. Iyengar)
- Flyer as a first-class channel alongside email/WhatsApp/Instagram/Facebook
- "+ Custom" channel chip for flexibility (TikTok, SMS, LinkedIn, etc.)
- Cross-campaign research reuse: "I found research from your last Bangalore campaign — reuse or run fresh?"

</specifics>

<deferred>
## Deferred Ideas

- **Campaign browsing/export UI** — Phase 4 (CAMP-01 through CAMP-05), uses data persisted in Phase 3
- **Ad creative image generation** — Phase 4 (ADS-01 through ADS-07)
- **One-click publishing** — v2 (PUB-01 through PUB-04)
- **Translation pipeline** — mentioned in CONT-08 but deferred until English quality confirmed
- **Video generation with Veo 3** — Phase 4+, provider wired but no pipeline

</deferred>

---

*Phase: 03-content-pipeline*
*Context gathered: 2026-04-01*
