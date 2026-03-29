# Amplify Marketing Suite

## What This Is

Amplify is an AI-powered marketing copilot for Art of Living teachers, state coordinators, and the national marketing team. Users describe what they need in natural language — a campaign for an upcoming workshop, ad creatives for a national initiative, Gurudev wisdom for social posts — and Amplify researches, writes, designs, and delivers production-ready marketing assets through a conversational chat interface. Think ChatGPT meets a full-stack marketing agency, purpose-built for Art of Living's mission.

## Core Value

A teacher with zero marketing experience can describe their upcoming workshop and receive a complete, multi-channel marketing kit (research, copy, images, ads, social posts) through a simple conversation — no forms, no learning curve, no design skills needed.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — building from scratch)

### Active

#### Authentication & Access
- [ ] User can sign in with Google (Supabase Auth)
- [ ] Users are assigned one of four roles: Teacher, State Coordinator, National Team, Admin
- [ ] Each role sees only their permitted data and features (row-level security)
- [ ] Admin role has access to prompt testing screen and system configuration

#### Conversational Chat Interface
- [ ] User interacts with Amplify through a chat-based UI (not forms)
- [ ] Chat renders rich content inline: research cards, copy blocks, images, ad previews, video thumbnails
- [ ] User can modify any generated content by typing instructions ("make the headline shorter", "try a different image style")
- [ ] Chat history persists per user with named campaign threads
- [ ] Suggested prompts/actions appear contextually (e.g., "Generate ad creatives", "Research this region")
- [ ] Tone selector available (formal, casual, inspiring) that influences AI output

#### Market Research Pipeline
- [ ] Given a region and event type, system researches: spirituality/meditation interest, mental health prevalence, sleep/health issues, relationship concerns, local idioms, cultural sensitivities, seasonal significance
- [ ] Research renders as structured cards in chat (expandable, with sources)
- [ ] User can add custom research notes or ask follow-up research questions
- [ ] Research context feeds into all downstream content generation

#### Gurudev Wisdom Curation
- [ ] System queries Ask Gurudev API with contextually relevant questions
- [ ] Curated quotes displayed in short/medium/long formats
- [ ] Quote images generated automatically using AI image models
- [ ] User can request different topics or refine quote selection via chat

#### Multi-Channel Content Generation
- [ ] From research + quotes, system generates content for: Email, WhatsApp, Instagram, Facebook
- [ ] Each channel's content renders in a channel-appropriate preview (phone frame for WhatsApp, post preview for Instagram, etc.)
- [ ] User can edit any piece of content inline or via chat instructions
- [ ] Content supports multiple languages (translation pipeline)

#### Ad Creative Studio
- [ ] AI generates ad copy (headline, subheadline, body, CTA) in brand voice
- [ ] AI generates images using configurable models (Nano Banana 2, GPT Image 1.5, Flux)
- [ ] Canva templates populated programmatically with generated copy + images
- [ ] Final creatives exported from Canva and stored in AWS S3
- [ ] Multiple orientations supported: square (1080x1080), vertical (1080x1920), horizontal (1920x1080)
- [ ] Ad types: Product Benefit, Testimonial, Wisdom Quote, Problem-Solution, Seasonal

#### Campaign Management
- [ ] Each conversation thread maps to a campaign
- [ ] Users can browse past campaigns and their generated assets
- [ ] Assets can be downloaded individually or as a campaign package
- [ ] Campaigns are shareable via link (role-permissioned)

#### Prompt Testing & Validation (Admin-only)
- [ ] Lists every AI agent/prompt used in the system
- [ ] Admin can view and edit any prompt in-place
- [ ] Run test executions with sample inputs, see raw AI output
- [ ] Compare outputs across prompt versions (A/B testing)
- [ ] Execution log: every AI call logged with inputs, outputs, model, latency, cost
- [ ] Model selector per prompt (swap between Gemini, Claude, GPT without code changes)

### Out of Scope

- One-click publishing to email/social platforms — requires OAuth integrations, separate milestone
- WhatsApp bot / headless interface — separate channel, separate milestone
- In-person outreach planner (venue finder, event scraping) — separate product module
- Analytics dashboard (Meta/Google ad insights) — requires ad account access
- Lead nurture automation / CRM integration — depends on HubSpot/other CRM
- Comments/annotations on creatives (Figma-style) — nice-to-have, post-launch
- Video ad generation — models available but pipeline complexity deferred to v2
- Real-time collaboration (multiple users editing same campaign) — post-launch
- Mobile native app — web-first, responsive design covers mobile

## Context

### Product History
Amplify has been in development since April 2025. Previous versions used n8n workflows (10 total) for AI orchestration with Airtable as the database. The n8n workflows contain proven AI prompts and business logic that serve as reference material for the redesign. Key learnings: the regional research pipeline (7 Perplexity queries) produces excellent context, the copywriting style (Daniel Throssell/Jim Gaffigan humor meets spiritual dignity) resonates, and the Ask Gurudev API provides authentic wisdom sourcing.

### Existing Assets (Reference Only)
- 10 n8n workflow JSONs in `../n8n amplify scripts/` — contain all AI prompts, data flows, and business logic
- Airtable bases (Amplify 2.0 + Market Research) — contain historical campaign data across 10 tables
- Obsidian notes in `~/Documents/AbhishekR/Amplify/` — product journey, vision docs, ideas, backlog
- AWS S3 bucket — existing ad creatives and images

### User Personas
- **Teachers** (~thousands): Run local workshops, need marketing materials, zero marketing experience
- **State Coordinators** (~50-100): Manage campaigns across a state, need consistency and oversight
- **National Team** (~10-20): Run nationwide campaigns, need scale and brand control
- **Admin** (1 — Abhishek): System configuration, prompt management, model selection

### Brand Guidelines
- Voice: Calm confidence, uplifting, jargon-free, Grade 8 reading level
- Tone: Encouraging, solution-oriented; no hype or fear
- Style: Active voice; no hashtags, emojis, or exclamation marks in generated content
- Colors: #3D8BE8 (blue), #E47D6C (peach), white backgrounds
- Fonts: Raleway, Lora, Work Sans

## Constraints

- **Tech Stack**: Next.js (TypeScript) on Vercel — must stay web-based, no native apps
- **Auth**: Supabase Auth only (project: kmibwrgfskthkxhilutm) — Google login required
- **Database**: Supabase PostgreSQL — all data in one place, row-level security for access tiers
- **AI Orchestration**: Direct API calls from Next.js API routes — no n8n, no LangGraph, no middleware
- **AI Providers**: Google AI Studio (Gemini + Nano Banana + Veo), Anthropic (Claude), OpenAI (GPT Image), Perplexity (research) — 4 API keys max
- **Image/Video**: fal.ai as optional fallback for Flux/Kling if needed
- **Creative Rendering**: Canva MCP for template population and export
- **Asset Storage**: AWS S3 for all generated media
- **Deployment**: Vercel — staging (staging.amplifyaol.com) → production (amplifyaol.com)
- **Repos**: Staging = boommark/Amplify-Aol-Staging, Production = boommark/Amplify-Aol
- **Budget**: Minimize per-campaign AI costs (~$0.40-0.60 target per full campaign)
- **No Data Migration**: Starting fresh in Supabase. Airtable data is historical reference only.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Chat-based UI over form-based | Teachers need zero learning curve; conversation is the most natural interface | — Pending |
| Direct API calls over n8n | Eliminates debugging pain, hosting cost, version issues; prompts in Supabase enable testing screen | — Pending |
| Supabase over Airtable | Free tier limits (1K records), no auth, no RLS; Supabase gives auth + tiers + unlimited records | — Pending |
| Canva over Switchboard | Team already uses Canva; MCP enables programmatic template editing; richer template ecosystem | — Pending |
| Google + Anthropic + OpenAI over single provider | Best-in-class per task: Gemini (volume text + images), Claude (premium copy), OpenAI (image quality leader) | — Pending |
| Prompts in Supabase over hardcoded | Enables admin testing screen, A/B testing, model swapping without deploys | — Pending |
| No Airtable data migration | Fresh start; historical data is reference, not needed in new system | — Pending |
| fal.ai as optional | Start with direct APIs; add fal.ai only if Flux/Kling needed | — Pending |

---
*Last updated: 2026-03-29 after initialization*
