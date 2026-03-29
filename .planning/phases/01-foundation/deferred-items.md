# Deferred Items - Phase 01 Foundation

## Out-of-Scope Issues Discovered

### Pre-existing Airtable API Routes (TypeScript Errors)

**Discovered during:** Plan 01-01, overall verification
**Files:**
- `app/api/airtable/update-ad-copy/route.ts`
- `app/api/past-campaigns/[id]/marketing-content/route.ts`
- `app/api/past-campaigns/[id]/route.ts`
- `app/api/past-campaigns/[id]/wisdom/route.ts`
- `app/api/past-campaigns/route.ts`
- `app/api/webhook-proxy/route.ts`

**Issue:** These files still import from `airtable` package which was removed in Plan 01-01. They are legacy v0 prototype routes that the CONTEXT.md explicitly states will be "replaced, not extended."

**Why deferred:** These are pre-existing files out of scope for Plan 01-01. The plan only covered creating Supabase utilities and the database schema. Removing/replacing legacy API routes is a separate concern for a later plan.

**Resolution:** Will be cleaned up when the corresponding Supabase-based API routes are created in later Phase 1 plans (auth callbacks, campaign routes, etc).
