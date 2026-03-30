# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Amplify AOL
**Generated:** 2026-03-30 (manually curated from ui-ux-pro-max + brand guidelines)
**Category:** AI Chat Copilot / SaaS
**Style:** AI-Native UI (from ui-ux-pro-max style catalog)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable | Tailwind |
|------|-----|--------------|----------|
| Primary | `#3D8BE8` | `--color-primary` | `blue-500` custom |
| Secondary/Accent | `#E47D6C` | `--color-accent` | `peach` custom |
| Background | `#FFFFFF` | `--color-background` | `white` |
| Surface | `#F9FAFB` | `--color-surface` | `gray-50` |
| User Bubble | `#3D8BE8` | `--color-user-bubble` | Primary |
| AI Bubble | `#F3F4F6` | `--color-ai-bubble` | `gray-100` |
| Text Primary | `#0F172A` | `--color-text` | `slate-900` |
| Text Muted | `#475569` | `--color-text-muted` | `slate-600` |
| Border | `#E2E8F0` | `--color-border` | `slate-200` |
| Success | `#22C55E` | `--color-success` | `green-500` |
| Error | `#EF4444` | `--color-error` | `red-500` |

**Color Notes:** Light mode only for v1. White backgrounds, subtle borders. Primary blue for interactive elements and user messages. Peach for highlights and CTAs sparingly.

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Heading | Raleway | 600-700 | 20-32px |
| Body | Work Sans | 400-500 | 14-16px |
| Chat message | Work Sans | 400 | 15px |
| Caption/meta | Work Sans | 400 | 12-13px |
| Code/mono | JetBrains Mono | 400 | 14px |

**Line height:** 1.5-1.6 for body, 1.3 for headings
**Max line length:** 65-75 characters in chat bubbles

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps, inline |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, chip padding |
| `--space-md` | `16px` / `1rem` | Standard padding, message gap |
| `--space-lg` | `24px` / `1.5rem` | Card padding, section gaps |
| `--space-xl` | `32px` / `2rem` | Large gaps |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Inputs, small buttons |
| `--radius-md` | `12px` | Cards, bubbles |
| `--radius-lg` | `16px` | Modals, panels |
| `--radius-xl` | `20px` | Large cards, carousel items |
| `--radius-full` | `9999px` | Pills, action chips |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards, bubbles |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, sheet |

---

## AI-Native UI Design Variables

From ui-ux-pro-max AI-Native UI style catalog:

| Variable | Value | Purpose |
|----------|-------|---------|
| `--user-bubble-bg` | `#3D8BE8` | User message background |
| `--ai-bubble-bg` | `#F3F4F6` | AI message background |
| `--input-height` | `48px` min | Chat input minimum height |
| `--typing-dot-size` | `8px` | Typing indicator dots |
| `--message-gap` | `16px` | Gap between messages |
| `--sidebar-width` | `280px` | Campaign sidebar width |
| `--carousel-item-width` | `200px` | Image carousel card width |

---

## Component Specs

### Chat Bubbles

```
User message:
  - Align: right
  - Background: #3D8BE8 (primary)
  - Text: white
  - Border-radius: 12px 12px 4px 12px
  - Max-width: 75% of chat area
  - Padding: 12px 16px

AI message:
  - Align: left
  - Background: #F3F4F6 (gray-100)
  - Text: #0F172A (slate-900)
  - Border-radius: 12px 12px 12px 4px
  - Max-width: 85% of chat area (wider for rich content)
  - Padding: 12px 16px
```

### Action Chips

```
  - Background: white
  - Border: 1px solid #E2E8F0
  - Border-radius: 9999px (pill)
  - Padding: 6px 14px
  - Font: Work Sans 14px 500
  - Hover: border-color #3D8BE8, color #3D8BE8
  - Transition: 200ms ease
  - Cursor: pointer
```

### Research Cards (Expandable)

```
  - Background: white
  - Border: 1px solid #E2E8F0
  - Border-radius: 12px
  - Left border accent: 3px solid #3D8BE8
  - Padding: 16px
  - Collapsed: title + summary (2 lines)
  - Expanded: full findings + sources
  - Transition: max-height 300ms ease
```

### Channel Preview Frames

```
WhatsApp:
  - Phone frame: rounded-[24px], bg-[#075E54] header
  - Green bubbles: bg-[#DCF8C6], rounded
  - Time stamps, read receipts

Instagram:
  - Post card: white bg, avatar row, image area
  - Likes/comments bar, caption area
  - Rounded-lg border

Email:
  - Client frame: toolbar header, from/to/subject
  - Body area with email formatting
  - Gray border, subtle shadow
```

### Carousel

```
  - Horizontal scroll: overflow-x-auto, snap-x
  - Item width: 200px (flex-shrink-0)
  - Gap: 12px
  - Selected: ring-2 ring-[#3D8BE8], checkmark overlay
  - Border-radius: 12px per item
  - Peek: show partial next item
```

### Loading Skeletons

```
  - Background: #F3F4F6
  - Animation: animate-pulse
  - Border-radius: match target element
  - Heights: text=16px, card=120px, image=200px
  - Duration: pulse 2s infinite
```

### Chat Input Bar

```
  - Background: white
  - Border-top: 1px solid #E2E8F0
  - Padding: 12px 16px
  - Position: sticky bottom
  - Min-height: 48px, auto-grow to 120px max
  - Contains: tone dropdown | textarea | mic | attach | send/stop
  - Send button: bg-[#3D8BE8], rounded-full, 36px
  - Stop button: bg-red-500, rounded-full (replaces send during stream)
```

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — Use Lucide React icons only
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — No scale transforms that shift layout
- ❌ **Low contrast text** — 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always 150-300ms transitions
- ❌ **Invisible focus states** — Focus rings must be visible
- ❌ **Generic AI slop** — No default gradients, no particle effects, no animated backgrounds
- ❌ **Frozen UI during streaming** — Always show skeleton/typing indicator
- ❌ **Horizontal scroll on mobile** — Content must fit 375px viewport

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (Lucide React only)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed elements
- [ ] No horizontal scroll on mobile
- [ ] Skeleton loaders for async content > 300ms
- [ ] Chat input always visible (sticky bottom)
- [ ] Touch targets minimum 44x44px
