---
phase: 03-content-pipeline
plan: 06
subsystem: api
tags: [url-parsing, web-scraping, claude-haiku, sse, pipeline, art-of-living]

requires:
  - phase: 03-content-pipeline
    provides: research pipeline (runResearchPipeline), orchestrator intent detection, SSE streaming pattern

provides:
  - URL auto-detection in detectPipelineIntent (url_parse intent)
  - parseWorkshopUrl() — AoL-specific + AI fallback extraction
  - POST /api/pipeline/parse-url — standalone parse endpoint with campaign update
  - url_parse SSE handler in chat route — parse then auto-trigger research in single stream
  - url_parsing/url_parsed/url_parse_complete state handlers in usePipelineChat

affects:
  - phase-04 (any UI improvements to ChatInterface showing parsed workshop card)
  - phase-05 (any marketing kit export referencing parsed event details)

tech-stack:
  added: []
  patterns:
    - URL regex detection as first guard in detectPipelineIntent (before AI classification)
    - Browser User-Agent fetch for scraping with AbortSignal.timeout
    - AoL domain-specific parser + Claude Haiku AI fallback for generic URLs
    - SSE stream handling parse + research in single response for seamless UX

key-files:
  created:
    - lib/pipeline/url-parser.ts
    - app/api/pipeline/parse-url/route.ts
  modified:
    - lib/pipeline/orchestrator.ts
    - app/api/chat/route.ts
    - hooks/usePipelineChat.ts

key-decisions:
  - "URL regex detection placed FIRST in detectPipelineIntent — before action chip matching and AI classification — so pasted URLs are never misclassified as chat"
  - "Art of Living domain gets dedicated parser; generic URLs fall back to Claude Haiku generateObject with 4000-char page text truncation"
  - "url_parse SSE handler chains parse + research in a single stream — user sees parsing → research_dimension events with no reload"
  - "Pre-stage setter (stage: research on any SSE stream) removed — stage transitions are now event-driven, enabling url_parsing stage before research begins"
  - "parse-url standalone API route also exists for future direct integrations (mobile app, browser extension)"

patterns-established:
  - "Scraping: fetch with browser User-Agent + AbortSignal.timeout(15000) for safe server-side HTML fetch"
  - "Graceful degradation: parseWorkshopUrl always returns ParsedWorkshopData (never throws) — partial data on any failure"
  - "Campaign update: only overwrite campaign.region/event_type if not already set, preventing user's manual selections from being overwritten"

requirements-completed: [CONT-01]

duration: 5min
completed: 2026-04-01
---

# Phase 03 Plan 06: Workshop URL Auto-Parser Summary

**URL auto-parsing pipeline: paste any workshop URL and Amplify extracts event details, updates the campaign, and auto-triggers regional research — all in a single SSE stream**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-01T22:00:36Z
- **Completed:** 2026-04-01T22:05:05Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- `parseWorkshopUrl()` fetches page HTML with browser User-Agent, extracts og:title/og:description/meta tags, applies AoL-specific date/location/price regex patterns, and falls back to Claude Haiku for generic pages
- Standalone `POST /api/pipeline/parse-url` endpoint for direct URL parsing with campaign update
- `url_parse` intent type added as the first guard in `detectPipelineIntent` — URL in any message always routes to parsing, never to chat
- URL parse + research chained in a single SSE stream via the chat route — user sees `url_parsing` → `url_parsed` → `research_dimension` events progressively
- Hook updated with `url_parsing` PipelineStage and three new action handlers; SSE pre-stage setter removed so events control transitions

## Task Commits

1. **Task 1: URL parser module and API route** - `d985df0` (feat)
2. **Task 2: Integrate URL detection into pipeline orchestrator and chat flow** - `9889581` (feat)

## Files Created/Modified

- `lib/pipeline/url-parser.ts` — Core parser: AoL domain-specific logic, Claude Haiku fallback, graceful degradation
- `app/api/pipeline/parse-url/route.ts` — Standalone POST endpoint with auth guard and campaign update
- `lib/pipeline/orchestrator.ts` — `url_parse` intent added; URL regex guard is now the first check
- `app/api/chat/route.ts` — `url_parse` SSE handler: parse + campaign update + auto-research in one stream
- `hooks/usePipelineChat.ts` — `url_parsing` stage, `parsedWorkshop`/`parsingUrl` state, three new action handlers, SSE pre-stage removed

## Decisions Made

- URL regex runs FIRST in intent detection — prevents URL strings from hitting AI classification
- AoL domain gets its own parser; all other pages use Claude Haiku (same model as detectPipelineIntent)
- Single SSE stream for parse + research — avoids client needing to make a second request after parsing completes
- Standalone `/api/pipeline/parse-url` also created — useful for future direct integrations

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — TypeScript compiled cleanly for all new and modified files. Pre-existing errors in unrelated components were out of scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- URL parsing is fully integrated; paste any AoL event URL in chat to trigger end-to-end parse + research
- UI can display `parsedWorkshop` state (from `pipeline.parsedWorkshop`) as a "Detected workshop" card before research cards appear — not implemented here, available for a UI enhancement
- Generic URL fallback depends on Claude Haiku API key being available (same as orchestrator intent detection)

---
*Phase: 03-content-pipeline*
*Completed: 2026-04-01*
