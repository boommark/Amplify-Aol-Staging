---
phase: 03-content-pipeline
plan: "04"
subsystem: copy-generation
tags: [copy-generation, brand-voice, multi-channel, refinement, prompts]
dependency_graph:
  requires:
    - 03-01 (lib/db/assets.ts, lib/ai/models.ts, TASK_MODEL_MAP)
    - 03-02 (lib/pipeline/research.ts, packageResearchContext)
  provides:
    - lib/pipeline/copy-generation.ts (generateChannelCopy, generateAllChannels, refineChannelCopy)
    - app/api/pipeline/copy/route.ts (POST /api/pipeline/copy)
    - supabase/seed/prompts.sql (copy.flyer, copy.custom prompts)
  affects:
    - 03-05 (chat route pipeline orchestration — will call generateAllChannels)
tech_stack:
  added: []
  patterns:
    - generateText (not streaming) for synchronous copy generation
    - Email-first then parallel pattern for channel generation ordering
    - BRAND_VOICE_PREAMBLE prepended to all copy generation system prompts
    - ON CONFLICT (key) WHERE is_active = true DO NOTHING for idempotent prompt seeding
key_files:
  created:
    - lib/pipeline/copy-generation.ts
    - app/api/pipeline/copy/route.ts
  modified:
    - supabase/seed/prompts.sql
decisions:
  - "English-only copy generation — translation/language support deferred per CONT-08 decision"
  - "Email generated first (Claude Sonnet premium model), then all other channels in parallel via Promise.allSettled"
  - "BRAND_VOICE_PREAMBLE prepended to all copy prompts — enforces Art of Living brand voice at system level"
  - "refineChannelCopy updates single asset in-place via updateAssetContent — no full pipeline re-run"
  - "Custom channels use copy.custom task key (Gemini Flash) with {{channel}} variable for platform adaptation"
  - "wisdom.questions prompt already seeded from n8n migration in Plan 02 — added only copy.flyer and copy.custom"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-01T21:14:43Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 3 Plan 4: Copy Generation Pipeline Summary

**One-liner:** Multi-channel Art of Living copy generation using channel-specific AI models with mandatory brand voice enforcement and targeted single-channel refinement.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Multi-channel copy generation pipeline | c3cac4a | lib/pipeline/copy-generation.ts, app/api/pipeline/copy/route.ts |
| 2 | Seed copy.flyer and copy.custom prompts | 0d5c7f3 | supabase/seed/prompts.sql |

## What Was Built

### lib/pipeline/copy-generation.ts

Three exported functions for the copy generation stage of the pipeline:

- **`generateChannelCopy`** — generates copy for a single channel using its channel-specific model from TASK_MODEL_MAP. Routes standard channels (email/whatsapp/instagram/facebook/flyer) via CHANNEL_TASK_MAP and custom channels via `copy.custom`. Persists result to `campaign_assets` via `saveAsset`.

- **`generateAllChannels`** — orchestrates copy for all selected channels. Generates email first (Claude Sonnet) then all other channels in parallel via `Promise.allSettled`. Supports `onChannelComplete` callback for progressive UI rendering. Calls `packageResearchContext` once and shares it across all channels.

- **`refineChannelCopy`** — loads existing asset content, applies user instruction via AI, updates the asset in-place via `updateAssetContent`. Updates only the specified channel — no other channels are touched.

The `BRAND_VOICE_PREAMBLE` constant is prepended to all system prompts, enforcing Art of Living brand voice rules: calm/warm/dignified tone, Grade 8 reading level, no hashtags/emojis/exclamation marks, banned buzzwords list, verbatim Gurudev quotes.

### app/api/pipeline/copy/route.ts

POST endpoint at `/api/pipeline/copy` with `maxDuration = 300` (Vercel Fluid Compute). Handles two actions:
- Default (generate): validates `channels[]` array is non-empty, validates `region` and `eventType`, calls `generateAllChannels`
- `action === 'refine'`: validates `assetId`, `channel`, `instruction`, calls `refineChannelCopy`

### supabase/seed/prompts.sql

Two new prompts seeded:
- **`copy.flyer`**: Physical flyer copy with Grade 6 reading level, structured output (headline max 8 words, bullet benefits max 8 words each, CTA max 6 words), community-board tone
- **`copy.custom`**: Adaptive prompt for custom channels (TikTok, SMS, LinkedIn, etc.) using `{{channel}}` variable for platform-specific adaptation

Note: `wisdom.questions` was already present from the n8n workflow migration in Plan 02.

## Deviations from Plan

### Auto-noted: wisdom.questions already seeded

**Found during:** Task 2
**Issue:** The plan instructed adding `wisdom.questions` as a new prompt, but it was already present in the SQL file from the n8n migration in Plan 02 (line 1489). It uses a different template format with n8n expressions but the same key.
**Fix:** Added only `copy.flyer` and `copy.custom` which were genuinely missing. The `ON CONFLICT DO NOTHING` pattern would skip `wisdom.questions` anyway — but skipping it intentionally makes the intent clear.
**Files modified:** supabase/seed/prompts.sql

### Auto-fixed: Response.json not available in TypeScript target

**Found during:** Task 1 verification (tsc --noEmit)
**Issue:** TypeScript target version doesn't recognize `Response.json()` static method — same pre-existing error in other route files.
**Fix:** Used `NextResponse.json()` from `next/server` — consistent with the established pattern in research/route.ts.
**Files modified:** app/api/pipeline/copy/route.ts

## Self-Check

All files exist:
- lib/pipeline/copy-generation.ts: FOUND
- app/api/pipeline/copy/route.ts: FOUND
- supabase/seed/prompts.sql (modified): FOUND

All commits exist:
- c3cac4a: FOUND
- 0d5c7f3: FOUND

## Self-Check: PASSED
