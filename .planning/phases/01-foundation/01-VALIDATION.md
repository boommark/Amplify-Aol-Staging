---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (or jest 29.x — TBD by planner) |
| **Config file** | none — Wave 0 installs |
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
| 01-01-01 | 01 | 1 | AUTH-01 | integration | `pnpm test -- auth` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-02 | integration | `pnpm test -- session` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | AUTH-03 | unit | `pnpm test -- roles` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | AUTH-04 | integration | `pnpm test -- rls` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | AUTH-05 | unit | `pnpm test -- admin` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 1 | AUTH-06 | integration | `pnpm test -- redirect` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | INFRA-01 | integration | `pnpm test -- prompts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | INFRA-03 | integration | `pnpm test -- rls` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | INFRA-04 | unit | `pnpm test -- s3` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 1 | INFRA-05 | config | manual verify | N/A | ⬜ pending |
| 01-03-03 | 03 | 1 | INFRA-06 | config | manual verify | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test framework (vitest or jest) installed and configured
- [ ] `tests/` directory with shared fixtures for Supabase client mocking
- [ ] Test stubs for AUTH-01 through AUTH-06
- [ ] Test stubs for INFRA-01, INFRA-03, INFRA-04

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
