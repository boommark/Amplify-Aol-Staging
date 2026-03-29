---
phase: 01-foundation
plan: 01
subsystem: database, infra
tags: [supabase, postgres, rls, aws-s3, nextjs, vercel]

# Dependency graph
requires: []
provides:
  - "@supabase/ssr browser client (lib/supabase/client.ts)"
  - "@supabase/ssr server client (lib/supabase/server.ts)"
  - "@supabase/ssr middleware client (lib/supabase/middleware.ts)"
  - "Supabase admin client with service role (lib/supabase/admin.ts)"
  - "Complete 9-table database schema with RLS for all 5 phases (supabase/migrations/001_foundation_schema.sql)"
  - "Vercel Fluid Compute configuration (vercel.json)"
  - "AWS SDK packages for S3 presigned URLs"
affects:
  - "All subsequent plans in Phase 1 (auth, S3, prompt seeding)"
  - "Phase 2 through Phase 5 (use Supabase clients and database schema)"

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js ^2.100.1"
    - "@supabase/ssr ^0.9.0"
    - "@aws-sdk/client-s3 ^3.1019.0"
    - "@aws-sdk/s3-request-presigner ^3.1019.0"
  patterns:
    - "Three Supabase client contexts: browser (createBrowserClient), server (createServerClient + cookies), middleware (createServerClient + request.cookies)"
    - "Admin client uses service role key with autoRefreshToken: false, persistSession: false"
    - "RLS helper auth.user_role() reads from app_metadata JWT claim (NOT user_metadata)"
    - "Roles stored in app_metadata, synced from profiles.role via trigger"
    - "Prompt immutability enforced via unique partial index on (key) WHERE is_active = true"

key-files:
  created:
    - "lib/supabase/client.ts"
    - "lib/supabase/server.ts"
    - "lib/supabase/middleware.ts"
    - "lib/supabase/admin.ts"
    - "supabase/migrations/001_foundation_schema.sql"
    - "vercel.json"
    - ".env.example"
  modified:
    - "package.json (added 4 packages, removed airtable)"
    - "pnpm-lock.yaml"

key-decisions:
  - "Use @supabase/ssr 0.9.x (not deprecated @supabase/auth-helpers-nextjs) — per research STACK.md"
  - "All RLS policies use app_metadata via auth.user_role() helper — user_metadata is user-writable and enables privilege escalation"
  - "sync_profile_role trigger keeps profiles.role and auth.users.app_metadata.role in sync after admin promotions"
  - "Vercel Fluid Compute enabled via fluid: true in vercel.json — required for 300s AI route timeouts"
  - "Full schema created upfront for all 5 phases — no future migration surprises"

patterns-established:
  - "Pattern 1: Import Supabase in server components via import { createClient } from '@/lib/supabase/server'"
  - "Pattern 2: Import Supabase in client components via import { createClient } from '@/lib/supabase/client'"
  - "Pattern 3: Middleware session refresh via import { updateSession } from '@/lib/supabase/middleware'"
  - "Pattern 4: Admin operations via import { adminClient } from '@/lib/supabase/admin'"
  - "Pattern 5: RLS role check always uses auth.user_role() = 'role' in USING clause"

requirements-completed: [INFRA-03, INFRA-05]

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 1 Plan 01: Supabase Foundation Summary

**Four Supabase client contexts (@supabase/ssr), 9-table PostgreSQL schema with RLS for all 5 phases, and Vercel Fluid Compute enabled**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-29T22:00:36Z
- **Completed:** 2026-03-29T22:04:54Z
- **Tasks:** 2 of 2
- **Files modified:** 9

## Accomplishments
- Installed @supabase/ssr, @supabase/supabase-js, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner; removed airtable
- Created all four Supabase client utilities (browser, server, middleware, admin) correctly typed with @supabase/ssr
- Created complete 533-line SQL migration with 9 tables, 9 RLS-enabled tables, 30 policies, triggers, and indexes
- Configured Vercel Fluid Compute (fluid: true) for long-running AI API routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Install packages, create Supabase client utilities, configure Vercel** - `b0749c1` (feat)
2. **Task 2: Create complete database schema migration with RLS for all 5 phases** - `8395111` (feat)

## Files Created/Modified
- `lib/supabase/client.ts` - Browser client using createBrowserClient from @supabase/ssr
- `lib/supabase/server.ts` - Server client using createServerClient + Next.js cookies() API
- `lib/supabase/middleware.ts` - Middleware client with updateSession for session refresh
- `lib/supabase/admin.ts` - Service role admin client, no session persistence
- `supabase/migrations/001_foundation_schema.sql` - Complete schema for all 5 phases (9 tables, 30 policies)
- `vercel.json` - Vercel Fluid Compute configuration
- `.env.example` - Documents all required env vars (Supabase + AWS S3)
- `package.json` - Added 4 new packages, removed airtable
- `lib/airtable.ts` - Deleted (replaced by Supabase)

## Decisions Made
- Used `@supabase/ssr` 0.9.x with three separate client creation functions per official Supabase Next.js guide — the deprecated `@supabase/auth-helpers-nextjs` was not used
- RLS helper `auth.user_role()` reads from `app_metadata` (not `user_metadata`) — user_metadata is user-writable and enables privilege escalation
- `sync_profile_role` trigger on `profiles` table syncs role changes to `auth.users.app_metadata` via `auth.admin_update_user_by_id()` — keeps JWT claims in sync after admin role promotions

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in legacy Airtable API routes (`app/api/airtable/`, `app/api/past-campaigns/`) after airtable package removal. These are out-of-scope v0 prototype files that will be replaced in subsequent Phase 1 plans. Logged to `deferred-items.md`.

## User Setup Required

None - all env vars are already in `.env.local`. The SQL migration file must be applied to the Supabase project — this will be done when the Supabase CLI is configured in Plan 01-04 or manually via the Supabase dashboard SQL editor.

## Next Phase Readiness
- All four Supabase client utilities are ready for import in Plan 01-02 (Google OAuth)
- Database schema exists and is ready to apply — Plan 01-02 auth callbacks will use profiles and allowed_emails tables
- AWS SDK packages are installed, ready for Plan 01-03 (S3 presigned URL utility)
- No blockers for Plan 01-02

---
*Phase: 01-foundation*
*Completed: 2026-03-29*
