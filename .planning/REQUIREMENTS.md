# Requirements: Amplify Marketing Suite

**Defined:** 2026-03-29
**Core Value:** A teacher with zero marketing experience can describe their workshop and receive a complete marketing kit through a simple conversation.

## v1 Requirements

### Authentication & Access (AUTH)

- [x] **AUTH-01**: User can sign in with Google via Supabase Auth
- [x] **AUTH-02**: User session persists across browser refresh and tabs
- [x] **AUTH-03**: Users are assigned roles (Teacher, State Coordinator, National Team, Admin) via app_metadata
- [ ] **AUTH-04**: Row-level security enforces that each role sees only permitted data
- [x] **AUTH-05**: Admin role has access to prompt testing screen and system configuration
- [x] **AUTH-06**: Unauthenticated users are redirected to login page

### Chat Interface (CHAT)

- [x] **CHAT-01**: User interacts through a conversational chat UI (no forms for primary workflow)
- [x] **CHAT-02**: AI responses stream token-by-token in real time (not batch)
- [x] **CHAT-03**: Chat renders rich inline content: research cards, copy blocks, image previews, ad previews
- [x] **CHAT-04**: User can stop a streaming response mid-generation
- [x] **CHAT-05**: User can retry/regenerate the last AI response
- [x] **CHAT-06**: Contextual suggested prompts appear after AI responses (e.g., "Generate ad creatives", "Translate to Hindi")
- [x] **CHAT-07**: Tone selector available (formal, casual, inspiring) that influences AI output style
- [x] **CHAT-08**: Chat history persists per user with named campaign threads
- [x] **CHAT-09**: User can browse past conversation threads and resume any thread
- [x] **CHAT-10**: Chat UI is responsive and usable at 375px mobile viewport
- [x] **CHAT-11**: User can modify any generated content by typing follow-up instructions

### Research Pipeline (RSRCH)

- [x] **RSRCH-01**: Given a region and event type, system researches 7 dimensions: spirituality interest, mental health, sleep/health, relationships, local idioms, cultural sensitivities, seasonal significance
- [ ] **RSRCH-02**: Research results render as structured expandable cards in chat
- [x] **RSRCH-03**: User can add custom research notes via chat
- [x] **RSRCH-04**: Research context automatically feeds into all downstream content generation
- [x] **RSRCH-05**: Research results are stored in Supabase (not replayed in chat context window)

### Gurudev Wisdom (WSDM)

- [ ] **WSDM-01**: System queries Ask Gurudev API with contextually relevant questions derived from research
- [x] **WSDM-02**: Curated quotes displayed in short/medium/long formats as inline cards
- [ ] **WSDM-03**: Quote images generated automatically using AI image models
- [ ] **WSDM-04**: User can request different topics or refine quote selection via chat

### Content Generation (CONT)

- [x] **CONT-01**: System generates marketing email copy from research + wisdom context
- [x] **CONT-02**: System generates WhatsApp messages from research + wisdom context
- [x] **CONT-03**: System generates Instagram post copy with image direction
- [x] **CONT-04**: System generates Facebook post copy with image direction
- [x] **CONT-05**: Each channel's content renders in a channel-appropriate preview format
- [x] **CONT-06**: User can edit any content piece via chat instructions ("make headline shorter")
- [x] **CONT-07**: Content generation uses brand voice: calm, uplifting, jargon-free, Grade 8 reading, no hashtags/emojis/exclamation marks
- [ ] **CONT-08**: Translation pipeline supports generating content in non-English languages

### Ad Creative Studio (ADS)

- [ ] **ADS-01**: AI generates ad copy (headline, subheadline, body, CTA) in brand voice
- [ ] **ADS-02**: AI generates ad images using configurable models (Nano Banana 2, GPT Image 1.5, Flux)
- [ ] **ADS-03**: Multiple orientations supported: square (1080x1080), vertical (1080x1920), horizontal (1920x1080)
- [ ] **ADS-04**: Ad types supported: Product Benefit, Testimonial, Wisdom Quote, Problem-Solution, Seasonal
- [ ] **ADS-05**: Canva templates populated programmatically with generated copy + images
- [ ] **ADS-06**: Final creatives exported from Canva and stored in AWS S3
- [ ] **ADS-07**: User can preview, download, and iterate on ad creatives via chat

### Campaign Management (CAMP)

- [ ] **CAMP-01**: Each conversation thread maps to a campaign
- [ ] **CAMP-02**: User can browse past campaigns with search and filter
- [ ] **CAMP-03**: Assets can be downloaded individually (copy-to-clipboard, image download)
- [ ] **CAMP-04**: Assets can be downloaded as a campaign package (ZIP)
- [ ] **CAMP-05**: Campaigns are shareable via link (role-permissioned, read-only)

### Prompt Testing & Admin (ADMIN)

- [ ] **ADMIN-01**: Admin screen lists every AI agent/prompt used in the system
- [ ] **ADMIN-02**: Admin can view and edit any prompt in-place
- [ ] **ADMIN-03**: Admin can run test executions with sample inputs and see raw AI output
- [ ] **ADMIN-04**: Admin can compare outputs across prompt versions (A/B)
- [ ] **ADMIN-05**: Execution log: every AI call logged with inputs, outputs, model, latency, cost
- [ ] **ADMIN-06**: Model selector per prompt — swap between Gemini, Claude, GPT without code changes
- [ ] **ADMIN-07**: Prompt versions are immutable — new edits create new versions, never overwrite

### Infrastructure (INFRA)

- [x] **INFRA-01**: All AI prompts stored and versioned in Supabase prompts table
- [x] **INFRA-02**: Multi-model routing: task-based model selection (Gemini for volume, Claude for premium, OpenAI for images)
- [x] **INFRA-03**: Supabase schema with RLS policies for all four roles
- [x] **INFRA-04**: AWS S3 presigned URL upload pattern for all generated assets
- [x] **INFRA-05**: Vercel Fluid Compute with maxDuration 300s for long-running AI pipelines
- [ ] **INFRA-06**: Staging deployment at staging.amplifyaol.com with separate environment config
- [ ] **INFRA-07**: Error handling and loading states throughout all AI operations

## v2 Requirements

### Publishing & Distribution
- **PUB-01**: One-click publish to email (SendGrid/Mailchimp)
- **PUB-02**: One-click publish to Facebook/Instagram
- **PUB-03**: WhatsApp Business API integration for direct messaging
- **PUB-04**: Scheduling/calendar for timed sends

### Video
- **VID-01**: Video ad generation (Veo 3, Kling)
- **VID-02**: Gurudev video clip extraction with branded cover art
- **VID-03**: Video storyboard generation

### Collaboration
- **COLLAB-01**: Comments/annotations on creatives (Figma-style)
- **COLLAB-02**: Real-time multi-user editing

### Analytics
- **ANLYT-01**: Meta/Google ad account integration for performance data
- **ANLYT-02**: Campaign performance dashboard
- **ANLYT-03**: Creative A/B testing with statistical significance

### Advanced
- **ADV-01**: WhatsApp bot interface (headless)
- **ADV-02**: In-person outreach planner (venue finder, event scraping)
- **ADV-03**: Lead nurture automation / CRM integration
- **ADV-04**: Chatbot-style prompt for custom campaign workflows (drag-and-drop)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first; responsive chat covers mobile use case |
| SEO optimization scoring | AOL promotes via WhatsApp/Facebook/email, not organic search |
| Template library (browse 50+ templates) | Chat is the interface; templates undermine the conversational UX thesis |
| User-configurable brand voice training | Brand voice is locked in prompts; user-training risks drift |
| A/B testing copy variants at scale | Teachers aren't performance marketers; admin prompt A/B covers the real need |
| In-platform content calendar/scheduling | Teachers use WhatsApp groups for distribution; no scheduling infrastructure needed |
| Airtable data migration | Fresh start in Supabase; historical data is reference only |
| n8n workflow migration | Rebuilding from scratch with direct API calls |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| INFRA-01 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 1 | Pending |
| CHAT-01 | Phase 2 | Complete |
| CHAT-02 | Phase 2 | Complete |
| CHAT-03 | Phase 2 | Complete |
| CHAT-04 | Phase 2 | Complete |
| CHAT-05 | Phase 2 | Complete |
| CHAT-06 | Phase 2 | Complete |
| CHAT-07 | Phase 2 | Complete |
| CHAT-08 | Phase 2 | Complete |
| CHAT-09 | Phase 2 | Complete |
| CHAT-10 | Phase 2 | Complete |
| CHAT-11 | Phase 2 | Complete |
| INFRA-02 | Phase 2 | Complete |
| INFRA-07 | Phase 2 | Pending |
| RSRCH-01 | Phase 3 | Complete |
| RSRCH-02 | Phase 3 | Pending |
| RSRCH-03 | Phase 3 | Complete |
| RSRCH-04 | Phase 3 | Complete |
| RSRCH-05 | Phase 3 | Complete |
| WSDM-01 | Phase 3 | Pending |
| WSDM-02 | Phase 3 | Complete |
| WSDM-03 | Phase 3 | Pending |
| WSDM-04 | Phase 3 | Pending |
| CONT-01 | Phase 3 | Complete |
| CONT-02 | Phase 3 | Complete |
| CONT-03 | Phase 3 | Complete |
| CONT-04 | Phase 3 | Complete |
| CONT-05 | Phase 3 | Complete |
| CONT-06 | Phase 3 | Complete |
| CONT-07 | Phase 3 | Complete |
| CONT-08 | Phase 3 | Pending |
| ADS-01 | Phase 4 | Pending |
| ADS-02 | Phase 4 | Pending |
| ADS-03 | Phase 4 | Pending |
| ADS-04 | Phase 4 | Pending |
| ADS-05 | Phase 4 | Pending |
| ADS-06 | Phase 4 | Pending |
| ADS-07 | Phase 4 | Pending |
| CAMP-01 | Phase 4 | Pending |
| CAMP-02 | Phase 4 | Pending |
| CAMP-03 | Phase 4 | Pending |
| CAMP-04 | Phase 4 | Pending |
| CAMP-05 | Phase 4 | Pending |
| ADMIN-01 | Phase 5 | Pending |
| ADMIN-02 | Phase 5 | Pending |
| ADMIN-03 | Phase 5 | Pending |
| ADMIN-04 | Phase 5 | Pending |
| ADMIN-05 | Phase 5 | Pending |
| ADMIN-06 | Phase 5 | Pending |
| ADMIN-07 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 60 total
- Mapped to phases: 60
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after roadmap creation (corrected count: 60 requirements, not 52)*
