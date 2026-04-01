---
phase: 02-chat-core
plan: 05
subsystem: chat, infra
tags: [streaming, ai-sdk, error-handling, deployment, prompt-engineering]

requires:
  - phase: 02-chat-core plans 00-04
    provides: AI SDK, orchestrator, chat UI, rich parts, campaign management
provides:
  - Error handling with inline retry for all chat operations
  - Loading states and skeleton renderers during streaming
  - 17 passing tests covering chat API, orchestrator, persistence, campaigns
  - Production deployment at staging.amplifyaol.com with all 4 AI provider keys
  - chat.orchestrate prompt v3 with writing craft principles from 4 books
  - @tailwindcss/typography for proper markdown rendering
affects: [phase-3-content-pipeline, all-subsequent-phases]

tech-stack:
  added:
    - "@tailwindcss/typography (markdown prose rendering)"
    - "@ai-sdk/react 3.0.143 (useChat hook)"
  patterns:
    - UIMessage to ModelMessage conversion in orchestrator
    - Prompt versioning via Supabase (v1→v2→v3 with is_active flag)

key-files:
  created: []
  modified:
    - lib/ai/orchestrator.ts (UIMessage→ModelMessage converter added)
    - app/api/chat/route.ts (UIMessage parts extraction for persistence)
    - components/chat/ChatInput.tsx (tone selector removed)
    - components/chat/parts/TextPart.tsx (prose styling improved)
    - components/chat/MessageBubble.tsx (bubble styling improved)
    - tailwind.config.ts (@tailwindcss/typography plugin added)

key-decisions:
  - "UIMessage→ModelMessage conversion required — AI SDK v6 useChat sends parts[], streamText expects content string"
  - "Tone selector removed from UI — prompt v3 handles tone naturally based on context"
  - "chat.orchestrate prompt v3 seeded with writing craft from 4 books (Copywriter's Handbook, Writing Tools, Elements of Style, TED Talk)"
  - "Anti-AI-slop word ban added to prompt: unlock, transform, journey, empower, elevate, harness, leverage"
  - "Program knowledge (Happiness Program, Sahaj Samadhi, Yoga, Sleep Protocol) embedded in system prompt"
  - "Gurudev quotes must be verbatim — never paraphrased — introduced with context not name drops"
  - "@tailwindcss/typography was missing — all prose-* classes were silently ignored, causing flat text rendering"
  - "Next.js downgraded from 16 to 15.5 in Phase 1 — middleware.ts works correctly with @supabase/ssr on 15.5"

patterns-established:
  - "Prompt versioning: deactivate old version (is_active=false), insert new version with incremented version number"
  - "AI SDK v6: useChat sends UIMessage[], route must convert to ModelMessage[] before streamText"
  - "Supabase prompt cache: 5-minute TTL, redeploy clears cache (new serverless instance)"

requirements-completed: [INFRA-07, CHAT-04, CHAT-05, CHAT-10]

duration: 180min
completed: 2026-03-31
---

# Phase 2: Chat Core — Integration Verification Summary

**Deployed streaming chat to staging with multi-model orchestration, 17 passing tests, and a v3 system prompt informed by 4 copywriting/communication books plus deep Art of Living program knowledge.**

## What Was Done

### Task 1: Error handling, loading states, and tests
- Error banner with "Try Again" in chat interface
- Loading skeleton during streaming responses
- 17 tests implemented across 4 test files (chat API, orchestrator, persistence, campaigns)
- All tests passing with `pnpm test -- --run`

### Task 2: Human verification (checkpoint passed)
- Deployed to staging.amplifyaol.com with all 4 AI provider API keys
- Google OAuth flow working end-to-end
- Campaign creation, sidebar list, and thread resumption verified
- Streaming chat with Claude Sonnet verified
- Mobile layout at 375px verified

### Post-Checkpoint Fixes (during verification)
1. **ModelMessage schema error**: AI SDK v6 useChat sends UIMessage[] (parts array), but streamText expects ModelMessage[] (content string). Added `toModelMessages()` converter in orchestrator.
2. **Prompt quality**: Seeded chat.orchestrate v1→v2→v3 with progressively richer content:
   - v1: Basic Amplify personality
   - v2: Deep program knowledge (Happiness Program, Sahaj Samadhi, Yoga, Sleep Protocol), Gurudev quote guidelines, 7-dimension research approach
   - v3: Writing craft principles from 4 books (Copywriter's Handbook, Writing Tools, Elements of Style, TED Talk), anti-AI-slop word ban, "speak WITH not AT" principle
3. **Tone selector removed**: Removed from both prompt and UI — AI handles tone naturally
4. **Markdown not rendering**: @tailwindcss/typography plugin was missing — all prose-* classes were silently ignored. Installed and configured.
5. **Text rendering**: Improved TextPart with proper heading hierarchy, list indentation, blockquote styling, code blocks, and 15px/1.6 line-height

## Self-Check: PASSED

- [x] Error handling shows inline retry
- [x] Streaming responses render progressively
- [x] 17 tests pass (`pnpm test -- --run`)
- [x] Staging deployed with AI provider keys
- [x] Markdown renders with headers, bullets, blockquotes
- [x] Campaign sidebar groups by recency
- [x] Chat input has mic, attach, send/stop (tone selector removed)
