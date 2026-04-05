---
phase: 04-creative-studio-and-campaign
plan: "03"
subsystem: campaigns
tags: [campaign-browser, search-filter, copy-clipboard, image-download, tdd]
dependency_graph:
  requires:
    - app/api/campaigns/route.ts
    - lib/db/assets.ts
    - lib/supabase/server.ts
    - types/campaign.ts
  provides:
    - app/(app)/campaigns/page.tsx
    - components/campaigns/CampaignBrowser.tsx
    - app/api/campaigns/[id]/assets/route.ts
  affects:
    - app/api/campaigns/route.ts (enriched with thumbnail_url, asset_count)
    - vitest.config.ts (React JSX plugin added)
tech_stack:
  added:
    - happy-dom (vitest browser environment)
    - "@testing-library/react (component rendering tests)"
    - "@vitejs/plugin-react (JSX support in vitest)"
  patterns:
    - Exported pure function for unit-testable filtering logic
    - TDD red-green cycle with happy-dom environment
    - Server component page + client component pattern
key_files:
  created:
    - app/(app)/campaigns/page.tsx
    - components/campaigns/CampaignBrowser.tsx
    - app/api/campaigns/[id]/assets/route.ts
    - tests/campaigns/browser.test.ts
  modified:
    - app/api/campaigns/route.ts
    - vitest.config.ts
    - package.json / pnpm-lock.yaml
decisions:
  - filterCampaigns exported as pure function to enable direct unit testing without React render
  - happy-dom chosen as vitest environment for browser API tests (navigator.clipboard, document)
  - "@vitejs/plugin-react added to vitest config to support JSX in .tsx test imports"
  - Assets API route created at /api/campaigns/[id]/assets — was missing; required for detail view
metrics:
  duration: 6 minutes
  completed_date: "2026-04-05"
  tasks_completed: 1
  files_created: 4
  files_modified: 3
---

# Phase 04 Plan 03: Campaign Browser Summary

**One-liner:** Campaign browser with card grid, text/event-type filtering, per-channel asset detail with copy-to-clipboard and image download, backed by 9 behavioral tests.

## What Was Built

### `app/(app)/campaigns/page.tsx`
Server component shell that renders the `CampaignBrowser` client component within a max-w-6xl container.

### `components/campaigns/CampaignBrowser.tsx`
Full-featured `'use client'` component providing:
- **filterCampaigns()** — exported pure function with case-insensitive search by title/region and exact event_type matching
- **Card grid** — responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with thumbnail (s3_url of first ad_creative), region, event_type, date (date-fns format), asset count badge
- **Search + filter bar** — text input and event type select dropdown (6 AoL program types)
- **Campaign detail view** — per-channel sections (email, whatsapp, instagram, facebook, flyer) with copy assets (CopyButton with 2s "Copied!" toast) and image assets (download anchor with filename `channel-assettype.png`)
- Loading skeleton states for both grid and detail views

### `app/api/campaigns/[id]/assets/route.ts`
New GET endpoint returning all `campaign_assets` rows for a campaign, ordered by `created_at`. Auth-gated; returns 401 for unauthenticated requests.

### `app/api/campaigns/route.ts`
Enriched GET handler — adds `thumbnail_url` (first `ad_creative` s3_url per campaign) and `asset_count` (total `campaign_assets` rows) via `Promise.all` per campaign.

### `tests/campaigns/browser.test.ts`
9 behavioral tests in `happy-dom` environment:
- 5 `filterCampaigns` unit tests (region search, event type, combined, empty, title)
- 2 `CampaignBrowser` render tests (grid-cols class, search input)
- 2 asset action tests (clipboard.writeText call, download href/attribute)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @vitejs/plugin-react to vitest config for JSX support**
- **Found during:** GREEN phase — importing CampaignBrowser.tsx in tests caused "invalid JS syntax" (JSX not transformed)
- **Fix:** Added `import react from '@vitejs/plugin-react'` and `plugins: [react()]` to `vitest.config.ts`
- **Files modified:** `vitest.config.ts`, `package.json`, `pnpm-lock.yaml`
- **Commit:** 71a1f4f

**2. [Rule 2 - Missing critical] Installed happy-dom and @testing-library/react dev dependencies**
- **Found during:** RED phase — `// @vitest-environment happy-dom` annotation requires the package
- **Fix:** `pnpm add -D happy-dom @testing-library/react @testing-library/dom`
- **Commit:** 71a1f4f

**3. [Rule 2 - Missing] Removed `JSDOM` direct import from test — used native `document` API instead**
- **Found during:** Test refactor — initial test used `require('happy-dom')` which isn't needed in happy-dom environment
- **Fix:** Used `document.createElement('a')` directly since happy-dom environment exposes it natively
- **Commit:** 71a1f4f

## Self-Check: PASSED

Files created:
- `app/(app)/campaigns/page.tsx` — FOUND
- `components/campaigns/CampaignBrowser.tsx` — FOUND
- `app/api/campaigns/[id]/assets/route.ts` — FOUND
- `tests/campaigns/browser.test.ts` — FOUND

Commits:
- `7cd07ea` — test(04-03): add failing tests for campaign browser filter and render — FOUND
- `71a1f4f` — feat(04-03): campaign browser page with card grid, search, filter, and asset detail — FOUND

Tests: 9/9 passing (`npm run test -- tests/campaigns/browser.test.ts`)
