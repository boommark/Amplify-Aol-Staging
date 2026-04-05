---
phase: 4
slug: creative-studio-and-campaign
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-00-01 | 00 | 0 | ADS-01..05, CAMP-02..05 | setup | `npm run test` | N/A | ⬜ pending |
| 04-01-01 | 01 | 1 | ADS-01, ADS-02, ADS-03 | unit | `npm run test -- tests/pipeline/ad-creative` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | ADS-01, ADS-06 | unit | `npm run test -- tests/pipeline/ad-creative` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | ADS-04, ADS-07 | integration | `npm run test -- tests/components/copy-block` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | ADS-04, ADS-05 | integration | `npm run test -- tests/pipeline/image-refinement` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 1 | CAMP-01, CAMP-02, CAMP-03 | unit | `npm run test -- tests/campaigns/browser` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | CAMP-04 | unit | `npm run test -- tests/api/export` | ❌ W0 | ⬜ pending |
| 04-04-02 | 04 | 2 | CAMP-05 | integration | `npm run test -- tests/api/share` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/pipeline/ad-creative-image.test.ts` — stubs for ADS-01, ADS-02, ADS-03
- [ ] `tests/components/copy-block-image.test.tsx` — stubs for ADS-04
- [ ] `tests/pipeline/image-refinement.test.ts` — stubs for ADS-05
- [ ] `tests/api/campaign-browser.test.ts` — stubs for CAMP-02, CAMP-03
- [ ] `tests/api/campaign-export.test.ts` — stubs for CAMP-04
- [ ] `tests/api/campaign-share.test.ts` — stubs for CAMP-05

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Image quality/relevance | ADS-07 | Subjective visual quality | Generate images for each workshop type x flavor, visually confirm relevance and brand alignment |
| Channel frame rendering | ADS-04 | Visual layout verification | Open chat, generate creatives, confirm images render correctly in each channel frame |
| Flavor toggle UX | ADS-02 | Interaction verification | Switch between Warm Realism and Playful Concept, confirm images regenerate |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
