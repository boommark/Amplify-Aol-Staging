---
phase: 01-foundation
verified: 2026-03-30T06:25:02Z
status: gaps_found
score: 8/12 must-haves verified
re_verification: false
gaps:
  - truth: "Vercel Fluid Compute is configured with fluid: true"
    status: failed
    reason: "vercel.json sets maxDuration via functions config but is missing the top-level \"fluid\": true declaration required for Vercel Fluid Compute (INFRA-05)"
    artifacts:
      - path: "vercel.json"
        issue: "Contains maxDuration via functions config but no top-level \"fluid\": true key"
    missing:
      - "Add \"fluid\": true as a top-level key in vercel.json"

  - truth: "middleware.ts wires to lib/supabase/middleware.ts via updateSession"
    status: failed
    reason: "middleware.ts reimplements session refresh inline (createServerClient directly) instead of importing updateSession from lib/supabase/middleware.ts. The key link from plan 01-02 is broken — lib/supabase/middleware.ts is an orphaned artifact."
    artifacts:
      - path: "middleware.ts"
        issue: "Imports createServerClient directly; does not import updateSession from @/lib/supabase/middleware"
      - path: "lib/supabase/middleware.ts"
        issue: "Exported updateSession function is never imported or called — orphaned"
    missing:
      - "Either update middleware.ts to import and call updateSession from @/lib/supabase/middleware, OR remove lib/supabase/middleware.ts if the inline approach is intentional and update plan documentation"

  - truth: "Non-allowlisted users are signed out and shown a Request Access form"
    status: failed
    reason: "app/api/auth/request-access/route.ts imports createAdminClient from @/lib/supabase/admin but that module only exports adminClient (a singleton constant). This is a broken named import that will throw a runtime error when a non-allowlisted user submits the access request form."
    artifacts:
      - path: "app/api/auth/request-access/route.ts"
        issue: "Imports { createAdminClient } from '@/lib/supabase/admin' — this export does not exist"
      - path: "lib/supabase/admin.ts"
        issue: "Only exports 'adminClient' (singleton), not a 'createAdminClient' factory function"
    missing:
      - "Either export a createAdminClient function from lib/supabase/admin.ts, OR change the import in request-access/route.ts to use { adminClient } and call it directly"

  - truth: "First-time allowlisted users are routed to onboarding (display name + region) with Indian states"
    status: partial
    reason: "Onboarding flow exists and collects display_name and region, but the plan acceptance criteria require at least 5 Indian state names in the region selector. The actual implementation uses a countries list (India, US, Canada, etc.) with a free-text city/state field. No Indian states (Maharashtra, Karnataka, Tamil Nadu, etc.) are present."
    artifacts:
      - path: "app/(app)/onboarding/page.tsx"
        issue: "Region step shows countries dropdown (India, US, Canada...) rather than Indian states. Plan 01-02 acceptance criteria: 'at least 5 Indian state names (e.g. Maharashtra, Karnataka, Tamil Nadu)'"
    missing:
      - "Either replace or augment the country dropdown with Indian states when country=India is selected, OR update the plan acceptance criteria to reflect the country+city approach is intentional"

  - truth: "Staging deployment at staging.amplifyaol.com is accessible (INFRA-06)"
    status: failed
    reason: "INFRA-06 requires a staging deployment at staging.amplifyaol.com with separate environment config. No staging deployment evidence exists in the codebase (no staging-specific env file, no vercel project config referencing staging). Plan 01-05 marked this as autonomous:false with a human-verify gate."
    artifacts: []
    missing:
      - "Deploy to staging (Vercel preview or dedicated staging environment) and verify staging.amplifyaol.com is accessible"
      - "Confirm separate environment config for staging (separate NEXT_PUBLIC_SUPABASE_URL etc.)"

human_verification:
  - test: "AUTH-04: RLS data isolation"
    expected: "Teacher can only see own campaigns, coordinator sees only their region, national/admin sees all"
    why_human: "RLS policies exist in migration SQL but cannot verify they are applied to the live Supabase project programmatically from codebase scan"
  - test: "INFRA-06: Staging deployment"
    expected: "https://staging.amplifyaol.com/login returns HTTP 200 with Amplify login page"
    why_human: "Staging deployment requires running infrastructure; cannot verify from codebase"
  - test: "Google OAuth end-to-end flow"
    expected: "Sign in with Google redirects through OAuth, allowlist check runs, teacher role assigned in app_metadata"
    why_human: "OAuth flow requires live Supabase project and Google OAuth provider configured"
---

# Phase 1: Foundation Verification Report

**Phase Goal:** A secure, role-aware application shell that every subsequent phase builds on
**Verified:** 2026-03-30T06:25:02Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | pnpm test runs vitest and exits cleanly | VERIFIED | vitest.config.ts with defineConfig, test scripts in package.json, all test stubs use it.todo (no failures) |
| 2 | Supabase mock helper provides reusable fake client | VERIFIED | tests/helpers/supabase-mock.ts exports createMockSupabaseClient and mockAuthUser |
| 3 | Supabase browser/server/middleware/admin clients importable and typed | VERIFIED | All 4 files in lib/supabase/ exist with correct exports and SSR patterns |
| 4 | All 9 tables with RLS and at least one policy each | VERIFIED | Migration has 9 CREATE TABLE + 9 ENABLE ROW LEVEL SECURITY + 30 CREATE POLICY statements; user_role() helper in public schema |
| 5 | Vercel Fluid Compute configured with fluid: true | FAILED | vercel.json has maxDuration via functions config but missing top-level "fluid": true |
| 6 | User can click Sign in with Google | VERIFIED | login/page.tsx has signInWithOAuth with provider:'google', redirectTo callback |
| 7 | Non-allowlisted users signed out and shown Request Access form | FAILED | Broken import: request-access/route.ts imports createAdminClient which does not exist in lib/supabase/admin.ts |
| 8 | First-time users routed to onboarding with display name + region | PARTIAL | Flow exists and collects both fields; but onboarding uses countries list not Indian states as required by plan criteria |
| 9 | Returning users land on chat page | VERIFIED | callback/route.ts checks profile.display_name and profile.region, redirects to /chat if complete |
| 10 | Unauthenticated users redirected to /login | VERIFIED | middleware.ts checks getUser(), redirects to /login for unauthenticated on protected routes |
| 11 | First login auto-assigns teacher role in app_metadata | VERIFIED | assign-default-role.ts calls adminClient.auth.admin.updateUserById with app_metadata.role='teacher'; callback calls assignDefaultRole on first login |
| 12 | Non-admin users on /admin/* redirected to /chat | VERIFIED | middleware.ts checks user.app_metadata?.role, redirects non-admin to /chat |

**Score:** 8/12 truths verified (3 failed, 1 partial)

---

## Required Artifacts

### Plan 00 (Test Infrastructure)

| Artifact | Status | Details |
|----------|--------|---------|
| `vitest.config.ts` | VERIFIED | Contains defineConfig, path alias for @, includes tests/**/*.test.ts |
| `tests/helpers/supabase-mock.ts` | VERIFIED | Exports createMockSupabaseClient and mockAuthUser |
| `tests/auth/allowlist.test.ts` | VERIFIED | describe + it.todo stubs |
| `tests/auth/middleware.test.ts` | VERIFIED | describe + it.todo stubs for AUTH-05 and AUTH-06 |
| `tests/s3/presigned-url.test.ts` | VERIFIED | describe + it.todo stubs |

### Plan 01 (Supabase Infrastructure)

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/supabase/client.ts` | VERIFIED | Exports createClient using createBrowserClient with PKCE flowType |
| `lib/supabase/server.ts` | VERIFIED | Exports async createClient using createServerClient with cookies |
| `lib/supabase/middleware.ts` | ORPHANED | Exports updateSession — never imported by middleware.ts |
| `lib/supabase/admin.ts` | PARTIAL | Exports adminClient (singleton) — but request-access/route.ts imports non-existent createAdminClient |
| `supabase/migrations/20260329000001_foundation_schema.sql` | VERIFIED | All 9 tables, 9 RLS, 30 policies; filename differs from planned 001_ prefix (timestamp format used — standard Supabase CLI behavior) |
| `vercel.json` | STUB | Has maxDuration in functions config but missing "fluid": true |

### Plan 02 (Auth Flow)

| Artifact | Status | Details |
|----------|--------|---------|
| `middleware.ts` | VERIFIED | Route protection + admin guard working; reimplements session refresh inline instead of using updateSession |
| `app/(auth)/login/page.tsx` | VERIFIED | 243 lines, signInWithOAuth with google, #3D8BE8 brand color, access=denied handling, 'use client' |
| `app/(auth)/auth/callback/route.ts` | VERIFIED | exchangeCodeForSession, checkEmailAllowlist, assignDefaultRole, signOut for denied users, maxDuration=300 |
| `lib/auth/allowlist.ts` | VERIFIED | Exports checkEmailAllowlist, queries allowed_emails table, lowercases email |
| `lib/auth/assign-default-role.ts` | VERIFIED | Exports assignDefaultRole, uses adminClient.auth.admin.updateUserById, sets app_metadata.role='teacher' |
| `app/(app)/layout.tsx` | VERIFIED | Server Component, getUser(), redirect to /login, sidebar with TODO Phase 2 comment |
| `app/(app)/onboarding/page.tsx` | PARTIAL | 217 lines, 'use client', display_name + region collected, updates profiles table — but region is countries not Indian states |
| `app/(app)/chat/page.tsx` | VERIFIED | Server Component, getUser(), shows display_name, sign out button |
| `app/(app)/admin/page.tsx` | VERIFIED | "Admin Dashboard" heading, "Phase 5" and "Prompt Lab" references |

### Plan 03 (S3 Presigned URL)

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/s3/presigned-url.ts` | VERIFIED | Exports generatePresignedUploadUrl, PutObjectCommand, getSignedUrl, amplifyaol bucket default |
| `app/api/s3/presigned-url/route.ts` | VERIFIED | POST handler, auth check, 401 for unauthenticated, maxDuration=300, prefixes key with user.id |

### Plan 04 (Prompt Registry)

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/prompts/extract-n8n.ts` | VERIFIED | 422 lines, references n8n amplify scripts directory |
| `supabase/seed/prompts.sql` | VERIFIED | 14 INSERT INTO prompts statements, version=1, is_active=true, model_override present, domain.task keys |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| app/(auth)/auth/callback/route.ts | lib/auth/allowlist.ts | checkEmailAllowlist | WIRED | Import present and function called |
| app/(auth)/auth/callback/route.ts | lib/auth/assign-default-role.ts | assignDefaultRole | WIRED | Import present and called on first login |
| middleware.ts | lib/supabase/middleware.ts | updateSession | NOT WIRED | middleware.ts reimplements inline; lib/supabase/middleware.ts is orphaned |
| app/(auth)/login/page.tsx | lib/supabase/client.ts | signInWithOAuth | WIRED | createClient() called, signInWithOAuth used |
| middleware.ts | /admin route guard | app_metadata.role check | WIRED | pathname.startsWith('/admin') + role !== 'admin' redirect implemented |
| app/api/s3/presigned-url/route.ts | lib/s3/presigned-url.ts | generatePresignedUploadUrl | WIRED | Import present and called |
| app/api/s3/presigned-url/route.ts | lib/supabase/server.ts | supabase.auth.getUser | WIRED | Auth check present, 401 returned for no user |
| app/api/auth/request-access/route.ts | lib/supabase/admin.ts | createAdminClient | BROKEN | Imports createAdminClient but admin.ts only exports adminClient |
| supabase/seed/prompts.sql | migration schema | INSERT INTO prompts | WIRED | Inserts into prompts table defined in migration |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| AUTH-01 | 01-02 | Sign in with Google via Supabase Auth | SATISFIED | login/page.tsx: signInWithOAuth(provider:'google'); callback: exchangeCodeForSession |
| AUTH-02 | 01-02 | Session persists across browser refresh and tabs | SATISFIED | middleware.ts refreshes session on every request; server client uses cookies |
| AUTH-03 | 01-02 | Users assigned roles via app_metadata | SATISFIED | assign-default-role.ts sets app_metadata.role='teacher'; callback calls it on first login |
| AUTH-04 | 01-05 | RLS enforces role-based data access | NEEDS HUMAN | Migration has 30 RLS policies using public.user_role() — cannot verify applied to live DB |
| AUTH-05 | 01-02 | Admin role has access to /admin routes | SATISFIED | middleware.ts: /admin/* guarded by app_metadata.role check; admin/page.tsx accessible to admin only |
| AUTH-06 | 01-02 | Unauthenticated users redirected to login | SATISFIED | middleware.ts: !user redirects to /login for all protected routes |
| INFRA-01 | 01-04 | Prompts stored and versioned in Supabase | SATISFIED | supabase/seed/prompts.sql: 14 prompts with version=1, is_active=true; prompts table in migration |
| INFRA-03 | 01-01 | Supabase schema with RLS for all four roles | SATISFIED | Migration: 9 tables with ENABLE ROW LEVEL SECURITY; policies reference public.user_role() for role checks |
| INFRA-04 | 01-03 | AWS S3 presigned URL upload pattern | SATISFIED | lib/s3/presigned-url.ts + API route; auth check + user-prefixed keys |
| INFRA-05 | 01-01 | Vercel Fluid Compute with maxDuration 300s | PARTIAL | maxDuration=300 on route handlers; vercel.json has maxDuration config BUT missing "fluid": true |
| INFRA-06 | 01-05 | Staging deployment at staging.amplifyaol.com | PENDING | No staging deployment evidence in codebase; plan 01-05 is autonomous:false requiring human gate |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/api/auth/request-access/route.ts` | 3 | `import { createAdminClient }` — export does not exist in lib/supabase/admin.ts | Blocker | Runtime crash when non-allowlisted user submits access request form |
| `vercel.json` | — | Missing `"fluid": true` top-level key | Warning | Vercel Fluid Compute not enabled despite INFRA-05 requirement |
| `lib/supabase/middleware.ts` | — | Exported updateSession never imported — orphaned file | Info | Dead code; middleware.ts reimplements session refresh inline |
| `app/(app)/onboarding/page.tsx` | 18-31 | COUNTRIES list instead of Indian states | Warning | Plan acceptance criteria required Indian states; app is India-first (AOL teachers) |

---

## Human Verification Required

### 1. AUTH-04: Row-Level Security Data Isolation

**Test:** Sign in as a teacher, create a campaign, then sign in as a second teacher — verify second teacher cannot see first teacher's campaigns.
**Expected:** Each teacher sees only their own data; RLS restricts access at DB level.
**Why human:** RLS policies exist in migration SQL but verifying the migration was applied to the live Supabase project and policies function correctly requires a live DB session.

### 2. INFRA-06: Staging Deployment

**Test:** Visit staging.amplifyaol.com (or the Vercel preview URL for the staging branch).
**Expected:** HTTP 200 with Amplify branded login page.
**Why human:** Staging deployment requires running infrastructure that cannot be verified from codebase scan.

### 3. Google OAuth End-to-End Flow

**Test:** Click "Sign in with Google" on the login page, complete the OAuth flow with an allowlisted email.
**Expected:** Redirected to onboarding on first login, then to /chat on subsequent logins. Teacher role visible in app_metadata in Supabase Auth dashboard.
**Why human:** OAuth flow requires live Supabase project with Google provider configured and a real browser session.

---

## Gaps Summary

Five gaps block or partially block the phase goal:

1. **Blocker — Broken import in request-access route:** `app/api/auth/request-access/route.ts` imports `createAdminClient` which does not exist. The fix is one line: either export `createAdminClient` from `lib/supabase/admin.ts` or change the import to use the existing `adminClient` singleton.

2. **Blocker — Fluid Compute not configured:** `vercel.json` is missing `"fluid": true`. Without this, the app runs on standard Vercel serverless (not Fluid Compute). The maxDuration=300 route-level config is present, which is partial credit for INFRA-05.

3. **Warning — updateSession orphaned:** `lib/supabase/middleware.ts` exports `updateSession` but `middleware.ts` reimplements the session refresh inline. The file is a dead artifact. This is a wiring deviation from the plan's key_link spec, though functionally the middleware behavior is correct.

4. **Warning — Onboarding uses countries, not Indian states:** The plan explicitly requires Indian state names in the region selector (acceptance criteria: "at least 5 Indian state names"). The actual implementation uses a countries list. The design divergence may be intentional (international user base), but it violates the stated acceptance criteria.

5. **Pending — INFRA-06 staging deployment:** No evidence of a deployed staging environment in the codebase. Plan 01-05 requires human verification for this.

---

_Verified: 2026-03-30T06:25:02Z_
_Verifier: Claude (gsd-verifier)_
