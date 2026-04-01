---
phase: 03-content-pipeline
plan: 03
subsystem: api
tags: [ask-gurudev, wisdom, quotes, imagen, imagen-3, s3, ai-sdk, anthropic, google]

# Dependency graph
requires:
  - phase: 03-01
    provides: types/message.ts quote-card part type, lib/ai/models.ts with wisdom.questions and image.quote task keys
  - phase: 03-02
    provides: lib/pipeline/research.ts packageResearchContext, lib/db/assets.ts saveAsset
provides:
  - lib/pipeline/wisdom.ts — Ask Gurudev API client, 5-question derivation, verbatim quote curation
  - lib/pipeline/quote-image.ts — Imagen 3 quote background image generation and S3 upload
  - app/api/pipeline/wisdom/route.ts — POST endpoint triggering wisdom pipeline with maxDuration=300
affects: [04-campaign-ui, 05-chat-orchestration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Ask Gurudev API: X-API-KEY header auth, 15s AbortController timeout, honeypot filter, crisis meta flag"
    - "generateObject with Zod schema for structured AI output (question generation, quote curation)"
    - "generateImage (stable ai v6 export) with google.image() for Imagen 3"
    - "Parallel Promise.allSettled for multi-query API calls with individual failure tolerance"
    - "S3 key pattern: userId/campaigns/campaignId/quote-images/quote-N.png"

key-files:
  created:
    - lib/pipeline/wisdom.ts
    - lib/pipeline/quote-image.ts
    - app/api/pipeline/wisdom/route.ts
  modified: []

key-decisions:
  - "Use generateImage (stable) not experimental_generateImage — both available in ai 6.0.141 but stable preferred"
  - "Route uses NextResponse.json not Response.json — Response.json not in project's TypeScript DOM lib config"
  - "Wisdom pipeline returns empty quotes (not error) when all API queries time out — timedOut flag signals caller"
  - "Quote dedup by first 100 chars of content — prevents duplicate quotes from overlapping question results"

patterns-established:
  - "Crisis flag: any suicide meta flag in any response aborts entire wisdom pipeline, returns helpline data"
  - "Manual category quotes: isManual=true flag signals UI to prepend AskGurudev Team disclaimer"
  - "Non-blocking image generation: generateQuoteImage returns null on any error, quote cards render without images"

requirements-completed: [WSDM-01, WSDM-03, WSDM-04]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 3 Plan 03: Gurudev Wisdom Pipeline Summary

**Ask Gurudev API client with 5-question contextual derivation from research, verbatim quote curation in short/medium/long formats, and Imagen 3 quote background image generation uploaded to S3**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T21:11:36Z
- **Completed:** 2026-04-01T21:14:54Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Ask Gurudev API client with X-API-KEY auth, 15s timeout, honeypot filter, and crisis meta flag handling
- 5-question contextual derivation using Claude Haiku + generateObject from packed research context
- Verbatim quote curation into short/medium/long formats — AI selects excerpts, never paraphrases
- Parallel quote image generation via Imagen 3 with S3 upload and graceful null fallback
- POST endpoint at `/api/pipeline/wisdom` with auth guard, campaign validation, and crisis/timeout branching

## Task Commits

Each task was committed atomically:

1. **Task 1: Ask Gurudev API client and wisdom curation pipeline** - `c3cac4a` (feat) — note: committed together with copy pipeline in prior session
2. **Task 2: Quote background image generation** - `343ce9a` (feat)

**Plan metadata:** see docs commit below

## Files Created/Modified

- `lib/pipeline/wisdom.ts` — queryAskGurudev client, generateWisdomQuestions, curateQuoteFormats, runWisdomPipeline
- `app/api/pipeline/wisdom/route.ts` — POST endpoint with maxDuration=300, crisis helpline response, timeout fallback
- `lib/pipeline/quote-image.ts` — generateQuoteImage and generateQuoteImages with Imagen 3 + S3 upload

## Decisions Made

- Used `generateImage` (stable ai v6 export) rather than `experimental_generateImage` — both available but stable preferred
- Route uses `NextResponse.json` not `Response.json` — `Response.json` is not in project's TypeScript DOM lib configuration
- Wisdom pipeline returns `timedOut: true` with empty quotes rather than error — allows chat to gracefully continue
- Deduplication by first 100 chars of content prevents duplicate quotes when multiple questions hit same source material

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used NextResponse.json instead of Response.json**
- **Found during:** Task 1 (API route implementation)
- **Issue:** TypeScript compilation error — `Response.json` is not defined in the project's TypeScript configuration (dom lib doesn't include it)
- **Fix:** Added `NextResponse` import from `next/server` and replaced all `Response.json()` calls with `NextResponse.json()`
- **Files modified:** `app/api/pipeline/wisdom/route.ts`
- **Verification:** `npx tsc --noEmit` shows no errors in wisdom files after fix
- **Committed in:** `c3cac4a` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix necessary for TypeScript compilation. Behavior is identical — NextResponse.json is Next.js's typed wrapper around Response.json. No scope creep.

## Issues Encountered

- Task 1 wisdom files (`wisdom.ts`, `app/api/pipeline/wisdom/route.ts`) were found already committed in `c3cac4a` from a prior execution session that bundled them with the copy pipeline. Files matched the plan spec exactly — no rework needed.

## User Setup Required

None — no new external service configuration required beyond existing `ASK_GURUDEV_API_KEY` env var (falls back to `test_text` for development).

## Next Phase Readiness

- Wisdom pipeline is ready for integration in the chat orchestration layer (Plan 05)
- Quote images are stored in S3 with consistent key pattern for retrieval
- Crisis flag and timeout handling is complete — chat route can pass these through to UI
- `generateQuoteImages` batch function ready for use once user selects quotes to image-ify

---
*Phase: 03-content-pipeline*
*Completed: 2026-04-01*
