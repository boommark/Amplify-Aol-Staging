---
phase: 04-creative-studio-and-campaign
plan: "04"
subsystem: campaign-export-share
tags: [export, zip, share, public-page, admin-client, rls-bypass]
dependency_graph:
  requires: [04-03]
  provides: [campaign-zip-export, campaign-share-links]
  affects: [CampaignBrowser, campaigns-table]
tech_stack:
  added: [archiver@7.0.1, @types/archiver]
  patterns: [zip-streaming, admin-client-rls-bypass, uuid-share-token, public-page-outside-app-group]
key_files:
  created:
    - app/api/campaigns/[id]/export/route.ts
    - app/api/campaigns/[id]/share/route.ts
    - app/share/[token]/page.tsx
    - components/campaigns/ShareableCampaignView.tsx
    - tests/api/export.test.ts
    - tests/api/share.test.ts
  modified:
    - components/campaigns/CampaignBrowser.tsx
decisions:
  - "archiver npm package used for ZIP streaming — PassThrough stream piped to Web ReadableStream for Next.js Response compatibility"
  - "Share page placed outside (app) group at app/share/[token]/page.tsx — no auth middleware applies, public access by design"
  - "adminClient from lib/supabase/admin.ts used in share page to bypass RLS — share_token UUID is the access control mechanism"
  - "Share button fetches existing token on detail open via GET; POST only called when user explicitly clicks Share"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_created: 6
  files_modified: 1
  tests_added: 16
---

# Phase 04 Plan 04: Campaign ZIP Export and Shareable Links Summary

**One-liner:** ZIP export streams all campaign assets to downloadable archive; UUID share tokens generate public read-only campaign views using admin Supabase client for RLS bypass.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ZIP export API route and share token API | cae24f9 | app/api/campaigns/[id]/export/route.ts, app/api/campaigns/[id]/share/route.ts, package.json |
| 2 | Public share page, shareable view, CampaignBrowser integration, tests | 1aa5f14 | app/share/[token]/page.tsx, ShareableCampaignView.tsx, CampaignBrowser.tsx, export.test.ts, share.test.ts |

## What Was Built

### ZIP Export API (`app/api/campaigns/[id]/export/route.ts`)
- Authenticated GET endpoint — verifies campaign belongs to the requesting user
- Fetches all campaign_assets for the campaign
- Uses `archiver` to build a ZIP stream: images (PNG) fetched from S3 URL, copy text read from `asset.content` column
- Pipes archiver through Node PassThrough → Web ReadableStream for Next.js Response compatibility
- Returns `Content-Type: application/zip` with `Content-Disposition: attachment; filename="[safe-title]-assets.zip"`
- Channel-based filenames: `email-copy.txt`, `instagram-ad_creative.png`, etc.

### Share Token API (`app/api/campaigns/[id]/share/route.ts`)
- `POST`: Generates UUID share token via `randomUUID()` if none exists, or returns existing token. Returns `{ shareToken, shareUrl }`.
- `GET`: Returns current share token and URL if token exists, null shareUrl if none.
- Both routes verify campaign ownership before responding.

### Public Share Page (`app/share/[token]/page.tsx`)
- Placed outside `(app)` route group — no auth middleware wrapping, fully public
- Uses `adminClient` from `lib/supabase/admin.ts` to bypass RLS for share_token lookup
- Calls `notFound()` for invalid tokens (404 page)
- Renders `<ShareableCampaignView assets={...} />` with campaign metadata header

### ShareableCampaignView (`components/campaigns/ShareableCampaignView.tsx`)
- `'use client'` component receiving `assets: CampaignAsset[]`
- Read-only: images displayed without download button, copy shown as pre-formatted text without copy button
- Channels organized in sections matching CHANNELS order priority

### CampaignBrowser Updates
- "Download All (ZIP)" button triggers GET to export endpoint via `<a href download>`
- On detail view load, fetches existing share token via GET to show pre-existing URL
- "Share" button calls POST to generate/retrieve token; shows copyable URL input + "Copy Link" button
- `navigator.clipboard.writeText(shareUrl)` handles clipboard copy with 2-second "Copied!" feedback

## Test Coverage

16 tests across 2 test files, all passing:
- `tests/api/export.test.ts` — 7 tests: 401 unauthorized, 404 campaign not found, 404 no assets, Content-Type zip, Content-Disposition header with title, asset.content column (not metadata.content), channel-based filenames
- `tests/api/share.test.ts` — 9 tests: POST generates UUID, POST returns existing, POST 401, POST 404, GET returns shareUrl, GET returns null shareUrl, adminClient used for share page, share page renders for valid token, returns 404 for invalid token

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Package manager mismatch**
- **Found during:** Task 1
- **Issue:** `npm install archiver` failed with `Cannot read properties of null (reading 'matches')` — project has `pnpm-lock.yaml` but CLAUDE.md says npm
- **Fix:** Used `pnpm add archiver @types/archiver` which matched the existing lockfile
- **Files modified:** package.json, pnpm-lock.yaml

**2. [Rule 2 - Missing functionality] Test files were stubs, not implementations**
- **Found during:** Task 2
- **Issue:** `tests/api/campaign-export.test.ts` and `tests/api/campaign-share.test.ts` existed as `it.todo()` stubs. Plan specified `tests/api/export.test.ts` and `tests/api/share.test.ts`.
- **Fix:** Created the plan-specified files with full test implementations. The existing stub files were left in place (not modified).
- **Files created:** tests/api/export.test.ts, tests/api/share.test.ts

## Self-Check: PASSED

All 6 created files found on disk. Both commits (cae24f9, 1aa5f14) verified in git log. All 16 tests pass.
