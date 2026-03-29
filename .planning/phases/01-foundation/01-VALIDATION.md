---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
---

# Phase 1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (created by Plan 00) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-00-01 | 00 | 0 | - | config | `pnpm test -- --run` | vitest.config.ts | ⬜ pending |
| 01-00-02 | 00 | 0 | - | stubs | `pnpm test -- --run` | tests/ | ⬜ pending |
| 01-01-01 | 01 | 1 | INFRA-03 | integration | `pnpm test -- auth` | tests/auth/allowlist.test.ts | ⬜ pending |
| 01-01-02 | 01 | 1 | INFRA-03 | integration | `pnpm test -- session` | tests/auth/middleware.test.ts | ⬜ pending |
| 01-02-01 | 02 | 2 | AUTH-01 | integration | `pnpm test -- auth` | tests/auth/allowlist.test.ts | ⬜ pending |
| 01-02-02 | 02 | 2 | AUTH-03 | unit | `pnpm test -- roles` | tests/auth/assign-role.test.ts | ⬜ pending |
| 01-02-03 | 02 | 2 | AUTH-05 | unit | `pnpm test -- admin` | tests/auth/middleware.test.ts | ⬜ pending |
| 01-02-04 | 02 | 2 | AUTH-06 | integration | `pnpm test -- redirect` | tests/auth/middleware.test.ts | ⬜ pending |
| 01-03-01 | 03 | 2 | INFRA-04 | unit | `pnpm test -- s3` | tests/s3/presigned-url.test.ts | ⬜ pending |
| 01-04-01 | 04 | 2 | INFRA-01 | integration | `pnpm test -- prompts` | tests/prompts/registry.test.ts | ⬜ pending |
| 01-05-01 | 05 | 3 | AUTH-04 | integration | `pnpm build 2>&1 \| tail -5` | N/A | ⬜ pending |
| 01-05-02 | 05 | 3 | INFRA-06 | config | `curl -s -o /dev/null -w "%{http_code}" https://staging.amplifyaol.com/login` | N/A | ⬜ pending |

*Status: ⬜ pending . ✅ green . ❌ red . ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Test framework (vitest) installed and configured — Plan 01-00, Task 1
- [x] `tests/` directory with shared fixtures for Supabase client mocking — Plan 01-00, Task 2
- [x] Test stubs for AUTH-01, AUTH-03, AUTH-05, AUTH-06 — Plan 01-00, Task 2
- [x] Test stubs for INFRA-01, INFRA-04 — Plan 01-00, Task 2

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth redirect flow | AUTH-01 | Requires real browser + Google consent screen | Sign in via staging URL, verify redirect to /chat |
| Session persistence across tabs | AUTH-02 | Requires multi-tab browser behavior | Open staging in two tabs, verify both authenticated |
| Staging deployment live | INFRA-06 | Requires Vercel deployment verification | Visit staging.amplifyaol.com, verify login page loads |
| Fluid Compute active | INFRA-05 | Requires Vercel dashboard check | Verify `maxDuration: 300` in Vercel function settings |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
