---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Completed 02-chat-core-00-PLAN.md
last_updated: "2026-03-30T23:30:01.130Z"
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 12
  completed_plans: 8
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** A teacher with zero marketing experience can describe their workshop and receive a complete marketing kit through a simple conversation.
**Current focus:** Phase 02 — chat-core

## Current Position

Phase: 02 (chat-core) — EXECUTING
Plan: 1 of 6

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P00 | 2 | 2 tasks | 8 files |
| Phase 01-foundation P01 | 5 | 2 tasks | 9 files |
| Phase 01-foundation P03 | 2 | 1 tasks | 2 files |
| Phase 01-foundation P04 | 18 | 1 tasks | 2 files |
| Phase 01-foundation P02 | 14 | 2 tasks | 13 files |
| Phase 02-chat-core P02 | 5 | 2 tasks | 8 files |
| Phase 02-chat-core P00 | 8 | 2 tasks | 11 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-build]: Canva Connect REST API only — NOT Canva MCP (MCP is for AI desktop clients, not production backends)
- [Pre-build]: Use `@supabase/ssr` not `@supabase/auth-helpers-nextjs` (deprecated at v0.15.0)
- [Pre-build]: Roles must go in `app_metadata` not `user_metadata` — user_metadata is user-writable and enables privilege escalation
- [Pre-build]: Vercel Fluid Compute + maxDuration 300s required on all AI routes — validate in Phase 1 before any content pipeline
- [Phase 01-foundation]: Use vitest (not jest) as test runner — aligns with Vite-based Next.js toolchain and offers faster execution
- [Phase 01-foundation]: Stub-first with it.todo() — satisfies Nyquist Wave 0 requirement without over-specifying unbuilt behavior
- [Phase 01-foundation]: Use @supabase/ssr 0.9.x (not deprecated @supabase/auth-helpers-nextjs) for all three client contexts
- [Phase 01-foundation]: All RLS policies use auth.user_role() reading app_metadata — user_metadata is intentionally excluded to prevent privilege escalation
- [Phase 01-foundation]: sync_profile_role trigger syncs profiles.role to auth.users.app_metadata via auth.admin_update_user_by_id() to keep JWT claims current
- [Phase 01-foundation]: S3 key prefixed with user.id (not user.email) — IDs are stable; emails can change
- [Phase 01-foundation]: Default bucket name 'amplifyaol' hardcoded as fallback; AWS_S3_BUCKET env var takes precedence via ?? operator
- [Phase 01-foundation]: 14 unique prompts deduped from 37 raw nodes across 10 n8n workflows — keeping longest template per domain.task key
- [Phase 01-foundation]: copy.email is canonical key for multi-channel content block (email+whatsapp+instagram+facebook in one prompt)
- [Phase 01-foundation P02]: x-pathname header set by middleware enables Server Component layouts to detect current path without client JS — prevents infinite redirect loop on onboarding page
- [Phase 01-foundation P02]: Onboarding page placed inside (app) route group — exempted from profile-completeness redirect via x-pathname header check
- [Phase 01-foundation P02]: Admin route guard reads app_metadata.role from JWT via updateSession return value — not user_metadata, preventing privilege escalation
- [Phase 02-chat-core]: Use UIMessage from ai SDK v6 (not Message) for deserializeCampaignMessages — Message removed in v6
- [Phase 02-chat-core]: CampaignList exposes refresh via onRefreshRef prop — parent can trigger reload after creation without lifting state
- [Phase 02-chat-core]: Shared sidebarContent JSX variable in layout.tsx renders identically in desktop aside and mobile Sheet
- [Phase 02-chat-core]: AI SDK v6 UIMessage parts pattern chosen for typed discriminated union rich content streaming
- [Phase 02-chat-core]: TASK_MODEL_MAP uses rule-based routing (task key -> provider+model) not AI-driven selection
- [Phase 02-chat-core]: Zod upgraded 3.24.1 -> 3.25.76 to satisfy AI SDK v6 peer dependency requirement

### Pending Todos

None yet.

### Blockers/Concerns

- **Canva Enterprise gate**: Ad Creative Studio (Phase 4) is blocked until Canva Enterprise access for the Autofill API is confirmed. Confirm this during Phase 1. If blocked, Sharp-based image composition is the fallback — design the fallback before Phase 4 planning begins.
- **Ask Gurudev API surface**: Request/response schema, rate limits, and auth mechanism are undocumented in research. Requires a quick integration spike during Phase 3 planning.
- **Perplexity parallel query limits**: The 7-query parallel research pipeline is unvalidated against Perplexity Sonar Pro concurrent query limits. Validate before Phase 3 planning.

## Session Continuity

Last session: 2026-03-30T23:30:01.127Z
Stopped at: Completed 02-chat-core-00-PLAN.md
Resume file: None
