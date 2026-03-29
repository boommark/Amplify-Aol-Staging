---
phase: 01-foundation
plan: 04
subsystem: database
tags: [n8n, prompts, sql, seed, typescript, tsx]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: Supabase prompts table schema (migration 001_foundation_schema.sql)
provides:
  - lib/prompts/extract-n8n.ts — reusable script to parse n8n workflows and extract AI prompts
  - supabase/seed/prompts.sql — 14 production-proven v1 prompt seed records covering all major domains
affects:
  - 02-chat-intake
  - 03-research-pipeline
  - 04-content-generation
  - 05-admin-promptlab

# Tech tracking
tech-stack:
  added: [tsx (for running TypeScript scripts directly via npx)]
  patterns:
    - Prompt key convention domain.task (e.g., research.regional, copy.email, wisdom.quotes)
    - ON CONFLICT DO NOTHING idempotent seed inserts
    - Deduplicate by key keeping longest/most-complete template variant

key-files:
  created:
    - lib/prompts/extract-n8n.ts
    - supabase/seed/prompts.sql
  modified: []

key-decisions:
  - "14 unique prompts extracted from 37 raw nodes across 10 workflows — dedup by longest template"
  - "model_override assigned from actual LLM nodes connected in each workflow, not assumed"
  - "research.regional vs research.translated split because v2.1 translated workflow uses gpt-4.1-nano vs sonar-pro"
  - "copy.email used as canonical key for the multi-channel content block (email+whatsapp+instagram+facebook in one prompt)"

patterns-established:
  - "domain.task key format: research|copy|wisdom|image|ads|translation . subtask"
  - "Seed SQL always uses version=1, is_active=true, ON CONFLICT DO NOTHING"
  - "Extract script resolves n8n dir via PROJECT_ROOT/../n8n amplify scripts"

requirements-completed: [INFRA-01]

# Metrics
duration: 18min
completed: 2026-03-29
---

# Phase 1 Plan 04: n8n Prompt Extraction Summary

**14 production-proven AI prompts extracted from 10 n8n workflow JSONs and seeded as immutable v1 records covering research, copy, wisdom, image, ads, and translation domains**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-29T22:08:00Z
- **Completed:** 2026-03-29T22:26:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Created `lib/prompts/extract-n8n.ts` — fully runnable TypeScript extraction script (npx tsx)
- Scanned all 10 n8n workflow JSONs, identified 37 AI/LLM prompt nodes, deduplicated to 14 unique domain.task keys
- Generated `supabase/seed/prompts.sql` with idempotent inserts for all 14 prompts as v1 seed records
- All inserts carry model_override (perplexity/sonar-pro, anthropic/claude-3-7-sonnet, openai/gpt-4o-mini etc.) from actual LLM nodes connected in each workflow

## Task Commits

1. **Task 1: Extract prompts from n8n workflow JSONs and generate seed SQL** - `bccb6ee` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `lib/prompts/extract-n8n.ts` - Node.js/TypeScript script: reads 10 n8n JSONs, classifies prompts via domain.task key assignment, resolves model overrides, deduplicates, writes SQL seed file
- `supabase/seed/prompts.sql` - 14 INSERT statements with keys: ads.copy, ads.national, copy.email, copy.facebook, copy.instagram, copy.intro-talk, copy.whatsapp, image.ad-creative, image.quote, research.regional, research.translated, translation.content, wisdom.questions, wisdom.quotes

## Decisions Made

- **Deduplication strategy:** For each domain.task key, keep the longest template across all workflows (most complete/detailed version). 37 raw → 14 unique.
- **copy.email as multi-channel canonical:** The "Content Maker" nodes produce email + WhatsApp + Instagram + Facebook copy in one prompt. Keyed as `copy.email` because email is the primary deliverable; other channels are co-produced within the same template.
- **copy.intro-talk as separate key:** The v2.1 translated workflow adds an introductory talk track to the multi-channel block — materially different output, deserves its own key.
- **research.regional vs research.translated:** Two distinct Perplexity system prompts exist — one for standard English research, one for translated workflows with a slightly different system persona and gpt-4.1-nano as the connected LLM.
- **Path resolution:** Script resolves the n8n directory as `PROJECT_ROOT/../n8n amplify scripts` (parent of the Next.js project root), matching the actual filesystem layout.

## Deviations from Plan

None - plan executed exactly as written. The only minor adaptation was the `__dirname`-based path calculation required one fix during execution when the initial `../../` resolution pointed to the wrong directory, corrected to `../../../` relative to `lib/prompts/`. This is a standard path calculation issue, not a deviation from plan intent.

## Issues Encountered

- Initial `path.resolve(__dirname, "../../n8n amplify scripts")` resolved inside the project directory rather than the parent. Fixed by computing `PROJECT_ROOT` separately and then doing `../n8n amplify scripts` from there.

## User Setup Required

None - no external service configuration required. The seed SQL must be run against your Supabase instance once the database is provisioned. Run:
```sql
\i supabase/seed/prompts.sql
```
or via Supabase CLI: `supabase db push` (if seed is registered in config.toml).

## Next Phase Readiness

- All 14 prompt seed records ready to load into the prompts table after Phase 1 database migration runs
- Phases 2-5 can reference prompts by their domain.task keys without writing prompts from scratch
- The extract-n8n.ts script can be re-run if n8n workflows are updated to regenerate the seed

---
*Phase: 01-foundation*
*Completed: 2026-03-29*
