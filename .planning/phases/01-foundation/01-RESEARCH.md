# Phase 1: Foundation - Research

**Researched:** 2026-03-29
**Domain:** Supabase Auth (Google OAuth + email allowlist + RLS), Next.js App Router middleware, full Postgres schema, prompt registry, AWS S3, Vercel Fluid Compute
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Auto-assign Teacher role (in `app_metadata`) on first successful login
- Sign-up restricted via email allowlist — only pre-approved email addresses can create accounts
- Users not on the allowlist see a "Request Access" form (email + reason) — admin gets notified and can add them
- Role promotions (Teacher → Coordinator → National → Admin) managed via admin UI only — Abhishek is the sole role manager
- Region collected during onboarding (first login flow) and stored in profiles table
- Amplify-branded login page: Amplify logo, brand colors (#3D8BE8 blue, #E47D6C peach), tagline. Art of Living mentioned subtly, not prominently
- Non-allowlisted users see a friendly "Request Access" form instead of a rejection
- First login triggers a 2-step onboarding: (1) Confirm display name, (2) Select region/state
- Returning users land directly on the chat page (new campaign view) — past campaigns accessible from sidebar
- Unauthenticated users redirected to login page (AUTH-06)
- Full schema created upfront for all 5 phases: profiles, allowed_emails, access_requests, campaigns, campaign_messages, campaign_assets, campaign_research, prompts, ai_executions
- RLS enabled on every table from day one — no exceptions
- All RLS policies use `app_metadata` for role checks, never `user_metadata`
- Profiles table mirrors role from `app_metadata` (synced via trigger): id, email, display_name, region, role, created_at
- S3 presigned URL utility built in Phase 1 using existing bucket (`amplifyaol`, us-east-2) — validates INFRA-04 early
- Extract all AI prompts from the 10 n8n workflow JSONs in `../n8n amplify scripts/`
- Seed prompts table with extracted prompts as v1 records
- Prompt key convention: `domain.task` (e.g., `research.regional`, `copy.email`, `copy.whatsapp`, `wisdom.quotes`, `image.ad-creative`)
- Each seed prompt includes `model_override` indicating which provider/model it was designed for
- Source is n8n workflows only — Obsidian notes are reference, not prompt source
- Prompts are immutable: new edits create new version rows, never overwrite existing
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

### Deferred Ideas (OUT OF SCOPE)
- Canva Enterprise validation — deferred to Phase 4 planning (user's choice; research recommended Phase 1)
- Admin role management UI — built in Phase 5 alongside Prompt Lab; Supabase dashboard available as interim fallback
- Social publishing integrations — v2 (out of scope)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign in with Google via Supabase Auth | `@supabase/ssr` + `signInWithOAuth({ provider: 'google' })` pattern; callback route required |
| AUTH-02 | User session persists across browser refresh and tabs | `@supabase/ssr` cookie-based session; middleware refreshes session on every request |
| AUTH-03 | Users assigned roles via app_metadata | Server-side Admin API call on first login; trigger or post-login hook to set `app_metadata.role = 'teacher'` |
| AUTH-04 | RLS enforces role-based data access | RLS policies using `(auth.jwt()->'app_metadata'->>'role')` on every table |
| AUTH-05 | Admin role has access to prompt testing screen | Route group `(admin)` guarded at middleware level; RLS on prompts/ai_executions tables |
| AUTH-06 | Unauthenticated users redirected to login | Next.js middleware checks session; redirects to `/login` if none |
| INFRA-01 | All AI prompts stored and versioned in Supabase | `prompts` table with immutable versioning schema; seed from n8n JSONs |
| INFRA-03 | Supabase schema with RLS for all four roles | Full schema for 5 phases created upfront; RLS on all tables from migration day 1 |
| INFRA-04 | AWS S3 presigned URL upload pattern | `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`; existing bucket `amplifyaol` us-east-2 |
| INFRA-05 | Vercel Fluid Compute with maxDuration 300s | `vercel.json` with `"fluid": true`; `export const maxDuration = 300` in route handlers |
| INFRA-06 | Staging deployment at staging.amplifyaol.com | Separate Supabase project + Vercel environment; separate OAuth client IDs |
</phase_requirements>

---

## Summary

Phase 1 is exclusively a security and infrastructure phase — no AI calls, no chat UI, no content generation. Its primary output is a hardened application shell that later phases depend on unconditionally. Three concerns dominate: (1) getting Supabase Google OAuth working with email allowlist gating and role assignment through `app_metadata` not `user_metadata`; (2) deploying a complete, RLS-enabled Postgres schema for all 5 phases upfront so later phases never create new tables; and (3) establishing infrastructure foundations (Vercel Fluid Compute, S3 presigned URLs, prompt seed records) before any AI work begins.

The existing codebase is a Next.js 16.2.1 / React 19 project with 55+ shadcn/ui components and Tailwind v3. None of the Supabase packages are installed yet — `@supabase/ssr`, `@supabase/supabase-js` need to be added. The login page exists as a mock form and needs full replacement with Google OAuth. The Airtable client and routes need removal. The project already has AWS credentials in `.env.local` for the `amplifyaol` bucket in `us-east-2`.

The n8n workflow audit identified 10+ distinct LLM prompts across 10 workflow files representing 6 task domains. These must be extracted and seeded as immutable v1 records in the `prompts` table — this is the only moment in the project lifecycle where production-proven prompts are ported from the old system, making it a one-time migration task with high accuracy requirements.

**Primary recommendation:** Install `@supabase/ssr`, build auth infrastructure with email allowlist gating and `app_metadata` roles first, then deploy the full schema, then configure Fluid Compute and S3, then extract and seed prompts.

---

## Standard Stack

### Core (Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.x | Supabase client | Required base package for any Supabase usage |
| `@supabase/ssr` | 0.9.x | Cookie-based auth for Next.js App Router | Replaces deprecated `@supabase/auth-helpers-nextjs`; handles server/client/middleware contexts |
| `@aws-sdk/client-s3` | 3.x | S3 operations | AWS SDK v3 — tree-shakeable, Node.js 20 compatible |
| `@aws-sdk/s3-request-presigner` | 3.x | Presigned URL generation | Pairs with client-s3; server-side URL generation for direct client uploads |

### Already Installed (No Action Needed)

| Library | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.1 | App Router framework |
| `react` | 19.x | UI runtime |
| `zod` | 3.24.x | Schema validation (used for form validation, API input) |
| `react-hook-form` | 7.54.x | Form management (onboarding flow) |
| `@hookform/resolvers` | 3.9.x | Zod integration with react-hook-form |
| `tailwindcss` | 3.4.x | Styling (NOTE: v3, not v4 — see pitfall below) |
| All shadcn/ui components | Various | UI components — button, card, dialog, form, input, select etc. |

### Not Needed in Phase 1

These are Phase 2+ concerns: Vercel AI SDK, AI provider packages (`@ai-sdk/google`, `@ai-sdk/anthropic`, etc.), `react-markdown`, `@tanstack/react-query`.

### Installation

```bash
# Add Supabase auth packages (not yet installed)
pnpm add @supabase/supabase-js @supabase/ssr

# Add AWS SDK for S3 presigned URLs
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Remove Airtable (no longer needed)
pnpm remove airtable
```

**Version verification (run before writing package versions into code):**
```bash
npm view @supabase/ssr version
npm view @supabase/supabase-js version
npm view @aws-sdk/client-s3 version
```

---

## Architecture Patterns

### Recommended Project Structure for Phase 1

The existing `app/` structure uses a flat layout. Phase 1 introduces route groups for auth separation.

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx            # Replace existing login page with Google OAuth
│   └── auth/
│       └── callback/
│           └── route.ts        # OAuth callback handler — REQUIRED by Supabase
├── (app)/
│   ├── layout.tsx              # Authenticated shell — session check here
│   ├── onboarding/
│   │   └── page.tsx            # 2-step: display name + region (first login only)
│   └── chat/
│       └── page.tsx            # Landing page for returning users (placeholder in Phase 1)
├── api/
│   ├── auth/
│   │   └── request-access/
│   │       └── route.ts        # POST: store access request from non-allowlisted user
│   └── s3/
│       └── presigned-url/
│           └── route.ts        # POST: generate presigned S3 PutObject URL
├── middleware.ts                # Session refresh + route protection
└── globals.css

lib/
├── supabase/
│   ├── client.ts               # createBrowserClient() — use in client components
│   ├── server.ts               # createServerClient() — use in Server Components + Route Handlers
│   └── middleware.ts           # createServerClient() — use in middleware.ts
├── s3/
│   └── presigned-url.ts        # generatePresignedUploadUrl(key, contentType)
├── auth/
│   └── allowlist.ts            # checkEmailAllowlist(email): boolean
└── prompts/
    └── seed.ts                 # Script to extract + insert v1 prompts from n8n JSONs

supabase/
├── migrations/
│   └── 001_foundation_schema.sql   # Full schema for all 5 phases
└── seed/
    └── prompts.sql             # Seed file generated from n8n extraction
```

### Pattern 1: Supabase SSR — Three Client Contexts

Supabase auth requires three separate client instances based on execution context. Using the wrong client is a silent failure: cookies won't be set or read correctly.

```typescript
// lib/supabase/client.ts — client components only
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts — Server Components, Route Handlers, Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}  // Server Components cannot set cookies — this is expected
        },
      },
    }
  )
}

// middleware.ts — session refresh on every request
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  // IMPORTANT: Never call supabase.auth.getUser() before creating supabaseResponse
  const { data: { user } } = await supabase.auth.getUser()
  const isProtectedRoute = !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/auth')
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
```

### Pattern 2: Google OAuth with Email Allowlist

The allowlist check happens at two points: (1) the OAuth callback route, where we check the authenticated email against the `allowed_emails` table before creating a profile; (2) the `onboarding` flow, where we show the Request Access form if the callback already redirected to it.

```typescript
// app/(auth)/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        // Check allowlist
        const { data: allowed } = await supabase
          .from('allowed_emails')
          .select('email')
          .eq('email', user.email.toLowerCase())
          .single()

        if (!allowed) {
          // Sign out and redirect to request-access page
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?access=denied&email=${encodeURIComponent(user.email)}`)
        }

        // Check if first login (no profile exists)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // Assign default role in app_metadata via service role
          // (done via Supabase Auth hook/trigger — see Pattern 3)
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        return NextResponse.redirect(`${origin}/chat`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

### Pattern 3: Role Assignment in app_metadata

Role assignment MUST use the Supabase Admin API (service role key) server-side. Never use the browser client for this. The most reliable mechanism for auto-assigning Teacher on first login is a Postgres function triggered by `auth.users` INSERT, called via `supabase_functions` or via a server-side hook in the callback route.

```typescript
// lib/auth/assign-default-role.ts
// Called server-side only — uses SUPABASE_SERVICE_ROLE_KEY
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // NEVER NEXT_PUBLIC_
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function assignDefaultRole(userId: string) {
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'teacher' }
  })
  if (error) throw error
}
```

### Pattern 4: RLS Policy Using app_metadata

All RLS policies must reference `app_metadata`, not `user_metadata`. The JWT claim path is `raw_app_meta_data` in Postgres.

```sql
-- Helper function (create once, use in all policies)
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role')
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Example: Teachers see only their own campaigns
CREATE POLICY "teachers_own_campaigns" ON campaigns
  FOR ALL USING (
    user_id = auth.uid()
    AND auth.user_role() = 'teacher'
  );

-- Example: Coordinators see all campaigns in their region
CREATE POLICY "coordinators_see_region_campaigns" ON campaigns
  FOR SELECT USING (
    auth.user_role() IN ('coordinator', 'national', 'admin')
  );
```

### Pattern 5: Immutable Prompt Versioning Schema

```sql
-- prompts table: immutable versioning
CREATE TABLE prompts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key           text NOT NULL,           -- e.g. 'copy.email', 'wisdom.questions'
  version       int NOT NULL DEFAULT 1,
  template      text NOT NULL,
  model_override text,                   -- e.g. 'anthropic/claude-sonnet-4-5'
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES auth.users
);

-- Unique constraint: only one active version per key
CREATE UNIQUE INDEX prompts_one_active_per_key
  ON prompts (key) WHERE is_active = true;

-- To "update" a prompt: deactivate old, insert new
UPDATE prompts SET is_active = false WHERE key = 'copy.email' AND is_active = true;
INSERT INTO prompts (key, version, template, model_override, is_active)
  SELECT key, version + 1, $new_template, model_override, true
  FROM prompts WHERE key = 'copy.email' ORDER BY version DESC LIMIT 1;

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
-- Admin can read/write; others can read active prompts only
CREATE POLICY "admins_manage_prompts" ON prompts
  FOR ALL USING (auth.user_role() = 'admin');
CREATE POLICY "authenticated_read_active_prompts" ON prompts
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');
```

### Pattern 6: S3 Presigned URL Route

```typescript
// app/api/s3/presigned-url/route.ts
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 300

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  // Auth check first — always
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, contentType } = await request.json()
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,  // amplifyaol
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
  return NextResponse.json({ url, key })
}
// Source: https://vercel.com/templates/next.js/aws-s3-image-upload-nextjs
```

### Pattern 7: Vercel Fluid Compute Configuration

```json
// vercel.json — at project root
{
  "fluid": true
}
```

```typescript
// Every API route handler that could run long — add this export:
export const maxDuration = 300

// Example: app/api/s3/presigned-url/route.ts
export const maxDuration = 300
export async function POST(request: Request) { ... }
```

### Anti-Patterns to Avoid

- **Using `@supabase/auth-helpers-nextjs`:** End-of-life. Only `@supabase/ssr` in this project.
- **Calling `supabase.auth.getSession()` server-side:** Use `supabase.auth.getUser()` instead — `getSession()` does not validate the JWT and can be spoofed.
- **Checking `user_metadata` in RLS policies:** User-writable. Always check `app_metadata` / `raw_app_meta_data`.
- **Creating tables without `ALTER TABLE x ENABLE ROW LEVEL SECURITY`:** Every migration SQL must enable RLS immediately after CREATE TABLE.
- **Exposing `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_` prefix:** Instant full-DB exposure. Service role key stays server-only.
- **Shared Supabase project across staging and production:** Separate Supabase projects required per environment.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-based session management for Next.js App Router | Custom cookie handling | `@supabase/ssr` | Handles server/client/middleware cookie contexts; gets refreshes right |
| OAuth callback code exchange | Manual fetch to Supabase | `supabase.auth.exchangeCodeForSession(code)` | One call; handles PKCE, token storage, session init |
| Protected route redirects | Custom middleware logic | Next.js middleware with `supabase.auth.getUser()` | Standard pattern — already works with App Router |
| S3 upload from Vercel | Proxy upload through API route | Presigned URL + direct client upload | Vercel has 4.5MB request body limit; proxying S3 large files fails |
| Prompt versioning enforcement | Manual version management | Database constraint (`UNIQUE INDEX WHERE is_active = true`) | Database enforces invariant; application code can't accidentally violate it |
| Region dropdown | Custom select component | shadcn/ui `Select` already installed | 55+ components installed; `Select` with India states is a data-seeding task |

**Key insight:** The Supabase auth flow has ~15 edge cases in cookie handling between server/client/middleware contexts. `@supabase/ssr` v0.9.x was built specifically for Next.js App Router and handles all of them. Any custom implementation will miss at least 3.

---

## Common Pitfalls

### Pitfall 1: RLS Disabled by Default — The Silent Exposure
**What goes wrong:** Every new Supabase table has RLS off by default. Without `ALTER TABLE x ENABLE ROW LEVEL SECURITY`, all rows are readable via the anon key. For Amplify, this means campaigns from one teacher are readable by any other authenticated user.
**Why it happens:** SQL Editor runs as superuser and bypasses RLS — testing there gives a false pass.
**How to avoid:** Every `CREATE TABLE` in migrations must be immediately followed by `ALTER TABLE x ENABLE ROW LEVEL SECURITY`. After running migration, verify with: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;` — must return zero rows.
**Warning signs:** Supabase dashboard shows RLS toggle off on any table.

### Pitfall 2: role in user_metadata = Privilege Escalation
**What goes wrong:** If roles are stored in `user_metadata`, any user can call `supabase.auth.updateUser({ data: { role: 'admin' } })` to escalate themselves.
**Why it happens:** `user_metadata` appears first in Supabase docs and is simpler to write.
**How to avoid:** Roles in `app_metadata` only. Set via `adminClient.auth.admin.updateUserById()` server-side. RLS policies use `auth.jwt()->'app_metadata'->>'role'`.
**Warning signs:** RLS policy body references `raw_user_meta_data` — it must say `raw_app_meta_data`.

### Pitfall 3: Missing OAuth Callback Route
**What goes wrong:** Google OAuth redirects to `/auth/callback?code=...` but if the route handler doesn't exist, it falls through to a 404 or the root page, and the session is never established.
**Why it happens:** Developers configure the Supabase provider and the redirect URL but forget to create the callback route handler.
**How to avoid:** Create `app/(auth)/auth/callback/route.ts` as one of the first files. Confirm the redirect URL in Supabase Auth settings AND in Google Cloud Console both point to the same callback URL per environment (local: `http://localhost:3000/auth/callback`, staging: `https://staging.amplifyaol.com/auth/callback`, prod: `https://amplifyaol.com/auth/callback`).
**Warning signs:** Login button triggers Google OAuth but lands on an error page or root page after Google consent.

### Pitfall 4: Separate Google OAuth Client IDs Per Environment
**What goes wrong:** Using the same Google OAuth client ID for local + staging + production. Google OAuth only allows whitelisted redirect URLs per client. If staging and prod share a client, Google rejects one environment's callbacks.
**Why it happens:** Creating one OAuth app seems simpler than three.
**How to avoid:** Create 3 Google OAuth clients (local dev, staging, production). Store different `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in each environment's `.env`. Staging and production are separate Supabase projects (different `NEXT_PUBLIC_SUPABASE_URL`), so they naturally get different OAuth settings.
**Warning signs:** OAuth works in one environment, silently fails in another with "redirect_uri_mismatch".

### Pitfall 5: Airtable Code Left in Place
**What goes wrong:** The existing `lib/airtable.ts` and `app/api/airtable/` routes remain in the codebase. Since they reference `AIRTABLE_API_KEY` which may be removed from `.env.local`, they cause build failures. More importantly, existing page components that import from Airtable routes will crash.
**Why it happens:** Incremental migration — developers add Supabase without removing Airtable.
**How to avoid:** In Phase 1, as part of the setup task: delete `lib/airtable.ts`, delete `app/api/airtable/` directory, remove Airtable env vars from `.env.local`. Run `pnpm build` to confirm no lingering imports.
**Warning signs:** `pnpm build` fails with "Cannot find module airtable" after auth is added.

### Pitfall 6: Prompt Seeding Loses Template Variable Syntax
**What goes wrong:** n8n prompts use `{{ $json.field }}` for variable interpolation. When seeded into Supabase, this n8n-specific syntax must be converted to the app's variable convention (e.g., `{{region}}` or `{region}`). If seeded as-is, the prompts contain inert n8n syntax that the new runtime cannot replace.
**Why it happens:** Copy-paste from n8n JSON without converting the interpolation format.
**How to avoid:** During prompt extraction, establish a convention (recommend `{{variable_name}}` double-brace) and convert all `{{ $json.field_name }}`, `{{ $('NodeName').item.json.field }}` references to the new convention. Document the variable names used per prompt key.
**Warning signs:** Prompt contains `$json` or `$('` patterns after seeding — those will appear verbatim in AI calls.

---

## Code Examples

### Google OAuth Trigger (client component)

```typescript
// Verified pattern from: https://supabase.com/docs/guides/auth/social-login/auth-google
'use client'
import { createClient } from '@/lib/supabase/client'

export function GoogleSignInButton() {
  const supabase = createClient()
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  return <button onClick={handleSignIn}>Sign in with Google</button>
}
```

### Full Database Schema (Phase 1 migration)

```sql
-- supabase/migrations/001_foundation_schema.sql
-- =============================================
-- PHASE 1: Auth + Access Control
-- =============================================

CREATE TABLE allowed_emails (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  added_by   uuid REFERENCES auth.users,
  added_at   timestamptz DEFAULT now()
);
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_manage_allowlist" ON allowed_emails
  FOR ALL USING (auth.user_role() = 'admin');

CREATE TABLE access_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  reason      text,
  status      text NOT NULL DEFAULT 'pending',  -- pending|approved|rejected
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_manage_access_requests" ON access_requests
  FOR ALL USING (auth.user_role() = 'admin');
-- Allow anonymous inserts (non-logged-in users submitting requests)
CREATE POLICY "anyone_can_request_access" ON access_requests
  FOR INSERT WITH CHECK (true);

CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email        text NOT NULL,
  display_name text,
  region       text,
  role         text NOT NULL DEFAULT 'teacher',
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "admins_read_all_profiles" ON profiles
  FOR SELECT USING (auth.user_role() = 'admin');

-- Trigger: sync role from app_metadata to profiles.role
CREATE OR REPLACE FUNCTION sync_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET role = NEW.raw_app_meta_data->>'role'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_role_update
  AFTER UPDATE OF raw_app_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_profile_role();

-- =============================================
-- PHASE 1: Prompt Registry
-- =============================================

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role')
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE TABLE prompts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key           text NOT NULL,
  version       int NOT NULL DEFAULT 1,
  template      text NOT NULL,
  model_override text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES auth.users
);
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX prompts_one_active_per_key ON prompts (key) WHERE is_active = true;
CREATE POLICY "admins_manage_prompts" ON prompts FOR ALL USING (auth.user_role() = 'admin');
CREATE POLICY "authenticated_read_active_prompts" ON prompts
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- =============================================
-- PHASES 2-5: Campaigns, Assets, Messages, Executions
-- (Full schema created upfront per Phase 1 decision)
-- =============================================

CREATE TABLE campaigns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title       text,
  region      text,
  event_type  text,
  tone        text DEFAULT 'inspiring',
  status      text DEFAULT 'active',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_campaigns" ON campaigns
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "coordinators_see_campaigns" ON campaigns
  FOR SELECT USING (auth.user_role() IN ('coordinator', 'national', 'admin'));

CREATE TABLE campaign_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  parts       jsonb,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_messages_follow_campaign" ON campaign_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid())
    OR auth.user_role() IN ('coordinator', 'national', 'admin')
  );

CREATE TABLE campaign_assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid NOT NULL REFERENCES campaigns ON DELETE CASCADE,
  asset_type      text,   -- 'ad-creative', 'quote-image', etc.
  s3_key          text,
  canva_design_id text,
  orientation     text,
  width           int,
  height          int,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE campaign_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_assets_follow_campaign" ON campaign_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid())
    OR auth.user_role() IN ('coordinator', 'national', 'admin')
  );

CREATE TABLE campaign_research (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns ON DELETE CASCADE,
  dimension   text NOT NULL,   -- e.g. 'spirituality', 'mental_health'
  content     jsonb,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE campaign_research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_research_follow_campaign" ON campaign_research
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid())
    OR auth.user_role() IN ('coordinator', 'national', 'admin')
  );

CREATE TABLE ai_executions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id   uuid REFERENCES prompts,
  campaign_id uuid REFERENCES campaigns,
  user_id     uuid REFERENCES auth.users,
  input       jsonb,
  output      text,
  model       text,
  provider    text,
  latency_ms  int,
  cost_usd    numeric(10, 6),
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE ai_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_all_executions" ON ai_executions
  FOR SELECT USING (auth.user_role() = 'admin');
CREATE POLICY "users_read_own_executions" ON ai_executions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "service_insert_executions" ON ai_executions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- INDEXES: performance on RLS policy columns
-- =============================================
CREATE INDEX idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX idx_campaign_messages_campaign_id ON campaign_messages (campaign_id);
CREATE INDEX idx_campaign_assets_campaign_id ON campaign_assets (campaign_id);
CREATE INDEX idx_campaign_research_campaign_id ON campaign_research (campaign_id);
CREATE INDEX idx_ai_executions_campaign_id ON ai_executions (campaign_id);
CREATE INDEX idx_ai_executions_user_id ON ai_executions (user_id);
CREATE INDEX idx_prompts_key ON prompts (key);
```

### n8n Prompt Extraction Script Pattern

```typescript
// lib/prompts/seed.ts — run once via `npx ts-node lib/prompts/seed.ts`
// Converts n8n {{ $json.field }} syntax to {{variable_name}} and inserts to Supabase

const N8N_SCRIPTS_DIR = '../n8n amplify scripts'
const PROMPT_MAP: Record<string, string> = {
  // Maps n8n node names to domain.task keys
  'Topic 1 Content Maker':          'copy.multi-channel',
  'Marketing Email Writer':         'copy.email',
  'WhatsApp Message Maker':         'copy.whatsapp',
  'Instagram Post Maker':           'copy.instagram',
  'Facebook Post Maker':            'copy.facebook',
  'Questions for Gurudev':          'wisdom.questions',
  'Topic 1 Quote Generator':        'wisdom.quotes',
  'Quote Finder':                   'wisdom.quotes-v2',
  'Generate Image Prompt':          'image.quote',
  'Photography - Ad Image Prompt (v3)': 'image.ad-creative',
  'Ad Copywriter (v4)':             'copy.ad',
}

// Variable substitution: n8n → app convention
function convertVariables(template: string): string {
  return template
    .replace(/\{\{\s*\$\('[\w\s]+'\)\.item\.json\.([\w.]+)\s*\}\}/g, '{{$1}}')
    .replace(/\{\{\s*\$json\.([\w.]+)\s*\}\}/g, '{{$1}}')
    .replace(/\{\{\s*\$\('[^']+'\)\.item\.json\.([\w.]+)\s*\}\}/g, '{{$1}}')
}
```

---

## Prompt Seed Inventory

Based on the n8n workflow audit, the following prompts must be extracted and seeded in Phase 1. All use `anthropic/claude` or `openai/gpt-4` as the original models.

| Prompt Key | Source Node | Source File | Original Model | Variables |
|------------|-------------|-------------|----------------|-----------|
| `copy.multi-channel` | Topic 1/2/3 Content Maker | Amplify 2.0 Copy Blocks | Claude/OpenAI | `{{region}}`, `{{event_type}}`, `{{date}}`, `{{research}}` |
| `copy.email` | Marketing Email Writer | Amplify Researcher | Claude | `{{region}}`, `{{event}}`, `{{date}}`, `{{research}}` |
| `copy.whatsapp` | WhatsApp Message Maker | Amplify Researcher | Claude | `{{region}}`, `{{event}}`, `{{date}}`, `{{research}}` |
| `copy.instagram` | Instagram Post Maker | Amplify Researcher | Claude | `{{region}}`, `{{event}}`, `{{date}}`, `{{research}}` |
| `copy.facebook` | Facebook Post Maker | Amplify Researcher | Claude | `{{region}}`, `{{event}}`, `{{date}}`, `{{research}}` |
| `wisdom.questions` | Questions for Gurudev | Amplify Quote n8n / 2.0 Research | Claude | `{{region}}`, `{{research}}` |
| `wisdom.quotes` | Topic 1/2/3 Quote Generator | Amplify 2.0 Research | OpenAI | `{{topic}}`, `{{wisdom_text}}` |
| `image.quote` | Generate Image Prompt | Amplify Quote n8n | Claude | `{{quote_text}}` |
| `image.ad-creative` | Photography Ad Image Prompt v3 | AOL Ad Creator v6 | OpenAI | `{{copy}}`, `{{style}}` |
| `copy.ad` | Ad Copywriter v4 | AOL Ad Creator v6 | Claude | `{{event}}`, `{{cta}}`, `{{research}}` |
| `copy.intro-talk` | Topic 1 Content Maker (translated) | Amplify 2.1 Translated | Claude | `{{region}}`, `{{language}}`, `{{research}}` |
| `wisdom.quotes-translated` | Topic 1 Quote Translator | Amplify 2.1 Translated | OpenAI | `{{topic}}`, `{{language}}`, `{{quotes}}` |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` 0.9.x | v0.15.0 final (2024) | Migration required; auth-helpers breaks with Next.js 15 App Router edge cases |
| `supabase.auth.getSession()` server-side | `supabase.auth.getUser()` server-side | Supabase security advisory | `getSession()` does not validate JWT; `getUser()` hits Supabase auth server to validate |
| Storing role in `user_metadata` | Role in `app_metadata` only | Security posture shift | `user_metadata` is user-writable; `app_metadata` is server-only |
| Manual session cookie handling | `@supabase/ssr` with `getAll/setAll` cookie API | Next.js 15 | `setAll` required for middleware to handle multiple cookies atomically |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Do not use; frozen at v0.15.0; not compatible with Next.js 15+
- `supabase.auth.getSession()` in server context: Use `getUser()` which validates the JWT
- Tailwind v3 config patterns (the project currently has `tailwind.config.ts`): Works for now but will need migration to Tailwind v4 CSS-native config when upgrading — do NOT do this in Phase 1; leave Tailwind v3 in place

---

## Open Questions

1. **India States List for Region Dropdown**
   - What we know: Region field is collected in onboarding; stored in `profiles.region`
   - What's unclear: Should the dropdown list Indian states only, or also allow custom text for international coordinators?
   - Recommendation: Default to a curated list of Indian states + Union Territories (29 + 8 = 37 options). Add an "Other" free-text option for edge cases. This is Claude's discretion per CONTEXT.md.

2. **Access Request Notification Mechanism**
   - What we know: Non-allowlisted users submit name + reason; admin is notified (CONTEXT.md: Claude's discretion on channel)
   - What's unclear: Email notification requires an email provider (SendGrid, Resend) not yet in the stack. In-app only means admin must actively check.
   - Recommendation: For Phase 1, write the access request to Supabase and use Supabase's built-in database webhook (or pg_net extension) to send a simple HTTP POST to a webhook URL (n8n or similar). Defers email provider integration to Phase 2+. Fallback: admin checks the `access_requests` table in Supabase dashboard.

3. **Onboarding Profile Creation Timing**
   - What we know: First login → onboarding → name + region stored in `profiles`. But `assignDefaultRole()` must happen before the user can see any authenticated page.
   - What's unclear: Whether to create the profile row in the OAuth callback route (before onboarding) or after onboarding completes.
   - Recommendation: Create a minimal `profiles` row in the callback route (id, email, role='teacher') immediately after allowlist check passes. Onboarding then updates `display_name` and `region` on the existing row. This way the profile always exists for RLS to work during onboarding itself.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test runner installed in package.json |
| Config file | None — Wave 0 gap |
| Quick run command | `pnpm test` (once configured) |
| Full suite command | `pnpm test:ci` (once configured) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Google OAuth sign-in redirects to callback | E2E / manual | Browser flow test | ❌ Wave 0 |
| AUTH-02 | Session persists across refresh | Integration | `playwright test auth.spec.ts` | ❌ Wave 0 |
| AUTH-03 | First-login user gets `app_metadata.role = 'teacher'` | Unit | `pnpm test lib/auth/assign-default-role.test.ts` | ❌ Wave 0 |
| AUTH-04 | Teacher cannot read another teacher's campaigns | Integration | `pnpm test supabase/tests/rls.test.ts` | ❌ Wave 0 |
| AUTH-05 | Non-admin cannot access `/admin` routes | Integration | Middleware test | ❌ Wave 0 |
| AUTH-06 | Unauthenticated → redirected to `/login` | Unit | Middleware unit test | ❌ Wave 0 |
| INFRA-01 | Prompts table readable; seed data present | Integration | `pnpm test lib/prompts/registry.test.ts` | ❌ Wave 0 |
| INFRA-03 | All tables have RLS enabled | Smoke | SQL query: `rowsecurity = false` returns 0 rows | ❌ Wave 0 |
| INFRA-04 | S3 presigned URL endpoint returns valid URL | Unit | `pnpm test app/api/s3/presigned-url.test.ts` | ❌ Wave 0 |
| INFRA-05 | Vercel maxDuration configured on routes | Smoke | Check export const maxDuration in route files | ❌ Wave 0 |
| INFRA-06 | Staging deployment responds at staging.amplifyaol.com | Manual | Browser smoke test | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test --testPathPattern="unit"` (once test infra exists)
- **Per wave merge:** `pnpm test` (full suite)
- **Phase gate:** All RLS verification SQL passes + manual OAuth flow confirmed before proceeding to Phase 2

### Wave 0 Gaps

- [ ] `package.json` — add `vitest` or `jest` + `@testing-library/react` test framework
- [ ] `vitest.config.ts` — configure for Next.js App Router
- [ ] `supabase/tests/rls.test.ts` — RLS verification tests using Supabase test utilities
- [ ] `lib/auth/assign-default-role.test.ts` — unit test for role assignment
- [ ] `lib/s3/presigned-url.test.ts` — unit test for S3 URL generation
- [ ] Framework install: `pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom`

---

## Sources

### Primary (HIGH confidence)
- `https://supabase.com/docs/guides/auth/server-side/nextjs` — `@supabase/ssr` patterns for Next.js App Router, three client contexts
- `https://supabase.com/docs/guides/database/postgres/row-level-security` — RLS documentation, policy syntax
- `https://supabase.com/docs/guides/auth/managing-user-data` — `app_metadata` vs `user_metadata` security distinction
- `https://vercel.com/docs/functions/limitations` — `maxDuration`, Fluid Compute configuration
- `https://vercel.com/templates/next.js/aws-s3-image-upload-nextjs` — S3 presigned URL pattern for Vercel
- `https://www.npmjs.com/package/@supabase/ssr` — v0.9.0 confirmed current
- `.planning/research/STACK.md` — stack decisions, version compatibility table
- `.planning/research/PITFALLS.md` — Pitfalls 3, 4 (RLS + user_metadata) verified in this research
- `.planning/research/ARCHITECTURE.md` — prompt schema, RLS pattern, project structure

### Secondary (MEDIUM confidence)
- n8n workflow JSON analysis — 10 workflow files manually audited for prompt extraction; prompt text confirmed present
- Existing codebase audit (`package.json`, `app/login/page.tsx`, `components/login-form.tsx`) — confirmed no Supabase installed, Tailwind v3, Next.js 16.2.1

### Tertiary (LOW confidence)
- Supabase pg_net webhook for access request notifications — not verified as available on all Supabase tiers; manual fallback recommended

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@supabase/ssr` v0.9.x confirmed current; AWS SDK v3 confirmed; all packages verified against npm
- Architecture: HIGH — official Supabase + Next.js App Router patterns directly from docs
- Schema: HIGH — follows ARCHITECTURE.md patterns with full RLS; verified against Pitfalls 3+4
- Prompt inventory: MEDIUM — n8n JSON audit confirmed nodes exist with prompt text; exact variable names require careful extraction during implementation
- Pitfalls: HIGH — all critical pitfalls from PITFALLS.md confirmed applicable to Phase 1; code examples verified

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (30 days — Supabase SSR and Next.js Auth patterns are stable)
