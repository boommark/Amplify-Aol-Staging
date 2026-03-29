# Architecture Research

**Domain:** AI-powered marketing chatbot platform (Next.js + Supabase + multi-provider AI)
**Researched:** 2026-03-29
**Confidence:** HIGH (Vercel AI SDK docs + official patterns verified)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Chat UI     │  │ Campaign     │  │ Admin /      │              │
│  │  (useChat)   │  │ Browser      │  │ Prompt Lab   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                      │
└─────────┼─────────────────┼──────────────────┼──────────────────────┘
          │ SSE stream       │ REST             │ REST
┌─────────┼─────────────────┼──────────────────┼──────────────────────┐
│                      NEXT.JS API LAYER                               │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐              │
│  │ /api/chat    │  │ /api/        │  │ /api/admin/  │              │
│  │ (streaming)  │  │ campaigns    │  │ prompts      │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                      │
│  ┌──────┴──────────────────────────────────────────────────────┐    │
│  │                    SERVICE LAYER                             │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │    │
│  │  │ AI         │  │ Asset      │  │ Prompt     │             │    │
│  │  │ Orchestrat │  │ Pipeline   │  │ Registry   │             │    │
│  │  └────────────┘  └────────────┘  └────────────┘             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
          │                       │                    │
┌─────────┼───────────────────────┼────────────────────┼──────────────┐
│                      EXTERNAL SERVICES                               │
│  ┌──────┴───────┐  ┌────────────┴──┐  ┌─────────────┴─┐            │
│  │ Supabase     │  │ AI Providers  │  │ Canva + S3    │            │
│  │ (Auth + DB)  │  │ (4 providers) │  │ (assets)      │            │
│  └──────────────┘  └───────────────┘  └───────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Chat UI | Render messages, stream tokens, display rich content parts | `useChat` hook from `@ai-sdk/react` |
| `/api/chat` route | Receive user message, run AI pipeline, stream response | Next.js Route Handler with `streamText()` |
| AI Orchestrator | Select provider per task, route prompts, handle fallbacks | `lib/ai/orchestrator.ts` — provider map + rule-based routing |
| Prompt Registry | Load prompt by key, inject variables, track version | `lib/prompts/` — DB-backed, cached in-memory |
| Asset Pipeline | Coordinate AI image gen → Canva fill → S3 export | `lib/assets/` — async multi-step job |
| Supabase DB | Persist campaigns, messages, prompts, users, assets | Postgres with RLS per role |
| Admin Prompt Lab | UI for viewing/editing prompts, running test executions | Protected `/admin` route |

## Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Google OAuth entry point
│   ├── (app)/
│   │   ├── layout.tsx              # Authenticated shell + sidebar
│   │   ├── chat/
│   │   │   ├── page.tsx            # New campaign / chat entry
│   │   │   └── [campaignId]/
│   │   │       └── page.tsx        # Existing campaign thread
│   │   ├── campaigns/
│   │   │   └── page.tsx            # Campaign browser + asset gallery
│   │   └── admin/
│   │       ├── prompts/page.tsx    # Prompt list + editor
│   │       └── logs/page.tsx       # AI execution log viewer
│   └── api/
│       ├── chat/route.ts           # Streaming chat endpoint
│       ├── campaigns/route.ts      # Campaign CRUD
│       ├── assets/route.ts         # Asset generation trigger + status
│       └── admin/
│           ├── prompts/route.ts    # Prompt CRUD
│           └── logs/route.ts       # Execution log queries
├── components/
│   ├── chat/
│   │   ├── MessageList.tsx         # Renders all message parts
│   │   ├── MessageBubble.tsx       # Single message with part routing
│   │   ├── parts/
│   │   │   ├── TextPart.tsx        # Plain streaming text
│   │   │   ├── ResearchCard.tsx    # Structured research result
│   │   │   ├── CopyBlock.tsx       # Editable copy with channel preview
│   │   │   ├── ImageGrid.tsx       # Generated images (2x2 etc)
│   │   │   ├── AdPreview.tsx       # Ad creative with aspect ratio
│   │   │   └── ActionBar.tsx       # Suggested next actions
│   │   └── ChatInput.tsx           # Tone selector + input + submit
│   ├── campaigns/
│   │   ├── CampaignCard.tsx
│   │   └── AssetDownloader.tsx
│   └── admin/
│       ├── PromptEditor.tsx
│       └── ExecutionLog.tsx
├── lib/
│   ├── ai/
│   │   ├── orchestrator.ts         # Provider selection + fallback
│   │   ├── providers.ts            # Gemini / Claude / GPT / Perplexity init
│   │   ├── models.ts               # Model config per task type
│   │   └── stream-helpers.ts       # Custom part writers for rich content
│   ├── prompts/
│   │   ├── registry.ts             # Load prompt from DB by key
│   │   ├── renderer.ts             # Variable injection into prompt template
│   │   └── cache.ts                # In-memory LRU cache for prompt lookup
│   ├── assets/
│   │   ├── image-gen.ts            # Image generation (multi-provider)
│   │   ├── canva-pipeline.ts       # Canva autofill + export
│   │   └── s3-upload.ts            # Upload generated files to S3
│   ├── db/
│   │   ├── client.ts               # Supabase client (server + browser)
│   │   ├── queries/                # Typed query functions per domain
│   │   └── types.ts                # DB-derived TypeScript types
│   └── auth/
│       └── middleware.ts           # Role guard + session check
├── types/
│   ├── message.ts                  # UIMessage extended with custom parts
│   ├── campaign.ts                 # Campaign + asset types
│   └── prompt.ts                   # Prompt version + execution types
└── hooks/
    ├── useAmplifyChat.ts           # useChat wrapper with custom part handling
    └── useCampaign.ts              # Campaign data + mutation hook
```

### Structure Rationale

- **`app/(app)/` route group:** All authenticated routes share a single layout (sidebar, top nav) without that layout affecting auth pages.
- **`components/chat/parts/`:** Each rich content type is its own component. Adding a new part type (e.g., `VideoThumbnail`) requires one new file, not changes to a monolithic renderer.
- **`lib/ai/`:** Keeps all provider logic behind a single `orchestrator.ts` interface. Swapping a provider means changing `providers.ts`, not touching any route handler.
- **`lib/prompts/`:** Separating prompt registry from AI orchestration means the Admin UI and the chat pipeline both use the same loading code.
- **`lib/db/queries/`:** Typed query functions (not raw SQL in route handlers) make it possible to unit-test DB logic and swap Supabase for something else later.

## Architectural Patterns

### Pattern 1: UIMessage Parts for Rich Content

**What:** The Vercel AI SDK `UIMessage` type contains a `parts` array instead of a single `content` string. Each part has a `type` and `data` field. Custom data types are defined once as TypeScript discriminated unions, then streamed server-side and rendered client-side by a type-based switch.

**When to use:** Any time the AI response needs to include more than text — research cards, image grids, copy blocks, ad previews. This is the primary rendering pattern for Amplify.

**Trade-offs:** Requires type-safe schema definition upfront; initial setup cost is higher than a plain `content: string` approach, but avoids unmaintainable HTML parsing hacks later.

**Example:**
```typescript
// types/message.ts
type AmplifyUIMessage = UIMessage<never, {
  'research-card': {
    topic: string;
    findings: Array<{ label: string; value: string; source?: string }>;
    status: 'loading' | 'ready';
  };
  'image-grid': {
    images: Array<{ url: string; aspectRatio: '1:1' | '9:16' | '16:9' }>;
    prompt: string;
  };
  'copy-block': {
    channel: 'email' | 'whatsapp' | 'instagram' | 'facebook';
    content: string;
    editableId: string;
  };
  'ad-preview': {
    canvaDesignId: string;
    exportUrl: string;
    adType: string;
    orientation: string;
  };
}>;

// components/chat/MessageBubble.tsx — switch on part.type, render matching component
```

### Pattern 2: Rule-Based Provider Routing

**What:** A single `orchestrator.ts` function selects the AI provider and model based on the task key, not on AI-driven routing. Simple if/else or a lookup map. All 4 providers (Gemini, Claude, GPT, Perplexity) are initialized once at module load; route handlers call `orchestrator.generate({ task, input })`.

**When to use:** Any AI call in the system. Prevents per-provider SDK calls from leaking into route handlers and business logic.

**Trade-offs:** Simple and fast (zero-latency routing decisions), but requires explicit task taxonomy upfront. Not suitable if routing logic needs to be dynamic at runtime — in that case, add a `model_override` field to the prompts table.

**Example:**
```typescript
// lib/ai/models.ts
const TASK_MODEL_MAP: Record<string, TaskConfig> = {
  'research.regional':    { provider: 'perplexity', model: 'sonar-pro' },
  'copy.email':           { provider: 'gemini',     model: 'gemini-2.0-flash' },
  'copy.premium':         { provider: 'anthropic',  model: 'claude-sonnet-4-5' },
  'image.ad-creative':    { provider: 'openai',     model: 'gpt-image-1' },
  'image.quote':          { provider: 'gemini',     model: 'nano-banana-2' },
};

// lib/ai/orchestrator.ts
export async function runTask(taskKey: string, input: Record<string, string>) {
  const config = TASK_MODEL_MAP[taskKey] ?? DEFAULT_CONFIG;
  const prompt = await promptRegistry.load(taskKey);
  const rendered = renderPrompt(prompt.template, input);
  return providers[config.provider].generate(config.model, rendered);
}
```

### Pattern 3: Prompt-as-Data with Version Tracking

**What:** Prompts live in a Supabase `prompts` table, not in source code. Each prompt has a `key` (e.g., `copy.email`), `version` integer, `template` text, `model_override` (nullable), and `is_active` boolean. The registry loads the active version at request time (with a short TTL cache). Executions are logged to an `ai_executions` table.

**When to use:** All AI prompts in Amplify. This pattern directly enables the Admin Prompt Lab requirement and makes A/B testing possible without code deploys.

**Trade-offs:** Adds a DB read per AI call (mitigated by cache). Means prompt bugs require a DB update not a code deploy — which is a feature for Amplify's use case, since the admin needs to iterate without engineer involvement.

**Supabase schema:**
```sql
create table prompts (
  id          uuid primary key default gen_random_uuid(),
  key         text not null,          -- e.g. 'copy.email'
  version     int  not null default 1,
  template    text not null,
  model_override text,                -- overrides TASK_MODEL_MAP if set
  is_active   boolean not null default true,
  created_at  timestamptz default now(),
  created_by  uuid references auth.users
);

create table ai_executions (
  id          uuid primary key default gen_random_uuid(),
  prompt_id   uuid references prompts,
  campaign_id uuid references campaigns,
  input       jsonb,
  output      text,
  model       text,
  provider    text,
  latency_ms  int,
  cost_usd    numeric(10,6),
  created_at  timestamptz default now()
);
```

### Pattern 4: Streaming with Progressive Content Parts

**What:** The `/api/chat` route uses `createUIMessageStream` from the AI SDK to write multiple typed parts to the same response stream. As each pipeline stage completes (research → copy → image → assembly), parts are appended to the stream in real time. The client renders them incrementally as they arrive.

**When to use:** Any multi-stage pipeline where the user benefits from seeing early results (research cards) while later stages (image generation) are still running. This is the correct pattern for Amplify's sequential pipeline.

**Trade-offs:** Route handler complexity increases (must manage a writer + merge multiple sub-streams). The payoff is that users see progress in under 5 seconds rather than waiting 30+ seconds for a complete response.

## Data Flow

### Primary Flow: User Message to Rich Chat Response

```
User types message
    ↓
useAmplifyChat.sendMessage()
    ↓
POST /api/chat  { campaignId, messages[], tone }
    ↓
Route handler: load campaign context from Supabase
    ↓
createUIMessageStream — open SSE response to client
    |
    ├─→ runTask('research.regional', context)
    │       ↓ Perplexity API
    │   writer.write({ type: 'data-research-card', status: 'loading' })
    │   [stream result]
    │   writer.write({ type: 'data-research-card', status: 'ready', data })
    │
    ├─→ runTask('copy.email', { research, tone, region })
    │       ↓ Gemini Flash
    │   writer.merge(textStream)   ← text tokens stream to client live
    │
    └─→ runTask('image.ad-creative', { copy, style })
            ↓ OpenAI GPT Image
        writer.write({ type: 'data-image-grid', images })
    ↓
Route handler: persist assembled message to Supabase
    ↓
SSE stream closes
    ↓
Client: useChat updates message.parts, each part component re-renders
```

### Asset Pipeline Flow: AI Image → Canva → S3

```
User triggers "Generate Ad Creative"
    ↓
POST /api/assets  { campaignId, adType, orientation, copy }
    ↓
image-gen.ts: call AI image provider → raw image URL
    ↓
canva-pipeline.ts:
    1. uploadAssetToCanva(imageUrl) → canvaAssetId
    2. autofillTemplate(templateId, { image: canvaAssetId, headline, cta })
    3. exportDesign(designId) → exported image buffer
    ↓
s3-upload.ts: upload buffer → S3 key assets/{campaignId}/{adType}-{orientation}.jpg
    ↓
Supabase: insert into campaign_assets { campaign_id, s3_key, canva_design_id, type }
    ↓
Return asset record to client — chat UI appends ad-preview part
```

### Prompt Load Flow: Registry with Cache

```
Route handler calls promptRegistry.load('copy.email')
    ↓
Check in-memory LRU cache (TTL: 60s)
    ↓ miss
SELECT * FROM prompts WHERE key = 'copy.email' AND is_active = true
    ↓
Store in cache, return PromptRecord
    ↓
renderPrompt(template, variables) → final prompt string
    ↓
Pass to provider, log execution to ai_executions
```

### Campaign Data Model

```
campaigns
  id, user_id, title, region, event_type, tone, status
  created_at, updated_at

campaign_messages
  id, campaign_id, role (user|assistant), parts (jsonb), created_at

campaign_assets
  id, campaign_id, asset_type, s3_key, canva_design_id
  orientation, width, height, created_at

prompts
  id, key, version, template, model_override, is_active, created_at

ai_executions
  id, prompt_id, campaign_id, input, output, model, provider
  latency_ms, cost_usd, created_at

users (via Supabase Auth + profiles table)
  id, email, role (teacher|coordinator|national|admin)
  region, display_name
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 users (launch) | Monolith is fine. Vercel serverless handles spikes. Supabase free/pro tier covers the load. Single `/api/chat` route. |
| 500-5k users | Add prompt cache (already designed in). Consider Vercel Edge for the chat route to reduce cold start latency. Monitor Supabase connection pool — add pgBouncer if needed. |
| 5k+ users | Asset pipeline becomes async (background job queue, not in-band in the route handler). Consider separating the AI execution log to a cheaper store (TimescaleDB or ClickHouse) if it grows to millions of rows. |

### Scaling Priorities

1. **First bottleneck:** Vercel function timeout on long AI pipelines (default 60s, Pro plan 300s). The multi-stage pipeline (research + copy + image) can exceed 60s. Fix: stream partial results early so the function stays alive, or break the pipeline into sequential user-triggered steps.
2. **Second bottleneck:** Supabase connection limits under concurrent load. Fix: use the Supabase connection pooler (Transaction mode) for all Next.js route handlers.

## Anti-Patterns

### Anti-Pattern 1: Hardcoded Prompts in Route Handlers

**What people do:** Write AI prompts as template literals directly inside `app/api/chat/route.ts`.
**Why it's wrong:** Admin cannot iterate on prompts without a code deploy. No version history. No A/B testing. No cost tracking per prompt. Amplify explicitly requires an admin prompt testing screen — this approach makes that impossible.
**Do this instead:** All prompts in the `prompts` Supabase table. Route handlers call `promptRegistry.load(key)`.

### Anti-Pattern 2: Monolithic Message Content String

**What people do:** Return AI responses as a single `content: string` with markdown or embedded JSON for rich elements.
**Why it's wrong:** Client must parse the string to extract cards, images, actions. Fragile to model output variance (model adds extra text, formatting changes). Cannot progressively stream different content types at different times.
**Do this instead:** Use Vercel AI SDK `UIMessage` parts with typed custom data schemas. Each part type renders independently.

### Anti-Pattern 3: Provider SDK Calls in Route Handlers

**What people do:** Import `anthropic` or `openai` directly in `app/api/chat/route.ts` and call `.messages.create()`.
**Why it's wrong:** Provider logic is scattered. Swapping a model (a stated requirement for the Admin screen) requires touching multiple files. No unified error handling or fallback.
**Do this instead:** All provider calls go through `lib/ai/orchestrator.ts`. Route handlers only call `runTask(key, input)`.

### Anti-Pattern 4: Waiting for Full Asset Pipeline Before Responding

**What people do:** Generate image → fill Canva → export → upload S3 → then return chat response.
**Why it's wrong:** Full pipeline takes 20-45 seconds. User sees a loading spinner. Canva export in particular is slow (5-15s). Blocking the SSE stream for this kills perceived performance.
**Do this instead:** Stream text content immediately. Trigger the asset pipeline as a fire-and-forget background process (or a separate user-triggered step). Return a `status: 'generating'` part immediately and update it via the `/api/assets` polling endpoint.

### Anti-Pattern 5: Client-Side AI Calls

**What people do:** Call AI provider APIs directly from React components (via `fetch` with API keys in environment variables prefixed `NEXT_PUBLIC_`).
**Why it's wrong:** Exposes API keys to the browser. No rate limiting. No prompt versioning. No cost tracking.
**Do this instead:** All AI calls go through Next.js route handlers server-side.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | `createServerClient()` in middleware + route handlers; `createBrowserClient()` in React | Use separate clients for server vs browser — different cookie handling |
| Supabase DB | `lib/db/client.ts` server client; RLS policies enforce role boundaries | Never bypass RLS by using service role key in client components |
| Gemini (Google AI Studio) | `@ai-sdk/google` provider via orchestrator | Used for high-volume text gen (Flash) and image gen (Nano Banana) |
| Claude (Anthropic) | `@ai-sdk/anthropic` provider via orchestrator | Used for premium copy requiring brand voice precision |
| GPT Image (OpenAI) | `@ai-sdk/openai` provider via orchestrator | Used for ad creative images — highest quality |
| Perplexity | Direct REST API (no official AI SDK provider); wrap in `lib/ai/providers.ts` | Returns grounded search results; treat response as plain text, parse to structured card |
| Canva Connect API | `lib/assets/canva-pipeline.ts`; requires Enterprise plan for Autofill API | Job-based: create autofill job → poll for completion → export design |
| AWS S3 | `@aws-sdk/client-s3` via `lib/assets/s3-upload.ts` | Pre-sign URLs for client-side display; never expose S3 credentials to browser |
| Ask Gurudev API | Direct REST call in orchestrator; response feeds `wisdom-quote` part type | Treat as a read-only external API; cache responses per query in Supabase |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Chat UI ↔ `/api/chat` | SSE stream via `useChat` hook | AI SDK handles protocol; custom part types defined in `types/message.ts` |
| `/api/chat` ↔ AI Orchestrator | Direct function call (same process) | No HTTP overhead; orchestrator is pure TypeScript |
| `/api/assets` ↔ Asset Pipeline | Direct function call + async background | Asset pipeline steps can exceed route timeout; design for async polling |
| Route Handlers ↔ Supabase | `lib/db/queries/` typed functions | Never raw SQL in route handlers |
| Admin Prompt Lab ↔ Prompts Table | `/api/admin/prompts` CRUD + real-time cache invalidation | Admin updates prompt → cache TTL expires → next AI call picks up new version |
| All routes ↔ Auth | Supabase middleware in `middleware.ts` | Role check at middleware level for `/admin` routes; RLS for data access |

## Suggested Build Order

The component dependencies create a natural build sequence. Each phase unlocks the next.

```
Phase 1: Foundation
  Auth (Supabase Google login + profiles + RLS)
  → DB schema (campaigns, messages, prompts, assets, executions)
  → Prompt registry (load from DB + cache)

Phase 2: AI Orchestration Core
  Provider setup (all 4 initialized, model map defined)
  → Orchestrator (runTask abstraction)
  → /api/chat streaming route (text only first, no rich parts yet)
  → Basic chat UI with useChat (text rendering only)

Phase 3: Rich Content Rendering
  UIMessage custom part types defined (research-card, copy-block, image-grid, ad-preview)
  → Part renderer components
  → Chat route enhanced to emit typed parts
  → Research pipeline (Perplexity → research-card part)

Phase 4: Content Generation Pipeline
  Copy generation (all channels)
  → Wisdom / Gurudev quotes pipeline
  → Image generation (text-to-image for quote images)
  → Campaign persistence (messages saved to DB)

Phase 5: Asset Pipeline
  AI image generation for ad creatives
  → Canva autofill + export
  → S3 upload + signed URL delivery
  → ad-preview part rendering in chat

Phase 6: Campaign Management
  Campaign browser (list + filter)
  → Asset gallery + downloader
  → Campaign sharing (signed URL)

Phase 7: Admin Prompt Lab
  Prompt list + editor UI
  → Test execution runner
  → Execution log viewer
  → A/B version comparison
```

**Key dependency rule:** The prompt registry (Phase 1) must exist before AI orchestration (Phase 2). The orchestrator must exist before any pipeline work (Phases 3-5). Rich content types must be defined before the pipeline emits them. Asset pipeline (Phase 5) is independent of Phase 6 and can be built in parallel if needed.

## Sources

- [Vercel AI SDK — Getting Started: Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) — HIGH confidence, official docs
- [Vercel AI SDK — Streaming Custom Data / UIMessage parts](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data) — HIGH confidence, official docs
- [Vercel AI SDK — Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) — HIGH confidence, official docs
- [AI SDK 6 Release Blog (Vercel)](https://vercel.com/blog/ai-sdk-6) — HIGH confidence, official release
- [Vercel Chatbot GitHub (reference template)](https://github.com/vercel/chatbot) — HIGH confidence, official reference architecture
- [Multi-provider LLM Orchestration in Production (DEV.to)](https://dev.to/ash_dubai/multi-provider-llm-orchestration-in-production-a-2026-guide-1g10) — MEDIUM confidence, community guide verified against SDK docs
- [Supabase Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization) — HIGH confidence, official docs
- [Canva Connect API — Autofill](https://www.canva.dev/docs/connect/) — HIGH confidence, official docs
- [Next.js AI Chatbot — nextjs-chat-genui-adaptive-cards (GitHub)](https://github.com/cameronking4/nextjs-chat-genui-adaptive-cards/) — MEDIUM confidence, community pattern for adaptive card rendering in chat

---
*Architecture research for: Amplify Marketing Suite — AI chatbot with rich content, multi-provider orchestration, prompt versioning*
*Researched: 2026-03-29*
