---
phase: 02-chat-core
plan: 04
subsystem: ui
tags: [react, react-markdown, remark-gfm, embla-carousel, lucide-react, tailwind, typescript]

# Dependency graph
requires:
  - phase: 02-chat-core plan 00
    provides: AmplifyDataParts and AmplifyUIMessage type definitions in types/message.ts
  - phase: 02-chat-core plan 01
    provides: useAmplifyChat hook and campaign chat infrastructure
provides:
  - TextPart: react-markdown renderer with remark-gfm for streaming text
  - ResearchCard: expandable card with blue left accent border, 300ms transition
  - CopyBlock: channel-native preview frames for WhatsApp, Instagram, Email, Facebook
  - ImageCarousel: horizontal swipe carousel with embla-carousel-react, tap-to-select
  - AdPreview: orientation-aware ad preview with orientation badge
  - SkeletonPart: pulsing skeleton placeholders for loading states
  - ActionChips: pill-shaped contextual suggestion buttons with hover-to-blue transition
  - MessageBubble: unified message renderer routing UIMessage parts to specialized components
affects: [03-output-pipeline, 04-canva-integration]

# Tech tracking
tech-stack:
  added: [remark-gfm]
  patterns:
    - UIMessage parts-based rendering — switch on part.type for discriminated union routing
    - Channel-native preview frames — distinct visual containers per social channel
    - Embla carousel with dragFree option — horizontal swipe image grid
    - Loading skeleton pattern — SkeletonPart type prop routes to text/card/image skeletons

key-files:
  created:
    - components/chat/parts/TextPart.tsx
    - components/chat/parts/ResearchCard.tsx
    - components/chat/parts/CopyBlock.tsx
    - components/chat/parts/ImageCarousel.tsx
    - components/chat/parts/AdPreview.tsx
    - components/chat/parts/SkeletonPart.tsx
    - components/chat/ActionChips.tsx
    - components/chat/MessageBubble.tsx
  modified:
    - package.json (remark-gfm added)
    - pnpm-lock.yaml

key-decisions:
  - "UIMessage in AI SDK v6 has no content field — text is extracted from parts array (type=text)"
  - "useEmblaCarousel takes EmblaOptionsType directly (not as an array) — fixed from plan spec"
  - "ReactMarkdown className prop removed in v6 — wrapping div carries prose classes instead"

patterns-established:
  - "All part renderers check status=loading and render SkeletonPart before content"
  - "CopyBlock routes to dedicated sub-components (WhatsAppFrame, InstagramFrame, EmailFrame, FacebookFrame)"
  - "MessageBubble renderDataPart switch handles all 5 AmplifyDataParts types"

requirements-completed: [CHAT-03, CHAT-06]

# Metrics
duration: 15min
completed: 2026-03-30
---

# Phase 02 Plan 04: Rich Chat Part Renderers Summary

**8 React components building channel-native WhatsApp/Instagram/Email/Facebook preview frames, embla swipe carousel with tap-to-select, expandable research cards with blue accent border, and discriminated-union part routing in MessageBubble**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-30T23:33:26Z
- **Completed:** 2026-03-30T23:48:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- 6 typed part renderer components covering all AmplifyDataParts variants (research-card, copy-block, image-carousel, ad-preview, skeleton, text)
- Channel-native copy preview frames: WhatsApp phone frame with green bubbles, Instagram post card with gradient avatar, email client with From/To/Subject headers, Facebook post with engagement bar
- ImageCarousel using embla-carousel-react with dragFree swipe + tap-to-select ring highlighting
- MessageBubble routes UIMessage.parts via switch statement to all 5 data part types + text; falls back to react-markdown for plain text

## Task Commits

Each task was committed atomically:

1. **Task 1: Rich content part renderers** - `b8d8de1` (feat)
2. **Task 2: ActionChips and MessageBubble routing** - `e2e8ad1` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `components/chat/parts/TextPart.tsx` - react-markdown + remark-gfm prose renderer
- `components/chat/parts/ResearchCard.tsx` - expandable card with border-l-[#3D8BE8] accent and 300ms transition
- `components/chat/parts/CopyBlock.tsx` - WhatsApp/Instagram/Email/Facebook channel-native frames
- `components/chat/parts/ImageCarousel.tsx` - embla horizontal swipe with tap-to-select ring-[#3D8BE8]
- `components/chat/parts/AdPreview.tsx` - square/vertical/horizontal orientation with bg-black/50 badge
- `components/chat/parts/SkeletonPart.tsx` - animate-pulse bg-[#F3F4F6] for text/card/image shapes
- `components/chat/ActionChips.tsx` - pill buttons with hover:border-[#3D8BE8] hover:text-[#3D8BE8]
- `components/chat/MessageBubble.tsx` - UIMessage parts router with switch on data-* part types
- `package.json` - added remark-gfm
- `pnpm-lock.yaml` - lockfile update

## Decisions Made

- **UIMessage.content removed in AI SDK v6**: The plan spec used `message.content` for user bubble text, but AI SDK v6 UIMessage has no `content` field — only `parts`. Text is extracted by filtering parts where `type === 'text'`. Fixed inline per deviation Rule 1.
- **useEmblaCarousel options format**: Plan spec passed options as an array `[{ dragFree: true }]`, but the actual embla-carousel-react v8 API takes `EmblaOptionsType` directly. Fixed per deviation Rule 1.
- **ReactMarkdown className prop**: react-markdown v9+ removed top-level className on the component. Wrapped with a `<div className="prose prose-sm prose-slate max-w-none">` instead. Fixed per deviation Rule 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed UIMessage.content access — field does not exist in AI SDK v6**
- **Found during:** Task 2 (MessageBubble implementation)
- **Issue:** Plan referenced `message.content` for fallback text rendering; AI SDK v6 UIMessage only has `parts` array
- **Fix:** Extract text by filtering `message.parts` for `type === 'text'` entries and joining their `.text` values
- **Files modified:** `components/chat/MessageBubble.tsx`
- **Verification:** TypeScript compilation passes with no errors in chat/ files
- **Committed in:** e2e8ad1

**2. [Rule 1 - Bug] Fixed useEmblaCarousel options — array form rejected by type system**
- **Found during:** Task 1 (ImageCarousel implementation)
- **Issue:** Plan specified `useEmblaCarousel([{ dragFree: true }])` but API takes options directly as `EmblaOptionsType`
- **Fix:** Changed to `useEmblaCarousel({ dragFree: true })`
- **Files modified:** `components/chat/parts/ImageCarousel.tsx`
- **Verification:** TypeScript compilation passes; no chat/ errors
- **Committed in:** b8d8de1

**3. [Rule 1 - Bug] Fixed ReactMarkdown className prop — removed in v9+**
- **Found during:** Task 1 (TextPart implementation)
- **Issue:** `className` is not a valid prop on ReactMarkdown in react-markdown v9+
- **Fix:** Wrapped `<ReactMarkdown>` in `<div className="prose prose-sm prose-slate max-w-none">`
- **Files modified:** `components/chat/parts/TextPart.tsx`
- **Verification:** TypeScript compilation passes
- **Committed in:** b8d8de1

---

**Total deviations:** 3 auto-fixed (all Rule 1 - Bug: API signature mismatches between plan spec and installed package versions)
**Impact on plan:** All auto-fixes required for TypeScript correctness. No scope changes or new features added.

## Issues Encountered

None beyond the 3 API signature mismatches documented above. All resolved inline.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 8 components ready for integration into ChatInterface (Plan 03 will wire them into the full chat UI)
- MessageBubble accepts `onChipSelect` and `onRegenerate` props for parent-controlled callbacks
- Part renderers are stateless and typed — ready for streaming UIMessage data from the AI route

---
*Phase: 02-chat-core*
*Completed: 2026-03-30*
