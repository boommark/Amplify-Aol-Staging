---
phase: 03-content-pipeline
plan: 01
subsystem: ui, database, api
tags: [typescript, supabase, react, tailwind, lucide, shadcn, ai-sdk]

# Dependency graph
requires:
  - phase: 02-chat-core
    provides: CopyBlock, ResearchCard, ActionChips, SkeletonPart, UIMessage parts pattern, orchestrator, TASK_MODEL_MAP

provides:
  - AmplifyDataParts extended with quote-card and stage-progress types
  - copy-block channel type supports flyer and custom string channels
  - TASK_MODEL_MAP with 8 new task keys for wisdom, per-channel copy, competitor research
  - lib/db/research.ts CRUD for campaign_research table (saveResearchDimension, getResearchForCampaign, findReusableResearch)
  - lib/db/assets.ts CRUD for campaign_assets table (saveAsset, getAssetsForCampaign, updateAssetContent)
  - QuoteCard component with format tabs (Short/Medium/Long), image background, copy-to-clipboard, manual disclaimer
  - FlyerFrame component for channel-native flyer preview
  - StageProgressBar with completed/active/pending visual states
  - ChannelSelector with toggleable chips, custom channel input, Generate Copy CTA
  - ResearchReusePrompt for cross-campaign research reuse flow

affects:
  - 03-02-research-pipeline
  - 03-03-wisdom-pipeline
  - 03-04-copy-pipeline
  - 03-05-orchestration

# Tech tracking
tech-stack:
  added: []
  patterns:
    - DB utility modules use createClient from @/lib/supabase/server (RLS applies)
    - All DB functions throw with descriptive messages on Supabase error
    - UI components follow UI-SPEC design tokens (exact hex values, touch targets 44px)
    - TASK_MODEL_MAP key format: domain.qualifier (e.g. copy.flyer, wisdom.questions)

key-files:
  created:
    - lib/db/research.ts
    - lib/db/assets.ts
    - components/chat/parts/QuoteCard.tsx
    - components/chat/parts/FlyerFrame.tsx
    - components/chat/StageProgressBar.tsx
    - components/chat/ChannelSelector.tsx
    - components/chat/ResearchReusePrompt.tsx
  modified:
    - types/message.ts
    - lib/ai/models.ts
    - components/chat/parts/CopyBlock.tsx

key-decisions:
  - "lib/db/research.ts and lib/db/assets.ts use server-side Supabase client (RLS applies) — not admin client"
  - "copy-block channel extended to 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'flyer' | string to allow custom channels"
  - "findReusableResearch queries campaigns by region + filters by excludeCampaignId, returns most recent campaign's research"
  - "ChannelSelector manages custom channel state internally; adds to allChannels display but calls onAddCustom for parent state"

patterns-established:
  - "Pattern: DB utility modules — async function with createClient(), query, throw on error, return typed result"
  - "Pattern: QuoteCard format tab — useState activeFormat drives data[activeFormat] with no re-query"
  - "Pattern: Copy-to-clipboard with icon swap — useState copied, setTimeout 1500ms to reset"

requirements-completed: [WSDM-02, CONT-05]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 3 Plan 01: Foundation Layer Summary

**Type contracts, 8 new TASK_MODEL_MAP keys, Supabase CRUD modules for research/assets, and 5 new UI components (QuoteCard, FlyerFrame, StageProgressBar, ChannelSelector, ResearchReusePrompt) establishing the data contracts all Phase 3 plans build against.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-01T21:04:40Z
- **Completed:** 2026-04-01T21:08:25Z
- **Tasks:** 2
- **Files modified:** 10 (3 modified, 7 created)

## Accomplishments

- Extended AmplifyDataParts discriminated union with `quote-card` (quoteId, short, medium, long, source, category, imageUrl, isManual, status) and `stage-progress` (stages array with id/label/state)
- Extended `copy-block` channel type to `'email' | 'whatsapp' | 'instagram' | 'facebook' | 'flyer' | string` for custom channel support
- Added 8 new TASK_MODEL_MAP entries: wisdom.questions (Haiku), copy.email (Sonnet), copy.whatsapp/instagram/facebook/flyer/custom (Gemini Flash), research.competitor (Perplexity Sonar)
- Created typed Supabase CRUD for `campaign_research` (saveResearchDimension, getResearchForCampaign, findReusableResearch with region-matching)
- Created typed Supabase CRUD for `campaign_assets` (saveAsset, getAssetsForCampaign, updateAssetContent)
- Built QuoteCard with accessible tablist (Short/Medium/Long), image overlay, copy-to-clipboard with Check icon swap, manual category disclaimer
- Built FlyerFrame, extended CopyBlock with flyer case and generic custom-channel fallback
- Built StageProgressBar with CheckCircle2 completed / filled circle active / slate pending states and connecting lines
- Built ChannelSelector with toggleable chips (role="checkbox"), inline custom channel input, peach Generate Copy CTA
- Built ResearchReusePrompt with Info icon and "Use existing" / "Run fresh" action buttons

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend type contracts, TASK_MODEL_MAP, and DB utility layer** - `ec497e1` (feat)
2. **Task 2: Build QuoteCard, ChannelSelector, FlyerFrame, StageProgressBar, and ResearchReusePrompt** - `655568b` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `types/message.ts` - Added quote-card, stage-progress part types; extended copy-block channel union
- `lib/ai/models.ts` - Added 8 new TASK_MODEL_MAP entries (15 total)
- `lib/db/research.ts` - Campaign research CRUD with ResearchDimension type and findReusableResearch
- `lib/db/assets.ts` - Campaign assets CRUD with AssetType type and updateAssetContent
- `components/chat/parts/QuoteCard.tsx` - Quote card with tablist format selector, clipboard, download
- `components/chat/parts/FlyerFrame.tsx` - Flyer channel preview with blue header bar
- `components/chat/parts/CopyBlock.tsx` - Extended with flyer case and custom channel generic fallback
- `components/chat/StageProgressBar.tsx` - Pipeline stage progress indicator (Research/Wisdom/Copy)
- `components/chat/ChannelSelector.tsx` - Channel toggle chips with custom input and Generate Copy CTA
- `components/chat/ResearchReusePrompt.tsx` - Research reuse offer card

## Decisions Made

- DB utility modules use the RLS-aware server Supabase client (not admin) — campaign_research and campaign_assets both have RLS policies tied to campaign ownership
- `findReusableResearch` does two separate queries (campaigns then campaign_research) rather than a join — Supabase JS client handles joins less ergonomically
- ChannelSelector uses `| string` channel type allowing arbitrary custom channels without type changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing TypeScript errors (lodash types, sidebar hook, past-campaigns components) are out-of-scope and were not introduced by this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All type contracts are locked — Plans 02-05 can import from types/message.ts without defining ad-hoc types
- DB utility modules ready for use by research pipeline (Plan 02) and copy pipeline (Plan 04)
- UI components built and accessible — pipeline wiring in Plans 02-05 can import and render directly
- TASK_MODEL_MAP has all required task keys for research (regional, competitor), wisdom (questions), and copy (per-channel) generation

---
*Phase: 03-content-pipeline*
*Completed: 2026-04-01*
