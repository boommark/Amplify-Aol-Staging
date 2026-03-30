---
phase: 02-chat-core
plan: 00
subsystem: infra
tags: [ai-sdk, vercel-ai, anthropic, google, openai, perplexity, typescript, zod, testing, vitest]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Supabase schema (campaigns + campaign_messages tables), vitest test runner, TypeScript config

provides:
  - AI SDK v6 packages installed (ai, @ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/openai, @ai-sdk/perplexity, @tanstack/react-query)
  - AmplifyDataParts discriminated union type (5 rich content part types)
  - AmplifyUIMessage type extending AI SDK UIMessage with custom parts
  - Campaign and CampaignMessage DB row interfaces matching Supabase schema
  - TASK_MODEL_MAP with 7 task keys mapping to provider+model pairs
  - TaskKey type and getModelForTask() helper
  - Test stubs covering CHAT-02, CHAT-07, CHAT-08, CHAT-09, INFRA-02, INFRA-07
  - mockCampaign() and mockCampaignMessage() test factory functions

affects: [02-01, 02-02, 02-03, 02-04, 02-05, Phase 3 research pipeline, Phase 4 media]

# Tech tracking
tech-stack:
  added:
    - ai@6.0.141 (Vercel AI SDK v6 — streaming, UIMessage, useChat)
    - "@ai-sdk/anthropic@3.0.64 (Claude provider)"
    - "@ai-sdk/google@3.0.54 (Gemini + Imagen + Veo provider)"
    - "@ai-sdk/openai@3.0.49 (GPT-Image provider)"
    - "@ai-sdk/perplexity@3.0.26 (Sonar research provider)"
    - "@tanstack/react-query@5.95.2 (client state management)"
    - zod@3.25.76 (upgraded from 3.24.1 to satisfy AI SDK peer dependency)
  patterns:
    - TASK_MODEL_MAP pattern for rule-based multi-model routing (task key -> provider+model)
    - UIMessage custom parts discriminated union for typed rich content streaming
    - it.todo() stubs for Nyquist Wave 0 compliance without over-specifying unbuilt behavior

key-files:
  created:
    - types/message.ts (AmplifyDataParts + AmplifyUIMessage)
    - lib/ai/models.ts (TASK_MODEL_MAP, TaskKey, getModelForTask)
    - tests/ai/models.test.ts (3 passing TASK_MODEL_MAP tests)
    - tests/chat/api.test.ts (3 todo stubs)
    - tests/chat/orchestrator.test.ts (3 todo stubs)
    - tests/chat/persistence.test.ts (2 todo stubs)
    - tests/campaigns/queries.test.ts (3 todo stubs)
  modified:
    - types/campaign.ts (replaced prototype fields with DB-accurate schema)
    - tests/helpers/supabase-mock.ts (added mockCampaign + mockCampaignMessage factories)
    - lib/db/campaigns.ts (Rule 1: updated Message -> UIMessage import after SDK upgrade)
    - package.json (added 7 new dependencies, upgraded zod)

key-decisions:
  - "AI SDK v6 UIMessage parts pattern chosen over plain text for typed discriminated union rich content"
  - "TASK_MODEL_MAP uses rule-based routing (not AI-driven) — task key maps deterministically to provider+model pair"
  - "Zod upgraded 3.24.1 -> 3.25.76 to satisfy AI SDK peer dependency (^3.25.76 || ^4.1.8)"
  - "lib/db/campaigns.ts Message import fixed to UIMessage — AI SDK v6 renamed the type"

patterns-established:
  - "Pattern 1: TASK_MODEL_MAP — import getModelForTask(taskKey) to get provider+model for any AI operation"
  - "Pattern 2: AmplifyUIMessage — use instead of raw UIMessage for type-safe rich content parts in chat messages"
  - "Pattern 3: Test stubs with it.todo() — all Phase 2 requirements covered at Wave 0, filled in downstream plans"

requirements-completed: [INFRA-02]

# Metrics
duration: 8min
completed: 2026-03-30
---

# Phase 02 Plan 00: AI SDK Foundation Summary

**AI SDK v6 installed with 4 provider packages, AmplifyDataParts discriminated union (5 rich content types), TASK_MODEL_MAP routing 7 task keys across Claude/Gemini/Perplexity/OpenAI, and Nyquist test stubs covering all Phase 2 requirements**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-30T23:24:22Z
- **Completed:** 2026-03-30T23:32:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Installed AI SDK v6 with all 4 provider packages (Anthropic, Google, OpenAI, Perplexity) and @tanstack/react-query
- Defined type contracts: `AmplifyDataParts` discriminated union (5 parts: research-card, copy-block, image-carousel, ad-preview, action-chips) and `AmplifyUIMessage`
- Created `TASK_MODEL_MAP` with 7 task keys routing to correct provider+model pairs; full test suite green (3 passing, 27 todos)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install AI SDK packages and define type contracts** - `75eda34` (feat)
2. **Task 2: Create test stubs for all testable Phase 2 requirements** - `8dcd966` (feat, committed in prior session)

**Plan metadata:** (see final commit hash)

## Files Created/Modified

- `types/message.ts` - AmplifyDataParts discriminated union + AmplifyUIMessage type
- `types/campaign.ts` - DB-accurate Campaign and CampaignMessage interfaces (replaced prototype fields)
- `lib/ai/models.ts` - TASK_MODEL_MAP with 7 entries, TaskKey type, getModelForTask()
- `lib/db/campaigns.ts` - Fixed Message -> UIMessage import (Rule 1 auto-fix)
- `tests/ai/models.test.ts` - 3 passing TASK_MODEL_MAP tests (INFRA-02 coverage)
- `tests/chat/api.test.ts` - 3 todo stubs (INFRA-07, CHAT-02, CHAT-07)
- `tests/chat/orchestrator.test.ts` - 3 todo stubs (CHAT-02, CHAT-07, context management)
- `tests/chat/persistence.test.ts` - 2 todo stubs (CHAT-08)
- `tests/campaigns/queries.test.ts` - 3 todo stubs (CHAT-08, CHAT-09)
- `tests/helpers/supabase-mock.ts` - Added mockCampaign() and mockCampaignMessage() factories
- `package.json` / `pnpm-lock.yaml` - Added 7 new dependencies, upgraded zod

## Decisions Made

- AI SDK v6 `UIMessage` parts pattern chosen over plain text returns — enables typed discriminated union for rich content streaming
- `TASK_MODEL_MAP` uses rule-based routing, not AI-driven selection — deterministic, fast, easy to test
- Zod upgraded `3.24.1 -> 3.25.76` to satisfy AI SDK peer dependency requirement (`^3.25.76 || ^4.1.8`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed broken Message -> UIMessage import in lib/db/campaigns.ts**
- **Found during:** Task 1 (TypeScript compilation check)
- **Issue:** `lib/db/campaigns.ts` used `import type { Message } from 'ai'` but AI SDK v6 renamed this to `UIMessage`; TSC reported error `TS2724: '"ai"' has no exported member named 'Message'`
- **Fix:** Updated import and all usages from `Message` to `UIMessage`
- **Files modified:** lib/db/campaigns.ts
- **Verification:** `pnpm tsc --noEmit` reports no errors in this file
- **Committed in:** `75eda34` (Task 1 commit)

**2. [Rule 3 - Blocking] Upgraded zod 3.24.1 -> 3.25.76 to unblock test runner**
- **Found during:** Task 2 verification (pnpm test)
- **Issue:** AI SDK packages require `zod ^3.25.76 || ^4.1.8` — project had `3.24.1`; vitest failed with `Package subpath './v4' is not defined by "exports"` when importing models.ts
- **Fix:** Ran `pnpm add zod@^3.25.76` — upgraded to `3.25.76`
- **Files modified:** package.json, pnpm-lock.yaml
- **Verification:** `pnpm test -- --run` passes with 3 passing + 27 todos
- **Committed in:** `8dcd966` (included in prior session's Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking dependency)
**Impact on plan:** Both fixes were essential for correctness and test execution. No scope creep.

## Issues Encountered

- Test files for Task 2 were already committed in a prior agent session (`8dcd966` at 16:27:58) alongside orchestrator and providers — this plan's Task 2 execution confirmed all stubs are in place and test suite is green.

## User Setup Required

None — no external service configuration required. API keys for AI providers (Anthropic, Google, OpenAI, Perplexity) will be needed at runtime but no setup steps are required for this plan.

## Next Phase Readiness

- AI SDK packages installed and importable by all downstream plans
- Type contracts (`AmplifyUIMessage`, `Campaign`, `CampaignMessage`) ready for use in chat route and persistence layer
- `TASK_MODEL_MAP` ready for orchestrator to consume in Plan 01+
- Test stubs cover all Phase 2 requirements — filled in by plans 02-01 through 02-05
- No blockers for Plan 01 (streaming chat route)

## Self-Check: PASSED

- FOUND: types/message.ts
- FOUND: types/campaign.ts
- FOUND: lib/ai/models.ts
- FOUND: tests/ai/models.test.ts
- FOUND: tests/chat/api.test.ts
- FOUND: tests/chat/orchestrator.test.ts
- FOUND: tests/chat/persistence.test.ts
- FOUND: tests/campaigns/queries.test.ts
- FOUND commit: 75eda34 (Task 1)
- FOUND commit: 8dcd966 (Task 2)

---
*Phase: 02-chat-core*
*Completed: 2026-03-30*
