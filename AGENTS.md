# CLAUDE.md — Milaap Platform
## Context file for Claude Code — read this at the start of every session

Milaap is a multi-organization animal adoption platform for Nepal, built and maintained by All Care Nepal (allcarenepal.org). It connects rescued animals with families through storytelling-driven discovery and WhatsApp-based adoption conversations.

**Tagline:** Two stories. One journey.
**Domain:** https://milaap.dpdns.org
**Maintained by:** All Care Nepal, Butwal, Nepal

---

## §1 — What this platform is and is not

**IS:** A storytelling-driven discovery platform. Every animal has a permanent profile with a rescue story, personality description, and a direct WhatsApp inquiry button to the specific organization that cares for that animal.

**IS NOT:** A pet marketplace, a social network, a messaging platform, or a form-heavy intake system.

**Core mechanic:** User reads an animal's story → feels emotional connection → taps "Meet [Name]" → WhatsApp opens with pre-filled message to that animal's organization → human conversation begins → adoption happens.

The platform's job ends when WhatsApp opens. Everything after that is human.

**The waiting bar:** Every animal card and profile shows a thin horizontal progress bar representing how long that animal has been waiting relative to the longest-waiting animal in the system. This is the platform's signature UI element. It appears on every animal card and every profile page. Never remove it.

**Sort order:** Discovery feed always sorts by `days_waiting DESC` (longest waiting first). This is a moral decision, not a UX preference. Never add a "sort by newest" option.

---

## §2 — Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14 (App Router) | TypeScript throughout |
| Styling | Tailwind CSS | Custom tokens in tailwind.config.ts |
| Font | Satoshi Rounded | Self-hosted in /public/fonts/, loaded via next/font/local |
| Database | Supabase PostgreSQL | Free tier, Singapore region |
| Auth | Supabase Auth | Email/password only — no OAuth in V1 |
| Storage | Supabase Storage | 1GB limit — see §10 for image strategy |
| Hosting | Vercel | Hobby plan (free) |
| DNS/CDN/SSL | Cloudflare | Free tier, proxied |
| AI quality check | Google Gemini 1.5 Flash API | Free tier — runs only on CMS animal publish |
| QR generation | qrcode (npm) | Client-side, no server needed |
| Share assets | Canvas API | Client-side generation, never stored |
| Language | i18next + react-i18next | EN/NE toggle, stored in localStorage |
| Image compression | browser-image-compression | Client-side before upload |
| PWA | next-pwa | Service worker + manifest |

**Never introduce:** Redux, Prisma, Express, MongoDB, Firebase, React Query (use Supabase's built-in hooks), or any UI component library (Shadcn, MUI, Chakra). Build components from scratch using Tailwind tokens.

---

## §3 — User roles

| Role | Access |
|------|--------|
| `public` | Browse all animals, view profiles, view happy tails, tap WhatsApp redirect, submit happy tails via token |
| `volunteer` | All public + CMS for their org's animals only (create/edit/status), view/action follow-up reminders, approve happy tails |
| `org_admin` | All volunteer + manage volunteers for their org, edit org profile |
| `platform_admin` | All org_admin across all orgs + create orgs, verify orgs, platform analytics |

**RLS is the enforcement layer.** The UI hides elements that users shouldn't see, but Supabase RLS policies are the actual security boundary. Never trust the UI alone.

Volunteers and admins only ever see and modify data for their own `organization_id`. The only exception is `platform_admin` who has no org filter.

---

## §4 — Database map

All tables and their purposes. Full schema is in `schema.sql`.

| Table | Purpose |
|-------|---------|
| `organizations` | NGO orgs on the platform. Each has a `whatsapp_number` used for per-animal redirect |
| `users` | Volunteer/admin accounts. Always has an `organization_id` (except platform_admin) |
| `animals` | Core table. Every animal gets a permanent record. `slug` is the URL identifier. `intake_date` drives the waiting counter |
| `happy_tails` | Adopter-submitted stories. Has before/after photos. Goes through approval |
| `followup_reminders` | CMS dashboard queue. Created automatically when animal status → adopted. Has pre-written WhatsApp message and unique submission token |
| `analytics_events` | Append-only. Tracks profile_view, whatsapp_tap, share_tap. No PII |

**The waiting counter is always computed, never stored:**
```sql
(current_date - intake_date) AS days_waiting
```

**Per-org WhatsApp redirect:**
Every animal belongs to an org. That org has a `whatsapp_number`. The WhatsApp CTA on every animal profile constructs:
```
https://wa.me/977{org.whatsapp_number}?text=Namaste! म {animal.name} ({org.name}) लाई adopt गर्न चाहन्छु। Milaap मा देखेँ। milaap.dpdns.org/p/{animal.slug}
```
This is the core conversion mechanic. Get it right on Day 1.

---

## §5 — Application structure

```
/app
  /(public)                    # Public-facing pages, no auth
    page.tsx                   # Welcome / landing
    /discover
      page.tsx                 # Discovery feed
    /p/[slug]
      page.tsx                 # Animal profile (permanent URL)
    /happy-tails
      page.tsx                 # Happy Tails feed
      /submit/[token]
        page.tsx               # Adopter submission form
    /org/[slug]
      page.tsx                 # Organization profile
    /faq
      page.tsx                 # FAQ + SEO/AEO content
    /about
      page.tsx                 # About Milaap + All Care Nepal
  /(admin)                     # CMS — requires auth
    layout.tsx                 # Admin shell with sidebar nav
    page.tsx                   # Dashboard (stats + reminder queue)
    /animals
      page.tsx                 # Animal list
      /new
        page.tsx               # Add animal form
      /[id]
        page.tsx               # Edit animal form
        /qr
          page.tsx             # QR generator
    /happy-tails
      page.tsx                 # Pending approvals
    /analytics
      page.tsx                 # Org analytics
    /org
      page.tsx                 # Edit org profile
    /team
      page.tsx                 # Manage volunteers (org_admin only)
  /api
    /animals/route.ts          # GET public animal list
    /animals/[slug]/route.ts   # GET single animal
    /share-image/[slug]/route.ts # Dynamic OG image (edge function)
    /analytics/event/route.ts  # POST analytics event
    /happy-tails/submit/[token]/route.ts # POST happy tails submission
    /admin
      /animals/route.ts        # GET/POST admin animals
      /animals/[id]/route.ts   # PUT/DELETE admin animal
      /reminders/route.ts      # GET reminders queue
      /reminders/[id]/route.ts # PUT mark as sent
      /happy-tails/route.ts    # GET/PUT happy tails approvals
      /analytics/route.ts      # GET org analytics
/components
  /ui                          # Base components (Button, Badge, Card, etc.)
  /animal                      # AnimalCard, WaitingBar, StatusBadge, etc.
  /admin                       # CMS-specific components
  /layout                      # Nav, Footer, AdminSidebar
  /share                       # ShareSheet, ShareAssetGenerator
/lib
  /supabase                    # client.ts, server.ts, middleware.ts
  /i18n                        # i18next config, en.json, ne.json
  /gemini.ts                   # AI quality check
  /whatsapp.ts                 # WhatsApp URL builder
  /canvas-share.ts             # Share asset generation
  /image-compress.ts           # Client-side compression
/public
  /fonts                       # Satoshi Rounded — self-hosted
  /icons                       # PWA icons
  manifest.json
  robots.txt
  llms.txt
```

---

## §6 — Design system (implement exactly — no deviations)

### Colors
```css
--color-linen:        #F7F2EB   /* Page backgrounds */
--color-terracotta:   #C46F52   /* PRIMARY action color — buttons, waiting bar fill, accents */
--color-dusty-rose:   #D7A79A   /* Secondary accent, waiting labels, quotes */
--color-sage:         #8A9B82   /* Available status, success states */
--color-charcoal:     #2D2926   /* Primary text, dark surfaces */
--color-white:        #FFFFFF   /* Cards, clean surfaces */
--color-stone:        #8A8078   /* Secondary text, captions, metadata */
--color-linen-dark:   #E8DDD0   /* Borders, dividers */

/* Status */
--status-available:   #8A9B82
--status-reserved:    #D7A79A
--status-fostered:    #C4A882
--status-medical:     #A08A7A
--status-adopted:     #6A8A6A
```

**Terracotta rule:** Use `--color-terracotta` ONLY for: primary action buttons, the waiting bar fill, active nav states, and status indicators. Never for decorative backgrounds or illustrations.

### Typography — Satoshi Rounded only
```
Display/Hero:    Satoshi Rounded Bold, 48-56px, tight tracking (-0.02em)
Animal names:    Satoshi Rounded Bold, 38-42px on cards, 32px on profiles
Section headers: Satoshi Rounded SemiBold, 24px
Body copy:       Satoshi Rounded Regular, 15px, line-height 1.75
Captions:        Satoshi Rounded Regular, 13px, color: stone
Labels/tags:     Satoshi Rounded Medium, 10-11px, UPPERCASE, letter-spacing 0.1em
Buttons:         Satoshi Rounded SemiBold, 14px, letter-spacing 0.04em
Quote/one-liner: Satoshi Rounded Light Italic, 14-16px, color: stone
```

### Spacing (8px base grid)
```
xs: 4px   sm: 8px   md: 16px   lg: 24px
xl: 32px  2xl: 48px  3xl: 64px
```

### Border radius
```
tags/badges: 6px    cards: 12px    large cards: 20px
buttons: 9999px (pill)    circular: 9999px
```

### The Waiting Bar (signature component)
```tsx
// WaitingBar.tsx — appears on EVERY animal card and profile
// width = (days_waiting / max_days_waiting_in_system) * 100%
// max_days_waiting fetched once and cached

<div className="flex items-center gap-2 mb-3">
  <div className="flex-1 h-[2px] bg-linen-dark rounded-full overflow-hidden">
    <div
      className="h-full bg-terracotta rounded-full transition-all"
      style={{ width: `${percentage}%` }}
    />
  </div>
  <span className="text-[10px] uppercase tracking-[0.08em] text-dusty-rose whitespace-nowrap font-medium">
    {days} days waiting
  </span>
</div>
```

### Buttons
```tsx
// Primary — terracotta
<button className="bg-terracotta text-white rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)]">

// Secondary — ghost
<button className="bg-transparent text-stone border border-linen-dark rounded-full px-6 py-3 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors">

// Dark (used for WhatsApp CTA on profiles)
<button className="bg-charcoal text-linen rounded-full px-7 py-4 text-sm font-semibold tracking-[0.04em] w-full hover:bg-[#1A1612] transition-colors flex items-center justify-center gap-2.5">
```

### Cards
```tsx
// Standard animal card
<div className="bg-white border border-linen-dark rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)] hover:shadow-[0_4px_16px_rgba(45,41,38,0.08)] transition-shadow">
```

---

## §7 — Key behaviors

### WhatsApp URL construction
```typescript
// lib/whatsapp.ts
export function buildWhatsAppURL(
  orgWhatsappNumber: string,
  animalName: string,
  animalSlug: string,
  orgName: string,
  language: 'en' | 'ne' = 'ne'
): string {
  const messages = {
    ne: `Namaste! म ${animalName} (${orgName}) लाई adopt गर्न चाहन्छु। मैले Milaap मा देखेँ। milaap.dpdns.org/p/${animalSlug}`,
    en: `Namaste! I am interested in adopting ${animalName} from ${orgName}. I found them on Milaap. milaap.dpdns.org/p/${animalSlug}`
  }
  const text = encodeURIComponent(messages[language])
  return `https://wa.me/977${orgWhatsappNumber}?text=${text}`
}
```

Every WhatsApp tap also fires an analytics event:
```typescript
await trackEvent('whatsapp_tap', animal.id, animal.organization_id)
```

### Analytics event tracking
```typescript
// lib/analytics.ts
export async function trackEvent(
  type: 'profile_view' | 'whatsapp_tap' | 'share_tap' | 'happy_tails_view',
  animalId: string,
  organizationId: string,
  source?: string
) {
  // Fire and forget — don't await, don't block UI
  fetch('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({ type, animalId, organizationId, source })
  }).catch(() => {}) // Silently fail — analytics should never break UX
}
```

### Follow-up reminder creation (automatic on adoption)
When a volunteer changes an animal's status to `adopted` in the CMS, the app automatically creates two `followup_reminders` rows:
1. `reminder_type: '30day'`, `due_date: adopted_date + 30 days`
2. `reminder_type: '6month'`, `due_date: adopted_date + 180 days`

Each reminder gets a unique `submission_token` (UUID) that forms the Happy Tails submission URL:
`milaap.dpdns.org/happy-tails/submit/{token}`

The pre-written message template is stored in the reminder row so it can be edited before sending.

### Image compression pipeline
```typescript
// lib/image-compress.ts
import imageCompression from 'browser-image-compression'

export async function compressForUpload(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.08,        // 80KB target
    maxWidthOrHeight: 900,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.72
  })
}
```

Always compress before upload. Never upload raw files. Check compressed size before uploading — if still over 150KB, compress again at 0.6 quality.

### Language toggle
- Default: English (`en`)
- Toggle stored in `localStorage` key `milaap_lang`
- All UI strings go through i18next `t()` function
- Animal content fields: `one_liner_en`/`one_liner_ne`, `story_en`/`story_ne`, etc.
- Switch language with `i18n.changeLanguage('ne')` — page re-renders instantly, no reload

---

## §8 — SEO, GEO & AEO requirements

Every public page must have:

```tsx
// In each page.tsx — use Next.js 14 Metadata API
export const metadata: Metadata = {
  title: '[Page-specific title] | Milaap Nepal',
  description: '[Page-specific description]',
  openGraph: {
    title: '...',
    description: '...',
    images: [{ url: '/api/share-image/[slug]', width: 1200, height: 630 }],
    siteName: 'Milaap Nepal',
  },
  twitter: { card: 'summary_large_image', ... }
}
```

**Animal profiles additionally need:**
- JSON-LD Animal schema (see PRD §7.1)
- Breadcrumb schema: Home > Discover > [Animal Name]
- `robots: { index: true, follow: true }` — adopted animals stay indexed

**FAQ page needs:**
- FAQ schema (QAPage type)
- HowTo schema for adoption process

**All pages need:**
- `<link rel="canonical" href="https://milaap.dpdns.org/[path]" />`
- `<html lang="en">` (or `ne` when in Nepali mode — use `lang` attribute on `<html>`)

**llms.txt** — create at `/public/llms.txt`, served at `milaap.dpdns.org/llms.txt`

**Sitemap** — auto-generated at `/app/sitemap.ts`, includes all animal slugs, updated on every animal publish.

---

## §9 — AI quality check (Google Gemini 1.5 Flash)

```typescript
// lib/gemini.ts
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function checkAnimalProfileQuality(animal: AnimalDraft) {
  const prompt = `You are a content reviewer for Milaap, a Nepal animal adoption platform.
Review this animal profile and return ONLY valid JSON — no markdown, no explanation.

Profile:
Name: ${animal.name}
One-liner: ${animal.one_liner}
Story (${animal.story_en?.split(' ').length || 0} words): ${animal.story_en}
Personality: ${animal.personality_en || 'not filled'}
Photo count: ${animal.photos?.length || 0}
Nepali one-liner: ${animal.one_liner_ne ? 'filled' : 'empty'}

Return this exact JSON structure:
{
  "checks": [
    { "id": "one_liner_emotional", "label": "One-liner describes personality not specs", "passed": boolean, "severity": "error"|"warning", "message": "suggestion if failed or null" },
    { "id": "story_length", "label": "Story is at least 80 words", "passed": boolean, "severity": "error", "message": "..." },
    { "id": "story_has_rescue", "label": "Story mentions how animal arrived or was found", "passed": boolean, "severity": "warning", "message": "..." },
    { "id": "story_present_focus", "label": "Story describes who the animal is NOW, not only their past", "passed": boolean, "severity": "warning", "message": "..." },
    { "id": "no_generic_language", "label": "Avoids generic words: friendly, playful, good dog, sweet", "passed": boolean, "severity": "warning", "message": "..." },
    { "id": "min_photos", "label": "Has at least 2 photos", "passed": boolean, "severity": "error", "message": "..." },
    { "id": "nepali_filled", "label": "Nepali one-liner is filled", "passed": boolean, "severity": "warning", "message": "Consider reviewing the auto-translated version" }
  ],
  "score": 0-100,
  "publish_blocked": boolean,
  "summary": "One sentence assessment"
}`

  const res = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 800 }
    })
  })

  const data = await res.json()
  const text = data.candidates[0].content.parts[0].text
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
```

The quality check runs ONLY when the volunteer clicks "Publish" — not on every keystroke. Never call Gemini on load or on form changes.

---

## §10 — Image strategy (1GB Supabase Storage limit)

**Budget:** 5 photos × 80KB = 400KB per animal. 1GB = ~2,500 animal sets.

**Upload path:** `/{org_id}/{animal_id}/{timestamp}_{index}.webp`
**Happy Tails photos:** `/{org_id}/happy-tails/{happy_tail_id}.webp`

**Never store share assets** — generated client-side via Canvas API, downloaded directly.

**Storage path in DB:** Store only the path (not the full URL). Construct URLs as:
```typescript
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${path}`
```

**Photo array in DB:** `photos` column is `jsonb`:
```typescript
type Photo = { path: string; is_hero: boolean; caption?: string }
// photos: Photo[]
// First photo with is_hero: true is the card/OG image
```

---

## §11 — Share asset generation (Canvas API)

Share assets are generated client-side — never stored, never hit the server.

```typescript
// lib/canvas-share.ts
// Two formats: 'story' (1080x1920) and 'post' (1080x1080)
// Steps:
// 1. Draw linen background
// 2. Draw animal photo (fetch as blob, drawImage)
// 3. Draw gradient overlay (bottom 60%)
// 4. Draw Milaap logo mark (top-left, SVG path)
// 5. Draw org handle (top-right, small text)
// 6. Draw animal name (large, Satoshi Bold)
// 7. Draw waiting days (terracotta color)
// 8. Draw URL (milaap.dpdns.org/p/slug, small, bottom)
// canvas.toBlob() → download as PNG
```

Always show a loading state while the canvas renders — it takes 1-2 seconds for the image fetch + draw.

---

## §12 — Coding conventions

**TypeScript:**
- Strict mode on. No `any`. No `// @ts-ignore`.
- All database types generated from Supabase CLI and imported from `@/types/supabase`
- All API responses typed

**Components:**
- One component per file. Name file same as component (PascalCase).
- Server Components by default. Add `'use client'` only when needed (event handlers, hooks, browser APIs).
- No inline styles. All styling via Tailwind classes using design tokens.
- No hardcoded colors — always use CSS variable names via Tailwind config.

**Data fetching:**
- Server Components: use Supabase server client directly (`createServerClient`)
- Client Components that need real-time or user-specific data: use Supabase browser client
- API routes: for mutations and analytics events only — don't create GET routes that duplicate what Server Components can do directly

**Error handling:**
- All Supabase calls: destructure `{ data, error }`, always check `error`
- Never `console.log` in production code. Use `console.error` for actual errors only.
- User-facing errors: show a toast (build a simple Toast component on Day 2)

**File naming:**
- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Components: `ComponentName.tsx`
- Utilities: `kebab-case.ts`
- Types: `types.ts` per feature, or `@/types/supabase.ts` for DB types

**Commits:** One feature per commit. Message format: `feat: [what]`, `fix: [what]`, `style: [what]`

---

## §13 — Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Gemini (free tier — get from aistudio.google.com)
GEMINI_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://milaap.dpdns.org
NEXT_PUBLIC_ORG_DEFAULT_SLUG=acn-butwal
```

Never hardcode any of these values. Never commit `.env.local`. The `.env.example` file should have all keys with empty values.

---

## §14 — What All Care Nepal is

Milaap is built and maintained by All Care Nepal — a registered animal welfare organization based in Butwal, Lumbini Province, Nepal. Website: https://allcarenepal.org

**Platform footer on every public page:**
"Built and maintained by All Care Nepal · Butwal, Nepal · allcarenepal.org"

**Platform neutrality:** ACN's animals in the discovery feed get NO preferential placement. Sort order is `days_waiting DESC` for all orgs equally. Milaap feels like a shared platform, not ACN's website with guest listings.

---

## §15 — Things Claude Code must never do

- Never add a UI component library (no Shadcn, no MUI, no Chakra, no Radix primitives)
- Never add Redux or any global state library — use React state + Supabase for everything
- Never store share assets in Supabase Storage — they are generated and downloaded client-side only
- Never add a "sort by newest" option to the discovery feed
- Never use `--color-terracotta` for decorative purposes (only for actions and the waiting bar)
- Never skip the image compression step before upload
- Never call the Gemini API on form changes — only on explicit "Publish" click
- Never remove the waiting bar from any animal card or profile
- Never add authentication to public-facing pages (/, /discover, /p/[slug], /happy-tails)
- Never store PII in analytics_events table
- Never let an animal profile 404 after adoption — always show adopted status

---