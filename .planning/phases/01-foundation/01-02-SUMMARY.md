---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [authentication, google-oauth, middleware, onboarding, route-protection]
dependency_graph:
  requires: ["01-01"]
  provides: ["auth-flow", "route-protection", "onboarding", "admin-guard"]
  affects: ["all-subsequent-phases"]
tech_stack:
  added: ["@supabase/ssr (server-side auth)", "Next.js route groups (auth)/(app)"]
  patterns: ["Google OAuth with Supabase", "Email allowlist gating", "App metadata role-based routing", "x-pathname header pattern for Server Component path detection"]
key_files:
  created:
    - middleware.ts
    - lib/auth/allowlist.ts
    - lib/auth/assign-default-role.ts
    - app/(auth)/layout.tsx
    - app/(auth)/login/page.tsx
    - app/(auth)/auth/callback/route.ts
    - app/api/auth/request-access/route.ts
    - app/(app)/layout.tsx
    - app/(app)/onboarding/page.tsx
    - app/(app)/chat/page.tsx
    - app/(app)/admin/page.tsx
  modified:
    - app/page.tsx (converted to auth-based redirect)
    - middleware.ts (added x-pathname header)
  deleted:
    - app/login/page.tsx (replaced by (auth) route group)
    - app/api/airtable/ (legacy Airtable routes)
    - app/api/ad-campaigns/ (legacy Airtable routes)
    - app/api/past-campaigns/ (legacy Airtable routes)
    - app/api/webhook-proxy/ (legacy Airtable route)
    - app/dashboard/ (v0 prototype pages, replaced by (app) route group)
decisions:
  - "Used x-pathname header set by middleware to detect current path in Server Component layouts, preventing infinite redirect loop on onboarding page"
  - "Moved onboarding page inside (app) route group so it shares the authenticated layout shell — exempted from profile-completeness redirect via x-pathname check"
  - "Admin route guard reads user.app_metadata.role from JWT via updateSession return value — roles in app_metadata not user_metadata prevents privilege escalation"
metrics:
  duration_minutes: 14
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_created: 11
  files_modified: 2
  files_deleted: 26
---

# Phase 01 Plan 02: Auth Flow — Login, Allowlist, Onboarding, Route Protection Summary

**One-liner:** Google OAuth with email allowlist gating, teacher role auto-assignment in app_metadata, 2-step onboarding, and middleware-based route protection including admin-only guard for AUTH-05.

## What Was Built

### Task 1: Auth Utilities, Middleware, Login Page, OAuth Callback

**lib/auth/allowlist.ts** — Queries the `allowed_emails` table (lowercase match) and returns true/false. Used by the callback route.

**lib/auth/assign-default-role.ts** — Calls `adminClient.auth.admin.updateUserById()` to set `app_metadata: { role: 'teacher' }` on first login. Uses admin client (service role key) — this is the correct pattern since user_metadata is user-writable.

**middleware.ts** — Handles three routing rules:
1. Auth route protection: unauthenticated users on protected routes → `/login`
2. Login bypass: authenticated users on `/login` → `/chat`
3. Admin route guard (AUTH-05): non-admin users on `/admin/*` → `/chat?error=unauthorized`

Also sets `x-pathname` response header so Server Component layouts can read the current path without client-side JavaScript.

**app/(auth)/login/page.tsx** — Amplify-branded login page with:
- Brand colors (#3D8BE8 blue, #E47D6C peach)
- "Sign in with Google" button using `supabase.auth.signInWithOAuth`
- Request Access form (shown when `?access=denied&email=xxx` query params present)
- "Already have a reason? Request access" fallback link

**app/(auth)/auth/callback/route.ts** — OAuth callback GET handler:
1. Exchanges code for session
2. Checks email allowlist — if denied: signs out + redirects to Request Access form
3. Checks if profile exists — if new user: assigns teacher role, creates profile row, redirects to `/onboarding`
4. Returning user: redirects to `/chat`

**app/api/auth/request-access/route.ts** — Public POST endpoint that inserts into `access_requests` table. Validates email format, handles duplicate submissions gracefully (23505 unique constraint).

### Task 2: App Shell, Onboarding, Chat Placeholder, Admin Placeholder

**app/(app)/layout.tsx** — Server Component app shell:
- Checks auth via `supabase.auth.getUser()` (belt-and-suspenders with middleware)
- Reads `x-pathname` header to detect if user is on `/onboarding` — prevents infinite redirect loop
- Redirects to `/onboarding` if profile is missing `display_name` or `region`
- Sidebar with: Amplify logo, "New Campaign" button (→ /chat), Phase 2 campaigns placeholder comment, user avatar + sign-out
- Responsive: sidebar hidden on mobile, simple header shown instead

**app/(app)/onboarding/page.tsx** — 2-step client component:
- Step 1: Display name input (pre-filled from Google profile name intent)
- Step 2: Region dropdown with all 29 Indian states + "International"
- On completion: updates `profiles` table with `display_name` and `region`, redirects to `/chat`
- Progress indicator (2 dots) to show step position

**app/(app)/chat/page.tsx** — Server Component placeholder showing welcome message with user's display name and region. Has sign-out Server Action. Phase 2 builds the real chat UI.

**app/(app)/admin/page.tsx** — Minimal admin placeholder accessible only to `role: 'admin'` users (middleware guard). Shows "Admin Dashboard" heading, Phase 5 Prompt Lab preview, link back to chat.

**app/page.tsx** — Converted from large marketing landing page to simple server-side redirect: authenticated users → `/chat`, unauthenticated → `/login`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed legacy Airtable API routes blocking build**
- **Found during:** Task 2 (pnpm build after completing Task 2)
- **Issue:** `app/api/past-campaigns/`, `app/api/webhook-proxy/` routes imported `airtable` package (not installed) — caused `Module not found: Can't resolve 'airtable'` build failure
- **Fix:** Removed `app/api/past-campaigns/` (4 routes) and `app/api/webhook-proxy/` (1 route) — all legacy v0 prototype routes per CONTEXT.md
- **Files modified:** 5 files deleted
- **Commit:** 7285dea

**2. [Rule 2 - Missing Critical] Added (auth) layout.tsx for route group**
- **Found during:** Task 1
- **Issue:** The `(auth)` route group required a layout file for Next.js App Router to correctly handle the route group without applying the root layout's auth checks
- **Fix:** Created `app/(auth)/layout.tsx` as a passthrough layout (no authentication required)
- **Files modified:** `app/(auth)/layout.tsx` created
- **Commit:** 457ae2e

**3. [Rule 1 - Bug] Fixed infinite redirect loop in app shell layout**
- **Found during:** Task 2 design review
- **Issue:** `app/(app)/layout.tsx` would redirect incomplete profiles to `/onboarding`, but `/onboarding` is itself inside `(app)` layout — creating an infinite redirect loop
- **Fix:** Middleware now sets `x-pathname` response header; layout reads this to detect when it's already serving the onboarding page and skips the redirect
- **Files modified:** `middleware.ts` (add header), `app/(app)/layout.tsx` (read header)
- **Commit:** 7285dea

## Auth Flow End-to-End

```
User visits any URL
  └─ Middleware: no session? → /login
       └─ Login page: Google OAuth button
            └─ Google OAuth flow
                 └─ /auth/callback:
                      ├─ Not on allowlist? → /login?access=denied&email=xxx
                      │    └─ Login page shows Request Access form
                      │         └─ /api/auth/request-access → stores in access_requests
                      ├─ New user (no profile)? → assign 'teacher' role + create profile → /onboarding
                      │    └─ Onboarding: set display_name + region → /chat
                      └─ Returning user → /chat

/admin/* routes:
  └─ Middleware: role !== 'admin'? → /chat?error=unauthorized
```

## Build Output

```
Route (app)
├ ƒ /                          (auth redirect)
├ ○ /_not-found
├ ƒ /admin                     (AUTH-05 admin placeholder)
├ ƒ /api/auth/request-access   (public access request API)
├ ƒ /api/s3/presigned-url      (from Plan 01)
├ ƒ /auth/callback             (OAuth callback)
├ ƒ /chat                      (Phase 2 placeholder)
├ ○ /login                     (static, Google OAuth)
└ ƒ /onboarding                (2-step flow)

ƒ Proxy (Middleware)
```

`pnpm build` passes with zero errors.

## Self-Check: PASSED
