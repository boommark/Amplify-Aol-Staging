---
phase: 03-content-pipeline
verified: 2026-04-01T22:00:00Z
status: passed
score: 18/18 must-haves verified
re_verification: false
human_verification:
  - test: "Paste a workshop URL into chat and observe URL auto-parse flow"
    expected: "Amplify extracts event title, date, location, region, and triggers research automatically"
    why_human: "Requires live page fetch and AI extraction — not verifiable via static grep"
  - test: "Trigger wisdom stage and verify QuoteCard renders in Short/Medium/Long tabs"
    expected: "Tabs switch quote text without a re-query; clicking Copy swaps icon to checkmark for 1.5s"
    why_human: "React state interaction and clipboard API require browser execution"
  - test: "Trigger copy generation for all 5 channels and verify brand voice rules"
    expected: "No hashtags, emojis, or exclamation marks in output; reading level is Grade 8 caliber"
    why_human: "Content quality and brand voice conformance require review of LLM output"
  - test: "Select a custom channel (e.g. LinkedIn) and generate copy"
    expected: "Copy is generated with LinkedIn-appropriate tone and format; rendered in generic channel card"
    why_human: "Custom channel path through copy.custom prompt requires live generation"
  - test: "Refine specific channel copy via chat: 'Make the email headline shorter'"
    expected: "Only that channel's copy updates; other channels unchanged"
    why_human: "Requires live pipeline execution to verify targeted refinement behavior"
  - test: "Crisis flag: if Ask Gurudev returns suicide meta flag, verify helpline appears instead of quote"
    expected: "Crisis helplines shown, no quote card rendered"
    why_human: "Requires triggering a specific API response state"
  - test: "Cross-campaign reuse: create two campaigns in same region; on second campaign, verify ResearchReusePrompt appears"
    expected: "ResearchReusePrompt shows campaign name from first campaign; 'Use existing' and 'Run fresh' buttons work"
    why_human: "Requires two campaigns in DB with research data"
---

# Phase 3: Content Pipeline Verification Report

**Phase Goal:** Build the complete content generation pipeline — research, wisdom, copy generation — and wire it into the chat interface with progressive streaming.
**Verified:** 2026-04-01T22:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Type contracts establish quote-card and stage-progress parts | VERIFIED | `types/message.ts` lines 29-45: `'quote-card'` with quoteId/short/medium/long/source/category/imageUrl/isManual/status; `'stage-progress'` with stages array |
| 2 | TASK_MODEL_MAP has all 8 new task keys | VERIFIED | `lib/ai/models.ts` lines 14-21: wisdom.questions (Haiku), copy.email/whatsapp/instagram/facebook/flyer/custom (Sonnet/Flash), research.competitor (Sonar) — 15 total keys |
| 3 | DB utility layer provides typed CRUD for campaign_research | VERIFIED | `lib/db/research.ts`: exports `saveResearchDimension`, `getResearchForCampaign`, `findReusableResearch` with 7-dimension enum |
| 4 | DB utility layer provides typed CRUD for campaign_assets | VERIFIED | `lib/db/assets.ts`: exports `saveAsset`, `getAssetsForCampaign`, `updateAssetContent` with AssetType union |
| 5 | Given a region + event type, 7 Perplexity queries fire in parallel | VERIFIED | `lib/pipeline/research.ts`: `DIMENSION_QUERIES` with all 7 dimensions, `Promise.allSettled` parallel execution, `generateText` + `perplexity('sonar-pro')` |
| 6 | Research results persisted to campaign_research via DB utility layer | VERIFIED | `lib/pipeline/research.ts` line 228: calls `saveResearchDimension()` — no direct supabase.from inserts |
| 7 | User can add custom research notes | VERIFIED | `lib/pipeline/research.ts` exports `addResearchNote`; `app/api/pipeline/research/route.ts` handles `action === 'add_note'` |
| 8 | Research context packaged for downstream copy | VERIFIED | `lib/pipeline/research.ts` exports `packageResearchContext` returning markdown string with dimension headers |
| 9 | System queries Ask Gurudev API with 5 contextual questions | VERIFIED | `lib/pipeline/wisdom.ts`: `generateWisdomQuestions` uses Claude Haiku + `generateObject`, `queryAskGurudev` with X-API-KEY header and 15s timeout |
| 10 | Quotes in short/medium/long formats, crisis flag and timeout handled | VERIFIED | `lib/pipeline/wisdom.ts`: crisis check `data.meta?.suicide`, honeypot filter `category !== 'honeypot'`, `curateQuoteFormats` with verbatim selection, `isManual: match.category === 'manual'` |
| 11 | Quote background images generated via Imagen 3 | VERIFIED | `lib/pipeline/quote-image.ts`: `generateImage` with `google.image('imagen-3.0-generate-002')`, uploads to S3 via `generatePresignedUploadUrl` |
| 12 | Multi-channel copy generation with brand voice | VERIFIED | `lib/pipeline/copy-generation.ts`: `BRAND_VOICE_PREAMBLE` enforces no hashtags/emojis/exclamation marks, Grade 8 reading level; `CHANNEL_TASK_MAP` covers all 5 standard channels + `copy.custom` for others |
| 13 | Flyer copy prompt seeded; custom prompt seeded | VERIFIED | `supabase/seed/prompts.sql` lines 1489 (wisdom.questions), 1591 (copy.flyer), 1620 (copy.custom) — all with ON CONFLICT idempotent pattern |
| 14 | Research results stream progressively into chat | VERIFIED | `app/api/chat/route.ts`: ReadableStream with `onDimensionComplete` callback streams `data: {...}\n\n` SSE events; `hooks/usePipelineChat.ts` reads via `getReader()` and updates state incrementally |
| 15 | Wisdom quotes render as QuoteCard in chat | VERIFIED | `components/chat/MessageBubble.tsx` line 74: `case 'data-quote-card':` renders `<QuoteCard>`; `ChatInterface.tsx` maps `pipeline.wisdomQuotes` to `data-quote-card` parts |
| 16 | Channel selector appears after wisdom; copy blocks rendered per channel | VERIFIED | `ChatInterface.tsx` lines 9-10 imports ChannelSelector/ResearchReusePrompt; `pipeline.showChannelSelector` controls rendering; `pipeline.copyResults` maps to `data-copy-block` parts |
| 17 | StageProgressBar tracks pipeline stages | VERIFIED | `ChatInterface.tsx` line 8 imports StageProgressBar; `stages` computed from `pipeline.hasResearch/hasWisdom/hasCopy` passed to component |
| 18 | URL auto-parse detects pasted URLs and triggers research | VERIFIED | `lib/pipeline/orchestrator.ts` line 33: URL regex check fires FIRST before AI classification; `app/api/chat/route.ts` handles `intent.type === 'url_parse'` with `parseWorkshopUrl`; `hooks/usePipelineChat.ts` handles `url_parsing` action |

**Score:** 18/18 truths verified

---

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `types/message.ts` | VERIFIED | quote-card (9 fields), stage-progress with stages array, copy-block extended to include `'flyer' \| string` |
| `lib/ai/models.ts` | VERIFIED | 15 total TASK_MODEL_MAP entries (7 original + 8 new) |
| `lib/db/research.ts` | VERIFIED | ResearchDimension type with all 7 values, 3 exports as specified |
| `lib/db/assets.ts` | VERIFIED | AssetType union with 4 values, 3 exports as specified |
| `components/chat/parts/QuoteCard.tsx` | VERIFIED | `role="tablist"`, `aria-selected`, `aria-label="Copy to clipboard"`, `aria-label="Download quote card"`, `navigator.clipboard.writeText`, imports from `@/types/message` |
| `components/chat/parts/FlyerFrame.tsx` | VERIFIED | `bg-[#3D8BE8]` header bar, "Flyer" label, content body |
| `components/chat/parts/CopyBlock.tsx` | VERIFIED | `case 'flyer':` renders FlyerFrame, default case renders generic channel card |
| `components/chat/StageProgressBar.tsx` | VERIFIED | `role="list"`, `aria-current="step"`, `bg-[#3D8BE8]` active, `bg-[#22C55E]` completed, responsive label hiding |
| `components/chat/ChannelSelector.tsx` | VERIFIED | `role="checkbox"`, `aria-checked`, `bg-[#E47D6C]` Generate CTA, placeholder "Channel name (e.g. TikTok, LinkedIn)" |
| `components/chat/ResearchReusePrompt.tsx` | VERIFIED | Info icon from lucide-react, "Use existing" and "Run fresh" buttons |
| `lib/pipeline/research.ts` | VERIFIED | 7 DIMENSION_QUERIES, Promise.allSettled, generateText + perplexity, saves via saveResearchDimension |
| `lib/pipeline/competitor.ts` | VERIFIED | COMPETITOR_BRANDS with Headspace/Calm/Mindvalley/Sadhguru/Deepak Chopra/Eckhart Tolle/Kripalu/Yoga Journal + others, single consolidated query |
| `app/api/pipeline/research/route.ts` | VERIFIED | maxDuration=300, auth guard, add_note action handler |
| `app/api/pipeline/competitor/route.ts` | VERIFIED | maxDuration=300, auth guard |
| `lib/pipeline/wisdom.ts` | VERIFIED | queryAskGurudev with X-API-KEY + 15s timeout, crisis flag, honeypot filter, isManual, runWisdomPipeline, generateWisdomQuestions |
| `lib/pipeline/quote-image.ts` | VERIFIED | generateImage with imagen-3.0-generate-002, S3 upload via generatePresignedUploadUrl, non-blocking (returns null on failure) |
| `app/api/pipeline/wisdom/route.ts` | VERIFIED | maxDuration=300, crisis helplines in response, timedOut handling |
| `lib/pipeline/copy-generation.ts` | VERIFIED | BRAND_VOICE_PREAMBLE, CHANNEL_TASK_MAP (5 channels), generateChannelCopy, generateAllChannels (email-first), refineChannelCopy via updateAssetContent |
| `app/api/pipeline/copy/route.ts` | VERIFIED | maxDuration=300, action==='refine' branch, channels validation |
| `supabase/seed/prompts.sql` | VERIFIED | copy.flyer, copy.custom, wisdom.questions — all inserted with ON CONFLICT idempotent guard |
| `lib/pipeline/orchestrator.ts` | VERIFIED | URL detection first, fast-path chip matching, Claude Haiku AI classification fallback, url_parse intent type |
| `hooks/usePipelineChat.ts` | VERIFIED | SSE stream reader, handlePipelineResponse switch (16 action cases), triggerWisdom/triggerCopyGeneration/triggerCompetitorScan, stages computed from pipeline state |
| `app/api/chat/route.ts` | VERIFIED | detectPipelineIntent wired, ReadableStream SSE for research, wisdom/copy JSON responses, generateQuoteImages awaited and merged |
| `app/(app)/chat/[campaignId]/ChatInterface.tsx` | VERIFIED | usePipelineChat, StageProgressBar, ChannelSelector, ResearchReusePrompt, synthetic pipeline messages merged with chat messages |
| `components/chat/MessageBubble.tsx` | VERIFIED | case 'data-quote-card' renders QuoteCard, case 'data-stage-progress' renders StageProgressBar |
| `lib/pipeline/url-parser.ts` | VERIFIED | parseWorkshopUrl, artofliving.org specific parsing, Claude Haiku extraction fallback |
| `app/api/pipeline/parse-url/route.ts` | VERIFIED | maxDuration=60, auth guard, updates campaign with parsed region/event_type |

---

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `lib/pipeline/research.ts` | `lib/db/research.ts` | `saveResearchDimension` import | WIRED — line 5 imports, line 228 calls |
| `lib/pipeline/research.ts` | perplexity API | `generateText` + `perplexity('sonar-pro')` | WIRED — lines 1-2 import, Promise.allSettled block |
| `lib/pipeline/wisdom.ts` | `lib/pipeline/research.ts` | `packageResearchContext` | WIRED — line 4 imports, line 267 calls |
| `lib/pipeline/wisdom.ts` | Ask Gurudev API | fetch with X-API-KEY | WIRED — `ASK_GURUDEV_API` URL + `X-API-KEY` header |
| `lib/pipeline/copy-generation.ts` | `lib/pipeline/research.ts` | `packageResearchContext` | WIRED — line 5 imports, used in `generateAllChannels` |
| `lib/pipeline/copy-generation.ts` | `lib/db/assets.ts` | `saveAsset` + `updateAssetContent` | WIRED — line 6 imports, both called in generateChannelCopy and refineChannelCopy |
| `app/api/chat/route.ts` | `lib/pipeline/orchestrator.ts` | `detectPipelineIntent` | WIRED — line 4 imports, line 95 calls |
| `app/api/chat/route.ts` | `lib/pipeline/research.ts` | `onDimensionComplete` callback | WIRED — lines 178 and 260 in two pipeline branches |
| `hooks/usePipelineChat.ts` | `/api/chat` | `fetch('/api/chat', ...)` with pipelineAction | WIRED — line 243 |
| `components/chat/MessageBubble.tsx` | `components/chat/parts/QuoteCard.tsx` | `case 'data-quote-card'` | WIRED — line 74-80 |
| `lib/pipeline/quote-image.ts` | `app/api/chat/route.ts` | `generateQuoteImages` awaited | WIRED — imported at line 9, awaited in wisdom handler |
| `types/message.ts` | `components/chat/parts/QuoteCard.tsx` | `AmplifyDataParts['quote-card']` | WIRED — QuoteCard line 5 imports type, uses as prop |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| RSRCH-01 | 03-02 | 7 research dimensions queried in parallel for region + event type | SATISFIED | `DIMENSION_QUERIES` with all 7 keys; `Promise.allSettled` in `runResearchPipeline` |
| RSRCH-02 | 03-05 | Research results render as structured expandable cards | SATISFIED | `components/chat/parts/ResearchCard.tsx` has `expanded` state with `aria-expanded`; pipeline messages use `data-research-card` parts |
| RSRCH-03 | 03-02 | User can add custom research notes via chat | SATISFIED | `addResearchNote` in research pipeline; `add_note` action in API route; `orchestrator.ts` classifies note-add intent |
| RSRCH-04 | 03-02, 03-05 | Research context automatically feeds downstream generation | SATISFIED | `packageResearchContext` called in `generateAllChannels` and `runWisdomPipeline` |
| RSRCH-05 | 03-02 | Research stored in Supabase (not replayed in context window) | SATISFIED | `saveResearchDimension` persists to `campaign_research`; chat route queries `getResearchForCampaign` for state — results not injected into AI message context |
| WSDM-01 | 03-03 | System queries Ask Gurudev API with contextually relevant questions | SATISFIED | `generateWisdomQuestions` derives 5 questions from research context; `queryAskGurudev` calls the API |
| WSDM-02 | 03-01, 03-05 | Curated quotes displayed in short/medium/long formats as inline cards | SATISFIED | `QuoteCard` with `role="tablist"` and 3 format tabs; rendered via `data-quote-card` parts |
| WSDM-03 | 03-03 | Quote images generated via AI image models | SATISFIED | `generateQuoteImage` uses `imagen-3.0-generate-002`; `generateQuoteImages` batch in chat route |
| WSDM-04 | 03-03, 03-05 | User can request different topics via chat | SATISFIED | `orchestrator.ts` `detectPipelineIntent` handles `different_topic`; action chip "Different topic" triggers `triggerWisdom()` |
| CONT-01 | 03-04, 03-06 | System generates marketing email copy from research + wisdom context | SATISFIED | `generateChannelCopy` for 'email' uses `copy.email` task key (Claude Sonnet); URL auto-parser triggers research pipeline |
| CONT-02 | 03-04 | System generates WhatsApp messages | SATISFIED | `CHANNEL_TASK_MAP` maps 'whatsapp' to `copy.whatsapp` (Gemini Flash) |
| CONT-03 | 03-04 | System generates Instagram copy | SATISFIED | `CHANNEL_TASK_MAP` maps 'instagram' to `copy.instagram` |
| CONT-04 | 03-04 | System generates Facebook copy | SATISFIED | `CHANNEL_TASK_MAP` maps 'facebook' to `copy.facebook` |
| CONT-05 | 03-01 | Each channel renders in channel-appropriate preview | SATISFIED | `CopyBlock` switch handles whatsapp/instagram/email/facebook/flyer/custom with dedicated frame components |
| CONT-06 | 03-04, 03-05 | User can edit content via chat instructions | SATISFIED | `refineChannelCopy` loads existing asset, applies instruction, calls `updateAssetContent`; `copy_refine` action in chat route |
| CONT-07 | 03-04 | Brand voice: calm, Grade 8, no hashtags/emojis/exclamation | SATISFIED | `BRAND_VOICE_PREAMBLE` prepended to all copy system prompts; banned words listed explicitly |
| CONT-08 | 03-04 | Translation pipeline for non-English content | DEFERRED — by design | Explicitly excluded per user decision documented in Plan 03-04. No language parameters present. Marked pending in REQUIREMENTS.md. |

**Note on RSRCH-02:** REQUIREMENTS.md marks this as `[ ]` (unchecked) but `ResearchCard.tsx` has full expandable state (`useState(false)`, `aria-expanded`, conditional rendering). The requirement IS satisfied in code — the REQUIREMENTS.md checkbox appears to be a tracking oversight.

**Note on CONT-08:** Intentionally deferred by user decision. Not a gap — the plan explicitly documents this decision.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/chat/parts/QuoteCard.tsx` | 121 | `// Placeholder — download handler wired in Phase 3 Plan 02` | Warning | Download button has empty `onClick={() => {}}`. Download functionality is not implemented. Does not block other goals. |

The download button comment references "Phase 3 Plan 02" which is a stale note — Plan 02 was research, not download handler. This is a minor cosmetic/documentation issue. The download button renders and is accessible but does nothing when clicked.

---

### Human Verification Required

#### 1. Workshop URL Auto-Parse Flow

**Test:** Paste an Art of Living event URL (e.g. `https://www.artofliving.org/us-en/...`) into the chat input
**Expected:** Amplify shows "Parsing workshop details..." indicator, then auto-populates event title/region/type, then triggers the research pipeline
**Why human:** Requires live HTTP fetch of an external page and AI extraction — not verifiable via static analysis

#### 2. QuoteCard Format Tab Interaction

**Test:** Trigger wisdom stage; when QuoteCard renders, click Short/Medium/Long tabs
**Expected:** Quote text swaps instantly without re-querying; clicking Copy button changes icon to checkmark for 1.5 seconds
**Why human:** React state interaction and clipboard API require browser execution

#### 3. Brand Voice Conformance in Generated Copy

**Test:** Generate copy for all 5 channels with a real campaign context
**Expected:** No hashtags (#), no emojis, no exclamation marks, calm and dignified tone at Grade 8 reading level
**Why human:** LLM output quality and adherence to brand voice rules must be read and assessed

#### 4. Custom Channel Generation

**Test:** Type "LinkedIn" in the custom channel input, press Enter, then click Generate Copy
**Expected:** LinkedIn copy generated with appropriate professional tone; rendered in the generic slate-header channel card
**Why human:** Custom channel path through `copy.custom` prompt requires live LLM execution

#### 5. Targeted Copy Refinement

**Test:** After generating copy, type "Make the email headline shorter" in chat
**Expected:** Only the email copy block updates; WhatsApp, Instagram, Facebook, Flyer copy remain unchanged
**Why human:** Requires live execution of `refineChannelCopy` and verification of state update isolation

#### 6. Crisis Flag Handling

**Test:** Trigger wisdom stage with a message containing sensitive mental health content that would trigger Ask Gurudev's suicide meta flag
**Expected:** Crisis helplines (iCall, Lifeline, Crisis Text Line, Samaritans) appear in chat instead of quote cards
**Why human:** Requires triggering a specific API response state that can't be mocked in static analysis

#### 7. Cross-Campaign Research Reuse

**Test:** Create two campaigns in the same region; on the second campaign, describe the same region
**Expected:** ResearchReusePrompt appears showing the first campaign's name; "Use existing" accepts it, "Run fresh" dismisses it and runs new research
**Why human:** Requires two campaigns with research data in the database

---

### Gaps Summary

No gaps found. All 18 must-have truths are verified. All required artifacts exist, are substantive (not stubs), and are wired into the pipeline.

The only items worth noting:

1. **Download button is a no-op** (QuoteCard line 121) — this is an acknowledged placeholder, not a blocking gap. The button renders and is accessible; download functionality was simply not implemented in Phase 3.

2. **RSRCH-02 checkbox in REQUIREMENTS.md is stale** — marked `[ ]` but ResearchCard.tsx has full expandable state. The implementation satisfies the requirement.

3. **CONT-08 (translation pipeline)** — explicitly deferred by user decision, not a Phase 3 failure.

The phase goal is fully achieved: the complete content generation pipeline (research → wisdom → copy) is built and wired into the chat interface with progressive SSE streaming.

---

_Verified: 2026-04-01T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
