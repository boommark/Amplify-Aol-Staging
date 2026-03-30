---
phase: 01-foundation
plan: 05
subsystem: infra
tags: [supabase, vercel, oauth, rls, deployment]

requires:
  - phase: 01-foundation plans 01-04
    provides: Schema, auth flow, S3 utility, prompt seeds
provides:
  - Applied database migration with 9 tables and 30+ RLS policies to Supabase
  - Seeded 14 production-proven AI prompts from n8n workflows
  - Deployed staging at staging.amplifyaol.com
  - Verified Google OAuth end-to-end with onboarding flow
affects: [phase-2-chat-core, all-subsequent-phases]

tech-stack:
  added: []
  patterns:
    - Supabase CLI for migrations (npx supabase db push)
    - Vercel CLI for staging deploys (vercel --prod)

key-files:
  created: []
  modified:
    - supabase/migrations/20260329000001_foundation_schema.sql
    - middleware.ts
    - lib/supabase/client.ts
    - lib/supabase/server.ts
    - lib/auth/assign-default-role.ts
    - app/api/auth/request-access/route.ts
    - app/(auth)/auth/callback/route.ts
    - app/(app)/onboarding/page.tsx
    - vercel.json
    - next.config.mjs

key-decisions:
  - "Downgraded from Next.js 16 to 15.5 — Next.js 16 deprecates middleware.ts and its edge runtime breaks @supabase/ssr"
  - "Moved auth.user_role() to public.user_role() — Supabase restricts CREATE FUNCTION in auth schema via migrations"
  - "Replaced auth.admin_update_user_by_id with direct raw_app_meta_data UPDATE in sync trigger"
  - "Fixed coordinator RLS policies to use auth.jwt() instead of self-referencing profiles table (infinite recursion)"
  - "Removed trailingSlash:true from next.config.mjs — incompatible with App Router route groups on Vercel"
  - "Fixed vercel.json from invalid root-level {fluid:true} to proper {framework:'nextjs', functions: {maxDuration:300}}"
  - "OAuth callback handles both PKCE and implicit flows — checks for code first, falls back to session check"
  - "assignDefaultRole preserves existing roles — prevents overwriting admin/coordinator set manually"
  - "Request access API uses admin client (service role) — non-allowlisted users have no session"
  - "Region selector changed from Indian states to countries + optional city/state"

patterns-established:
  - "Supabase migration naming: timestamp format (20260329000001_name.sql) required by CLI"
  - "RLS coordinator policies: use auth.jwt()->'app_metadata' instead of self-referencing the same table"
  - "Middleware must use @supabase/ssr createServerClient inline — not imported from separate file on Vercel edge"

requirements-completed: [AUTH-04, INFRA-06]

duration: 120min
completed: 2026-03-30
---

# Phase 1: Foundation — Integration Verification Summary

**Applied full schema to Supabase, seeded 14 prompts, deployed to staging.amplifyaol.com, and verified Google OAuth + onboarding end-to-end with multiple debugging iterations.**

## What Was Done

### Task 1: Apply migration, seed, deploy
- Linked Supabase CLI to project kmibwrgfskthkxhilutm
- Applied 20260329000001_foundation_schema.sql — 9 tables, all RLS enabled
- Seeded 14 AI prompts from n8n workflows
- Added abhishekratna@gmail.com and abhishek.ratna@artofliving.org to allowed_emails
- Set abhishek.ratna@artofliving.org as admin role
- Configured Supabase site URL to staging.amplifyaol.com with redirect allowlist
- Deployed to Vercel staging (staging.amplifyaol.com)

### Task 2: Human verification (checkpoint passed)
- Google OAuth flow: working (sign in → Google → Supabase → callback → onboarding)
- Onboarding: working (display name + country/city region selector)
- Chat placeholder: working (sidebar with campaigns placeholder)
- Session persistence: working (middleware refreshes cookies)
- RLS: all 9 tables verified with rowsecurity=true

### Issues Fixed During Verification
1. **Vercel edge runtime**: Next.js 16 middleware broke with @supabase/ssr → downgraded to Next.js 15.5
2. **vercel.json**: Invalid root-level `{fluid:true}` caused all routes to 404 → fixed to proper functions config
3. **trailingSlash**: Incompatible with App Router on Vercel → removed
4. **OAuth callback**: Supabase implicit flow sends no code → callback now handles both flows
5. **Middleware**: Lightweight cookie-check couldn't maintain sessions → restored full @supabase/ssr middleware
6. **RLS infinite recursion**: Coordinator policies self-referenced profiles table → use JWT app_metadata directly
7. **Admin role overwrite**: assignDefaultRole overwrote admin → now checks for existing role first
8. **Request access form**: Used authenticated client but users have no session → switched to admin client
9. **Region selector**: Only Indian states → changed to countries + city/state

## Self-Check: PASSED

- [x] Migration applied (9 tables with RLS)
- [x] Prompts seeded (14 records)
- [x] Staging accessible (staging.amplifyaol.com returns 200)
- [x] Google OAuth works end-to-end
- [x] Onboarding saves profile (display_name + region)
- [x] Admin role preserved for abhishek.ratna@artofliving.org
