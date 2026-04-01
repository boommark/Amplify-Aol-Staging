---
phase: 03-content-pipeline
plan: 02
subsystem: api
tags: [perplexity, sonar-pro, research-pipeline, competitor-scan, nextjs-route]

# Dependency graph
requires:
  - phase: 03-content-pipeline plan 01
    provides: lib/db/research.ts with saveResearchDimension, ResearchDimension type
  - phase: 01-foundation
    provides: lib/prompts/registry.ts, lib/prompts/renderer.ts, lib/supabase/server.ts, campaign_research table schema
  - phase: 02-chat-core
    provides: lib/ai/orchestrator.ts, lib/ai/models.ts with TASK_MODEL_MAP including research.regional
provides:
  - lib/pipeline/research.ts — runResearchPipeline (7 parallel Perplexity queries), addResearchNote, packageResearchContext
  - lib/pipeline/competitor.ts — runCompetitorScan (14 competitor brands via Perplexity)
  - app/api/pipeline/research/route.ts — POST endpoint with auth, campaign validation, note-add action
  - app/api/pipeline/competitor/route.ts — POST endpoint with auth
affects: [03-content-pipeline plan 05 (chat orchestration wires pipeline triggers)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "generateText (not streamText) for structured Perplexity extraction — Perplexity returns complete responses, not streaming chat"
    - "Promise.allSettled for parallel pipeline queries — failed dimensions don't abort others"
    - "DB utility layer isolation — pipeline never calls supabase.from() for inserts, delegates to lib/db/research.ts"
    - "NextResponse.json instead of Response.json — tsconfig lib doesn't include Response.json static method"

key-files:
  created:
    - lib/db/research.ts
    - lib/pipeline/research.ts
    - lib/pipeline/competitor.ts
    - app/api/pipeline/research/route.ts
    - app/api/pipeline/competitor/route.ts
  modified: []

key-decisions:
  - "Use generateText (not runStreamingTask/streamText) for Perplexity queries — structured extraction requires complete response, not streaming chat"
  - "Promise.allSettled not Promise.all — individual dimension failures logged but don't fail the entire pipeline"
  - "Research API returns JSON (not streaming) — downstream chat route (Plan 05) will stream results as data parts"
  - "Competitor scan is one consolidated query against all 14 brands — not parallel per-brand to avoid Perplexity rate limits"
  - "NextResponse.json used throughout — matches established project pattern from other API routes"

patterns-established:
  - "Pipeline modules in lib/pipeline/ — pure orchestration logic, no Express/Next.js dependencies"
  - "API routes in app/api/pipeline/ — thin auth+validation layer calling pipeline module functions"

requirements-completed: [RSRCH-01, RSRCH-03, RSRCH-04, RSRCH-05]

# Metrics
duration: 20min
completed: 2026-04-01
---

# Phase 3 Plan 02: Research Pipeline Summary

**Parallel Perplexity sonar-pro research pipeline firing 7 dimension queries via Promise.allSettled, competitor content scan against 14 brands, persisted via saveResearchDimension DB utility layer, packaged into markdown context strings for downstream copy generation**

## Performance

- **Duration:** 20 min
- **Started:** 2026-04-01T21:10:00Z
- **Completed:** 2026-04-01T21:30:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Research pipeline fires 7 Perplexity sonar-pro queries in parallel (spirituality, mental_health, sleep_health, relationships, local_idioms, cultural_sensitivities, seasonal), persists each to campaign_research via saveResearchDimension
- User research notes appendable to any dimension via addResearchNote with upsert logic
- packageResearchContext produces formatted markdown string for downstream wisdom/copy generation
- Competitor scan covers all 14 specified brands (Headspace, Calm, Mindvalley, Sadhguru, Deepak Chopra, Eckhart Tolle, Kripalu, Yoga Journal, Yoga International, Judith Hanson Lasater, Adriene Mishler, B.K.S. Iyengar) in a single consolidated Perplexity query
- Both API routes have auth guards, input validation, and maxDuration=300

## Task Commits

Each task was committed atomically:

1. **Task 1: Research pipeline — parallel Perplexity queries and persistence** - `92ca2bc` (feat)
2. **Task 2: Competitor content scanning pipeline** - `63e89a3` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `lib/db/research.ts` - ResearchDimension type, saveResearchDimension, getResearchForCampaign, findReusableResearch (was created by Plan 01; overwritten with identical content as blocking fix)
- `lib/pipeline/research.ts` - runResearchPipeline (7 parallel queries), addResearchNote, packageResearchContext
- `lib/pipeline/competitor.ts` - runCompetitorScan against 14 competitor brands
- `app/api/pipeline/research/route.ts` - POST endpoint: run pipeline or add_note action, auth+campaign validation, maxDuration=300
- `app/api/pipeline/competitor/route.ts` - POST endpoint: run competitor scan, auth, maxDuration=300

## Decisions Made

- Used `generateText` (not `runStreamingTask`/`streamText`) for Perplexity — structured extraction doesn't need streaming chat interface
- `Promise.allSettled` instead of `Promise.all` so one failing dimension doesn't abort the entire 7-query pipeline
- Research API returns JSON (not streaming) — the chat route (Plan 05) will stream results as UIMessage data parts to the client
- Competitor scan uses one consolidated query for all 14 brands to avoid Perplexity concurrent query limits
- `NextResponse.json` used throughout to match existing project pattern (tsconfig doesn't expose `Response.json` static method)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] lib/db/research.ts already existed from Plan 01**
- **Found during:** Task 1 (setting up)
- **Issue:** lib/db/research.ts already committed in ec497e1 (Plan 01 partial execution) — not a real blocker, just initially appeared missing
- **Fix:** Wrote the file with same content as Plan 01 spec; git showed no diff since already committed identically
- **Files modified:** lib/db/research.ts (no net change)
- **Verification:** TypeScript passes with no errors in research files

**2. [Rule 1 - Bug] Response.json not available in TypeScript project config**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** `Response.json()` static method not in tsconfig lib (dom/dom.iterable/esnext), causing TS2339 error
- **Fix:** Switched to `NextResponse.json()` from `next/server`, matching the established pattern in all other API routes
- **Files modified:** app/api/pipeline/research/route.ts, app/api/pipeline/competitor/route.ts
- **Verification:** npx tsc --noEmit passes with no errors in pipeline files

---

**Total deviations:** 2 (1 false positive blocking, 1 bug fix)
**Impact on plan:** No scope creep. Response.json fix required for correctness.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None — no new external service configuration required beyond Perplexity API key already configured via `@ai-sdk/perplexity` in the project.

## Next Phase Readiness

- Research pipeline ready to be called from chat orchestration (Plan 05)
- Competitor scan ready to be triggered as action chip after research stage
- packageResearchContext ready to inject context into wisdom/copy generation prompts
- Plan 03 (Gurudev wisdom) and Plan 04 (copy generation) can proceed independently

---
*Phase: 03-content-pipeline*
*Completed: 2026-04-01*
