---
phase: 02-chat-core
plan: "02"
subsystem: campaign-management
tags: [campaigns, sidebar, CRUD, supabase, ai-sdk, routing]
dependency_graph:
  requires: [02-00]
  provides: [campaign-list-api, campaign-crud-db, sidebar-recency-grouping, campaign-type-selector, campaignId-route]
  affects: [02-03, 02-04]
tech_stack:
  added: []
  patterns: [supabase-server-client, date-fns-grouping, nextjs-dynamic-route, sheet-mobile-overlay]
key_files:
  created:
    - lib/db/campaigns.ts
    - app/api/campaigns/route.ts
    - components/campaigns/CampaignList.tsx
    - components/campaigns/CampaignTypeSelector.tsx
    - app/(app)/chat/[campaignId]/page.tsx
  modified:
    - types/campaign.ts
    - app/(app)/layout.tsx
    - app/(app)/chat/page.tsx
decisions:
  - "Use UIMessage from ai SDK v6 (not Message — removed in v6) for deserializeCampaignMessages return type"
  - "CampaignList exposes refresh via onRefreshRef prop pattern — parent can trigger reload after campaign creation without state lifting"
  - "layout.tsx shares sidebarContent JSX variable between desktop aside and mobile Sheet — avoids duplication"
metrics:
  duration_minutes: 5
  completed_date: "2026-03-30T23:28:59Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 3
---

# Phase 02 Plan 02: Campaign Management — Summary

Campaign CRUD API with Supabase RLS, sidebar campaign list with date-fns recency grouping (Today/Yesterday/Last 7 days/Older), CampaignTypeSelector that POST-creates and redirects, and dynamic [campaignId] route with deserializeCampaignMessages converting DB rows to AI SDK UIMessage format.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Campaign CRUD API, query functions, and message deserialization | 8739518 | types/campaign.ts, lib/db/campaigns.ts, app/api/campaigns/route.ts |
| 2 | Sidebar campaign list, type selector, layout update, and [campaignId] route | efc3f9c | CampaignList.tsx, CampaignTypeSelector.tsx, app/(app)/layout.tsx, app/(app)/chat/page.tsx, app/(app)/chat/[campaignId]/page.tsx |

## What Was Built

**Campaign data layer (`lib/db/campaigns.ts`):**
- `getUserCampaigns` — ordered by `updated_at DESC`, limit 50
- `getCampaignWithMessages` — parallel `Promise.all` for campaign + messages
- `deserializeCampaignMessages` — converts `CampaignMessage[]` (Supabase jsonb) to AI SDK `UIMessage[]`
- `createCampaign` — inserts with `user_id`, `event_type`, `region`, `status: 'draft'`
- `updateCampaignTitle` — used by Plan 03 for auto-titling from first message

**Campaign API (`app/api/campaigns/route.ts`):**
- `GET /api/campaigns` — auth guard → returns user's campaigns
- `POST /api/campaigns` — auth guard → validates `eventType` → creates campaign → returns 201

**Sidebar (`components/campaigns/CampaignList.tsx`):**
- Client component with `useEffect` fetch on mount
- Groups by recency using `date-fns` `isToday`, `isYesterday`, `differenceInCalendarDays`
- Active campaign gets `bg-blue-50 border-l-2 border-l-[#3D8BE8]`
- Skeleton loading state, empty state message, event_type icon per campaign
- `onRefreshRef` prop for parent-triggered reload

**Campaign type selector (`components/campaigns/CampaignTypeSelector.tsx`):**
- All 9 campaign types; active types POST to `/api/campaigns`, coming-soon types `opacity-50 cursor-not-allowed`
- Inline spinner during creation, redirects to `/chat/{id}` via `useRouter`

**Layout (`app/(app)/layout.tsx`):**
- `CampaignList` replaces the old TODO placeholder
- Mobile hamburger (`Menu` from lucide-react) opens shadcn `Sheet` overlay with full sidebar content
- Shared `sidebarContent` JSX renders identically in desktop `<aside>` and mobile Sheet

**Chat entry (`app/(app)/chat/page.tsx`):**
- Simplified Server Component rendering `CampaignTypeSelector` with "Start a New Campaign" heading

**Campaign thread (`app/(app)/chat/[campaignId]/page.tsx`):**
- Server Component: `getCampaignWithMessages` → `deserializeCampaignMessages` → pass `initialMessages` as props
- Redirects to `/chat` if campaign not found
- Placeholder UI with message count; `ChatInterface` component wired in Plan 03

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] types/campaign.ts had wrong Campaign interface**
- **Found during:** Task 1
- **Issue:** Existing `types/campaign.ts` had the old pre-migration interface (`name`, `course`, `date`, `location`, `audience`, `imageUrl`) instead of matching the Supabase schema
- **Fix:** Replaced with schema-matching interface (`id`, `user_id`, `title`, `status`, `region`, `event_type`, `share_token`, `created_at`, `updated_at`) and added `CampaignMessage` interface
- **Files modified:** `types/campaign.ts`
- **Commit:** 8739518

**2. [Rule 1 - Bug] AI SDK v6 removed `Message` export, uses `UIMessage`**
- **Found during:** Task 1, TypeScript check
- **Issue:** Plan spec used `Message` from `ai` SDK but AI SDK v6 exports `UIMessage` not `Message`
- **Fix:** Changed import and all type references to `UIMessage`
- **Files modified:** `lib/db/campaigns.ts`
- **Commit:** 8739518

## Self-Check

Verifying all claimed files exist and commits are real:

- [x] `lib/db/campaigns.ts` — created
- [x] `app/api/campaigns/route.ts` — created
- [x] `components/campaigns/CampaignList.tsx` — created
- [x] `components/campaigns/CampaignTypeSelector.tsx` — created
- [x] `app/(app)/chat/[campaignId]/page.tsx` — created
- [x] `types/campaign.ts` — modified
- [x] `app/(app)/layout.tsx` — modified
- [x] `app/(app)/chat/page.tsx` — modified
- [x] Commit 8739518 — Task 1
- [x] Commit efc3f9c — Task 2
