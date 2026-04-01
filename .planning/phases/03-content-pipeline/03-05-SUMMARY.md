---
phase: 03-content-pipeline
plan: 05
subsystem: ui
tags: [pipeline, orchestration, sse, streaming, react, typescript, next.js]

# Dependency graph
requires:
  - phase: 03-content-pipeline/03-01
    provides: StageProgressBar, ChannelSelector, ResearchReusePrompt, QuoteCard components; types/message.ts with quote-card and stage-progress parts
  - phase: 03-content-pipeline/03-02
    provides: runResearchPipeline, runCompetitorScan, lib/db/research (findReusableResearch, getResearchForCampaign)
  - phase: 03-content-pipeline/03-03
    provides: runWisdomPipeline, generateQuoteImages
  - phase: 03-content-pipeline/03-04
    provides: generateAllChannels, refineChannelCopy
  - phase: 02-chat-core/02-03
    provides: useAmplifyChat hook (wrapped by usePipelineChat)
  - phase: 02-chat-core/02-04
    provides: MessageBubble with existing data part switch cases
provides:
  - Pipeline orchestration (detectPipelineIntent) wired into chat route with progressive SSE streaming
  - usePipelineChat hook managing all pipeline state and SSE stream reading
  - ChatInterface updated to render StageProgressBar, ChannelSelector, ResearchReusePrompt, and pipeline messages
  - MessageBubble extended with data-quote-card and data-stage-progress cases
affects: [phase 04, chat-interface, content-rendering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SSE progressive streaming via ReadableStream with onDimensionComplete callbacks for research pipeline
    - Pipeline intent detection via fast-path string matching + Claude Haiku AI classification fallback
    - Synthetic pipeline messages computed from hook state and merged into chat message list
    - NextResponse.json for all JSON pipeline responses (Response.json not in project TS DOM lib config)

key-files:
  created:
    - lib/pipeline/orchestrator.ts
    - hooks/usePipelineChat.ts
  modified:
    - app/api/chat/route.ts
    - app/(app)/chat/[campaignId]/ChatInterface.tsx
    - components/chat/MessageBubble.tsx

key-decisions:
  - "NextResponse.json used for all pipeline JSON responses — Response.json not available in project TypeScript DOM lib config (consistent with Plan 03 decision)"
  - "Pipeline messages (research cards, quote cards, copy blocks) rendered as computed synthetic UIMessages appended to real chat messages — avoids touching AI SDK useChat internals"
  - "usePipelineChat wraps useAmplifyChat — preserves all existing chat behavior, adds pipeline layer on top"
  - "SSE research stream reads via getReader() in usePipelineChat — each data: event triggers incremental state update, giving progressive card-by-card appearance"
  - "Quote image URLs are awaited server-side (not fire-and-forget) so QuoteCard renders images on first paint without a second fetch"

patterns-established:
  - "Pipeline intent fast-path: exact string match for action chip prompts before AI classification"
  - "SSE stream in hook: buffer + split on double newline, parse data: prefix per event"
  - "Synthetic pipeline messages: computed from state using useMemo, merged with real messages for rendering"

requirements-completed:
  - RSRCH-02
  - RSRCH-04
  - WSDM-02
  - CONT-05
  - CONT-06

# Metrics
duration: 25min
completed: 2026-04-01
---

# Phase 3 Plan 05: Pipeline Orchestration Summary

**Progressive SSE streaming for research cards, quote image URLs merged server-side, and full research → wisdom → copy pipeline wired into chat via usePipelineChat hook and detectPipelineIntent classifier**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-01T21:20:00Z
- **Completed:** 2026-04-01T21:45:00Z
- **Tasks:** 2 of 3 complete (Task 3 is checkpoint:human-verify)
- **Files modified:** 5

## Accomplishments
- lib/pipeline/orchestrator.ts: detectPipelineIntent with fast-path exact matching for action chips + Claude Haiku fallback for ambiguous messages
- app/api/chat/route.ts: full pipeline routing — research via ReadableStream SSE, wisdom with awaited generateQuoteImages, copy generation and refinement, standard chat fallback
- hooks/usePipelineChat.ts: SSE stream reading via getReader(), progressive state updates per research dimension, stage transition helpers
- ChatInterface.tsx: StageProgressBar + ChannelSelector + ResearchReusePrompt integrated; pipeline messages computed and merged with real chat messages
- MessageBubble.tsx: data-quote-card and data-stage-progress cases added

## Task Commits

1. **Task 1: Pipeline orchestrator and enhanced chat route** - `1639fd5` (feat)
2. **Task 2: Client-side pipeline hook, ChatInterface integration, MessageBubble extensions** - `681be6b` (feat)
3. **Task 3: Human verification** - PENDING CHECKPOINT

## Files Created/Modified
- `lib/pipeline/orchestrator.ts` - detectPipelineIntent with PipelineIntent discriminated union
- `app/api/chat/route.ts` - Full pipeline routing with SSE streaming for research
- `hooks/usePipelineChat.ts` - Client-side pipeline state, SSE reading, stage helpers
- `app/(app)/chat/[campaignId]/ChatInterface.tsx` - Pipeline UI integration
- `components/chat/MessageBubble.tsx` - Extended with quote-card and stage-progress rendering

## Decisions Made
- Used `NextResponse.json` for all pipeline JSON responses (consistent with Phase 3 Plan 03 decision — `Response.json` not in project TS DOM lib config)
- Pipeline messages computed as synthetic UIMessage objects from state using useMemo — avoids touching AI SDK internals
- Quote images awaited server-side so QuoteCard renders images immediately on first paint
- Fast-path string matching before AI classification avoids 500ms Haiku call for action chip prompts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced Response.json with NextResponse.json in chat route**
- **Found during:** Task 1 (chat route rewrite)
- **Issue:** `Response.json` is not available in the project TypeScript DOM lib config — same issue resolved in Plan 03
- **Fix:** Imported `NextResponse` from `next/server` and replaced all `Response.json(` calls with `NextResponse.json(`
- **Files modified:** app/api/chat/route.ts
- **Verification:** `npx tsc --noEmit` passes with no errors in route file
- **Committed in:** 1639fd5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required fix for TypeScript correctness. No scope creep.

## Issues Encountered
None beyond the Response.json deviation auto-fixed above.

## User Setup Required
None - no new external services or environment variables required. All pipeline modules already configured in previous plans.

## Next Phase Readiness
- Full pipeline integration complete — research, wisdom, copy all wired into chat
- Task 3 (human verification) pending: user needs to verify end-to-end flow in browser
- After checkpoint passes: Phase 4 (campaign browsing/export UI + ad creative) ready to begin
- Canva Enterprise gate still unresolved for Phase 4 ad creative (pre-existing blocker)

---
*Phase: 03-content-pipeline*
*Completed: 2026-04-01 (partial — awaiting Task 3 checkpoint verification)*
