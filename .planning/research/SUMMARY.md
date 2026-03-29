# Project Research Summary

**Project:** Amplify Marketing Suite
**Domain:** AI-powered conversational marketing platform (spiritual/wellness organization)
**Researched:** 2026-03-29
**Confidence:** HIGH

## Executive Summary

Amplify is a purpose-built AI marketing assistant for Art of Living teachers and coordinators — non-marketers who need to produce complete, regionally-targeted marketing campaigns (copy, quotes, ad creatives) through a simple chat interface. This is not a generic AI writing tool. The product's core value proposition rests on three unique capabilities that no commercial competitor can replicate: (1) a 7-query Perplexity regional research pipeline that provides hyper-local context before any content is generated, (2) direct integration with the Ask Gurudev API for authentic spiritual wisdom that forms the identity layer of all content, and (3) end-to-end Canva creative export that takes teachers from intent to print-ready ad in a single session.

The recommended architecture is a Next.js 15 monolith on Vercel, backed by Supabase for auth and persistence, orchestrating four AI providers (Gemini for volume text, Claude for brand voice precision, OpenAI GPT Image for ad creatives, Perplexity for grounded research) through the Vercel AI SDK v6. The key architectural decision is treating all prompts as versioned database records (not code), which enables the admin prompt testing screen — the critical operational layer that lets Abhishek maintain output quality without code deploys. The UI paradigm is chat-first with typed streaming content parts (research cards, copy blocks, image grids, ad previews) rendering inline in the conversation, modeled after Midjourney's pattern applied to marketing content.

The two critical risks requiring immediate attention before writing a line of application code are: (1) confirming that the Canva account has Enterprise access for the Autofill API — the entire ad creative pipeline is blocked without it, with Sharp-based image composition as the fallback — and (2) locking down the security foundation (Supabase RLS on every table, roles in `app_metadata` not `user_metadata`, auth on every AI route) before any AI integration. Vercel function timeout on long pipelines and context window management in multi-turn sessions are solvable but require deliberate architecture choices from Phase 1.

---

## Key Findings

### Recommended Stack

The stack centers on Next.js 15 App Router as the full-stack framework — SSR, API routes, streaming, and middleware all in one codebase, Vercel-native. Vercel AI SDK v6 is the single integration layer for all four AI providers; it handles streaming, typed content parts, and provider switching with one unified API. Supabase with `@supabase/ssr` (not the deprecated `auth-helpers-nextjs`) handles auth and all persistence. AWS S3 with presigned URLs handles all media assets — Vercel's 4.5MB request body limit makes proxying large files through serverless impossible. The UI is built on shadcn/ui CLI v4 with Tailwind v4, giving full code ownership with production-ready chat components.

**Core technologies:**
- **Next.js 15**: Full-stack framework — App Router gives per-route streaming, Server Actions, Middleware, and Vercel-native deployment
- **Vercel AI SDK v6**: AI orchestration — unified interface across Gemini, Claude, OpenAI, Perplexity; `useChat`, `streamText`, `streamObject` cover every pattern needed
- **Supabase + `@supabase/ssr` 0.9.x**: Auth and persistence — cookie-based sessions in App Router, RLS for role-based data isolation
- **`@ai-sdk/google` + `@ai-sdk/anthropic` + `@ai-sdk/openai` + `@ai-sdk/perplexity`**: Per-provider packages for cost transparency and direct billing
- **AWS S3 + presigned URLs**: Asset storage — client uploads directly to S3, never through Vercel
- **shadcn/ui CLI v4 + Tailwind v4**: UI — copy-paste components with full code ownership; production-ready streaming chat components via `shadcn/ai` namespace

**Critical version requirements:**
- Use `@supabase/ssr`, never `@supabase/auth-helpers-nextjs` (end-of-life at v0.15.0)
- Use Canva Connect REST API for server-side design generation, never Canva MCP (MCP is for AI desktop clients only)
- Use direct provider packages, not Vercel AI Gateway (cost transparency requirement)

### Expected Features

Research identified a clear three-tier feature structure. The must-haves are the minimum viable product that makes the tool usable for non-marketer teachers. The differentiators are what make Amplify worth building instead of buying a Jasper subscription. Everything else is deferred.

**Must have (table stakes):**
- Conversational chat input with streaming response rendering — teachers expect tokens to appear in real time; batch response feels broken
- Inline asset rendering in chat — research cards, copy blocks, image previews all appear in the conversation (Midjourney's pattern applied to marketing)
- Named conversation threads (campaigns) — users expect to return to "Bangalore Summer Workshop" and resume
- Multi-channel content output — Email, Instagram, WhatsApp, Facebook as distinct output targets with channel-appropriate previews
- Google Auth + four role tiers — Teacher, State Coordinator, National Team, Admin; baseline requirement for any org tool
- Art of Living brand voice enforcement — locked in the system prompt, non-configurable by teachers; protects output quality
- Tone selector (formal/casual/inspiring) — the only user-facing voice control that is safe to expose
- Campaign history with per-campaign asset view and bulk ZIP export
- Contextual suggested prompts — reduces blank-page anxiety for non-marketers
- Admin prompt testing screen — Abhishek needs this to maintain quality post-launch without code deploys

**Should have (competitive differentiators):**
- Regional research pipeline (7 parallel Perplexity queries: spirituality interest, mental health prevalence, sleep issues, relationship concerns, cultural sensitivities, local idioms, seasonal context) — the core quality differentiator, no competitor has this
- Gurudev Wisdom curation via Ask Gurudev API (quotes in 3 lengths + auto-generated quote images) — the identity differentiator no competitor can replicate
- Ad Creative Studio (AI image + Canva template population + S3 export in multiple orientations) — the end-to-end creative pipeline
- Translation pipeline (Hindi + regional languages) — add after English quality is confirmed
- Shareable campaign links with role-based permissions

**Defer (v2+):**
- Social publishing integrations (Meta, Instagram, WhatsApp Business API) — validate manual workflow first
- Video ad generation (Veo/Kling) — cost and latency make this a separate product decision
- Real-time multi-user collaboration — not needed for solo teacher use case
- In-platform scheduling/content calendar — validate distribution workflow before automating it
- A/B testing copy variants — teachers are not performance marketers; admin prompt A/B testing covers the actual need

### Architecture Approach

The architecture follows a monolith-first pattern with clear internal boundaries. The key insight from architecture research is that the system has three distinct execution contexts — the streaming chat pipeline (text content), the async asset pipeline (image generation + Canva + S3), and the admin operations layer (prompt CRUD, execution logs) — and these must never be mixed in the same route handler or the pipeline will hit Vercel's function timeout. All AI provider calls are routed through a single `lib/ai/orchestrator.ts` interface; all prompts are loaded from a Supabase `prompts` table through `lib/prompts/registry.ts`; all provider logic is invisible to route handlers.

**Major components:**
1. **Chat UI** (`useAmplifyChat` hook wrapping `useChat`) — renders typed `UIMessage` parts (research-card, copy-block, image-grid, ad-preview) via a component switch in `MessageBubble.tsx`
2. **AI Orchestrator** (`lib/ai/orchestrator.ts`) — rule-based provider routing via `TASK_MODEL_MAP`; `runTask(key, input)` is the only AI call interface exposed to route handlers
3. **Prompt Registry** (`lib/prompts/registry.ts`) — loads active prompt version from Supabase with 60s LRU cache; all executions logged to `ai_executions` table
4. **Asset Pipeline** (`lib/assets/`) — async: AI image gen → Canva autofill → S3 upload; decoupled from the streaming chat route via polling or Supabase Realtime
5. **Admin Prompt Lab** (`/admin`) — UI over the `prompts` table; creates new versions (never overwrites); test execution runner with cost/latency logging
6. **Supabase DB** — campaigns, messages (parts as JSONB), assets, prompts (versioned), executions; RLS on every table

### Critical Pitfalls

1. **Canva Autofill API requires Enterprise account** — Verify immediately before building any creative pipeline. If Enterprise is unavailable, pivot to Sharp-based image composition. Keep the Canva integration in an isolated module (`lib/assets/canva-pipeline.ts`) so it can be swapped without touching the rest of the system.

2. **Supabase RLS disabled by default on new tables** — Every migration must include `ALTER TABLE x ENABLE ROW LEVEL SECURITY` immediately after `CREATE TABLE x`. Test all policies via the Supabase JS client (not SQL Editor which runs as superuser and bypasses RLS). Use `app_metadata` not `user_metadata` for role checks in all policies — `user_metadata` is user-writable and enables privilege escalation.

3. **Vercel function timeout on multi-step pipelines** — Image generation + Canva export + S3 upload takes 60-120s. Set `export const maxDuration = 300` on all AI route handlers and enable Fluid Compute (`"fluid": true` in `vercel.json`). Never put image generation in the same function as streaming text — fire the asset pipeline as a background job, stream text immediately.

4. **Unprotected AI endpoints enabling cost runaway** — Auth check must be the first line of every AI route. Set hard spend limits on all four provider dashboards before first staging deployment. Implement per-user rate limiting (5 campaigns/user/day) from day one.

5. **Context window exhaustion in long sessions** — A full campaign conversation (system prompt + 7 research results + multi-turn history) exceeds 32K tokens. Store research as a structured `campaign_research` record in Supabase; reference it by campaign ID in downstream calls rather than replaying it in the messages array. Implement sliding window (system prompt + last 10 turns + campaign summary) for follow-up messages.

---

## Implications for Roadmap

Based on the research, the build order is determined by three hard dependencies: (1) auth and RLS must exist before any data is stored, (2) the prompt registry must exist before the AI orchestrator, and (3) the AI orchestrator must exist before any content pipeline. The asset pipeline (Canva) has a business prerequisite (Enterprise account validation) that must be resolved in parallel with Phase 1.

### Phase 1: Foundation and Security
**Rationale:** Every subsequent phase depends on auth, RLS, and the database schema. The prompt versioning schema and role architecture must be locked before a single AI call is made — retrofitting these is the highest-recovery-cost failure mode in the pitfalls research. This phase also validates the Canva prerequisite.
**Delivers:** Working Google OAuth, four role tiers in `app_metadata`, RLS-enabled schema for all tables, prompt registry with versioning, Canva Enterprise verification, Vercel Fluid Compute configuration
**Addresses:** Google Auth, role-based access (table stakes features)
**Avoids:** Pitfalls 2 (RLS), 3 (timeout config), 4 (role metadata), 5 (unprotected routes), 8 (prompt mutation)
**Research flag:** Standard patterns — well-documented Supabase + Next.js auth. No research-phase needed.

### Phase 2: AI Orchestration Core + Basic Chat
**Rationale:** Before building any content pipeline, validate that streaming text works end-to-end with auth in Vercel production. This phase surfaces the timeout issue and streaming race conditions in isolation before multi-step pipelines add complexity.
**Delivers:** All four providers initialized, `orchestrator.ts` with `runTask`, `/api/chat` streaming route, basic chat UI with text-only rendering, streaming state architecture validated
**Uses:** Vercel AI SDK v6 `streamText`, `useChat`, `createUIMessageStream`
**Avoids:** Pitfalls 5 (auth on routes), 7 (streaming race conditions)
**Research flag:** Standard patterns — official AI SDK docs cover this completely.

### Phase 3: Rich Content Rendering + Research Pipeline
**Rationale:** The `UIMessage` custom parts schema must be defined before any content pipeline emits typed parts — the research shows retrofitting this is a rewrite. Research pipeline is the first production AI integration and validates the context management pattern (research-as-record) before heavier content generation.
**Delivers:** All custom part types defined (research-card, copy-block, image-grid, ad-preview), part renderer component library, Perplexity 7-query research pipeline rendering as expandable cards
**Implements:** `types/message.ts` discriminated union, `components/chat/parts/` component tree
**Avoids:** Pitfall 6 (context window — research stored as `campaign_research` record, not chat messages)
**Research flag:** Research-phase recommended — Perplexity API integration patterns and rate limits for parallel queries.

### Phase 4: Content Generation Pipeline
**Rationale:** With the research pipeline established and the context pattern validated, content generation is a direct extension — same orchestrator, same part types, new task keys. This phase delivers the core product loop: research → copy → wisdom.
**Delivers:** Multi-channel copy generation (Email, WhatsApp, Instagram, Facebook) with channel-specific previews, Gurudev Wisdom curation via Ask Gurudev API (3 quote lengths + quote images), tone selector, campaign persistence (messages saved to DB)
**Addresses:** Multi-channel content output, Gurudev Wisdom integration, brand voice enforcement, tone selector (table stakes + differentiator features)
**Avoids:** Pitfall 6 (context window budget validation across all generation steps)
**Research flag:** Standard patterns for content generation. Ask Gurudev API — validate rate limits and response format before building the pipeline.

### Phase 5: Ad Creative Studio
**Rationale:** This is the most complex phase and the one with an external hard dependency (Canva Enterprise). It is explicitly deferred until the text-only pipeline is validated and the Canva prerequisite confirmed in Phase 1. Isolated behind `lib/assets/canva-pipeline.ts` so a fallback (Sharp-based composition) can be swapped in without touching other phases.
**Delivers:** AI image generation for ad creatives (GPT Image), Canva template autofill + export, S3 presigned URL upload, `ad-preview` part rendering in chat, multi-orientation support (1:1, 9:16, 16:9)
**Avoids:** Pitfall 1 (async asset pipeline, never blocking the streaming chat route), Pitfall 2 (Canva Enterprise confirmed in Phase 1)
**Research flag:** Research-phase strongly recommended — Canva Autofill API job polling patterns, S3 presigned URL upload flow, async asset pipeline design.

### Phase 6: Campaign Management and Export
**Rationale:** Once content is being generated, teachers need to organize, retrieve, and export their work. This phase closes the production loop for v1 launch.
**Delivers:** Campaign browser (list + filter), per-campaign asset gallery, per-asset copy/download, bulk campaign ZIP export, named threads with auto-generated campaign titles, contextual suggested prompts
**Addresses:** Campaign history, copy/download, suggested prompts (table stakes features)
**Research flag:** Standard patterns.

### Phase 7: Admin Prompt Lab
**Rationale:** The admin screen is a UI over data that exists from Phase 1 (prompt table + execution logs). It is built last because the prompt iteration workflow is most useful once the content pipeline is stable and there are real execution logs to review. This is also the phase that validates the immutable versioning schema designed in Phase 1.
**Delivers:** Prompt list + editor (creates new versions, never overwrites), test execution runner, execution log viewer with cost/latency, model selector per prompt, A/B version comparison
**Implements:** Admin Prompt Lab architecture component
**Avoids:** Pitfall 8 (UI enforces "Save as new version" not "Save")
**Research flag:** Standard patterns.

### Phase Ordering Rationale

- **Security before features:** Pitfalls research shows RLS misconfiguration and role metadata errors are the highest-recovery-cost failures. No table enters production without RLS enabled.
- **Schema immutability before UI:** Prompt versioning schema designed in Phase 1 protects against mid-campaign prompt mutations that corrupt active sessions. If this is designed wrong, recovery requires data migration.
- **Text pipeline before asset pipeline:** Validates the core chat loop, streaming architecture, and context management patterns before adding the 60-120 second async asset pipeline complexity.
- **Single stream before multi-part:** Basic text streaming (Phase 2) before custom part types (Phase 3) lets streaming race conditions be caught in isolation.
- **Canva validation as a gate:** Phase 5 does not start until Phase 1 confirms Enterprise access. Fallback decision (Sharp-based composition) must be made before Phase 5 begins.

### Research Flags

**Needs research-phase during planning:**
- **Phase 3** (Research Pipeline): Perplexity API parallel query patterns, rate limits, response parsing to structured `research-card` format
- **Phase 5** (Ad Creative Studio): Canva Autofill API polling implementation, error handling for job failures, S3 async upload flow, Sharp fallback pipeline design

**Standard patterns — skip research-phase:**
- **Phase 1** (Foundation): Supabase + Next.js 15 auth is extensively documented with official guides
- **Phase 2** (AI Core + Chat): Vercel AI SDK v6 + Next.js App Router is the primary use case in official docs; reference chatbot template available
- **Phase 4** (Content Generation): Extension of Phase 3 patterns; Ask Gurudev API validation is a quick integration check, not a research problem
- **Phase 6** (Campaign Management): CRUD + download patterns are standard
- **Phase 7** (Admin Prompt Lab): UI over Supabase tables with standard CRUD patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs, npm, and release blogs. Version compatibility table cross-referenced. Critical warnings (deprecated auth-helpers, Canva MCP misuse) backed by official docs. |
| Features | HIGH | Competitor analysis from official product pages + reviews. UX patterns from established references (Shape of AI, Smashing Magazine). Feature dependencies modeled from project context. |
| Architecture | HIGH | Patterns sourced from official Vercel AI SDK docs + reference chatbot. Data flow diagrams derived from SDK streaming protocol docs. Schema from Supabase official docs. |
| Pitfalls | HIGH (infra), MEDIUM (Canva) | Supabase/Vercel/streaming pitfalls from official docs + real incident records. Canva Enterprise requirement confirmed from API docs but MCP-specific surface is LOW confidence — MCP behavior not fully validated. |

**Overall confidence:** HIGH

### Gaps to Address

- **Canva Enterprise validation**: The single highest-risk gap. Must be confirmed in Phase 1 with an actual Autofill API call against a real template in the actual account. If blocked, the Sharp fallback path needs to be designed before Phase 5 planning begins.

- **Ask Gurudev API surface**: Research mentions this API as a core integration but does not document its request/response schema, rate limits, or authentication mechanism. Needs a quick integration spike in Phase 4 planning.

- **Perplexity parallel query rate limits**: The 7-query parallel research pipeline is the established pattern from n8n v1, but Perplexity's concurrent query limits for the Sonar Pro model are not documented in the research. Validate before Phase 3 planning.

- **Context window budget validation**: The 32K token estimate for a full campaign conversation is a calculation, not a measured value. Log actual token counts during Phase 3 development and adjust the sliding window strategy based on real data.

- **fal.ai as image generation fallback**: STACK.md marks this as MEDIUM confidence / optional. If GPT Image proves too slow or expensive for the per-campaign budget target ($0.40-0.60), fal.ai Flux integration needs to be evaluated. Defer this decision to Phase 5 based on observed costs.

---

## Sources

### Primary (HIGH confidence)
- `https://ai-sdk.dev/docs/introduction` — Vercel AI SDK v6 official docs; streaming patterns, UIMessage parts, provider setup
- `https://vercel.com/blog/ai-sdk-6` — AI SDK v6 release notes, Dec 2025
- `https://supabase.com/docs/guides/auth/server-side/nextjs` — Supabase SSR auth pattern for Next.js App Router
- `https://www.npmjs.com/package/@supabase/ssr` — v0.9.0 package; confirms `auth-helpers-nextjs` deprecation
- `https://www.canva.dev/docs/connect/autofill-guide/` — Canva Connect Autofill API workflow and Enterprise requirement
- `https://ui.shadcn.com/docs/changelog/2026-03-cli-v4` — shadcn CLI v4 release, Tailwind v4 support
- `https://supabase.com/docs/guides/database/postgres/row-level-security` — RLS official docs + `app_metadata` vs `user_metadata` security
- `https://vercel.com/docs/functions/limitations` — Vercel function timeout documentation, Fluid Compute
- `https://github.com/vercel/chatbot` — Official Vercel chatbot reference architecture

### Secondary (MEDIUM confidence)
- `https://www.jasper.ai/brand-voice`, `https://www.copy.ai/`, `https://www.anyword.com/` — Competitor feature analysis
- `https://www.shapeof.ai` — AI UX patterns reference
- `https://www.getmaxim.ai/articles/prompt-versioning-and-its-best-practices-2025/` — Prompt versioning patterns
- `https://dev.to/ash_dubai/multi-provider-llm-orchestration-in-production-a-2026-guide-1g10` — Multi-provider orchestration patterns (verified against SDK docs)

### Tertiary (LOW confidence)
- Canva MCP Server behavior in production backends — MCP is documented for developer tooling use; production backend behavior is inferred, not tested

---

*Research completed: 2026-03-29*
*Ready for roadmap: yes*
