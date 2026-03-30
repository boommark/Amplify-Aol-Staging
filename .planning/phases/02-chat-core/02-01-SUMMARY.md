---
phase: 02-chat-core
plan: 01
subsystem: ai-orchestrator
tags: [ai-sdk, streaming, chat-api, orchestrator, prompt-registry]
dependency_graph:
  requires:
    - 02-00 (lib/ai/models.ts TASK_MODEL_MAP, types/campaign.ts)
    - lib/supabase/server.ts (createClient)
    - lib/supabase/admin.ts (adminClient for prompt loading)
  provides:
    - lib/ai/providers.ts (4 AI SDK providers initialized)
    - lib/ai/orchestrator.ts (runStreamingTask — model lookup, prompt loading, sliding window)
    - lib/prompts/registry.ts (loadPrompt with LRU cache from Supabase prompts table)
    - lib/prompts/renderer.ts (Mustache-style variable injection)
    - app/api/chat/route.ts (POST /api/chat — streaming, auth, persistence)
  affects:
    - All downstream plans that call runStreamingTask
    - Front-end chat UI (02-02) which sends POST /api/chat
tech_stack:
  added:
    - ai (v6.0.141) streamText, ModelMessage
    - "@ai-sdk/anthropic", "@ai-sdk/google", "@ai-sdk/openai", "@ai-sdk/perplexity"
  patterns:
    - Rule-Based Multi-Model Routing via TASK_MODEL_MAP
    - Sliding window context (last maxTurns*2 messages)
    - Map-based LRU cache (max 50 entries, 5-min TTL) for prompt templates
    - onFinish callback for post-stream persistence (never mid-stream writes)
    - Auth-first route guard (getUser before any AI SDK usage)
key_files:
  created:
    - lib/ai/providers.ts
    - lib/ai/orchestrator.ts
    - lib/prompts/registry.ts
    - lib/prompts/renderer.ts
    - app/api/chat/route.ts
  modified: []
decisions:
  - "Use toUIMessageStreamResponse() instead of toDataStreamResponse() — the latter does not exist in AI SDK v6; toUIMessageStreamResponse() is the correct v6 equivalent"
  - "Prompt registry queries prompts table by single `key` column (e.g., 'chat.orchestrate'), not separate domain/task columns — actual schema differs from plan description"
  - "Use ModelMessage type instead of CoreMessage — CoreMessage was renamed in AI SDK v6"
  - "lib/ai/models.ts auto-created (Rule 3 fix) — it was planned in 02-00 but never committed; this plan depends on it"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-03-30"
  tasks_completed: 2
  files_created: 5
---

# Phase 2 Plan 01: AI Orchestrator and Streaming Chat API Summary

**One-liner:** Streaming chat API (POST /api/chat) backed by a rule-based AI orchestrator with TASK_MODEL_MAP routing, LRU-cached Supabase prompt registry, Mustache variable injection, and 10-turn sliding window.

## What Was Built

### Task 1: AI providers, prompt registry, and orchestrator (commit: 8dcd966)

Four files created that form the AI backbone:

**lib/ai/providers.ts** — Simple re-export of all 4 AI SDK providers. Each auto-reads its API key from environment variables.

**lib/prompts/registry.ts** — Loads prompt templates from the Supabase `prompts` table by `key` (e.g., `chat.orchestrate`). Uses a Map-based LRU cache (max 50 entries, 5-minute TTL). Falls back to a default Amplify system prompt if the key is not found in the database.

**lib/prompts/renderer.ts** — Single `renderPrompt(template, vars)` function that replaces `{{varName}}` patterns with values. Missing variables become empty strings (never throws).

**lib/ai/orchestrator.ts** — `runStreamingTask(taskKey, options)` function that:
1. Resolves the model from `TASK_MODEL_MAP[taskKey]`
2. Loads and renders the system prompt via `loadPrompt` + `renderPrompt`
3. Applies a sliding window (last `maxTurns * 2` messages, default 10 turns = 20 messages)
4. Calls `streamText` with model, system prompt, windowed messages, and optional `onFinish` callback

### Task 2: Streaming /api/chat route (commit: e3b090f)

**app/api/chat/route.ts** — POST handler with strict operation ordering:
1. Auth guard (`createClient` + `getUser` + 401)
2. Input validation (messages array, campaignId)
3. Campaign existence check (404 before any writes)
4. User message persisted to `campaign_messages`
5. Campaign `updated_at` refreshed
6. Delegate to `runStreamingTask('chat.orchestrate', { messages, variables: { tone }, onFinish })`
7. Return `result.toUIMessageStreamResponse()`

The `onFinish` callback persists the assistant message after the stream completes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] lib/ai/models.ts created as missing dependency**
- **Found during:** Task 1 pre-flight
- **Issue:** Plan 02-01 depends_on 02-00, but `lib/ai/models.ts` was never committed. The file was part of Plan 02-00's output but was absent from the repo.
- **Fix:** Created `lib/ai/models.ts` with `TASK_MODEL_MAP` (7 task keys), `TaskKey` type, and `getModelForTask` function — matching the 02-00-PLAN.md spec exactly.
- **Files modified:** `lib/ai/models.ts`
- **Commit:** 8dcd966 (bundled with Task 1)

**2. [Rule 1 - Bug] CoreMessage renamed to ModelMessage in AI SDK v6**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** Plan specified `import type { CoreMessage } from 'ai'` but AI SDK v6 exports `ModelMessage` instead; `CoreMessage` does not exist.
- **Fix:** Changed import to `ModelMessage` in `lib/ai/orchestrator.ts`.
- **Files modified:** `lib/ai/orchestrator.ts`

**3. [Rule 1 - Bug] toDataStreamResponse replaced by toUIMessageStreamResponse in AI SDK v6**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** Plan specified `result.toDataStreamResponse()` but this method does not exist on `StreamTextResult` in AI SDK v6. The equivalent is `toUIMessageStreamResponse()`.
- **Fix:** Changed to `result.toUIMessageStreamResponse()` in `app/api/chat/route.ts`.
- **Files modified:** `app/api/chat/route.ts`

**4. [Rule 1 - Bug] Prompt registry uses `key` column, not `domain`+`task` columns**
- **Found during:** Task 1 — reading actual migration schema
- **Issue:** Plan described querying by `.eq('domain', domain).eq('task', task)` but the actual `prompts` table has a single `key` column (e.g., `'chat.orchestrate'`), not separate columns.
- **Fix:** Registry queries `.eq('key', domainTask)` directly with the dot-notation key.
- **Files modified:** `lib/prompts/registry.ts`

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| lib/ai/providers.ts exists | FOUND |
| lib/prompts/registry.ts exists | FOUND |
| lib/prompts/renderer.ts exists | FOUND |
| lib/ai/orchestrator.ts exists | FOUND |
| app/api/chat/route.ts exists | FOUND |
| Commit 8dcd966 exists | FOUND |
| Commit e3b090f exists | FOUND |
