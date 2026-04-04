# Copy Evolution — How We Got Here

A record of the copy improvement exercise for Art of Living Amplify, April 2026.

---

## What We Started With

The original copy system produced 3-4 pieces per channel (3 emails, 4 WhatsApp messages, 4 Instagram posts, 4 Facebook posts). The prompts were inherited from the n8n workflow era and had these problems:

**Too long.** Emails ran 500+ words. WhatsApp messages read like blog posts. The prompts asked for multiple variants per channel, creating volume over quality.

**Negative framing.** Copy led with pain and fear: "Tired of Bellevue stress stealing your sleep?" Raw research statistics about domestic violence (41.4%), suicide rates, and mental health crises were dumped directly into outward-facing copy.

**AI patterns leaking through.** "Okay, here are 4 WhatsApp messages..." The AI was talking about the copy instead of writing it. Emojis cheapened the brand.

**No quote quality bar.** The Ask Gurudev API returns full 3000-char articles and video titles, not standalone quotes. The curation step told Haiku to "select 1-2 sentences" which produced dangling fragments that didn't stand alone.

**Inconsistent brand voice.** Some channels sounded clinical, others sounded like a sales pitch. No unified voice across the system.

---

## What We Did

### Phase 1: Book Research

Read four copywriting/writing books and extracted actionable principles:

- **The Copywriter's Handbook** (Bly): 14-16 word average sentences. Brevity from selection, not compression. Respect the reader's intelligence. Start selling in the first line.
- **The Elements of Style** (Strunk): Omit needless words. Positive form. Definite, specific, concrete language.
- **Writing Tools** (Clark): Understate when serious. Ladder of abstraction. Vary sentence length for rhythm. "Leave out the parts readers tend to skip."
- **How to Deliver a TED Talk** (Donovan): Single seed of inspiration. Specificity. Authenticity over engineering.

### Phase 2: Competitive Analysis

Analyzed actual copy from six wellness brands: Headspace, Calm, CorePower Yoga, Kripalu, Art of Living Retreat Center, and the Happiness Program page itself.

Key findings:
- Best wellness headlines are 3-6 words ("Begin Again, Here" / "Be kind to your mind")
- Sentence length: 10-14 words digital, 18-28 for experiential
- Headlines 90% aspirational, body 60/40, details 95% informational
- Every brand leads with "you" (2.5:1 ratio vs we/our)
- No wellness brand uses the word "easy" — they use "simple"
- The funnel moves from feeling to fact as you scroll down

### Phase 3: PMM Sherpa Intelligence

Queried PMM Sherpa for product marketing frameworks and wellness-specific guidance.

Breakthrough insights:
- **"Context before quote, never quote before context."** Set up the reader's felt experience first, then the quote crystallizes what they were already feeling.
- **Messaging hierarchy: Feel → See → Believe → Act.** Feel the experience, see the possibility (via quote), believe the proof, act on the invitation.
- **"Name the experience, don't diagnose it."** "You know that feeling when..." (naming) vs "Are you struggling with anxiety?" (diagnosing).
- **One CTA per piece. Logistics in a separate block. 80/20 emotional/informational.**

### Phase 4: Quote Curation

Queried the Ask Gurudev API across 10 life topics, filtered out video/web results (just titles), read full text/web articles, and extracted standalone sentences that pass the "wall poster test."

Established the quality bar: complete thought, warm or profound, 1-3 sentences, verbatim, no surrounding context needed.

Curated 10 production-quality quotes spanning happiness, meditation, relationships, fear, gratitude, rest, and generosity.

### Phase 5: Iterative Copy Rewriting (7 versions)

| Version | Problem | Key Change |
|---------|---------|------------|
| v1 (original) | Too long, negative framing, AI patterns, broken quotes | Baseline from existing system |
| v2 | Still pain-leading, no quotes | Shortened to 100-180 words, positive framing, no emojis |
| v3 | Nice but flat, too aspirational | Added Gurudev quotes matched per channel, competitive sparkle |
| v4 | Still not relatable, still aspirational and distant | Grounded in real daily moments (3pm wall, snooze button, ordering in) |
| v5 | Verbose, talking down, performing casualness | Tried "sharing not selling" posture but overexplained |
| v6 | Stripped too far, lost warmth | Minimal but soulless |
| v7 | **Final** | Synthesis of all research. Context before quote. Feel → See → Believe → Act. Understatement. 13-word average sentences. 20-40 word paragraphs. Names experience without diagnosing. Trusts the reader |

---

## What Changed

### Copy Defaults
- From 3-4 pieces per channel → **1 per channel** (quality over quantity)
- Users can request more via a "+" button with quantity selector

### Prompt Architecture
- Added `COPY-PRINCIPLES.md` as the persistent reference for all copy generation
- Brand voice preamble updated with the five rules, anti-patterns, and channel specs
- Quote integration rules formalized: context before quote, wall poster test, one quote per piece, different quotes per channel

### Quote Pipeline
- Filter out `video/web` results (just topic labels, not quotes)
- Target 4-5 quotes per campaign, not 5+
- Curation prompt rewritten to extract complete standalone insights, not fragments
- Quality test: "Does this make complete sense on a wall with no context?"

### Channel Specs
- Email: 100-150 words, 6-10 word subject line
- WhatsApp: 60-80 words, no formal greeting
- Instagram: 80-120 words, first line is everything
- Facebook: 100-150 words, write for the nod or the share
- Flyer: 50-75 words, headline under 10 words

### Brand Voice
- From inconsistent across channels → unified "friend sharing a discovery" posture
- From pain/fear leading → felt experience leading
- From diagnosing ("you suffer from stress") → naming ("you know that feeling when...")
- From overstatement → understatement
- From multiple CTAs → single soft CTA per piece

---

## Source Materials

All research artifacts are stored in:
- `docs/COPY-PRINCIPLES.md` — the living reference for all copy generation
- `.gstack/qa-reports/` — QA test evidence from staging
- Agent outputs (competitive analysis, book principles, PMM Sherpa, quote curation) — available in session artifacts
