# Phase 1: Foundation - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

A secure, role-aware application shell that every subsequent phase builds on. Delivers: Google OAuth with email allowlist, four-role RLS on all tables, full database schema for all 5 phases, prompt registry seeded with n8n-proven prompts, S3 presigned URL utility, and Vercel Fluid Compute configuration. No AI features, no chat UI, no content generation.

</domain>

<decisions>
## Implementation Decisions

### Role Assignment Flow
- Auto-assign Teacher role (in `app_metadata`) on first successful login
- Sign-up restricted via email allowlist — only pre-approved email addresses can create accounts
- Users not on the allowlist see a "Request Access" form (email + reason) — admin gets notified and can add them
- Role promotions (Teacher → Coordinator → National → Admin) managed via admin UI only — Abhishek is the sole role manager
- Region collected during onboarding (first login flow) and stored in profiles table

### Login & Onboarding UX
- Amplify-branded login page: Amplify logo, brand colors (#3D8BE8 blue, #E47D6C peach), tagline. Art of Living mentioned subtly, not prominently
- Non-allowlisted users see a friendly "Request Access" form instead of a rejection
- First login triggers a 2-step onboarding: (1) Confirm display name, (2) Select region/state
- Returning users land directly on the chat page (new campaign view) — past campaigns accessible from sidebar
- Unauthenticated users redirected to login page (AUTH-06)

### Database Schema Scope
- Full schema created upfront for all 5 phases: profiles, allowed_emails, access_requests, campaigns, campaign_messages, campaign_assets, campaign_research, prompts, ai_executions
- RLS enabled on every table from day one — no exceptions
- All RLS policies use `app_metadata` for role checks, never `user_metadata`
- Profiles table mirrors role from `app_metadata` (synced via trigger): id, email, display_name, region, role, created_at
- S3 presigned URL utility built in Phase 1 using existing bucket (`amplifyaol`, us-east-2) — validates INFRA-04 early

### Prompt Seeding Strategy
- Extract all AI prompts from the 10 n8n workflow JSONs in `../n8n amplify scripts/`
- Seed prompts table with extracted prompts as v1 records
- Prompt key convention: `domain.task` (e.g., `research.regional`, `copy.email`, `copy.whatsapp`, `wisdom.quotes`, `image.ad-creative`)
- Each seed prompt includes `model_override` indicating which provider/model it was designed for
- Source is n8n workflows only — Obsidian notes are reference, not prompt source
- Prompts are immutable: new edits create new version rows, never overwrite existing

### Infrastructure
- Vercel Fluid Compute enabled (`"fluid": true` in vercel.json)
- `maxDuration = 300` configured on all API route handlers
- Staging deployment at staging.amplifyaol.com with separate environment config (INFRA-06)
- Canva Enterprise validation deferred to Phase 4 planning

### Claude's Discretion
- Exact onboarding UI component design and animations
- Database index strategy for RLS policy columns
- Prompt extraction approach from n8n JSON (parsing strategy)
- Access request notification mechanism (email vs in-app vs both)
- Exact RLS policy formulations per table per role

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Authentication & Security
- `.planning/research/PITFALLS.md` — Pitfalls 3 (RLS default off), 4 (role in user_metadata), 5 (unprotected endpoints), 8 (prompt mutations)
- `.planning/research/ARCHITECTURE.md` — Supabase auth pattern, RLS policy examples, profiles table schema
- `.planning/research/STACK.md` — `@supabase/ssr` 0.9.x usage, NOT deprecated auth-helpers

### Database Schema
- `.planning/research/ARCHITECTURE.md` §Campaign Data Model — full schema definition for campaigns, messages, assets, prompts, executions
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-06, INFRA-01, INFRA-03, INFRA-04, INFRA-05, INFRA-06

### Prompt Registry
- `.planning/research/ARCHITECTURE.md` §Pattern 3 — Prompt-as-Data with Version Tracking, including SQL schema
- `../n8n amplify scripts/` — Source n8n workflow JSONs containing all production-proven AI prompts to extract

### Infrastructure
- `.planning/research/STACK.md` — S3 presigned URL pattern, Vercel Fluid Compute, version compatibility
- `.planning/research/PITFALLS.md` §Pitfall 1 — Vercel function timeout config requirements

### Project Context
- `.planning/PROJECT.md` — Brand guidelines (colors, fonts, voice), constraints, key decisions
- `.planning/STATE.md` — Pre-build decisions (Canva REST API, @supabase/ssr, roles in app_metadata, Fluid Compute)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **shadcn/ui components** (`components/ui/`): 55+ components already installed (button, card, dialog, form, input, select, tabs, toast, etc.) — reuse for login page, onboarding flow, and admin screens
- **login-form.tsx** (`components/login-form.tsx`): Existing login form component — needs refactoring for Google OAuth but layout/structure is reusable
- **theme-provider.tsx** (`components/theme-provider.tsx`): Dark/light theme support via next-themes — keep for Phase 1
- **cn utility** (`lib/utils.ts`): Tailwind merge helper — standard, keep as-is

### Established Patterns
- **Next.js App Router**: Project uses `app/` directory with route groups — continue this pattern
- **Tailwind CSS v3**: Current setup uses `tailwind.config.ts` — note: research recommends Tailwind v4 migration
- **shadcn/ui CLI**: `components.json` configured — use `pnpm dlx shadcn@latest add` for new components

### Integration Points
- **Existing Airtable API routes** (`app/api/airtable/`, `app/api/ad-campaigns/`, etc.): These are from the v0 prototype and will be replaced, not extended
- **`.env.local`**: Already has Supabase URL + keys + AWS S3 credentials configured
- **`app/client.tsx`**: Root client wrapper — will need Supabase auth provider integration
- **`app/login/page.tsx`**: Existing login page with branding — refactor for Supabase Google OAuth

### What to Remove/Replace
- `lib/airtable.ts` — Airtable client, replaced by Supabase
- `app/api/airtable/` — Airtable API routes, no longer needed
- Airtable env vars in `.env.local` — can be removed after Phase 1

</code_context>

<specifics>
## Specific Ideas

- Email allowlist with a "Request Access" form for non-listed users — admin-friendly gating without blocking interested teachers entirely
- Region collected at onboarding, not per-campaign — reduces friction for the primary workflow in Phase 3
- Full schema upfront so later phases never need migration work — just use existing tables
- Prompt seeds from n8n workflows give Phase 2+ battle-tested starting points instead of writing prompts from scratch

</specifics>

<deferred>
## Deferred Ideas

- Canva Enterprise validation — deferred to Phase 4 planning (user's choice; research recommended Phase 1)
- Admin role management UI — built in Phase 5 alongside Prompt Lab; Supabase dashboard available as interim fallback
- Social publishing integrations — v2 (out of scope)

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-29*
