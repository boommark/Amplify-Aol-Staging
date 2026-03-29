---
phase: 01-foundation
plan: "00"
subsystem: testing
tags: [vitest, testing, supabase, mocks, test-infrastructure]

# Dependency graph
requires: []
provides:
  - Vitest test runner configured with node environment and @ path alias
  - Reusable Supabase client mock factory (createMockSupabaseClient, mockAuthUser)
  - Test stubs for AUTH-01 (allowlist), AUTH-03 (role assignment), AUTH-05/AUTH-06 (middleware), INFRA-01 (prompt registry), INFRA-04 (S3 presigned URL)
affects: [01-01, 01-02, 01-03, 01-04, 01-05, all subsequent plans requiring test infrastructure]

# Tech tracking
tech-stack:
  added: [vitest ^4.1.2, @vitejs/plugin-react ^6.0.1]
  patterns: [test stubs with todo placeholders for Wave 0 Nyquist compliance, shared mock factory pattern for Supabase client]

key-files:
  created:
    - vitest.config.ts
    - tests/helpers/supabase-mock.ts
    - tests/auth/allowlist.test.ts
    - tests/auth/assign-role.test.ts
    - tests/auth/middleware.test.ts
    - tests/s3/presigned-url.test.ts
    - tests/prompts/registry.test.ts
  modified:
    - package.json

key-decisions:
  - "Use vitest (not jest) as test runner — aligns with Vite-based Next.js toolchain and offers faster execution"
  - "node environment (not jsdom) for all tests — auth, S3, and prompt registry are server-side concerns"
  - "Stub-first with it.todo — satisfies Nyquist Wave 0 requirement without over-specifying unbuilt behavior"

patterns-established:
  - "Pattern 1: createMockSupabaseClient() factory — pass overrides to customize per-test, never import real Supabase client in unit tests"
  - "Pattern 2: mockAuthUser(role, email) — standard test user shape with app_metadata.role for middleware and auth tests"
  - "Pattern 3: it.todo() stubs in describe blocks — stub exists before implementation so plans 01-01 through 01-05 can replace with real assertions"

requirements-completed: []

# Metrics
duration: 2min
completed: "2026-03-29"
---

# Phase 01 Plan 00: Test Infrastructure Setup Summary

**Vitest 4.1.2 installed with shared Supabase mock factory and test stubs for all AUTH and INFRA requirements (16 todo tests across 5 files, pnpm test exits 0)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T22:00:22Z
- **Completed:** 2026-03-29T22:02:37Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Vitest 4.1.2 configured with node environment, globals: true, @ path alias matching tsconfig, and tests/**/*.test.ts include glob
- Reusable createMockSupabaseClient() factory with auth, admin, and from/select/insert/update/eq/single chain mocks — any subsequent test file imports this instead of the real Supabase client
- Six test stub files scaffolded with describe blocks and it.todo() for all Wave 0 requirements: AUTH-01, AUTH-03, AUTH-05, AUTH-06, INFRA-01, INFRA-04

## Task Commits

Each task was committed atomically:

1. **Task 1: Install vitest and create test configuration** - `864c5fa` (chore)
2. **Task 2: Create Supabase mock helpers and test stubs** - `186a3d8` (feat)

## Files Created/Modified

- `vitest.config.ts` — Vitest configuration: node env, globals, @ alias, tests/**/*.test.ts glob
- `package.json` — Added test and test:watch scripts; vitest and @vitejs/plugin-react added to devDependencies
- `tests/helpers/supabase-mock.ts` — Shared mock factory: createMockSupabaseClient(overrides) and mockAuthUser(role, email)
- `tests/auth/allowlist.test.ts` — Stub for AUTH-01: email allowlist check (3 todo tests)
- `tests/auth/assign-role.test.ts` — Stub for AUTH-03: default role assignment (2 todo tests)
- `tests/auth/middleware.test.ts` — Stub for AUTH-05 and AUTH-06: route protection and admin guard (5 todo tests)
- `tests/s3/presigned-url.test.ts` — Stub for INFRA-04: S3 presigned URL generation (3 todo tests)
- `tests/prompts/registry.test.ts` — Stub for INFRA-01: prompt registry seed (3 todo tests)

## Decisions Made

- Used vitest over jest: aligns with the Vite-based toolchain already present (@vitejs/plugin-react), no additional babel transform needed
- node environment selected over jsdom: all tests in this project target server-side code (auth callbacks, S3 API routes, middleware) — jsdom not needed
- Stub-first approach (it.todo): satisfies VALIDATION.md Nyquist rule for Wave 0 without over-constraining implementation details of plans 01-01 through 01-05

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed pnpm via corepack before running install**
- **Found during:** Task 1 (vitest installation)
- **Issue:** pnpm not found in PATH; project uses pnpm-lock.yaml so pnpm is required
- **Fix:** Ran `corepack enable pnpm` to download and activate pnpm 10.33.0 via Node.js corepack
- **Files modified:** None (tooling fix)
- **Verification:** `pnpm --version` returned 10.33.0; subsequent pnpm add ran successfully
- **Committed in:** 864c5fa (Task 1 commit, indirect)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Tooling prerequisite resolved without scope changes. All deliverables match plan specification exactly.

## Issues Encountered

pnpm was not installed in the shell environment (not in nvm bin). Resolved via corepack (built into Node 24). No plan changes required.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Test infrastructure complete and verified (exit 0)
- All subsequent plans (01-01 through 01-05) can import createMockSupabaseClient from tests/helpers/supabase-mock.ts
- Plans 01-01 through 01-05 should replace it.todo() stubs with real assertions as each feature is implemented
- No blockers for Phase 1 plan execution

---
*Phase: 01-foundation*
*Completed: 2026-03-29*
