# Pitfalls Research

**Domain:** AI-powered marketing chatbot platform (Next.js, multi-model LLM, Supabase, Vercel, Canva API, AWS S3)
**Researched:** 2026-03-29
**Confidence:** HIGH (streaming/Vercel/Supabase pitfalls), MEDIUM (Canva API, prompt management), LOW (Canva MCP-specific)

---

## Critical Pitfalls

### Pitfall 1: Vercel Function Timeout on Image Generation and Multi-Step Pipelines

**What goes wrong:**
AI image generation (GPT Image 1.5, Nano Banana 2, Flux via fal.ai) routinely takes 60-120 seconds. Vercel's default function duration is 10 seconds on Hobby, 300 seconds on Pro with Fluid Compute enabled. A single API route that runs the full ad creative pipeline — research + copy + image generation + S3 upload — will hit the limit reliably. The stream gets silently truncated with no error visible to the user; the chat appears to hang.

**Why it happens:**
Developers assume Vercel's 5-minute default covers all cases, but this only applies with Fluid Compute enabled AND on Pro/Enterprise plans. Legacy projects default to 10s. The pipeline is built as a single long-running function instead of being broken into discrete steps.

**How to avoid:**
- Enable Fluid Compute explicitly in `vercel.json` (`"fluid": true`)
- Set `export const maxDuration = 300` on every AI route handler
- Split image generation into a separate background job: the chat route streams text immediately, then fires an async image job that updates the UI via polling or Supabase Realtime
- Image generation should never be in the same function as streaming text

**Warning signs:**
- Chat responses cut off mid-stream in Vercel production but work fine in local dev
- Vercel logs show `FUNCTION_INVOCATION_TIMEOUT` errors
- Image generation works for simple prompts but fails for complex ones (variable latency)

**Phase to address:** Phase 1 (Infrastructure setup) — configure `maxDuration` and Fluid Compute before writing any AI routes. Phase 3 (Ad Creative Studio) — implement async image job pattern.

---

### Pitfall 2: Canva Autofill API Requires Enterprise Account

**What goes wrong:**
The project assumes Canva MCP will handle programmatic template population. In reality, Canva's Autofill API (the only mechanism for replacing text/image placeholders in templates) is gated behind an Enterprise Canva organization membership. Standard or Pro accounts cannot use it. The Canva MCP tool wraps the Connect API — which has the same Enterprise restriction for template autofill.

**Why it happens:**
Canva's marketing for the Connect API is broad, but the capability table buries the Enterprise requirement. The MCP abstraction further obscures what the underlying API actually supports.

**How to avoid:**
- Verify immediately (Phase 1) whether the Canva account is Enterprise or can be upgraded
- If Enterprise is not available, pivot to a direct image composition approach: use Sharp or Canvas (Node.js) to composite text over image assets, bypassing Canva entirely for MVP
- Document the Canva dependency as a hard prerequisite before Phase 4 (Ad Creative Studio)
- Keep the Canva integration in its own isolated module so it can be swapped without touching the rest of the pipeline

**Warning signs:**
- Canva MCP calls return 403 or "insufficient permissions" for autofill operations
- MCP documentation refers to "organization" scope without specifying tier
- Template editing works in the Canva UI but the API rejects the same operation

**Phase to address:** Phase 1 (prerequisite validation) — confirm Canva account tier before building any creative pipeline. If blocked, decide alternate approach before Phase 4.

---

### Pitfall 3: Supabase RLS Not Enforced on New Tables

**What goes wrong:**
Every new table in Supabase has RLS disabled by default. If a migration creates a table and forgets `ALTER TABLE x ENABLE ROW LEVEL SECURITY`, all rows are publicly readable via the Supabase REST API using the anon key. For Amplify, this means campaign data from teachers could be readable across role boundaries. The Lovable incident (CVE-2025-48757, 170+ exposed apps) demonstrated this is a systemic mistake, not a rare one.

**Why it happens:**
Developers test in the Supabase SQL Editor, which runs as `postgres` superuser and bypasses RLS. Everything appears to work. The exposure only exists when accessed through the client SDK with the anon/authenticated key.

**How to avoid:**
- Every migration SQL file must include `ALTER TABLE x ENABLE ROW LEVEL SECURITY` immediately after `CREATE TABLE x`
- Create a migration testing checklist that tests all tables via the Supabase JS client (not the SQL Editor)
- For this project specifically: campaigns, assets, messages, and research tables all need policies scoped to `auth.uid()` and the user's role
- Use `(SELECT auth.jwt()->'app_metadata'->>'role')` for role checks in policies — **not** `user_metadata` which users can self-modify

**Warning signs:**
- Running `SELECT * FROM pg_tables WHERE rowsecurity = false` returns application tables (not just system tables)
- Supabase dashboard shows tables with RLS toggle off
- Client-side queries return rows that belong to other users

**Phase to address:** Phase 1 (database schema and auth setup) — RLS must be enabled and tested on all tables before any user-facing feature is built.

---

### Pitfall 4: Storing Role in user_metadata Instead of app_metadata

**What goes wrong:**
Supabase Auth has two metadata fields: `user_metadata` (user-writable via the client SDK) and `app_metadata` (server-writable only). If role assignments (Teacher, State Coordinator, National, Admin) are stored in `user_metadata`, any authenticated user can call `supabase.auth.updateUser({ data: { role: 'Admin' } })` and escalate their own privileges. RLS policies that check `user_metadata` for roles are bypassed entirely.

**Why it happens:**
`user_metadata` is the first metadata field encountered in the Supabase auth docs and is simpler to set. The distinction from `app_metadata` is not prominently featured until the security section.

**How to avoid:**
- Store all role assignments exclusively in `app_metadata` via the Supabase Admin API (service role key, server-side only)
- RLS policies must reference `(SELECT auth.jwt()->'app_metadata'->>'role')` not `user_metadata`
- Never expose the service role key to the client; role assignment is an admin-only server operation
- On first login (new user created), a server-side webhook or trigger assigns the default role (`teacher`) to `app_metadata`

**Warning signs:**
- Role check in RLS policy uses `raw_user_meta_data` instead of `raw_app_meta_data`
- User can change their own displayed role without admin action
- JWT decoded in client shows role under `user_metadata` key

**Phase to address:** Phase 1 (auth setup) — role architecture decision must be locked before any RLS policy is written.

---

### Pitfall 5: Unprotected AI Route Endpoints Enabling Cost Runaway

**What goes wrong:**
Next.js API routes and Server Actions are public HTTP endpoints. An unauthenticated or rate-unlimited `/api/chat` or `/api/generate-image` route can be discovered and abused — intentionally or by crawlers — to generate thousands of AI calls at the developer's expense. With 4 AI providers (Gemini, Claude, OpenAI, Perplexity) and per-campaign costs targeting $0.40-0.60, a single abuse incident could generate hundreds of dollars in API charges before detection.

**Why it happens:**
Auth middleware is often added after the feature is built and working. During development the routes are open for convenience. The protection step gets skipped under deadline pressure.

**How to avoid:**
- Auth check must be the first line of every AI route: validate the Supabase session server-side before any AI call
- Implement per-user rate limiting from day one: 5 campaign generations per user per day as a hard cap
- Set hard spend limits on each AI provider's dashboard (Google AI Studio, Anthropic, OpenAI) before first deployment to staging
- Log every AI call with user ID, model, token counts, and estimated cost to Supabase — enables anomaly detection

**Warning signs:**
- AI routes work without a logged-in session during local testing
- No rate limiting middleware on `/api/` routes
- AI provider dashboards show no spend alerts configured

**Phase to address:** Phase 1 (foundation) — auth middleware on all routes before any AI integration. Phase 2 (first AI feature) — rate limiting and spend alerts before any API key touches a deployed environment.

---

### Pitfall 6: Context Window Exhaustion in Long Campaign Conversations

**What goes wrong:**
A full Amplify campaign conversation includes: system prompt, research results (7 Perplexity query results = ~3,000 tokens each = ~21,000 tokens), multiple back-and-forth turns, generated copy for 4 channels, quote suggestions, and ad creative instructions. This exceeds 32K tokens in a long session. Passing the full history to each subsequent AI call causes: (a) API errors when the limit is hit, (b) "context rot" where model quality degrades as the window fills, and (c) significant token cost multiplication on every follow-up message.

**Why it happens:**
Developers pass `messages` array directly from chat state to the AI API without token budgeting. Works for short conversations, breaks silently for long ones (the AI just starts giving worse answers — no error thrown until the hard limit is hit).

**How to avoid:**
- Treat research results as structured context stored in Supabase, not as chat messages — load them selectively per request rather than replaying in message history
- Implement a sliding window: keep system prompt + last 10 turns + campaign summary
- After research phase completes, store the research as a structured `research_context` record and reference it with a short summary in subsequent AI calls
- Set explicit token budget per request and log actual usage — alert when approaching 80% of model limit

**Warning signs:**
- Late-conversation AI responses start contradicting earlier ones or ignoring brand voice
- Token usage per call climbs steadily as conversation lengthens
- API occasionally throws context length errors on complex sessions

**Phase to address:** Phase 2 (research pipeline) — establish the research-as-context-record pattern before it becomes technical debt. Phase 3 (multi-channel content) — validate token budgets before adding more generation steps.

---

### Pitfall 7: Streaming State Race Conditions Corrupting Chat UI

**What goes wrong:**
When streaming AI responses, React state updates arrive faster than the UI can reconcile them. Common failure modes: messages overwrite each other during simultaneous streams, the final persisted message in Supabase differs from what was displayed (stream chunks not flushed before the database write), or the "thinking" indicator disappears before the message fully renders. In a multi-step pipeline (research → copy → images) with separate streams, the UI shows partial states that confuse users.

**Why it happens:**
Developers manage streaming state with `useState` and naive append logic. Concurrent updates from multiple async operations create race conditions. The Vercel AI SDK's `useChat` handles single-stream cases well but requires explicit handling for multi-step or parallel streams.

**How to avoid:**
- Use Vercel AI SDK's `useChat` hook as the single source of truth for streaming state — do not mix with raw fetch/EventSource
- For multi-step pipelines, use a single stream with data annotations (`streamObject` with step markers) rather than multiple parallel streams
- Database persistence happens only after the stream is fully complete — use `onFinish` callback, never write mid-stream
- Test with slow network throttling (Chrome DevTools: "Slow 3G") to surface race conditions that are invisible on localhost

**Warning signs:**
- Duplicate messages appear in chat after network interruption
- Chat history loaded from database shows different content than what was streamed
- `useEffect` dependencies include streaming state (usually a sign of incorrect state architecture)

**Phase to address:** Phase 2 (chat infrastructure) — streaming architecture must be correct before building content pipelines on top of it.

---

### Pitfall 8: Prompt Version Mutations Breaking Active Campaigns

**What goes wrong:**
The admin prompt testing screen allows editing prompts stored in Supabase. If a prompt record is updated in-place (same row, updated `content` column), all in-flight campaigns using that prompt ID now use the new version mid-session. A teacher's ongoing campaign changes behavior between their first message and their second. Additionally, if a prompt change causes an AI call to fail, there is no rollback mechanism and the system breaks silently in production.

**Why it happens:**
Treating prompts like configuration (mutable records) rather than like code (immutable versioned artifacts). The simplest implementation updates the record directly, which feels natural but is incorrect for production systems.

**How to avoid:**
- Prompt table schema must enforce immutability: new content = new row with an incremented `version` integer and a `is_active` boolean
- Active campaigns reference a specific prompt version ID, not the prompt name
- The admin testing screen creates new versions, never edits existing ones — the UI should visually enforce this ("Save as new version" not "Save")
- Rollback = set `is_active = false` on current version, set `is_active = true` on previous version

**Warning signs:**
- Prompt table has an `updated_at` column being written (should be write-once)
- Foreign keys from campaigns/generations point to prompt name (string) rather than prompt version ID (UUID)
- Admin screen has a "Save" button that overwrites

**Phase to address:** Phase 1 (database schema) — immutable versioning schema must be designed before any prompts are stored. Phase 5 (admin screen) — UI must enforce the version pattern, not just allow it.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode AI model names in route handlers | Faster to ship | Model changes require code deploys; breaks prompt testing screen | Never — use prompt config records from day one |
| Pass full message history to every AI call | Simple implementation | Token costs multiply; context rot in long sessions; hard limit failures | Only for single-turn interactions, never for multi-turn campaigns |
| Single API route for full pipeline | Fewer files, simpler | One slow step blocks all streaming; hits function timeout | Never for operations exceeding 30 seconds |
| Skip RLS on "internal" tables | Faster schema setup | Data leaks between user tiers; requires migration to fix later | Never — no table is truly internal if it holds user data |
| Service role key in environment variable accessible to client | Easy data access | Full database access for any attacker who reads the key | Never — service role key is server-only, always |
| Store generated images directly in Supabase Storage instead of S3 | Fewer integrations | Supabase Storage free tier limits (1GB); inconsistent CDN performance | MVP only, with S3 migration planned |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth (Google OAuth) | Using the same redirect URL across dev/staging/prod environments | Maintain separate OAuth client IDs per environment; each has its own allowed redirect URL list |
| Supabase RLS | Testing policies in the SQL Editor (runs as superuser, bypasses RLS) | Test all policies via Supabase JS client with actual user sessions |
| Vercel AI SDK streaming | Using `fetch` + manual SSE parsing for streaming | Use `useChat` hook and `streamText` / `streamObject` from the AI SDK — they handle reconnection, state, and error recovery |
| OpenAI GPT Image 1.5 | Assuming synchronous response within timeout | GPT Image 1.5 generation can take 30-90 seconds; always handle as async job with polling |
| Perplexity API (research) | Single large query for all research dimensions | 7 parallel queries (one per research dimension) as the n8n workflows established — parallel is 3-5x faster |
| AWS S3 uploads | Uploading from the Vercel function (adds to function duration) | Generate a presigned URL server-side, upload directly from client to S3 — removes S3 from function execution path |
| Canva Connect API | Treating MCP calls as synchronous | Canva uses background jobs for asset processing — must poll for completion; plan for 10-30 second waits |
| Supabase Realtime | Using Realtime for all state updates | Realtime has connection limits on the free tier (200 concurrent); use for critical async job updates (image generation complete) only |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Sequential AI calls in a pipeline | Each step waits for the previous; 7-step pipeline takes 70-140 seconds | Fan out independent calls in parallel using `Promise.all`; only chain when output of one is input to next | Immediately on the research pipeline (7 Perplexity calls) |
| Loading full campaign history on every chat render | Slow page load as campaign grows | Paginate messages; load only last 20 on open, infinite scroll backward | ~50+ messages per campaign |
| No database indexes on RLS policy columns | Queries slow down as rows accumulate | Index `user_id`, `role`, `campaign_id` columns used in WHERE clauses and RLS policies | ~1,000+ rows |
| Storing large AI responses as JSON blobs in one column | Difficult to query, full-row locks on updates | Store structured data in typed columns; store raw LLM output separately from structured content | At reporting/admin screen level |
| Re-fetching research data for each generation step | Redundant Perplexity API calls, inflated cost | Cache research results in `campaign_research` table; reference by campaign ID in all downstream calls | Every subsequent generation in the same campaign |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing service role key in client bundle or public env var | Full database access for any attacker | Service role key only in `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`); validate this in CI |
| Role check in RLS using `user_metadata` | Users can self-escalate to Admin/National Team | All role checks use `app_metadata` exclusively; set roles only via server-side Admin API |
| No authentication on AI streaming endpoints | Unauthenticated cost abuse; data leakage | Validate Supabase session at the top of every route handler before touching any AI provider |
| AI provider API keys in `.env.local` without rotation plan | Key exposure = unlimited spend | Set hard spend limits on every AI provider dashboard; rotate keys quarterly; use Vercel's encrypted environment variables |
| Canva OAuth tokens stored in Supabase without encryption | Canva account takeover | Store Canva tokens in encrypted Supabase column or Vercel environment; never in plaintext user-accessible tables |
| Shared Supabase anon key used across environments | Staging data polluting production | Separate Supabase projects for staging and production; never share keys across environments |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No progress indication during multi-step pipeline (30-90 seconds) | Users think the app is broken; they reload and lose progress | Stream step-by-step status updates ("Researching your region... Generating copy... Creating images...") as text annotations in the same stream |
| Showing raw AI output before structured rendering | Marketing content looks like a wall of text | Render research as expandable cards, copy as channel-specific previews — define the component library before streaming content to it |
| Allowing new requests while pipeline is running | Duplicate campaigns, race conditions, wasted AI spend | Disable the input and show "Campaign in progress" until all steps complete; allow only follow-up refinements |
| No error recovery in chat UI | Single API failure kills the whole session | Implement per-step retry with "Try again" inline button; partial results (e.g., research done, copy failed) should be preserved |
| Tone selector and language settings buried in settings | Teachers don't discover customization; all output sounds the same | Surface tone selector and language in the chat input area as quick-select chips, not hidden in a settings page |
| Chat history without campaign naming | Teachers cannot find past campaigns | Auto-generate campaign names from conversation context (e.g., "Bangalore Yoga Workshop - March 2026") on thread creation |

---

## "Looks Done But Isn't" Checklist

- [ ] **Google OAuth login:** Verify redirect URL is whitelisted for staging AND production domains separately — local dev using different callback will break in deployed environments
- [ ] **RLS enabled:** Run `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false` — must return zero rows
- [ ] **Role-based data isolation:** Log in as a Teacher user and verify you cannot read another teacher's campaigns via the Supabase client
- [ ] **Streaming with auth:** Verify AI routes return 401 (not hang silently) when called without a valid session cookie
- [ ] **Image generation timeout:** Test with a real image generation call on Vercel staging (not localhost) to confirm Fluid Compute maxDuration is active
- [ ] **Prompt versioning:** Verify that editing a prompt in the admin screen creates a new version row, not an in-place update
- [ ] **Cost caps:** Confirm spend alerts are set on Google AI Studio, Anthropic Console, and OpenAI Platform dashboards before staging goes live
- [ ] **Canva Enterprise:** Confirm the Canva account has Enterprise access before building the creative pipeline — test the Autofill API with a real template
- [ ] **S3 presigned URLs:** Confirm generated images upload directly from client to S3 (not routing through Vercel function) — check Vercel function execution time does not include S3 transfer time
- [ ] **Context window budget:** Log actual token counts for a full campaign generation; confirm it stays under 80% of the target model's context limit

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS not enabled (data exposure discovered post-launch) | HIGH | Enable RLS immediately (zero downtime), but all policies must be written and tested before enabling or it locks out all users; requires immediate incident response if exposure window was open |
| Canva Enterprise blocker discovered mid-build | MEDIUM | Swap to Sharp-based image composition for MVP; Canva integration becomes Phase 2; maintain the same interface contract so the swap is internal |
| Vercel function timeout causing pipeline failures | LOW | Add `maxDuration` config + Fluid Compute enable; redeploy; no data loss |
| Prompt mutation corrupting active campaigns | HIGH | Requires data migration to split prompts into versioned rows; active sessions may have produced inconsistent outputs requiring manual review |
| AI provider key abuse (unauthorized spend) | MEDIUM | Rotate key immediately; set spend limits; audit logs to identify abuse vector; add rate limiting before re-enabling public access |
| Context window exhaustion causing late-conversation failures | MEDIUM | Add sliding window + research-as-context-record pattern; requires refactoring how messages are assembled before AI calls |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vercel function timeout | Phase 1 (infrastructure config) | Deploy a test route with `maxDuration = 300` and Fluid Compute to staging; confirm it runs 6+ minutes |
| Canva Enterprise requirement | Phase 1 (prerequisite validation) | Successful Autofill API call against a real template in the actual account |
| Supabase RLS not enabled | Phase 1 (database schema) | SQL query confirms zero tables with RLS disabled |
| Role in user_metadata | Phase 1 (auth architecture) | Attempt to self-escalate role via client SDK — must fail |
| Unprotected AI endpoints | Phase 1–2 (auth + first AI route) | Call AI route without session — must return 401 |
| Context window exhaustion | Phase 2 (research pipeline) | Log token counts for full campaign; validate budget |
| Streaming race conditions | Phase 2 (chat infrastructure) | Test with network throttle; verify database matches streamed content |
| Prompt version mutations | Phase 1 (schema) + Phase 5 (admin UI) | Edit a prompt in admin screen; verify new row created, original unchanged |

---

## Sources

- [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations) — official timeout and maxDuration documentation
- [Vercel AI SDK Timeout Troubleshooting](https://ai-sdk.dev/docs/troubleshooting/timeout-on-vercel) — streaming-specific timeout guidance
- [Resolving AI Image Generation Timeout on Vercel — LobeHub](https://lobehub.com/docs/self-hosting/faq/vercel-ai-image-timeout) — real-world timeout mitigation
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) — official RLS guide
- [Supabase RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — official performance guidance
- [Supabase Token Security and RLS](https://supabase.com/docs/guides/auth/oauth-server/token-security) — app_metadata vs user_metadata security
- [6 Common Supabase Auth Mistakes](https://startupik.com/6-common-supabase-auth-mistakes-and-fixes/) — auth pitfall reference
- [Canva Connect API Documentation](https://www.canva.dev/docs/connect/) — official API scope and limitations
- [Canva Connect API Limitations Analysis](https://img.ly/blog/img-ly-a-canva-connect-api-alternative-for-white-label-scalable-editing/) — Enterprise gate documentation
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/) — context rot and sliding window patterns
- [Context Rot — Product Talk](https://www.producttalk.org/context-rot/) — quality degradation in long sessions
- [Prompt Versioning Best Practices](https://www.getmaxim.ai/articles/prompt-versioning-and-its-best-practices-2025/) — immutability and rollback patterns
- [ZenML Prompt Engineering in Production](https://www.zenml.io/blog/prompt-engineering-management-in-production-practical-lessons-from-the-llmops-database) — production prompt management lessons
- [Rate Limiting Next.js Server Actions](https://nextjsweekly.com/blog/rate-limiting-server-actions) — abuse prevention patterns
- [AI API Aggregation Cost Management](https://www.cloudzero.com/blog/ai-api-aggregation/) — multi-provider cost opacity
- [LLM Cost Optimization](https://propelius.ai/blogs/llm-cost-optimization-strategies/) — token cost patterns
- [Vercel chatbot race condition fix](https://github.com/vercel/chatbot/pull/404) — streaming state race condition example

---
*Pitfalls research for: AI-powered marketing chatbot platform (Amplify)*
*Researched: 2026-03-29*
