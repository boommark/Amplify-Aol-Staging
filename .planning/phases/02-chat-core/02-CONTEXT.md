# Phase 2: Chat Core - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Full conversational chat UI with streaming, rich inline rendering, thread persistence, and AI provider wiring. Users can have a complete conversational session with Amplify through a polished, streaming chat interface backed by multiple AI providers. Includes: campaign type selector, multi-model orchestrator, progressive streaming with rich content parts, channel-native previews, thread management, and mobile-responsive layout. Does NOT include: content generation pipelines (Phase 3), ad creative studio (Phase 4), or one-click publishing (v2).

</domain>

<decisions>
## Implementation Decisions

### Chat Layout & Feel
- Sidebar + chat layout — left sidebar with campaign list, main area is chat (builds on Phase 1 app shell)
- Sidebar collapses on mobile (375px) — hamburger menu opens sidebar as overlay
- Bubble-style messages — user messages right-aligned blue bubbles, AI messages left-aligned gray/white bubbles
- Rich inline artifacts — images, videos, channel previews all render inside chat bubbles, not in separate panels
- Channel-native previews: WhatsApp shows in phone frame with green bubbles, Instagram as a post with avatar/likes, email in client frame, flyers render as actual flyers
- Image/template selection via horizontal swipe carousel — tap to select, selected gets blue border/checkmark, shows 2-3 at a time with peek
- Visual, classy, high-fidelity design — reference: Dribbble AI chat examples with rich card rendering

### Chat Input Area
- Text input with:
  - Tone selector (formal/casual/inspiring per CHAT-07)
  - Attachment button (paperclip icon for file/image uploads)
  - Voice dictation button (microphone icon)
  - Stop button (appears during streaming, replaces send)
  - Edit prompt capability (user can edit their last message and resubmit)

### Streaming & AI Provider
- Multi-model orchestration from day one:
  - Claude Sonnet 4.6 — final copywriting and orchestration/decision-making
  - Gemini Flash — intermediate/volume tasks
  - Perplexity Sonar — research queries
  - Google Nano Banana Pro — image generation
  - Google Veo 3 — video creation (deferred to Phase 4+, wire provider only)
- Progressive card rendering — stream text normally, rich content (research cards, images) appears as loading skeletons that fill in progressively
- Stop mid-stream keeps partial content + allows edit and retry
- Regenerate button below AI responses (small icon, reruns same prompt — CHAT-05)
- Contextual action chips after AI responses — 2-4 pill buttons like "Generate ad creatives", "Translate to Hindi", "Try a different tone" (CHAT-06)

### Rich Content Parts
- Research cards: expandable — compact card with dimension name + summary, click to expand full findings with sources
- Copy blocks: channel-specific high-fidelity mockups (WhatsApp phone frame, Instagram post preview, email client frame)
- Image previews: horizontal swipe carousel with tap-to-select
- Ad previews: rendered with orientation indicators (square/vertical/horizontal)
- All parts use the Vercel AI SDK UIMessage custom parts pattern (typed discriminated union)

### Thread & Campaign Management
- Campaign type selector on "New Campaign" — shows all 9 types from existing component:
  - Active: Introductory Workshop, National Ad Campaign, India Marketing
  - Coming Soon: Gurudev's Tour, Special Event with Gurudev, State Campaign, City Campaign, Special Event, Graduate Workshop
- Auto-title from first message context (e.g., "Bangalore Yoga Workshop — March 2026") — editable in sidebar
- Sidebar groups campaigns by recency: Today, Yesterday, Last 7 days, Older — each shows title + type icon + last activity
- Resume conversation: click past campaign in sidebar → load full chat history → type new message to continue where left off
- Campaign data uses existing Supabase `campaigns` and `campaign_messages` tables with RLS

### Claude's Discretion
- Exact streaming buffer/chunk size for progressive rendering
- UIMessage part type schemas (TypeScript discriminated union structure)
- AI SDK provider initialization and configuration
- Prompt registry integration with orchestrator
- Error handling and loading state patterns
- Voice dictation implementation (Web Speech API vs external)
- Exact mobile breakpoint behaviors beyond 375px

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Chat Architecture
- `.planning/research/ARCHITECTURE.md` §Pattern 1 — UIMessage Parts for Rich Content (typed custom data schemas)
- `.planning/research/ARCHITECTURE.md` §Pattern 4 — Streaming with Progressive Content Parts
- `.planning/research/ARCHITECTURE.md` §Data Flow — Primary Flow: User Message to Rich Chat Response
- `.planning/research/ARCHITECTURE.md` §Recommended Project Structure — components/chat/ directory structure

### AI Orchestration
- `.planning/research/ARCHITECTURE.md` §Pattern 2 — Rule-Based Provider Routing (TASK_MODEL_MAP)
- `.planning/research/STACK.md` §AI Provider Packages — @ai-sdk/google, @ai-sdk/anthropic, @ai-sdk/openai, @ai-sdk/perplexity
- `.planning/research/STACK.md` §Stack Patterns — streaming, structured output, multi-model routing patterns

### Pitfalls
- `.planning/research/PITFALLS.md` §Pitfall 1 — Vercel function timeout (never put image gen in same function as streaming text)
- `.planning/research/PITFALLS.md` §Pitfall 6 — Context window exhaustion (sliding window, research-as-record)
- `.planning/research/PITFALLS.md` §Pitfall 7 — Streaming state race conditions (use useChat as single source of truth)

### Existing Code
- `components/campaign-selection/campaign-selection.tsx` — 9 campaign types with CampaignTypeCard component (reuse)
- `lib/supabase/server.ts` — Server client for route handlers
- `supabase/migrations/20260329000001_foundation_schema.sql` — campaigns + campaign_messages table schemas
- `supabase/seed/prompts.sql` — 14 seeded prompts with domain.task keys

### Requirements
- `.planning/REQUIREMENTS.md` — CHAT-01 through CHAT-11, INFRA-02, INFRA-07

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **CampaignTypeCard** (`components/campaign-selection/`): 9 campaign types with icons, coming-soon tags — reuse for new campaign flow
- **shadcn/ui components** (`components/ui/`): 55+ components including card, dialog, select, tabs, carousel, scroll-area, sheet (for mobile sidebar)
- **App shell** (`app/(app)/layout.tsx`): Sidebar with "New Campaign" button and campaigns placeholder — extend with campaign list
- **Supabase clients** (`lib/supabase/`): Browser, server, admin clients — use for campaign CRUD and message persistence
- **Prompt registry seed** (`supabase/seed/prompts.sql`): 14 prompts ready to load via orchestrator

### Established Patterns
- **@supabase/ssr** for auth: createServerClient in route handlers, createBrowserClient in components
- **Middleware**: Session refresh via @supabase/ssr in root middleware.ts
- **RLS**: All data access through Supabase client respects role-based policies
- **Brand**: Amplify blue (#3D8BE8), peach (#E47D6C), Raleway font

### Integration Points
- **`app/(app)/chat/page.tsx`**: Current placeholder — replace with full chat UI
- **`app/(app)/layout.tsx`**: Sidebar needs campaign list populated from Supabase
- **`app/api/`**: New `/api/chat` streaming route needed
- **`lib/`**: New `lib/ai/orchestrator.ts`, `lib/ai/providers.ts`, `lib/prompts/registry.ts` needed

</code_context>

<specifics>
## Specific Ideas

- Chat should feel "rich, visual, classy" — referenced Dribbble AI chat designs with high-fidelity card rendering
- Channel previews should be channel-native: WhatsApp in phone frame with green bubbles, Instagram as actual post with likes/caption, email in client frame, flyers render as flyers
- Image selection via horizontal swipe carousel (like app store screenshots) — not grids
- Voice dictation as input method alongside typing
- User mentioned wanting to switch between content creation and pushing to channels — deferred to v2 publishing

</specifics>

<deferred>
## Deferred Ideas

- **One-click publishing** to email/social/WhatsApp — v2 requirement (PUB-01 through PUB-04), explicitly out of scope for this milestone
- **Video generation with Veo 3** — wire the provider in Phase 2 but actual video creation pipeline belongs in Phase 4+
- **Cross-role visual asset catalog** — coordinators/national seeing all teacher assets belongs in Phase 4 (Campaign Management). RLS already handles data access; the browse UI comes later.
- **WhatsApp Cloud Platform integration** — for pushing content directly, v2 scope

</deferred>

---

*Phase: 02-chat-core*
*Context gathered: 2026-03-30*
