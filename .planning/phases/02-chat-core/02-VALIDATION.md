---
phase: 2
slug: chat-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (installed in Phase 1) |
| **Config file** | vitest.config.ts (exists from Phase 1) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | W0 | 0 | - | config | `pnpm test -- --run` | vitest.config.ts | ⬜ pending |
| 02-01-01 | 01 | 1 | INFRA-02 | unit | `pnpm test -- orchestrator` | tests/ai/orchestrator.test.ts | ⬜ pending |
| 02-01-02 | 01 | 1 | CHAT-01 | integration | `pnpm test -- chat` | tests/chat/api.test.ts | ⬜ pending |
| 02-02-01 | 02 | 2 | CHAT-02 | unit | `pnpm test -- streaming` | tests/chat/streaming.test.ts | ⬜ pending |
| 02-02-02 | 02 | 2 | CHAT-03 | unit | `pnpm test -- parts` | tests/chat/parts.test.ts | ⬜ pending |
| 02-03-01 | 03 | 2 | CHAT-08 | integration | `pnpm test -- campaigns` | tests/campaigns/persistence.test.ts | ⬜ pending |
| 02-03-02 | 03 | 2 | CHAT-09 | integration | `pnpm test -- campaigns` | tests/campaigns/resume.test.ts | ⬜ pending |
| 02-04-01 | 04 | 3 | CHAT-10 | config | `pnpm build` | N/A | ⬜ pending |
| 02-04-02 | 04 | 3 | INFRA-07 | unit | `pnpm test -- error` | tests/chat/error-handling.test.ts | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] AI SDK packages installed and importable
- [ ] Test stubs for CHAT-01, CHAT-02, CHAT-03, CHAT-08, CHAT-09, INFRA-02
- [ ] Orchestrator mock helper for multi-model testing

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Streaming tokens visible in real time | CHAT-02 | Requires browser rendering | Send message, verify tokens appear progressively |
| Stop mid-stream works | CHAT-04 | Requires browser interaction | Click stop during streaming, verify partial content kept |
| Rich content renders inline | CHAT-03 | Visual verification | Send research/copy trigger, verify cards render in chat |
| Mobile layout at 375px | CHAT-10 | Responsive visual check | Open DevTools, set 375px viewport, verify usability |
| Voice dictation input | CHAT-01 | Requires microphone | Click mic button, speak, verify text appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
