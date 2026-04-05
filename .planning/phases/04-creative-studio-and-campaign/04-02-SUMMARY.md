---
phase: 04-creative-studio-and-campaign
plan: "02"
subsystem: creative-studio-ui
tags: [ad-creatives, flavor-picker, image-rendering, action-chips, sse-streaming]
dependency_graph:
  requires: ["04-01"]
  provides: ["FlavorPicker component", "channel frame image rendering", "ad_creative_generate SSE handler", "ad_creative_refine JSON handler", "hasCreatives/selectedFlavor/adCreativeResults state", "triggerAdCreativeGeneration", "flavor-switch action chips"]
  affects: ["components/chat/parts/CopyBlock.tsx", "components/chat/parts/FlyerFrame.tsx", "components/chat/ActionChips.tsx", "hooks/usePipelineChat.ts", "app/api/chat/route.ts"]
tech_stack:
  added: []
  patterns: ["SSE progressive streaming per channel", "optimistic imageStatus state", "discriminated union event handling"]
key_files:
  created:
    - components/chat/parts/FlavorPicker.tsx
    - tests/components/copy-block.test.ts
  modified:
    - components/chat/parts/CopyBlock.tsx
    - components/chat/parts/FlyerFrame.tsx
    - components/chat/ActionChips.tsx
    - hooks/usePipelineChat.ts
    - app/api/chat/route.ts
decisions:
  - "onTriggerAdCreativeGeneration prop pattern in ActionChips — keeps chip logic in hook, avoids global state coupling"
  - "ChannelImageArea extracted as shared component — DRY across Instagram/Facebook/WhatsApp/Flyer frames"
  - "handleDownload uses programmatic anchor element — avoids cross-origin download attribute limitation"
metrics:
  duration: "6 minutes"
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_modified: 7
---

# Phase 04 Plan 02: Creative Studio UI Wiring Summary

End-to-end creative studio UI: FlavorPicker, channel frames with image rendering/skeleton/retry/download, chat route SSE handlers for ad_creative_generate and ad_creative_refine, client state machine with hasCreatives/selectedFlavor/adCreativeResults, and post-generation flavor-switch action chips.

## What Was Built

### Task 1: FlavorPicker and Channel Frames with Image Rendering

Created `FlavorPicker` component with two-pill toggle (Warm Realism / Playful Concept), disabled state, and onChange callback.

Updated all 4 channel frames (InstagramFrame, FacebookFrame, WhatsAppFrame, FlyerFrame):
- Skeleton shimmer (`animate-pulse`) when `imageStatus === 'generating'`
- `<img>` tag when `imageStatus === 'ready'` with `imageUrl`
- Retry button when `imageStatus === 'failed'`
- Download button using programmatic anchor click when image is ready
- Aspect ratios: `aspect-square` (Instagram, WhatsApp), `aspect-video` (Facebook), `aspect-[2/3]` (Flyer)

Extracted `ChannelImageArea` helper component to avoid duplication across frames.

Created 21 passing tests in `tests/components/copy-block.test.ts` covering all rendering logic and FlavorPicker callback behavior.

### Task 2: Chat Route, State Machine, and Action Chips

Added `ad_creative_generate` handler to `app/api/chat/route.ts`:
- Returns SSE stream
- Calls `generateAllAdCreatives` with `onChannelComplete` callback
- Emits `ad_creative_channel_done` per channel as it completes
- Emits `ad_creative_complete` when all done

Added `ad_creative_refine` handler to `app/api/chat/route.ts`:
- Returns JSON response
- Calls `refineChannelImage` with assetId + instruction
- Returns `ad_creative_refined` action with updated channel/imageUrl/assetId

Extended `usePipelineChat.ts`:
- `PipelineStage` now includes `'ad_creative'`
- `PipelineState` has `hasCreatives`, `selectedFlavor`, `adCreativeResults`
- Handles `ad_creative_channel_done`, `ad_creative_complete`, `ad_creative_refined` events
- Exposes `triggerAdCreativeGeneration(flavor)`, `triggerImageRefine(channel, instruction)`, `setSelectedFlavor(flavor)`
- Returns `hasCreatives`, `selectedFlavor`, `adCreativeResults` from hook

Updated `ActionChips.tsx` to accept `hasCreatives`, `selectedFlavor`, `pipelineStage`, `onTriggerAdCreativeGeneration` props and render a flavor-switch chip ("Switch to Playful Concept" / "Switch to Warm Realism") after creative generation completes. Chip is disabled while `pipelineStage === 'ad_creative'`.

## Verification

- TypeScript compiles clean (`npx tsc --noEmit --project tsconfig.json` — zero project errors)
- 47 tests pass across `tests/components/copy-block.test.ts` and `tests/pipeline/ad-creative-image.test.ts`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] FlavorPicker.tsx exists at `components/chat/parts/FlavorPicker.tsx`
- [x] CopyBlock.tsx updated with imageUrl, imageStatus, animate-pulse, Retry, download
- [x] FlyerFrame.tsx updated with imageUrl rendering
- [x] tests/components/copy-block.test.ts created with 21 passing tests
- [x] app/api/chat/route.ts has ad_creative_generate and ad_creative_refine
- [x] hooks/usePipelineChat.ts has hasCreatives, selectedFlavor, adCreativeResults, triggerAdCreativeGeneration
- [x] ActionChips.tsx has "Switch to" flavor-switch chip wired to triggerAdCreativeGeneration
- [x] Commits: 8f8fb3c (Task 1), 8e0ccc7 (Task 2)

## Self-Check: PASSED
