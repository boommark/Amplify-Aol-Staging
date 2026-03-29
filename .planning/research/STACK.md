# Stack Research

**Domain:** AI-powered marketing chatbot platform (multi-model, streaming, Canva creative export)
**Researched:** 2026-03-29
**Confidence:** HIGH (verified via official docs, npm, and current search results)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (latest stable) | Full-stack React framework | App Router gives per-route streaming, Server Actions, and Middleware — ideal for chat + auth + API routes in one codebase. Vercel-native deployment. |
| TypeScript | 5.x | Type safety | Required for AI SDK v6 type inference on model outputs and Zod schema validation. |
| Tailwind CSS | v4.x | Styling | v4 ships in 2025 with CSS-native config (no tailwind.config.js), faster builds. shadcn/ui CLI supports it as of Feb 2026. Included in Next.js 15 create-next-app. |
| shadcn/ui | CLI v4 (March 2026) | Component library | Copy-paste model means full ownership. shadcn/ai namespace now ships production-ready streaming chat components with AI SDK v6 integration. |
| Vercel AI SDK | v6.x (`ai` package) | AI provider orchestration + streaming | Unified interface across all 4 providers (Gemini, Claude, OpenAI, Perplexity). `useChat`, `streamText`, `generateObject` cover every pattern needed. Single SDK, no per-provider SDKs needed in app code. |
| Supabase | Latest (`@supabase/ssr` 0.9.x) | Auth + PostgreSQL database | `@supabase/ssr` handles cookie-based sessions in Next.js App Router. RLS covers role-based data isolation. `@supabase/auth-helpers-nextjs` is deprecated — do not use. |

### AI Provider Packages

| Package | Version | Purpose | Usage |
|---------|---------|---------|-------|
| `@ai-sdk/google` | 1.2.x | Gemini provider | High-volume text generation, image gen (Imagen), Veo video. `gemini-2.5-flash` for speed, `gemini-2.5-pro` for quality. |
| `@ai-sdk/anthropic` | Latest | Claude provider | Premium copywriting, nuanced brand voice tasks. `claude-sonnet-4-5` or `claude-opus-4` per task. |
| `@ai-sdk/openai` | Latest | OpenAI provider | GPT-Image for ad creative generation. `gpt-image-1.5` for creative export pipeline. |
| `@ai-sdk/perplexity` (community) | Latest | Perplexity Sonar provider | Market research queries. Use `sonar-pro` model for multi-step research; `sonar` for lightweight fact retrieval. Perplexity returns cited sources in responses. |

Note: The AI SDK v6 Vercel AI Gateway can route to all providers via a single API key. For cost transparency and direct billing, use per-provider packages (listed above) instead of the Gateway.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@aws-sdk/client-s3` | 3.1019.x | S3 asset storage | Generating presigned PutObject URLs server-side; storing Canva exports and AI-generated images. Required for all media uploads from Vercel (can't proxy large files through serverless). |
| `@aws-sdk/s3-request-presigner` | 3.x (bundled with aws-sdk) | Presigned URL generation | Pair with `client-s3` to generate time-limited upload/download URLs. Never expose AWS credentials client-side. |
| `react-markdown` | 9.x | Markdown rendering in chat | AI responses come as markdown. Required to render formatted copy blocks, headers, lists inline in chat messages. |
| `rehype-highlight` | 7.x | Code syntax highlighting | Render code blocks in AI responses cleanly. Lighter than `react-syntax-highlighter` for this use case. |
| `zod` | 3.x (or `zod/v4`) | Schema validation | AI SDK `generateObject` requires Zod schemas. Also used for form validation and API input validation. |
| `react-hook-form` | 7.x | Form management | Tone selector, admin prompt editor, any settings forms. Pair with `@hookform/resolvers/zod`. |
| `@tanstack/react-query` | 5.x | Server state management | Campaign history, asset lists — anything fetched from Supabase that needs caching and background refresh. |
| `lucide-react` | Latest | Icons | Already included in shadcn/ui ecosystem. Use consistently; avoid mixing icon sets. |
| `date-fns` | 3.x | Date formatting | Campaign timestamps, chat thread dates. Lightweight vs `moment.js`. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `pnpm` | Package manager | Faster installs, strict dependency resolution vs npm. Used by shadcn/ui CLI v4. |
| ESLint + `@typescript-eslint` | Linting | Next.js 15 ships with flat ESLint config. |
| Prettier | Code formatting | Integrate with Tailwind plugin for class sorting. |
| Supabase CLI | Local dev + migrations | `supabase db diff` → `supabase db push` for schema management. Use local Supabase via Docker for development. |
| Vercel CLI | Deployment + env management | `vercel env pull` to sync env vars locally. Required for staging/prod parity. |

---

## Installation

```bash
# Bootstrap
npx create-next-app@latest amplify-aol --typescript --tailwind --app --src-dir
cd amplify-aol

# AI SDK core + providers
pnpm add ai @ai-sdk/google @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/perplexity

# Supabase (SSR pattern — NOT auth-helpers-nextjs)
pnpm add @supabase/supabase-js @supabase/ssr

# AWS S3
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# UI + chat rendering
pnpm add react-markdown rehype-highlight zod react-hook-form @hookform/resolvers

# State + utilities
pnpm add @tanstack/react-query date-fns

# shadcn/ui (CLI-driven, copy-paste components)
pnpm dlx shadcn@latest init
# Then add components as needed:
# pnpm dlx shadcn@latest add button input textarea card badge

# Dev dependencies
pnpm add -D @types/node eslint prettier
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vercel AI SDK v6 | LangChain.js | LangChain when you need complex RAG pipelines or LangGraph for stateful agent graphs. For Amplify's direct API call pattern, AI SDK is lighter and cleaner. |
| Vercel AI SDK v6 | Direct provider SDKs (`@google/generative-ai`, `@anthropic-ai/sdk`) | When you need provider-specific features not yet exposed through AI SDK (e.g., Gemini video streaming, Anthropic extended thinking). Start with AI SDK; drop to native SDK only for specific tasks. |
| shadcn/ui + shadcn-chatbot-kit | CopilotKit, assistant-ui | CopilotKit for copilot-style embed-in-app-anywhere UX. assistant-ui for headless/bring-your-own-design. Amplify needs owned UI with brand customization — shadcn gives full code ownership. |
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | Never. auth-helpers-nextjs is end-of-life (final version 0.15.0). All new projects must use `@supabase/ssr`. |
| Canva Connect REST API | Canva MCP (Claude Desktop) | Canva MCP is for AI assistants in interactive desktop contexts (Claude Desktop, Cursor). For server-side design generation from a Next.js API route, use Canva Connect REST API directly. |
| `@aws-sdk/client-s3` presigned URLs | Vercel Blob Storage | Vercel Blob for simple user file uploads. Use S3 when you already have an S3 bucket (Amplify does), need to store at scale, or want assets in your own AWS account for cost/compliance. |
| `react-markdown` + `rehype-highlight` | `react-syntax-highlighter` | react-syntax-highlighter when you need rich code theming (IDEs, developer tools). For a marketing chat UI, `rehype-highlight` is sufficient and lighter. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@supabase/auth-helpers-nextjs` | End-of-life (v0.15.0 final, no updates). Breaks with Next.js 15 App Router edge cases. | `@supabase/ssr` v0.9.x |
| LangChain.js / LangGraph | Over-engineered for direct API calls. Adds abstraction layers that make debugging harder. PROJECT.md explicitly forbids it. | Vercel AI SDK v6 with custom `ToolLoopAgent` |
| n8n / workflow middleware | Existing v1 pain point. Hard to debug, version-lock issues, separate hosting cost. PROJECT.md explicitly forbids it. | Next.js API routes with AI SDK |
| `create-react-app` or Vite SPA | No SSR, no API routes — can't keep API keys server-side for AI calls or S3. | Next.js 15 App Router |
| Hardcoded AI prompts in code | Can't A/B test, admin can't edit, requires deploys to change. | Prompts stored in Supabase `prompts` table, loaded at call time |
| `moment.js` | 67KB bundle size, legacy API, unmaintained for new features. | `date-fns` v3 (tree-shakeable, 20x smaller) |
| Tailwind v3 config patterns | Tailwind v4 removes `tailwind.config.js`. Third-party UI libs using v3 patterns will conflict. | Use `@theme` CSS variables in `globals.css` per Tailwind v4 |
| Vercel AI Gateway (for billing transparency) | Adds Vercel as billing intermediary; harder to track per-provider costs for the $0.40-0.60 per-campaign budget target. | Direct provider packages (`@ai-sdk/google`, `@ai-sdk/anthropic`, etc.) |

---

## Stack Patterns by Scenario

**For streaming AI responses in chat UI:**
- Use `streamText()` in a Next.js Route Handler (`app/api/chat/route.ts`)
- Return `result.toDataStreamResponse()` — not a raw Response
- Consume with `useChat()` hook from `@ai-sdk/react` in the client component
- This handles backpressure, cancellation, and reconnection automatically

**For structured AI output (research cards, copy blocks):**
- Use `streamObject()` or `generateObject()` with a Zod schema
- Stream partial objects into custom card components via `useObject()` hook
- Example: market research card renders field-by-field as the AI fills it in

**For multi-model routing (different model per task):**
- Keep a `lib/ai/models.ts` file that exports named model instances
- `const researchModel = perplexity('sonar-pro')` / `const copyModel = anthropic('claude-sonnet-4-5')`
- Pass the appropriate model to `streamText({ model: researchModel, ... })`
- No framework needed — AI SDK provider-switching is one line

**For Canva template population (server-side):**
- Use Canva Connect REST API, NOT the MCP server (MCP is for interactive AI desktop clients)
- Flow: `POST /autofills` → poll `GET /autofills/{id}` → `GET /exports` for file URL
- Store Canva OAuth tokens per user in Supabase (Canva uses user-scoped auth)
- Treat autofill as async job: queue job in Supabase, webhook or poll for completion, upload result to S3

**For S3 uploads from Vercel:**
- Always use presigned URLs — Vercel serverless functions have a 4.5MB request body limit
- API route generates presigned `PutObject` URL with `@aws-sdk/s3-request-presigner`
- Client uploads directly to S3 with the presigned URL (bypasses Vercel entirely)
- Store final S3 key in Supabase after confirming upload

**For Supabase auth with App Router:**
- Create three client factories: `createBrowserClient` (client components), `createServerClient` (Server Components/Route Handlers), `createServerClient` in `middleware.ts` for session refresh
- The `@supabase/ssr` package handles cookie management for all three contexts
- RLS policies on all tables using `auth.uid()` and a `user_role` column join

---

## Canva Integration Detail

Canva has two separate integration surfaces. Choose correctly:

| Surface | What It Is | When to Use |
|---------|-----------|-------------|
| Canva Connect REST API | REST endpoints for design CRUD, autofill, export. OAuth 2.0 + PKCE per user. | **Use this for Amplify** — server-side design generation from Next.js API routes |
| Canva MCP Server | Model Context Protocol server for AI desktop assistants (Claude Desktop, Cursor). | For developers using Canva while building their integration. Not for production app backends. |

Canva Connect API flow for ad creative generation:
1. User authenticates with Canva (OAuth, stored in Supabase)
2. `GET /brand-templates` to list available templates
3. `GET /brand-templates/{id}/dataset` to get field names (text placeholders, image slots)
4. `POST /autofills` with `{ brand_template_id, data: { fields: [...] } }` — returns `job_id`
5. Poll `GET /autofills/{job_id}` until `status: "success"` — returns `design.id`
6. `POST /exports` to trigger export (PNG/PDF, async) — returns `export_job_id`
7. Poll `GET /exports/{export_job_id}` until complete — returns file URL
8. Download file from Canva CDN → upload to S3 → store S3 key in Supabase campaign record

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `ai` v6.x | Next.js 15, React 19 | AI SDK v6 released Dec 2025. Upgrade from v4/v5 via `npx @ai-sdk/codemod upgrade v6`. |
| `@supabase/ssr` 0.9.x | Next.js 15 App Router | Explicitly tested against Next.js 15. Replaces deprecated `auth-helpers-nextjs`. |
| `tailwindcss` v4.x | Next.js 15, shadcn/ui CLI v4 | shadcn CLI v4 (March 2026) supports Tailwind v4. Do NOT use Tailwind v4 with shadcn CLI v3 or older. |
| `@aws-sdk/client-s3` 3.x | Node.js 20+ | AWS SDK v3 drops Node.js v18 support in Jan 2026. Vercel defaults to Node.js 20 — compatible. |
| `react-markdown` 9.x | React 18/19 | v9 requires ESM. In Next.js, add to `transpilePackages` if import issues arise. |
| `zod` v3.x vs v4 | AI SDK v6 | AI SDK v6 ships with Zod 3 support. Zod v4 available as `zod/v4` import path — works with `@hookform/resolvers` 3.x+ |

---

## Sources

- `https://ai-sdk.dev/docs/introduction` — AI SDK v6 confirmed current, 25+ providers listed (HIGH confidence)
- `https://vercel.com/blog/ai-sdk-6` — v6 release notes, Dec 2025 (HIGH confidence)
- `https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai` — `@ai-sdk/google@1.2.23`, Gemini 2.5 and 3.x models (HIGH confidence)
- `https://www.npmjs.com/package/@supabase/ssr` — v0.9.0, updated 24 days ago (HIGH confidence)
- `https://supabase.com/docs/guides/auth/server-side/nextjs` — Cookie-based SSR auth pattern (HIGH confidence)
- `https://www.canva.dev/docs/connect/autofill-guide/` — Autofill API workflow, OAuth scopes (HIGH confidence)
- `https://www.canva.dev/docs/apps/mcp-server/` — MCP server is for developer tooling, not production backends (HIGH confidence)
- `https://www.npmjs.com/package/@aws-sdk/client-s3` — v3.1019.0 current (HIGH confidence)
- `https://vercel.com/templates/next.js/aws-s3-image-upload-nextjs` — Presigned URL pattern for Vercel (HIGH confidence)
- `https://ui.shadcn.com/docs/changelog/2026-03-cli-v4` — shadcn CLI v4 released March 2026 (HIGH confidence)
- `https://docs.perplexity.ai/docs/sonar/models` — Sonar, Sonar Pro, Sonar Reasoning Pro, Sonar Deep Research models (HIGH confidence)
- `https://docs.fal.ai/model-apis/integrations/nextjs/` — fal.ai Next.js integration with `fal.subscribe("fal-ai/flux/dev", ...)` (MEDIUM confidence — optional fallback only per PROJECT.md)

---

*Stack research for: Amplify Marketing Suite — AI chatbot platform with multi-model orchestration, Canva creative export, and Supabase auth*
*Researched: 2026-03-29*
