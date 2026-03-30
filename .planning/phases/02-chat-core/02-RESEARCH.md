# Phase 2: Chat Core - Research

**Researched:** 2026-03-30
**Domain:** Vercel AI SDK streaming chat, multi-model orchestration, rich inline content rendering, Next.js 15 App Router, Supabase persistence
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Chat Layout & Feel**
- Sidebar + chat layout — left sidebar with campaign list, main area is chat (builds on Phase 1 app shell)
- Sidebar collapses on mobile (375px) — hamburger menu opens sidebar as overlay
- Bubble-style messages — user messages right-aligned blue bubbles, AI messages left-aligned gray/white bubbles
- Rich inline artifacts — images, videos, channel previews all render inside chat bubbles, not in separate panels
- Channel-native previews: WhatsApp shows in phone frame with green bubbles, Instagram as a post with avatar/likes, email in client frame, flyers render as actual flyers
- Image/template selection via horizontal swipe carousel — tap to select, selected gets blue border/checkmark, shows 2-3 at a time with peek
- Visual, classy, high-fidelity design — reference: Dribbble AI chat examples with rich card rendering

**Chat Input Area**
- Text input with: tone selector (formal/casual/inspiring), attachment button, voice dictation button, stop button (appears during streaming), edit prompt capability

**Streaming & AI Provider**
- Multi-model orchestration from day one: Claude Sonnet 4.6 (copywriting + orchestration), Gemini Flash (intermediate/volume), Perplexity Sonar (research), Google Nano Banana Pro (images), Google Veo 3 (video — wire provider only, Phase 4+)
- Progressive card rendering — stream text normally, rich content appears as loading skeletons that fill in progressively
- Stop mid-stream keeps partial content + allows edit and retry
- Regenerate button below AI responses — reruns same prompt (CHAT-05)
- Contextual action chips after AI responses — 2-4 pill buttons (CHAT-06)

**Rich Content Parts**
- Research cards: expandable — compact card with dimension name + summary, click to expand full findings with sources
- Copy blocks: channel-specific high-fidelity mockups (WhatsApp phone frame, Instagram post preview, email client frame)
- Image previews: horizontal swipe carousel with tap-to-select
- Ad previews: rendered with orientation indicators (square/vertical/horizontal)
- All parts use the Vercel AI SDK UIMessage custom parts pattern (typed discriminated union)

**Thread & Campaign Management**
- Campaign type selector on "New Campaign" — shows all 9 types from existing CampaignTypeCard component
- Auto-title from first message context (e.g., "Bangalore Yoga Workshop — March 2026") — editable in sidebar
- Sidebar groups campaigns by recency: Today, Yesterday, Last 7 days, Older — each shows title + type icon + last activity
- Resume conversation: click past campaign in sidebar → load full chat history → type new message to continue
- Campaign data uses existing Supabase `campaigns` and `campaign_messages` tables with RLS

### Claude's Discretion
- Exact streaming buffer/chunk size for progressive rendering
- UIMessage part type schemas (TypeScript discriminated union structure)
- AI SDK provider initialization and configuration
- Prompt registry integration with orchestrator
- Error handling and loading state patterns
- Voice dictation implementation (Web Speech API vs external)
- Exact mobile breakpoint behaviors beyond 375px

### Deferred Ideas (OUT OF SCOPE)
- One-click publishing to email/social/WhatsApp — v2 requirement (PUB-01 through PUB-04)
- Video generation with Veo 3 — wire the provider in Phase 2 but actual video creation pipeline belongs in Phase 4+
- Cross-role visual asset catalog — Phase 4 (Campaign Management)
- WhatsApp Cloud Platform integration — v2 scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | User interacts through a conversational chat UI (no forms for primary workflow) | `useChat` hook + `app/(app)/chat/` page structure covers this |
| CHAT-02 | AI responses stream token-by-token in real time (not batch) | `streamText()` + `toDataStreamResponse()` + `useChat` streaming pattern |
| CHAT-03 | Chat renders rich inline content: research cards, copy blocks, image previews, ad previews | UIMessage custom parts + typed discriminated union + per-part components |
| CHAT-04 | User can stop a streaming response mid-generation | `useChat` exposes `stop()` function; stop button replaces send during streaming |
| CHAT-05 | User can retry/regenerate the last AI response | `useChat` `reload()` function; regenerate button below AI messages |
| CHAT-06 | Contextual suggested prompts appear after AI responses | `data-action-chips` custom part type; rendered as pill buttons post-message |
| CHAT-07 | Tone selector available (formal, casual, inspiring) that influences AI output style | Passed as extra body field in `useChat`; injected into system prompt at API layer |
| CHAT-08 | Chat history persists per user with named campaign threads | `campaign_messages` table (parts jsonb column); load on campaign open |
| CHAT-09 | User can browse past conversation threads and resume any thread | Sidebar campaign list from Supabase; `/chat/[campaignId]` dynamic route |
| CHAT-10 | Chat UI is responsive and usable at 375px mobile viewport | Mobile sidebar as Sheet overlay; chat layout uses flex column; input fixed at bottom |
| CHAT-11 | User can modify any generated content by typing follow-up instructions | Standard chat follow-up — no special mechanism, handled by conversation context |
| INFRA-02 | Multi-model routing: task-based model selection (Gemini for volume, Claude for premium, OpenAI for images) | `TASK_MODEL_MAP` in `lib/ai/models.ts`; orchestrator selects provider per task key |
| INFRA-07 | Error handling and loading states throughout all AI operations | Per-step skeletons; `onError` in `useChat`; 401 guard on `/api/chat`; retry chips |
</phase_requirements>

---

## Summary

Phase 2 installs the Vercel AI SDK (currently not in `package.json`) and wires up a streaming chat UI backed by four AI providers. The foundation from Phase 1 provides working Supabase auth, the `campaigns` and `campaign_messages` tables with RLS, 14 seeded prompts, Vercel Fluid Compute with `maxDuration=300`, and an app shell with a sidebar stub ready for the campaign list. Phase 2 fills that shell with a complete chat experience.

The central technical pattern is Vercel AI SDK v6's `UIMessage` parts system: rather than returning plain text, the `/api/chat` route streams typed parts — `text-delta` for streaming tokens, plus custom data parts for research cards, copy blocks, image carousels, and action chips. Each part type maps to one React component. The client uses `useChat` as the single source of truth for streaming state, preventing the race conditions documented in PITFALLS.md Pitfall 7.

Multi-model routing is rule-based (not AI-driven): a `TASK_MODEL_MAP` in `lib/ai/models.ts` maps task keys to provider+model pairs. In Phase 2, the orchestrator handles the "chat.orchestrate" task (Claude Sonnet 4.6 for the main conversational turn) and wires the other providers at the interface level so Phase 3 can add research and copy tasks without structural changes.

**Primary recommendation:** Install AI SDK v6 packages first, implement the `/api/chat` streaming route with text-only output, verify end-to-end streaming on Vercel staging, then progressively layer in the UIMessage part types and their rendering components.

---

## Standard Stack

### Core (Phase 2 additions — not yet installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 6.0.141 | AI SDK core — `streamText`, `createUIMessageStream`, `generateObject` | Official Vercel AI SDK v6; unified streaming interface across all providers |
| `@ai-sdk/anthropic` | 3.0.64 | Claude Sonnet 4.6 provider | Official SDK; handles auth, retry, token streaming for Anthropic models |
| `@ai-sdk/google` | 3.0.54 | Gemini Flash + Nano Banana Pro + Veo 3 provider | Official SDK; covers all Google AI Studio models in one package |
| `@ai-sdk/openai` | 3.0.49 | GPT Image provider (image generation) | Official SDK; used for ad creative images in Phase 4, wired now |
| `@ai-sdk/perplexity` | 3.0.26 | Perplexity Sonar research queries | Official SDK (not community); Sonar Pro returns grounded citations |

### Already Installed (no changes needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `react-markdown` | latest | Markdown text rendering in chat | Already in package.json |
| `zod` | ^3.24.1 | Schema validation for structured AI output | Already in package.json |
| `@tanstack/react-query` | — | NOT yet installed; needed for campaign list polling | Add in this phase |
| `embla-carousel-react` | 8.5.1 | Horizontal swipe carousel for image selection | Already in package.json — use this for image carousels |
| `date-fns` | 4.1.0 | Relative date formatting for sidebar recency groups | Already in package.json |
| `@supabase/ssr` | ^0.9.0 | Supabase client for chat route and campaign persistence | Already in package.json |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `ai` v6 (official Vercel) | LangChain.js | LangChain adds abstraction for RAG/agent graphs; overkill for direct API calls; PROJECT.md explicitly forbids it |
| `@ai-sdk/perplexity` official | Community provider | Official package exists — use it; community packages risk breaking API changes |
| `embla-carousel-react` (existing) | Custom swipe | Embla already installed; handles touch momentum, peek, keyboard, and accessibility |
| Web Speech API (native) | External voice service | Web Speech API is zero-cost, zero-dependency, works in modern browsers; use it for Phase 2 voice dictation |

**Installation (new packages only):**
```bash
pnpm add ai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/openai @ai-sdk/perplexity @tanstack/react-query
```

**Version verification (confirmed 2026-03-30):**
- `ai`: 6.0.141
- `@ai-sdk/anthropic`: 3.0.64
- `@ai-sdk/google`: 3.0.54
- `@ai-sdk/openai`: 3.0.49
- `@ai-sdk/perplexity`: 3.0.26

---

## Architecture Patterns

### Recommended File Structure (Phase 2 additions to existing project)

```
app/
├── (app)/
│   ├── layout.tsx                    # EXTEND: sidebar campaign list + mobile Sheet
│   ├── chat/
│   │   ├── page.tsx                  # REPLACE: campaign type selector → new campaign flow
│   │   └── [campaignId]/
│   │       └── page.tsx              # NEW: load history + resume thread
│   └── api/
│       ├── chat/route.ts             # NEW: streaming chat endpoint (SSE)
│       └── campaigns/
│           └── route.ts              # NEW: campaign CRUD (create, list, title update)
components/
├── chat/
│   ├── ChatLayout.tsx                # NEW: sidebar + main area, mobile-aware
│   ├── MessageList.tsx               # NEW: renders all messages with parts
│   ├── MessageBubble.tsx             # NEW: single message, routes parts by type
│   ├── ChatInput.tsx                 # NEW: tone selector + text + stop/send + voice
│   ├── ActionChips.tsx               # NEW: contextual pill buttons after AI messages
│   └── parts/
│       ├── TextPart.tsx              # NEW: streaming plain text
│       ├── ResearchCard.tsx          # NEW: expandable research dimension card
│       ├── CopyBlock.tsx             # NEW: channel preview (WhatsApp/IG/email frame)
│       ├── ImageCarousel.tsx         # NEW: swipe carousel with tap-to-select
│       ├── AdPreview.tsx             # NEW: ad with orientation badge
│       └── SkeletonPart.tsx          # NEW: loading skeleton for any part type
├── campaigns/
│   ├── CampaignList.tsx              # NEW: sidebar list grouped by recency
│   └── CampaignTypeSelector.tsx     # NEW: wraps existing CampaignSelection component
lib/
├── ai/
│   ├── orchestrator.ts              # NEW: runTask(key, input, options)
│   ├── providers.ts                 # NEW: all 4 providers initialized once
│   ├── models.ts                    # NEW: TASK_MODEL_MAP
│   └── stream-helpers.ts           # NEW: writeDataPart helpers for typed parts
├── prompts/
│   ├── registry.ts                  # NEW: load prompt from DB by key + LRU cache
│   └── renderer.ts                  # NEW: variable injection into template strings
types/
├── message.ts                       # NEW: AmplifyUIMessage with custom part union
└── campaign.ts                      # NEW: Campaign + CampaignMessage DB types
hooks/
└── useAmplifyChat.ts                # NEW: useChat wrapper with Amplify-specific options
```

### Pattern 1: AI SDK v6 Streaming with `useChat`

**What:** The route handler calls `streamText()` and returns `result.toDataStreamResponse()`. The client uses `useChat({ api: '/api/chat' })` which handles SSE parsing, state management, cancellation, and reconnection automatically.

**When to use:** All chat turns in Phase 2. This is the only correct pattern — do not use raw `fetch` + `EventSource` for streaming.

**Example:**
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300

export async function POST(req: Request) {
  // AUTH FIRST — always, before any AI call
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, campaignId, tone } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: buildSystemPrompt(tone),
    messages,
  })

  return result.toDataStreamResponse()
}

// components/chat/ChatInput.tsx (client)
'use client'
import { useChat } from '@ai-sdk/react'

const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
  api: '/api/chat',
  body: { campaignId, tone },
})
```

**Source:** https://ai-sdk.dev/docs/getting-started/nextjs-app-router

### Pattern 2: UIMessage Custom Parts for Rich Content

**What:** Extend `UIMessage` with a typed discriminated union of custom data parts. The server writes parts to the stream with `createDataStreamResponse` + `writeData`. The client reads `message.parts` and routes each part to its rendering component via a switch statement.

**When to use:** All non-text content: research cards, copy blocks, image carousels, ad previews, action chips, loading skeletons.

**Example:**
```typescript
// types/message.ts
import type { UIMessage } from 'ai'

export type AmplifyDataParts = {
  'research-card': {
    topic: string
    findings: Array<{ label: string; value: string; source?: string }>
    status: 'loading' | 'ready'
  }
  'copy-block': {
    channel: 'email' | 'whatsapp' | 'instagram' | 'facebook'
    content: string
    editableId: string
    status: 'loading' | 'ready'
  }
  'image-carousel': {
    images: Array<{ url: string; aspectRatio: '1:1' | '9:16' | '16:9'; prompt?: string }>
    selectable: boolean
    status: 'loading' | 'ready'
  }
  'ad-preview': {
    imageUrl: string
    adType: string
    orientation: 'square' | 'vertical' | 'horizontal'
    status: 'loading' | 'ready'
  }
  'action-chips': {
    chips: Array<{ label: string; prompt: string }>
  }
}

export type AmplifyUIMessage = UIMessage<never, AmplifyDataParts>

// components/chat/MessageBubble.tsx
function renderPart(part: AmplifyUIMessage['parts'][number]) {
  switch (part.type) {
    case 'text': return <TextPart text={part.text} />
    case 'data-research-card': return <ResearchCard data={part.data} />
    case 'data-copy-block': return <CopyBlock data={part.data} />
    case 'data-image-carousel': return <ImageCarousel data={part.data} />
    case 'data-action-chips': return <ActionChips chips={part.data.chips} />
    default: return null
  }
}
```

**Source:** https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data (AI SDK v6 UIMessage parts)

### Pattern 3: Rule-Based Multi-Model Routing

**What:** A static `TASK_MODEL_MAP` maps task keys to provider+model pairs. The orchestrator reads this map — zero-latency routing, no AI decision required. All four providers are initialized once at module load time.

**When to use:** Every AI call in the system. Route handlers never import provider SDKs directly.

**Example:**
```typescript
// lib/ai/models.ts
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'

export const TASK_MODEL_MAP = {
  'chat.orchestrate':      { model: anthropic('claude-sonnet-4-5') },
  'copy.premium':          { model: anthropic('claude-sonnet-4-5') },
  'copy.volume':           { model: google('gemini-2.0-flash') },
  'research.regional':     { model: perplexity('sonar-pro') },
  'image.quote':           { model: google('nano-banana-pro') },  // Phase 3+
  'image.ad-creative':     { model: openai('gpt-image-1') },      // Phase 4
  'video.ad':              { model: google('veo-3') },            // Phase 4 wire-only
} as const

// lib/ai/orchestrator.ts
export async function runStreamingTask(taskKey: keyof typeof TASK_MODEL_MAP, options: TaskOptions) {
  const config = TASK_MODEL_MAP[taskKey]
  const prompt = await promptRegistry.load(taskKey)
  const rendered = renderPrompt(prompt.template, options.variables)
  return streamText({ model: config.model, system: rendered, messages: options.messages })
}
```

### Pattern 4: Progressive Streaming with Skeleton Parts

**What:** The route opens a `createDataStreamResponse`, immediately writes a `status: 'loading'` skeleton part, then runs the AI task and replaces it with `status: 'ready'` data. The client shows a pulsing skeleton the moment the part type arrives, before data is available.

**When to use:** Research cards, copy blocks, image carousels — any part that takes >500ms to generate.

**Example:**
```typescript
// app/api/chat/route.ts — progressive pattern
import { createDataStreamResponse } from 'ai'

return createDataStreamResponse(async (stream) => {
  // 1. Immediate skeleton — user sees activity within 200ms
  stream.writeData({ type: 'research-card', status: 'loading', topic: 'Spirituality' })

  // 2. Run the actual AI task
  const result = await runTask('research.regional', { region, topic: 'spirituality' })

  // 3. Replace skeleton with real data
  stream.writeData({ type: 'research-card', status: 'ready', topic: 'Spirituality', findings: result })

  // 4. Stream the main text response
  const textResult = streamText({ model: anthropic('claude-sonnet-4-5'), messages })
  stream.merge(textResult.toDataStream())
})
```

**Source:** https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data#streaming-custom-data

### Pattern 5: Campaign Persistence — Write on Stream Close

**What:** Messages are persisted to the `campaign_messages` table only in the `onFinish` callback of `streamText`, never mid-stream. The `parts` column (jsonb) stores the fully assembled `UIMessage.parts` array. The `content` column stores the plain text for fallback.

**When to use:** Every AI response. Never write to Supabase from inside the streaming loop.

**Example:**
```typescript
const result = streamText({
  model,
  messages,
  onFinish: async ({ text, usage }) => {
    // Persist only after stream is fully complete
    await supabase.from('campaign_messages').insert({
      campaign_id: campaignId,
      role: 'assistant',
      content: text,
      parts: assembledParts,   // final UIMessage.parts array
      model: modelName,
    })
    // Also persist user message (idempotent — check if already exists)
    await persistUserMessage(supabase, campaignId, userMessage)
  }
})
```

### Pattern 6: Sidebar Recency Grouping

**What:** Load campaign list from Supabase ordered by `updated_at DESC`. Group client-side using `date-fns` `differenceInCalendarDays`. Render four sections: Today, Yesterday, Last 7 days, Older.

**When to use:** Campaign list in sidebar. Load on app shell mount, refresh after each new campaign creation.

**Example:**
```typescript
import { differenceInCalendarDays, isToday, isYesterday } from 'date-fns'

function groupCampaignsByRecency(campaigns: Campaign[]) {
  const today: Campaign[] = []
  const yesterday: Campaign[] = []
  const lastWeek: Campaign[] = []
  const older: Campaign[] = []

  for (const c of campaigns) {
    const diff = differenceInCalendarDays(new Date(), new Date(c.updated_at))
    if (isToday(new Date(c.updated_at))) today.push(c)
    else if (isYesterday(new Date(c.updated_at))) yesterday.push(c)
    else if (diff <= 7) lastWeek.push(c)
    else older.push(c)
  }
  return { today, yesterday, lastWeek, older }
}
```

### Anti-Patterns to Avoid

- **Mixing raw `fetch`/`EventSource` with `useChat`:** Race conditions guaranteed. Use `useChat` exclusively as the single source of truth for streaming state.
- **Writing to Supabase mid-stream:** Use `onFinish` callback only. Mid-stream writes produce partial/corrupted messages.
- **Parallel streaming calls for multi-step output:** Use a single stream with `createDataStreamResponse` and merge/write each part in sequence. Multiple parallel streams create client-side state corruption.
- **Passing full message history to every AI call:** Implement a 10-turn sliding window from day 1. Research stored in Supabase is NOT replayed through message history (see PITFALLS.md Pitfall 6).
- **AI routes without auth check as first line:** Auth must run before any provider SDK is touched. See PITFALLS.md Pitfall 5.
- **Importing `@ai-sdk/anthropic` directly in route handlers:** All provider calls go through `lib/ai/orchestrator.ts`. Route handlers call `runStreamingTask(key, options)`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSE streaming state management | Custom EventSource + useState append logic | `useChat` from `@ai-sdk/react` | Handles backpressure, cancellation, reconnection, deduplication |
| Streaming cancellation | AbortController wired manually | `useChat` `stop()` function | AI SDK manages the AbortController lifecycle |
| Message retry/regenerate | Custom re-fetch logic | `useChat` `reload()` function | Handles deduplication of the replaced message |
| Horizontal swipe carousel | Custom touch handler | `embla-carousel-react` (already installed) | Handles touch momentum, peek effect, keyboard nav, accessibility |
| Relative time grouping | Manual date arithmetic | `date-fns` `isToday`, `isYesterday`, `differenceInCalendarDays` (already installed) | Edge cases around midnight, timezone-aware |
| Markdown in chat responses | Custom parser | `react-markdown` (already installed) | Handles GFM, nested elements, safe rendering |
| Mobile sidebar overlay | Custom drawer | shadcn `Sheet` component (already installed via Radix) | Handles animation, focus trap, backdrop, escape key |
| Voice dictation | External speech API | Web Speech API (browser native) | Zero cost, zero dependency; `window.SpeechRecognition` in modern browsers |
| Structured AI output (research cards) | JSON parsing from text | `generateObject()` with Zod schema | Handles retries, validation, partial streaming |

**Key insight:** The AI SDK, embla-carousel, and shadcn/ui already cover 80% of the Phase 2 UI complexity. The custom work is in the part type schemas and the per-channel preview components (WhatsApp phone frame, Instagram post frame, email client frame).

---

## Common Pitfalls

### Pitfall 1: AI SDK Not Installed — Zero AI Features Work Until Packages Are Added

**What goes wrong:** The project currently has NO AI SDK packages installed (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/perplexity` are all absent from `package.json`). Wave 0 must install these before any other work begins.
**Why it happens:** Phase 1 intentionally deferred AI SDK to Phase 2.
**How to avoid:** First task in Wave 0: `pnpm add ai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/openai @ai-sdk/perplexity @tanstack/react-query`

### Pitfall 2: Streaming Race Conditions (PITFALLS.md Pitfall 7)

**What goes wrong:** Managing streaming state with `useState` + naive append causes messages to overwrite each other, and the database record differs from what was displayed.
**How to avoid:** `useChat` is the single source of truth. Database write happens in `onFinish` only.
**Warning signs:** Duplicate messages after network interruption; chat history from DB differs from what was displayed.

### Pitfall 3: Vercel Function Timeout on Complex Turns (PITFALLS.md Pitfall 1)

**What goes wrong:** The `vercel.json` was fixed in Phase 1 to `{ "functions": { "app/api/**": { "maxDuration": 300 } } }` with Fluid Compute. But if image generation or multi-step tasks are included in the Phase 2 `/api/chat` route, they can still exceed 300s for complex pipelines.
**How to avoid:** Phase 2's chat route handles only text streaming (Claude Sonnet 4.6). Image generation tasks go to separate `/api/` routes or are deferred to Phase 3. Verify `maxDuration` is still active by checking Vercel function logs.

### Pitfall 4: Context Window Exhaustion in Long Campaign Threads (PITFALLS.md Pitfall 6)

**What goes wrong:** Passing full `campaign_messages` history to every AI call. A campaign with 20 turns of back-and-forth plus rich content can exceed 32K tokens.
**How to avoid:** Implement a sliding window of the last 10 turns from the start. Store campaign context (region, event_type, tone) in the `campaigns` table and inject as system context, not as message history.

### Pitfall 5: Unprotected `/api/chat` Route (PITFALLS.md Pitfall 5)

**What goes wrong:** If the auth check is missing or placed after any AI SDK initialization, the route is exploitable for cost abuse.
**How to avoid:** Auth check is always the first two lines of every route handler.

### Pitfall 6: Mobile Sidebar Not Collapsing (CHAT-10)

**What goes wrong:** The existing `app/(app)/layout.tsx` sidebar is `hidden md:flex` — on mobile, there is currently no hamburger to open it. Phase 2 must add the mobile hamburger + Sheet overlay.
**How to avoid:** Use shadcn `Sheet` component with a `trigger` hamburger button in the mobile header. The sidebar content is the same; wrap it in `SheetContent` for mobile.

### Pitfall 7: Campaign Title Not Auto-Generated

**What goes wrong:** If the campaign is created before the first AI response, it has no title. The sidebar shows "Untitled campaign" indefinitely.
**How to avoid:** After the first AI response completes (`onFinish`), make a quick `generateObject` call to extract a campaign title from the first user message. Update the `campaigns.title` field. This is a separate lightweight Claude call — do not include it in the streaming response.

### Pitfall 8: `@ai-sdk/react` Import Path vs `ai/react`

**What goes wrong:** AI SDK v6 changed the import path for client hooks. Some tutorials show `import { useChat } from 'ai/react'` (v5 path). The v6 path is `import { useChat } from '@ai-sdk/react'` — but `@ai-sdk/react` is bundled inside the `ai` package, not a separate install.
**How to avoid:** Import as `import { useChat } from 'ai'` or `import { useChat } from '@ai-sdk/react'`. Both work in AI SDK v6. The `ai/react` subpath export also still works for backwards compatibility — but verify which path works with the installed version.

---

## Code Examples

Verified patterns from official sources and project context:

### Streaming Route Handler (minimal, authenticated)

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, campaignId, tone = 'inspiring' } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: `You are Amplify, an AI marketing copilot for Art of Living teachers.
Tone: ${tone}. Be calm, uplifting, Grade 8 reading level. No hashtags, emojis, or exclamation marks.`,
    messages,
    onFinish: async ({ text }) => {
      await supabase.from('campaign_messages').insert({
        campaign_id: campaignId,
        role: 'assistant',
        content: text,
        parts: [{ type: 'text', text }],
      })
    }
  })

  return result.toDataStreamResponse()
}
```

Source: https://ai-sdk.dev/docs/getting-started/nextjs-app-router

### `useChat` Integration in Chat Page

```typescript
// components/chat/ChatInput.tsx
'use client'
import { useChat } from 'ai'  // or '@ai-sdk/react'

export function ChatInterface({ campaignId }: { campaignId: string }) {
  const [tone, setTone] = useState<'formal' | 'casual' | 'inspiring'>('inspiring')

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat',
    body: { campaignId, tone },
    initialMessages: [],   // loaded separately from Supabase
  })

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <div className="flex gap-2 p-4 border-t">
        <ToneSelector value={tone} onChange={setTone} />
        <input value={input} onChange={handleInputChange} className="flex-1" />
        {isLoading
          ? <button onClick={stop}>Stop</button>
          : <button onClick={handleSubmit}>Send</button>
        }
      </div>
    </div>
  )
}
```

### Campaign List Query with Recency Grouping

```typescript
// lib/db/campaigns.ts
import { createClient } from '@/lib/supabase/server'

export async function getUserCampaigns(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('id, title, event_type, status, updated_at, created_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50)
  return data ?? []
}
```

### Auto-Title Generation (post-stream)

```typescript
// lib/ai/auto-title.ts
import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export async function generateCampaignTitle(firstUserMessage: string): Promise<string> {
  const { object } = await generateObject({
    model: anthropic('claude-haiku-3-5'),  // lightweight model for simple extraction
    schema: z.object({ title: z.string().max(60) }),
    prompt: `Generate a concise campaign title (max 60 chars) from this message: "${firstUserMessage}".
Example format: "Bangalore Yoga Workshop — March 2026"`,
  })
  return object.title
}
```

### Mobile Sidebar as Sheet

```typescript
// components/chat/ChatLayout.tsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export function ChatLayout({ sidebar, children }: Props) {
  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r">{sidebar}</aside>

      {/* Mobile header + Sheet */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-2 p-3 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <button><Menu className="w-5 h-5" /></button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">{sidebar}</SheetContent>
          </Sheet>
          <span className="font-bold" style={{ color: '#3D8BE8' }}>Amplify</span>
        </div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
```

### Voice Dictation (Web Speech API)

```typescript
// hooks/useVoiceDictation.ts
export function useVoiceDictation(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return  // graceful fallback

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e) => onResult(e.results[0][0].transcript)
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
    return recognition
  }

  return { isListening, start }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ai/react` import path | `ai` or `@ai-sdk/react` import | AI SDK v6 (Dec 2025) | Minor — subpath still works but canonical path changed |
| `useChat` text-only `content` | `useChat` with `message.parts` array | AI SDK v6 | Parts are the primary model; `content` is deprecated fallback |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` v0.9.x | 2024 | auth-helpers is end-of-life; project already uses ssr (confirmed) |
| Next.js 16 edge middleware | Next.js 15.5 + standard middleware | Phase 1 discovery | Next.js 16 broke `@supabase/ssr`; project downgraded to 15.5 (STAY on 15.5) |
| `tailwind.config.js` v3 patterns | Still using v3 (`tailwind.config.ts` exists) | Phase 1 kept v3 | Do NOT upgrade to Tailwind v4 in this phase — existing shadcn setup is v3 |
| Custom streaming with `ReadableStream` | `streamText().toDataStreamResponse()` | AI SDK v5+ | SDK handles all stream protocol, chunking, reconnection |

**Deprecated/outdated (confirmed):**
- `@supabase/auth-helpers-nextjs`: End-of-life. Project correctly uses `@supabase/ssr`. Do not add it.
- `useCompletion` hook: For single-turn text completion only. Use `useChat` for conversation.
- Next.js 16: Downgraded in Phase 1. Do not upgrade in Phase 2.
- Tailwind v4: Phase 1 kept v3. Do not upgrade in Phase 2.

---

## Open Questions

1. **`claude-sonnet-4-6` vs `claude-sonnet-4-5` model identifier**
   - What we know: CONTEXT.md specifies "Claude Sonnet 4.6" but `@ai-sdk/anthropic` provider model IDs may differ from marketing names. The ARCHITECTURE.md research used `claude-sonnet-4-5`.
   - What's unclear: Whether `claude-sonnet-4-5` is the correct API identifier for what Anthropic markets as "Sonnet 4.6" and whether a `claude-sonnet-4-6` ID exists.
   - Recommendation: At implementation time, verify the exact model ID via `anthropic.models.list()` or the Anthropic console. Use the most recent Claude 3.5/3.7 Sonnet or Claude 4 Sonnet that is available. The orchestrator makes this a one-line change.

2. **`nano-banana-pro` Google model identifier**
   - What we know: CONTEXT.md specifies "Google Nano Banana Pro" for image generation. This is not a recognized model name in the `@ai-sdk/google` docs reviewed.
   - What's unclear: Whether "Nano Banana Pro" is the internal Amplify nickname for a specific Google Imagen model or a real API model ID. The current `@ai-sdk/google` supports `imagen-3.0` and `imagen-3.0-fast`.
   - Recommendation: In Phase 2, wire the Google provider for image generation as `google('imagen-3.0')` as a placeholder. Verify the actual "Nano Banana Pro" model ID during Phase 3 image work. Using a wrong model ID in Phase 2 is low risk since image generation is Phase 3+.

3. **`@tanstack/react-query` vs Supabase `useQuery` hook for campaign list**
   - What we know: The campaign list needs to refresh after new campaigns are created and update the sidebar in real time. `@tanstack/react-query` is recommended in STACK.md.
   - What's unclear: Whether the project wants to add `@tanstack/react-query` as a new dependency or use Supabase's own `useQuery` from `@supabase/ssr`.
   - Recommendation: Add `@tanstack/react-query` — it was already in the STACK.md install list and covers polling/invalidation patterns cleanly. The `QueryClientProvider` wraps the app shell layout.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.2 |
| Config file | `vitest.config.ts` (exists, uses `environment: 'node'`, glob `tests/**/*.test.ts`) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` (same, no split) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-02 | `/api/chat` returns 401 for unauthenticated request | unit | `pnpm test -- tests/chat/api.test.ts` | ❌ Wave 0 |
| CHAT-02 | `streamText` called with correct model for `chat.orchestrate` task | unit | `pnpm test -- tests/chat/orchestrator.test.ts` | ❌ Wave 0 |
| CHAT-04 | `useChat` `stop()` aborts in-flight request | manual-only | — | manual; browser behavior |
| CHAT-07 | Tone value injected into system prompt string | unit | `pnpm test -- tests/chat/orchestrator.test.ts` | ❌ Wave 0 |
| CHAT-08 | `persistMessage` inserts correct parts jsonb to campaign_messages | unit | `pnpm test -- tests/chat/persistence.test.ts` | ❌ Wave 0 |
| CHAT-09 | `getUserCampaigns` returns campaigns ordered by `updated_at DESC` | unit | `pnpm test -- tests/campaigns/queries.test.ts` | ❌ Wave 0 |
| INFRA-02 | `TASK_MODEL_MAP` maps all expected task keys | unit | `pnpm test -- tests/ai/models.test.ts` | ❌ Wave 0 |
| INFRA-07 | `/api/chat` returns 401 without session | unit | `pnpm test -- tests/chat/api.test.ts` | ❌ Wave 0 |
| CHAT-10 | Layout renders without horizontal scroll at 375px | manual-only | — | manual; visual |
| CHAT-03 | Part rendering — research-card renders expandable card | manual-only | — | manual; visual |

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/chat/api.test.ts` — covers CHAT-02, INFRA-07 (auth guard on route)
- [ ] `tests/chat/orchestrator.test.ts` — covers CHAT-02, CHAT-07 (model routing, tone injection)
- [ ] `tests/chat/persistence.test.ts` — covers CHAT-08 (parts persisted correctly)
- [ ] `tests/campaigns/queries.test.ts` — covers CHAT-09 (campaign list ordering)
- [ ] `tests/ai/models.test.ts` — covers INFRA-02 (task model map completeness)
- [ ] `tests/helpers/supabase.ts` — extend existing mock helpers for campaign_messages table

---

## Sources

### Primary (HIGH confidence)
- https://ai-sdk.dev/docs/getting-started/nextjs-app-router — AI SDK v6 streaming setup, `streamText`, `useChat`
- https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data — UIMessage parts, `createDataStreamResponse`, custom data types
- https://vercel.com/blog/ai-sdk-6 — AI SDK v6 release notes (Dec 2025), UIMessage parts model confirmed
- `npm view ai version` — 6.0.141 confirmed 2026-03-30
- `npm view @ai-sdk/anthropic version` — 3.0.64 confirmed 2026-03-30
- `npm view @ai-sdk/google version` — 3.0.54 confirmed 2026-03-30
- `npm view @ai-sdk/openai version` — 3.0.49 confirmed 2026-03-30
- `npm view @ai-sdk/perplexity version` — 3.0.26 confirmed 2026-03-30
- `.planning/research/ARCHITECTURE.md` — UIMessage parts pattern, streaming with progressive parts, orchestrator pattern
- `.planning/research/STACK.md` — full stack with versions, Canva/S3/Supabase patterns
- `.planning/research/PITFALLS.md` — Pitfalls 1, 5, 6, 7 directly relevant to Phase 2

### Secondary (MEDIUM confidence)
- `.planning/phases/01-foundation/01-05-SUMMARY.md` — Phase 1 decisions: Next.js 15.5, vercel.json fix, RLS patterns, coordinator JWT fix
- `supabase/migrations/20260329000001_foundation_schema.sql` — confirmed campaigns + campaign_messages schema (parts jsonb column present)
- `package.json` — confirmed: AI SDK not yet installed; embla-carousel, react-markdown, date-fns, zod already present

### Tertiary (LOW confidence)
- None — all findings verified from official sources or direct codebase inspection

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — versions verified via `npm view` on 2026-03-30
- Architecture: HIGH — patterns verified via official AI SDK v6 docs and ARCHITECTURE.md
- Pitfalls: HIGH — cross-referenced PITFALLS.md (pre-existing research) with Phase 1 learnings
- Existing codebase state: HIGH — directly read package.json, migration SQL, layout.tsx, chat/page.tsx

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (AI SDK releases frequently; verify package versions before install)
