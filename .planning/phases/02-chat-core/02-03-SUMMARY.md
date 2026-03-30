---
phase: 02-chat-core
plan: 03
subsystem: ui
tags: [react, ai-sdk-v6, useChat, streaming, chat-ui, voice-dictation, auto-title, lucide, shadcn, date-fns, react-markdown]

# Dependency graph
requires:
  - phase: 02-chat-core
    provides: "app/api/chat/route.ts streaming endpoint (toUIMessageStreamResponse), lib/db/campaigns.ts (getCampaignWithMessages, deserializeCampaignMessages, updateCampaignTitle), types/message.ts (AmplifyUIMessage, AmplifyDataParts)"
provides:
  - "hooks/useAmplifyChat.ts: AI SDK v6 useChat wrapper with DefaultChatTransport, tone state, auto-title trigger"
  - "hooks/useVoiceDictation.ts: Web Speech API wrapper with isListening/start/stop/isSupported"
  - "lib/ai/auto-title.ts: generateCampaignTitle using generateObject with claude-haiku-4-5"
  - "app/api/campaigns/title/route.ts: POST endpoint for campaign title generation"
  - "components/chat/ChatLayout.tsx: full-height flex layout with scrollable area + sticky input"
  - "components/chat/MessageList.tsx: scrollable list with auto-scroll, empty state, last-user-message tracking"
  - "components/chat/MessageBubble.tsx: enhanced with edit-last-message (Pencil), regenerate (RotateCcw), timestamps, streaming indicator"
  - "components/chat/ChatInput.tsx: tone selector, auto-grow textarea, mic/attach/send/stop buttons with 44px touch targets"
  - "app/(app)/chat/[campaignId]/ChatInterface.tsx: client component orchestrating full chat with edit-resubmit flow"
  - "app/(app)/chat/[campaignId]/page.tsx: server component loading campaign + messages, rendering ChatInterface"
affects:
  - 02-chat-core
  - 03-content-generation
  - future chat UI extensions

# Tech tracking
tech-stack:
  added:
    - "@ai-sdk/react 3.0.143 — React hooks for AI SDK v6 (useChat, useCompletion)"
  patterns:
    - "AI SDK v6 useChat via DefaultChatTransport with dynamic body — tone is passed as a function () => ({ campaignId, tone: toneRef.current }) so updates are picked up per-request"
    - "Server component page + client ChatInterface pattern — page.tsx fetches data server-side, ChatInterface.tsx handles all hook logic"
    - "Edit-resubmit: onEdit truncates messages via setMessages(messages.slice(0, messageIndex)) then sets editingContent state which pre-populates ChatInput"
    - "AI SDK v6 status field ('submitted' | 'streaming' | 'ready' | 'error') used for isStreaming detection instead of v5 isLoading"
    - "sendMessage({ text }) used instead of v5 handleSubmit — ChatInput manages own input state separately"

key-files:
  created:
    - hooks/useAmplifyChat.ts
    - hooks/useVoiceDictation.ts
    - lib/ai/auto-title.ts
    - app/api/campaigns/title/route.ts
    - components/chat/ChatLayout.tsx
    - components/chat/MessageList.tsx
    - components/chat/ChatInput.tsx
    - app/(app)/chat/[campaignId]/ChatInterface.tsx
  modified:
    - components/chat/MessageBubble.tsx
    - app/(app)/chat/[campaignId]/page.tsx

key-decisions:
  - "useChat from @ai-sdk/react (not ai package) — in AI SDK v6, React hooks moved to @ai-sdk/react. Required pnpm add @ai-sdk/react."
  - "DefaultChatTransport with body as function — ensures tone changes are picked up per-request without recreating transport"
  - "ChatInput manages own textarea state — AI SDK v6 removed input/handleInputChange/handleSubmit from useChat; these are now component-local"
  - "ChatInterface.tsx as separate client file — keeps page.tsx as clean server component, avoids use-client on the data-fetching wrapper"
  - "UIMessage.parts extraction for user text — v6 UIMessage has no .content field; text lives in parts[].type=text[].text"
  - "toneRef pattern — toneRef.current synced with tone state so the transport body function always reads the latest tone"

patterns-established:
  - "AI SDK v6 chat: useChat + DefaultChatTransport(body: fn) + sendMessage({ text }) + status check"
  - "Edit-resubmit: setMessages(slice) + editingContent state + useEffect to focus textarea"
  - "Auto-title: onFinish callback in useAmplifyChat fires POST /api/campaigns/title once per new campaign"

requirements-completed: [CHAT-01, CHAT-02, CHAT-04, CHAT-05, CHAT-07, CHAT-10, CHAT-11]

# Metrics
duration: 10min
completed: 2026-03-30
---

# Phase 2 Plan 03: Chat UI Components Summary

**Streaming chat interface with blue/gray bubbles, tone selector, voice dictation, stop/regenerate/edit-resubmit, and AI SDK v6 DefaultChatTransport integration**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-30T23:33:25Z
- **Completed:** 2026-03-30T23:43:07Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Full chat UI from hooks to page: useAmplifyChat (AI SDK v6 DefaultChatTransport), voice dictation, auto-title generation endpoint
- MessageBubble enhanced with Pencil icon edit-last-message, RotateCcw regenerate button, timestamps, and streaming typing indicator
- ChatInput with auto-grow textarea (48-120px), shadcn Select tone dropdown, Mic/Paperclip/SendHorizontal/Square buttons (all 44px touch targets), Shift+Enter newline, Enter submit
- Server component page.tsx + client ChatInterface.tsx pattern keeping data fetching server-side

## Task Commits

Each task was committed atomically:

1. **Task 1: useAmplifyChat hook, voice dictation hook, and auto-title utility** - `93bd26b` (feat)
2. **Task 2: Chat UI components — layout, message list, bubbles, input bar, and campaign page** - `13fa924` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `hooks/useAmplifyChat.ts` - AI SDK v6 useChat wrapper with DefaultChatTransport, tone state, auto-title trigger
- `hooks/useVoiceDictation.ts` - Web Speech API integration with graceful fallback
- `lib/ai/auto-title.ts` - generateCampaignTitle using generateObject + claude-haiku-4-5 + Zod schema
- `app/api/campaigns/title/route.ts` - POST endpoint: auth guard, title generation, updateCampaignTitle
- `components/chat/ChatLayout.tsx` - Full-height flex column layout with sticky input
- `components/chat/MessageList.tsx` - Scrollable list with auto-scroll, empty state, last-user-message tracking for edit
- `components/chat/MessageBubble.tsx` - Enhanced with edit icon, regenerate button, timestamps, typing indicator
- `components/chat/ChatInput.tsx` - Complete input bar: tone selector, textarea, mic, attach, send/stop
- `app/(app)/chat/[campaignId]/ChatInterface.tsx` - Client component with useAmplifyChat, edit-resubmit, chip select
- `app/(app)/chat/[campaignId]/page.tsx` - Server component: loads campaign + messages, renders ChatInterface

## Decisions Made

- **`@ai-sdk/react` required:** In AI SDK v6, `useChat` moved from `ai` to `@ai-sdk/react`. Installed `@ai-sdk/react 3.0.143`. (Rule 3 — blocking)
- **DefaultChatTransport with body as function:** Tone is dynamic; wrapping body in `() => ({ campaignId, tone: toneRef.current })` ensures each request uses current tone without recreating the transport.
- **ChatInput manages textarea state:** AI SDK v6 removed `input`, `handleInputChange`, `handleSubmit` from `useChat`. These are now purely component-local state with `sendMessage({ text })` called on submit.
- **UIMessage has no .content in v6:** Text is in `parts[].type==='text'[].text`. All text extraction updated accordingly.
- **Server + client component split:** `page.tsx` stays as Server Component using `getCampaignWithMessages`, passes serializable props to `ChatInterface.tsx` (client).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @ai-sdk/react package**
- **Found during:** Task 1 (useAmplifyChat hook creation)
- **Issue:** `useChat` does not exist in the `ai` package in v6 — it moved to `@ai-sdk/react`. TypeScript error: `Module '"ai"' has no exported member 'useChat'`
- **Fix:** `pnpm add @ai-sdk/react 3.0.143`; updated import to `from '@ai-sdk/react'`
- **Files modified:** `hooks/useAmplifyChat.ts`, `package.json`, `pnpm-lock.yaml`
- **Verification:** TypeScript compilation passes with no errors in new files
- **Committed in:** 93bd26b (Task 1 commit)

**2. [Rule 1 - Bug] Updated useChat API for v6 changes**
- **Found during:** Task 1 (implementing useAmplifyChat)
- **Issue:** AI SDK v6 `useChat` has no `handleSubmit`, `input`, `handleInputChange`, `isLoading` — replaced by `sendMessage()`, `status`, `setMessages`. Also `onFinish` callback signature changed to `{ message, messages }`.
- **Fix:** Used `DefaultChatTransport` for body/api config, adapted `onFinish` to receive `{ messages }`, updated status check to `status === 'streaming' || status === 'submitted'`
- **Files modified:** `hooks/useAmplifyChat.ts`, `components/chat/ChatInput.tsx`, `app/(app)/chat/[campaignId]/ChatInterface.tsx`
- **Verification:** TypeScript passes; UI components compile cleanly
- **Committed in:** 93bd26b, 13fa924

**3. [Rule 1 - Bug] UIMessage.parts text extraction instead of .content**
- **Found during:** Task 1 (auto-title firstMessage extraction)
- **Issue:** `UIMessage` in v6 has no `.content` field — text lives in `parts[{type:'text',text:'...'}]`
- **Fix:** Extracted text via `msg.parts.filter(p => p.type === 'text').map(p => p.text).join('')`
- **Files modified:** `hooks/useAmplifyChat.ts`, `components/chat/MessageBubble.tsx`
- **Verification:** TypeScript: no `Property 'content' does not exist` errors
- **Committed in:** 93bd26b, 13fa924

---

**Total deviations:** 3 auto-fixed (2 blocking API changes, 1 bug)
**Impact on plan:** All fixes necessary to work with AI SDK v6. No scope creep. Plan intent fully preserved.

## Issues Encountered

None beyond the above deviations, all resolved automatically.

## User Setup Required

None - no external service configuration required. The `/api/campaigns/title` endpoint uses the existing `ANTHROPIC_API_KEY` env var already configured.

## Next Phase Readiness

- Full chat UI ready for Phase 3 (content generation pipeline)
- ChatInterface renders all rich content parts from `MessageBubble.tsx` (ResearchCard, CopyBlock, ImageCarousel, AdPreview, ActionChips)
- `useAmplifyChat` hook provides `sendMessage`, `stop`, `regenerate`, `setMessages` for Phase 3 action chips and multi-step flows
- Auto-title runs automatically on first AI response — sidebar can refresh by wiring `onTitleGenerated` to CampaignList
- Pre-existing TypeScript errors in `past-campaigns/`, `channel-setup/`, and `sidebar.tsx` are out of scope and deferred

## Self-Check: PASSED

All 10 files verified present. Both task commits (93bd26b, 13fa924) verified in git history.

---
*Phase: 02-chat-core*
*Completed: 2026-03-30*
