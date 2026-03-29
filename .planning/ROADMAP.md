# Roadmap: Amplify Marketing Suite

## Overview

Amplify is built in five phases, each delivering a coherent capability. The build order is determined by hard dependencies: security and infrastructure must exist before any data is stored (Phase 1); the chat layer must exist before AI content flows through it (Phase 2); research and wisdom must precede content generation that depends on them (Phase 3); ad creatives and campaign management are natural partners that close the production loop (Phase 4); the admin prompt lab is built last, when the content pipeline is stable and real execution logs exist to review (Phase 5).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Google auth, four-role RLS, full database schema, prompt registry, and infra configuration
- [ ] **Phase 2: Chat Core** - Full conversational chat UI with streaming, rich inline rendering, thread persistence, and AI provider wiring
- [ ] **Phase 3: Content Pipeline** - Regional research, Gurudev wisdom curation, and multi-channel marketing copy generation
- [ ] **Phase 4: Creative Studio and Campaign** - AI ad image generation, Canva template export, campaign browser, and asset download
- [ ] **Phase 5: Admin Prompt Lab** - Prompt editor, version history, test runner, execution log, and model selector

## Phase Details

### Phase 1: Foundation
**Goal**: A secure, role-aware application shell that every subsequent phase builds on
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, INFRA-01, INFRA-03, INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. User can sign in with Google and stay signed in across browser refresh and new tabs
  2. Each role (Teacher, State Coordinator, National Team, Admin) sees only their permitted data — verified by signing in as each role and confirming data isolation
  3. Unauthenticated users attempting to access any page are redirected to the login screen
  4. All AI prompts are stored and retrievable from Supabase; a new prompt version can be created without a code deploy
  5. Staging deployment at staging.amplifyaol.com is live with environment-specific config and separate credentials
**Plans:** 1/6 plans executed

Plans:
- [ ] 01-00-PLAN.md — Wave 0: vitest setup, Supabase mock helpers, test stubs for all requirements
- [ ] 01-01-PLAN.md — Supabase clients, full database schema with RLS, Vercel Fluid Compute config
- [ ] 01-02-PLAN.md — Google OAuth login, callback with allowlist gating, middleware, onboarding flow
- [ ] 01-03-PLAN.md — S3 presigned URL utility and authenticated API route
- [ ] 01-04-PLAN.md — Extract and seed AI prompts from n8n workflows
- [ ] 01-05-PLAN.md — Integration verification: deploy to staging, end-to-end validation

### Phase 2: Chat Core
**Goal**: Users can have a full conversational session with Amplify through a polished, streaming chat interface backed by a live AI provider
**Depends on**: Phase 1
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10, CHAT-11, INFRA-02, INFRA-07
**Success Criteria** (what must be TRUE):
  1. User sends a message and tokens stream back in real time — no waiting for a batch response
  2. User can stop a streaming response mid-generation and send a new message
  3. Chat renders research cards, copy blocks, image previews, and ad previews inline in the conversation (not in separate panels)
  4. User can return to a named past campaign thread and resume the conversation where it left off
  5. Chat is fully usable at 375px mobile viewport — no horizontal scroll, readable text, tappable inputs
**Plans**: TBD

### Phase 3: Content Pipeline
**Goal**: A teacher can describe their workshop, receive regionally-targeted research and Gurudev wisdom, and get ready-to-use multi-channel marketing copy — all in one conversation
**Depends on**: Phase 2
**Requirements**: RSRCH-01, RSRCH-02, RSRCH-03, RSRCH-04, RSRCH-05, WSDM-01, WSDM-02, WSDM-03, WSDM-04, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08
**Success Criteria** (what must be TRUE):
  1. Given a region and event type, the system surfaces 7 research dimensions as expandable cards with sources — without the user needing to ask for each one
  2. At least three contextually relevant Gurudev quotes appear in short, medium, and long formats, each with an auto-generated quote image
  3. Email, WhatsApp, Instagram, and Facebook copy are generated from the same research context, each rendering in a channel-appropriate preview format
  4. User types a refinement instruction ("make the email headline shorter") and the specific content piece updates without regenerating the full pipeline
  5. Generated copy uses Art of Living brand voice — calm, Grade 8 reading level, no hashtags, emojis, or exclamation marks
**Plans**: TBD

### Phase 4: Creative Studio and Campaign
**Goal**: Teachers leave with print-ready ad creatives in hand and can find, download, and share any past campaign
**Depends on**: Phase 3
**Requirements**: ADS-01, ADS-02, ADS-03, ADS-04, ADS-05, ADS-06, ADS-07, CAMP-01, CAMP-02, CAMP-03, CAMP-04, CAMP-05
**Success Criteria** (what must be TRUE):
  1. Ad creatives are generated with AI copy and AI images, exported from Canva templates, and stored in S3 — in square, vertical, and horizontal orientations
  2. User can preview any generated creative in chat, download it individually, or request a revision via a follow-up message
  3. User can browse their full campaign history, search past campaigns, and open any campaign to see all its generated assets
  4. All assets for a campaign can be downloaded as a single ZIP file
  5. A campaign can be shared via a read-only link that respects role permissions — a recipient without the correct role cannot access it
**Plans**: TBD

### Phase 5: Admin Prompt Lab
**Goal**: Abhishek can inspect, iterate, and improve every AI prompt in the system without touching code or doing a deploy
**Depends on**: Phase 4
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07
**Success Criteria** (what must be TRUE):
  1. Admin screen lists every prompt used across all AI tasks, showing the active version for each
  2. Admin can edit a prompt and save it as a new immutable version — the old version remains intact and revertible
  3. Admin can run a test execution against any prompt with custom sample input and see the raw AI output, model, latency, and cost
  4. Admin can compare two versions of the same prompt side-by-side to evaluate output quality
  5. Every AI call in the system is logged with inputs, outputs, model used, latency, and cost — visible in the execution log view
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/6 | In Progress|  |
| 2. Chat Core | 0/TBD | Not started | - |
| 3. Content Pipeline | 0/TBD | Not started | - |
| 4. Creative Studio and Campaign | 0/TBD | Not started | - |
| 5. Admin Prompt Lab | 0/TBD | Not started | - |
