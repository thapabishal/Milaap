# Milaap — BUILD GUIDE
## Day-by-day development roadmap
### Platform maintained by All Care Nepal · milaap.dpdns.org

---

## HOW TO USE THIS GUIDE

This guide is split into two types of steps:

**MANUAL steps** — things you do yourself (Supabase dashboard, Vercel settings, terminal commands, account creation). These are clearly marked. Do not give these to Claude Code.

**PROMPT sections** — exact instructions to paste into Claude Code. Claude Code must read CLAUDE.md at the start of every session. Remind it if it forgets.

Every day ends with a **Verify** checklist. Do not move to the next day until every box is checked. A broken foundation is harder to fix later than it is now.

**Session start ritual for Claude Code:**
```
Read CLAUDE.md in full before writing any code.
Confirm you have read it by listing the 5 things listed in §15 (things never to do).
Then proceed with today's task.
```

---

## PRE-WORK — Setup (Do before Day 1)

### A1. Create the Next.js project

**MANUAL:**
```bash
npx create-next-app@latest milaap \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd milaap
```

Then install core dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install browser-image-compression
npm install qrcode
npm install react-i18next i18next i18next-browser-languagedetector
npm install next-pwa
npm install @types/qrcode --save-dev
```

### A2. Set up Supabase project

**MANUAL:**
1. Go to supabase.com → New project
2. Name: `milaap`
3. Region: **Singapore** (closest to Nepal)
4. Generate a strong database password — save it somewhere safe
5. Wait for project to spin up (~2 minutes)
6. Go to **Project Settings → API**. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret → `SUPABASE_SERVICE_ROLE_KEY` (keep this private)

### A3. Run the schema

**MANUAL:**
1. In Supabase dashboard → **SQL Editor → New query**
2. Open `schema.sql` from this project
3. Before running: find the seed data section at the bottom and update:
   - `whatsapp_number` → ACN's real WhatsApp number (digits only, no spaces, no +977)
   - `whatsapp_display` → formatted version for display
   - `founded_year` → ACN's actual founding year
4. Run the entire file
5. Go to **Table Editor** — confirm you see 6 tables: `analytics_events`, `animals`, `followup_reminders`, `happy_tails`, `organizations`, `users`
6. In Table Editor → `organizations` → confirm "All Care Nepal" row exists with `verification_status = 'verified'`

### A4. Create the first admin user

**MANUAL:**
1. Supabase dashboard → **Authentication → Users → Add user**
2. Email: your real email (you'll use this to log into the CMS)
3. Password: strong password
4. Copy the User UID that appears after creation
5. Go to **SQL Editor** and run:
```sql
insert into users (id, organization_id, full_name, role)
values (
  'PASTE-YOUR-UID-HERE',
  (select id from organizations where slug = 'acn-butwal'),
  'Your Full Name',
  'platform_admin'
);
```
6. Confirm the row appears in the `users` table

### A5. Set up Cloudflare + domain

**MANUAL:**
1. Log into Cloudflare → your `milaap.dpdns.org` domain
2. Go to **DNS → Records**
3. Add record:
   - Type: `CNAME`
   - Name: `@` (or `milaap`)
   - Target: `cname.vercel-dns.com`
   - Proxy: ✓ Proxied (orange cloud)
4. SSL/TLS → set to **Full (strict)**
5. Speed → Optimization → enable **Auto Minify** (HTML, CSS, JS)

### A6. Create GitHub repository

**MANUAL:**
```bash
git init
git add .
git commit -m "feat: initial Next.js setup"
gh repo create milaap --private
git remote add origin https://github.com/YOUR_USERNAME/milaap.git
git push -u origin main
```

### A7. Set up Vercel

**MANUAL:**
1. vercel.com → **Add New → Project** → import your GitHub repo
2. Before first deploy → **Settings → Environment Variables** → add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (get from aistudio.google.com → Create API key — free, no credit card)
   - `NEXT_PUBLIC_SITE_URL` = `https://milaap.dpdns.org`
   - `NEXT_PUBLIC_ORG_DEFAULT_SLUG` = `acn-butwal`
3. Apply to Production, Preview, and Development
4. **Settings → Domains** → add `milaap.dpdns.org`
5. Deploy → first deploy will show default Next.js page — that's fine

### A8. Create `.env.local`

**MANUAL:** Create this file in project root (never commit it):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SITE_URL=https://milaap.dpdns.org
NEXT_PUBLIC_ORG_DEFAULT_SLUG=acn-butwal
```

Also create `.env.example` with empty values and commit that one.

### A9. Self-host Satoshi Rounded font

**MANUAL:**
1. Go to fontshare.com → search "Satoshi" → Download
2. Extract the zip — you need these weights: 300, 300i, 400, 400i, 500, 700
3. Create `/public/fonts/satoshi/` directory
4. Copy the `.woff2` files there
5. You'll wire these up in Day 1 via Claude Code prompt

### A10. Set up Supabase Storage

**MANUAL:**
1. Supabase dashboard → **Storage → New bucket**
2. Name: `animal-photos`
3. Public: ✓ Yes (photos are public — no auth needed to view)
4. File size limit: 5MB (the app will compress below 150KB, but this is a safety net)
5. Allowed MIME types: `image/webp,image/jpeg,image/png`
6. Click Create

---

**Pre-work checklist — complete before Day 1:**
- [ ] `npm run dev` works at localhost:3000
- [ ] 6 tables visible in Supabase Table Editor
- [ ] All Care Nepal org row exists with verified status
- [ ] Platform admin user account created and in `users` table
- [ ] `animal-photos` storage bucket created
- [ ] Gemini API key in `.env.local`
- [ ] Vercel project deployed (default page is fine)
- [ ] `milaap.dpdns.org` resolving (may take up to 24h for DNS)
- [ ] Satoshi font files in `/public/fonts/satoshi/`

---

# PHASE 1 — Core profile page
## Weeks 1–2: Design system + single animal profile

The goal of Phase 1 is one thing: a single animal profile page that is so well designed and emotionally compelling that seeing it makes you want to adopt. Everything else is built on top of this. Do not rush it.

---

## Week 1 — Foundation

### Day 1 — Design tokens + font + Supabase client

**Goal:** The visual foundation in place. Every color, spacing, and font available as Tailwind tokens. Supabase client connected. App runs with correct typography.

**Prompt:**
```
Read CLAUDE.md in full before writing any code.
Confirm you have read it by listing the 5 things in §15.

Today's tasks:

1. Self-host Satoshi Rounded font:
   - Font files are in /public/fonts/satoshi/ (woff2 format, weights 300/400/500/700 + italics)
   - Create a font.ts file in /lib/ that uses next/font/local to load them
   - Apply to the root layout as a CSS variable: --font-satoshi
   - The body should use this font by default

2. Configure Tailwind with Milaap design tokens (tailwind.config.ts):
   - Extend colors with ALL values from §6 of CLAUDE.md:
     linen: '#F7F2EB', terracotta: '#C46F52', dusty-rose: '#D7A79A',
     sage: '#8A9B82', charcoal: '#2D2926', stone: '#8A8078',
     linen-dark: '#E8DDD0', and all status colors
   - Extend fontFamily: { satoshi: ['var(--font-satoshi)', 'sans-serif'] }
   - Extend spacing with the 8px grid from §6
   - Extend borderRadius with values from §6

3. Set up Supabase clients:
   - /lib/supabase/client.ts — browser client using createBrowserClient
   - /lib/supabase/server.ts — server client using createServerClient with cookies
   - /lib/supabase/middleware.ts — session refresh middleware
   - Update next.config.js to include the middleware matcher

4. Update root layout (app/layout.tsx):
   - Apply font variable
   - Set background to bg-linen
   - Set default text to text-charcoal
   - Add <html lang="en"> 

5. Create a simple test page at / that shows:
   - A heading in Satoshi Bold using each weight (300, 400, 500, 700)
   - A terracotta button, a dusty-rose badge, a sage status dot
   - Text: "Design system loaded. All colors and fonts working."
   This is temporary — replaced on Day 5.
```

**Verify:**
- [ ] `npm run dev` runs without errors
- [ ] Satoshi Rounded font renders (not fallback system font) — check DevTools
- [ ] Test page shows terracotta button, sage dot, correct font weights
- [ ] No TypeScript errors (`npm run type-check`)

---

### Day 2 — Base UI components

**Goal:** The reusable component library that every page will use. Build these once, use everywhere.

**Prompt:**
```
Read CLAUDE.md §6 (design system) and §12 (coding conventions).

Build these components in /components/ui/ — each in its own file.
Follow design specs in §6 exactly. No external component libraries.

1. Button.tsx
   Variants: 'primary' (terracotta), 'secondary' (ghost), 'dark' (charcoal)
   Sizes: 'sm', 'md' (default), 'lg'
   Props: variant, size, className, disabled, loading (shows spinner), onClick, href (renders as <a> if provided), children

2. Badge.tsx
   For status labels and tags.
   Props: variant ('available'|'reserved'|'fostered'|'medical'|'adopted'|'default'), size ('sm'|'md'), children
   Use status colors from §6. Uppercase text, letter-spacing, pill shape.
   'available' variant shows a small pulsing green dot before the text.

3. Card.tsx
   White background, linen-dark border, rounded-xl, subtle shadow.
   Hover: slightly elevated shadow. Smooth transition.
   Props: className, children, onClick

4. WaitingBar.tsx
   The platform's signature element — appears on EVERY animal card and profile.
   Props: daysWaiting (number), maxDaysWaiting (number)
   Renders: thin horizontal bar (h-[2px]), linen-dark bg, terracotta fill
   Fill width: (daysWaiting / maxDaysWaiting) * 100%, clamped to 100%
   Right of bar: "{daysWaiting} days waiting" in dusty-rose, 10px uppercase
   See exact code in CLAUDE.md §6.

5. Toast.tsx + useToast.tsx hook
   Simple toast notification (top-right, auto-dismisses after 3s).
   Variants: 'success' (sage), 'error' (muted red), 'info' (charcoal)
   No external library — build with useState + useEffect + CSS transition.

6. LoadingSkeleton.tsx
   Animated linen-colored skeleton for loading states.
   Props: className (for sizing)
   Uses a shimmer animation: gradient sweep left-to-right.
   Never use a spinner — always use skeletons.

7. LanguageToggle.tsx
   Fixed position top-right (z-50).
   Shows: EN | NE — two text buttons, active one in charcoal, inactive in stone.
   On click: calls i18n.changeLanguage(), saves to localStorage key 'milaap_lang'.
   Reads saved preference on mount.
   For now just build the UI — i18n wiring happens on Day 3.
```

**Verify:**
- [ ] All 7 components render without errors on a test import page
- [ ] WaitingBar fills proportionally (test with daysWaiting=100, max=200 → 50% fill)
- [ ] Badge 'available' variant shows pulsing dot
- [ ] Toast appears and dismisses after 3 seconds
- [ ] Skeleton shows shimmer animation

---

### Day 3 — i18n setup + language system

**Goal:** The entire app can switch between English and Nepali with one tap.

**Prompt:**
```
Read CLAUDE.md §7 (language toggle behavior).

Set up i18next for EN/NE language support:

1. Install if not already: npm install react-i18next i18next i18next-browser-languagedetector

2. Create /lib/i18n/config.ts — i18next configuration:
   - Resources: en and ne namespaces
   - Detection: localStorage key 'milaap_lang', then navigator language
   - Fallback: 'en'
   - For now, add placeholder strings — they'll be filled in as we build

3. Create /lib/i18n/en.json with these initial strings:
   {
     "nav": { "discover": "Discover", "happyTails": "Happy Tails", "about": "About" },
     "welcome": {
       "headline": "Someone is waiting for",
       "headline_you": "you.",
       "subtext": "Rescued animals across Nepal. Each with a story. Each waiting for someone to read it.",
       "cta": "Meet them"
     },
     "animal": {
       "daysWaiting": "{{count}} days waiting",
       "available": "Available",
       "reserved": "Reserved",
       "fostered": "In foster care",
       "medicalHold": "Not currently available",
       "adopted": "Found their home",
       "goodWithKids": "Good with kids",
       "goodWithDogs": "Good with dogs",
       "goodWithCats": "Good with cats",
       "apartmentOk": "Apartment ok",
       "vaccinated": "Vaccinated",
       "neutered": "Neutered",
       "meetCta": "Meet {{name}}",
       "whatsappCta": "Message {{org}} about {{name}}"
     },
     "footer": {
       "builtBy": "Built and maintained by All Care Nepal · Butwal, Nepal",
       "website": "allcarenepal.org"
     }
   }

4. Create /lib/i18n/ne.json with Nepali equivalents:
   {
     "nav": { "discover": "खोज्नुहोस्", "happyTails": "सफल कथाहरू", "about": "बारेमा" },
     "welcome": {
       "headline": "कोही प्रतीक्षामा छ",
       "headline_you": "तपाईंको।",
       "subtext": "नेपालभर उद्धार गरिएका जनावरहरू। प्रत्येकसँग एउटा कथा छ। प्रत्येक कसैको प्रतीक्षामा छ।",
       "cta": "तिनीहरूलाई भेट्नुहोस्"
     },
     "animal": {
       "daysWaiting": "{{count}} दिनदेखि पर्खिरहेको",
       "available": "उपलब्ध",
       "reserved": "आरक्षित",
       "fostered": "पालनपोषणमा",
       "medicalHold": "अहिले उपलब्ध छैन",
       "adopted": "घर भेट्यो",
       "goodWithKids": "बच्चाहरूसँग मिल्छ",
       "goodWithDogs": "कुकुरसँग मिल्छ",
       "goodWithCats": "बिरालोसँग मिल्छ",
       "apartmentOk": "अपार्टमेन्टमा ठिक",
       "vaccinated": "खोप लगाइएको",
       "neutered": "बन्ध्याकरण गरिएको",
       "meetCta": "{{name}} लाई भेट्नुहोस्",
       "whatsappCta": "{{name}} बारे {{org}} लाई सन्देश"
     },
     "footer": {
       "builtBy": "अल केयर नेपाल द्वारा निर्मित र संचालित · बुटवल, नेपाल",
       "website": "allcarenepal.org"
     }
   }

5. Wire the LanguageToggle component (built Day 2) to i18next:
   - On mount: read localStorage 'milaap_lang', call i18n.changeLanguage()
   - On toggle click: call i18n.changeLanguage(), save to localStorage
   - Active language highlighted in charcoal

6. Wrap the root layout with the i18n provider.

7. Update the <html> tag to use the current language:
   <html lang={currentLang}> — use 'ne' or 'en'
```

**Verify:**
- [ ] Language toggle appears top-right on all pages
- [ ] Clicking NE changes visible strings to Nepali
- [ ] Refreshing the page remembers the selected language
- [ ] `<html lang>` attribute updates correctly

---

### Day 4 — Public layout + navigation

**Goal:** The public-facing layout shell. The header and footer that every public page uses.

**Prompt:**
```
Read CLAUDE.md §5 (app structure) and §6 (design system).

Build the public layout — used by all public pages (/, /discover, /p/[slug], /happy-tails, etc.)

1. Create app/(public)/layout.tsx with:
   - PublicHeader component: logo left, nav right (Discover | Happy Tails | About), language toggle
   - The Milaap logo: the SVG mark (two crossing paths) + wordmark "Milaap" in Satoshi Bold
     SVG mark uses terracotta (#C46F52) for the left path, charcoal (#2D2926) for the right path
     The crossing/meeting point dot is terracotta
   - On mobile: hamburger menu (three lines), slides in from right
   - Nav items use i18n t() function for text
   - Header is sticky on scroll — white bg when scrolled, transparent when at top of page
   
2. PublicFooter component:
   - Milaap logo mark (small)
   - "Two stories. One journey." tagline in stone italic
   - Nav links: Discover, Happy Tails, About, FAQ
   - Divider line
   - "Built and maintained by All Care Nepal · Butwal, Nepal"
   - "allcarenepal.org" link → opens in new tab
   - © 2025 All Care Nepal
   - Background: charcoal (#2D2926), text: linen (#F7F2EB) at reduced opacity

3. Create placeholder pages so navigation doesn't 404:
   - app/(public)/page.tsx → "Welcome page — Day 5"
   - app/(public)/discover/page.tsx → "Discovery feed — Week 2"
   - app/(public)/happy-tails/page.tsx → "Happy Tails — Phase 3"
   - app/(public)/about/page.tsx → "About — Phase 3"
   - app/(public)/faq/page.tsx → "FAQ — Phase 3"
```

**Manual steps:** 
After the build, open the site on your phone. Confirm the hamburger menu works on mobile. Confirm the header goes transparent at the top and white on scroll.

**Verify:**
- [ ] Header renders with logo, nav items, language toggle
- [ ] Footer renders with ACN credit in charcoal background
- [ ] Hamburger menu works on mobile viewport (375px width)
- [ ] All nav links don't 404 (placeholder pages exist)
- [ ] Logo SVG mark is visible and correct colors

---

### Day 5 — Welcome page

**Goal:** The first page a visitor sees. 4 seconds to create emotional impact. Matches the opening experience designed in the brainstorming phase.

**Prompt:**
```
Read CLAUDE.md §6 and §8 (SEO requirements).
The welcome page is app/(public)/page.tsx

Build the welcome page exactly as specified:

SECTION 1 — Hero (above the fold on mobile):
- Background: bg-linen (#F7F2EB)
- Headline: "Someone is waiting for" [newline] "you."
  - "Someone is waiting for" → Satoshi Bold, 48px on mobile / 64px on desktop, charcoal
  - "you." → same size, terracotta (#C46F52), italic style
  - Words animate in sequentially: each word fades up with 80ms stagger, starting 200ms after load
  - Use CSS transitions, not a library
- Subtext (14px, stone, max-width 320px): fetched from i18n welcome.subtext
- CTA button: "Meet them →" — Primary variant (terracotta), links to /discover
  - Fades in after headline completes (after ~800ms)
- All content left-aligned, padding: 32px top, 28px sides

SECTION 2 — Hero photo area:
- Full-width image (below headline on mobile, right column on desktop)
- Image: rotate daily through featured animals (query: animals where is_featured=true, is_published=true, order by random(), limit 1)
  - Fetch server-side — no loading flash
  - Show the hero photo (first photo where is_hero=true from photos jsonb)
  - Display name + waiting days overlay at bottom of image
- On desktop: two-column layout, headline left / photo right
- Gradient: image fades into linen at bottom (linear-gradient overlay)
- Bottom strip (dark, charcoal bg, 48px height):
  - Left: "animals waiting" in stone 10px uppercase
  - Right: count of published available animals from DB — in dusty-rose, 18px

METADATA (server-side, in page.tsx):
export const metadata = {
  title: 'Milaap — Where rescued animals meet their families | Nepal',
  description: 'Discover rescued animals across Nepal waiting for a home. Milaap connects animals with families through storytelling, trust, and meaningful discovery.',
  openGraph: {
    title: 'Milaap Nepal — Two stories. One journey.',
    description: 'Where rescued animals meet their families.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  }
}

For the OG image, create a simple static /public/og-default.jpg placeholder for now 
(any 1200x630 image) — dynamic OG generation is Day 14.

DATABASE QUERIES (server component):
- Featured animal: select from animals where is_featured=true, is_published=true, status='available', limit 1 with random ordering
- Animal count: select count(*) from animals where is_published=true and status in ('available','reserved','fostered')
- Also fetch the featured animal's org for the overlay display
```

**Manual steps:** 
In Supabase Table Editor → `animals` table → create one test animal row manually so the welcome page has data to show. Use realistic data:
- name: 'Bruno'
- slug: 'bruno'
- organization_id: ACN's ID
- one_liner: 'First to greet you every morning. Still waiting for someone to come home to.'
- story_en: 'Bruno arrived in March 2024, found near the Butwal highway with an injured leg. He was frightened of everything he saw. Eight months of patience, gentle handling, and consistent love later — he is the shelter team's most trusted companion. He follows volunteers on their morning rounds, sits calmly with new visitors, and has never shown aggression despite everything he has been through. He is ready. He has been ready. He is just waiting for the right person to notice.'
- intake_date: '2024-03-15' (or a real past date giving ~200+ days waiting)
- species: 'dog', gender: 'male', size: 'medium'
- status: 'available', is_published: true, is_featured: true
- Add a photo: upload any dog photo to Supabase Storage, copy the path into photos jsonb as `[{"path": "acn-butwal/bruno/hero.webp", "is_hero": true}]`

**Verify:**
- [ ] Welcome page renders with headline animation
- [ ] "you." is terracotta italic
- [ ] Featured animal photo shows with name overlay
- [ ] Animal count strip shows a number > 0
- [ ] OG meta tags present in page source
- [ ] Page looks correct on 375px (iPhone SE) and 1440px (desktop)

---

## Week 2 — Animal profile page

This is the most important page in the entire platform. Take the full week on it.

### Day 6 — Animal profile — photo section + hero

**Goal:** The top half of the profile page. Photo gallery, status, org badge, waiting bar, animal name.

**Prompt:**
```
Read CLAUDE.md §5 (app structure), §6 (design system), §7 (WhatsApp URL, analytics).

Build app/(public)/p/[slug]/page.tsx — the permanent animal profile.

Today: the photo section and hero only. Bottom sections tomorrow.

DATA FETCHING (server component):
- Query: select animal by slug, join organization (for name + whatsapp_number + slug)
- If animal not found: return notFound() (Next.js 404)
- If animal status = 'medical_hold': still render profile but show "Not currently available" status
- Pass data to client components as needed

PHOTO GALLERY (client component: AnimalPhotoGallery.tsx):
- Full-bleed image, width 100%, height 65vh on mobile / 55vh on desktop
- Image array from animal.photos jsonb
- Dot indicators below image: filled dot = current, empty dot = other
- Tap left/right edges to navigate photos
- Smooth transition between photos (opacity fade, 300ms)
- Bottom gradient: linear-gradient from transparent to the page background (linen)
- If no photos: show a linen-colored placeholder with the Milaap logo mark centered

STATUS + ORG ROW (below photo area):
- Left: Badge component with animal's status (use Badge.tsx from Day 2)
- Right: org name + city, 11px stone, links to /org/[org.slug]
- Between them: a subtle dot separator

WAITING BAR:
- WaitingBar component (from Day 2)
- daysWaiting: computed as current_date - intake_date (compute server-side)
- maxDaysWaiting: query max(current_date - intake_date) from animals where status != 'adopted' and is_published = true
- Full width, appears directly below the status row

ANIMAL NAME + METADATA:
- Name: Satoshi Bold, 38px, charcoal, tracking tight
- Below name: "[species] · ~[age] · [gender]" in 12px stone

METADATA for this page:
export async function generateMetadata({ params }): Promise<Metadata> {
  const animal = await getAnimalBySlug(params.slug)
  return {
    title: `${animal.name} — ${animal.species} for adoption in ${animal.org.city} | Milaap Nepal`,
    description: `${animal.one_liner} Available for adoption through ${animal.org.name}.`,
    openGraph: {
      title: `${animal.name} — waiting ${daysWaiting} days | Milaap`,
      description: animal.one_liner,
      images: [{ url: `/api/share-image/${animal.slug}`, width: 1200, height: 630 }],
    }
  }
}

Track page view on load (fire-and-forget, client-side):
trackEvent('profile_view', animal.id, animal.organization_id, source)
Source: check URL params for ?src=qr, ?src=social, etc. Default: 'direct'
```

**Verify:**
- [ ] `/p/bruno` renders without errors
- [ ] Photo gallery shows Bruno's photo, full-bleed
- [ ] Dot indicators appear (1 dot for 1 photo)
- [ ] Status badge "Available" with pulsing green dot
- [ ] WaitingBar fills and shows days count
- [ ] Animal name "Bruno" large and bold
- [ ] `analytics_events` table gets a new row on page load (check in Table Editor)

---

### Day 7 — Animal profile — story + traits + incentives

**Goal:** The middle and bottom sections of the profile. The emotional content that drives conversion.

**Prompt:**
```
Read CLAUDE.md §6 (design system).

Continue building app/(public)/p/[slug]/page.tsx — below the hero from Day 6.

All sections below the waiting bar + name. Page has bg-linen, card sections are bg-white.

SECTION: PERSONALITY QUOTE
- If animal.personality_en is filled:
  - Italic text, 15px, stone color, Satoshi Light Italic
  - Left border: 2px solid dusty-rose (#D7A79A)
  - Padding-left: 14px
  - Margin: 20px 0
- Use t() for any surrounding UI text

SECTION: "HIS STORY" / "HER STORY" / "THEIR STORY"
- Section label: 10px uppercase, stone, letter-spacing 0.14em
  - "HIS STORY" for male, "HER STORY" for female, "THEIR STORY" for unknown gender
  - Use i18n key — add to en.json and ne.json
- Story text: 14px, charcoal at 0.85 opacity, line-height 1.75
- Show animal.story_en or story_ne based on current language
- If story_ne is empty and language is 'ne': show story_en with a small note "(Translation coming soon)"

SECTION: "GOOD TO KNOW"
- 2-column grid of trait cards
- Only show traits where the value is not null/unknown
- Each trait card: white bg, linen-dark border, rounded-md, padding 10px 12px
  - Good with kids ✓ → sage text
  - Good with dogs ✓ → sage text  
  - Good with cats ✓ → sage text
  - Apartment ok ✓ → sage text
  - Vaccinated ✓ → sage text
  - Neutered ✓ → sage text
  - High energy ⚡ → dusty-rose text (it's not bad, but worth knowing)
  - Not good with cats ✗ → stone text, not alarming
- Use i18n keys for all labels

SECTION: "WHAT COMES WITH [NAME]"
- Terracotta section label (same 10px uppercase style)
- Light terracotta bg (rgba(196,111,82,0.06)), terracotta border (0.15 opacity), rounded-xl
- Incentive items (show all 4):
  🩺 Free first vet check — partner clinic
  💉 Rabies vaccination included, year one
  💬 Adopter support WhatsApp group
  🏠 Emergency foster if you need it
- 12px, charcoal, line-height 1.5, gap between items: 8px

SECTION: PHOTO GRID (if animal has 3+ photos)
- Show remaining photos (not hero) in a 2-column grid
- Each rounded-md, aspect-ratio 1:1, object-cover
- Tap to open full-screen (simple lightbox — just a fixed overlay with the image and a close X)
```

**Verify:**
- [ ] Personality quote shows with left dusty-rose border
- [ ] Story text is readable (not too small, good line height)
- [ ] Trait grid shows only non-null traits (hidden if null/unknown)
- [ ] "What comes with Bruno" section has the terracotta tinted background
- [ ] All 4 incentive items show with emoji
- [ ] Language toggle switches story and trait labels correctly

---

### Day 8 — Animal profile — CTA section + share sheet

**Goal:** The conversion elements. The WhatsApp button, share options, foster path.

**Prompt:**
```
Read CLAUDE.md §7 (WhatsApp URL construction, analytics tracking).

Complete the animal profile page with the CTA section and share sheet.

CTA SECTION (sticky on mobile — fixed bottom bar when scrolled past hero):
Primary CTA:
- Button: dark variant (charcoal bg, linen text), full width
- Text: "💬 Message [OrgName] about [AnimalName]" — use i18n animal.whatsappCta
- On click:
  1. Call trackEvent('whatsapp_tap', animal.id, animal.organization_id)
  2. Build WhatsApp URL using buildWhatsAppURL() from lib/whatsapp.ts
     (use current language — 'ne' if NE is active, 'en' otherwise)
  3. window.open(url, '_blank')
- Show a 1.5-second overlay before opening WhatsApp:
  - Centered text: "We've noted your interest in [Name]. [OrgName] will reply within 24 hours."
  - Linen background, subtle fade in/out
  - Do not block the WhatsApp open — show overlay simultaneously

Secondary CTAs (below primary):
- "Share [Name]'s story ↗" → opens share sheet (see below)
- "Interested in fostering instead? →" → links to /about#fostering (placeholder for now)

Both secondary CTAs: ghost style, smaller text, centered

MOBILE STICKY BAR:
- When user scrolls past the hero photo area:
  - A compact sticky bar appears at the bottom (fixed, above any browser chrome)
  - Shows: animal name (small, left) + "Meet [Name]" button (terracotta, right)
  - Tapping "Meet [Name]" triggers same WhatsApp behavior as primary CTA
  - Bar has charcoal background, linen text
  - Smooth slide-up animation on appear

SHARE SHEET (bottom sheet on mobile, modal on desktop):
- Triggered by "Share [Name]'s story ↗"
- Build as a client component ShareSheet.tsx
- Options:
  1. "Instagram Story" → calls generateStoryAsset() (stub for now — Day 21)
     Show placeholder: "Story asset — Day 21" 
  2. "Instagram Post" → calls generatePostAsset() (stub for now — Day 21)
  3. "WhatsApp" → opens WhatsApp with message:
     "[AnimalName] has been waiting [X] days. [OneLiner] [URL]"
     tracks share_tap event
  4. "Copy link" → navigator.clipboard.writeText(url), shows toast "Link copied!"
     tracks share_tap event
- Bottom sheet: slides up from bottom, backdrop blur, charcoal handle bar at top

JSON-LD STRUCTURED DATA (add to page):
Add script tag with Animal schema as described in CLAUDE.md §8.
Also add BreadcrumbList schema:
Home > Discover > [AnimalName]
```

**Manual steps:**
Test the WhatsApp redirect on your actual phone. Open `/p/bruno` on mobile, tap the WhatsApp button. Confirm:
- WhatsApp opens (not just a link)
- The pre-filled message contains Bruno's name, ACN's name, and the Milaap URL
- The message appears in the correct org's WhatsApp (not a general number)

Also check in Supabase Table Editor → `analytics_events` — confirm a `whatsapp_tap` event was recorded.

**Verify:**
- [ ] WhatsApp button opens WhatsApp with correct pre-filled message on mobile
- [ ] Correct org WhatsApp number in the URL (verify against DB)
- [ ] 1.5s overlay shows after tapping WhatsApp button
- [ ] Sticky bottom bar appears after scrolling past the hero
- [ ] Share sheet opens from bottom on mobile
- [ ] "Copy link" shows toast and copies URL
- [ ] `analytics_events` records both `profile_view` and `whatsapp_tap` events
- [ ] JSON-LD breadcrumb appears in page source

---
### Day 9 — After-adoption profile state + SEO polish

**Goal:** Adopted animals stay live. Their profile changes gracefully. SEO metadata is complete.

**Prompt:**
```
Read CLAUDE.md §8 (SEO requirements).

Two tasks today:

TASK 1 — Adopted profile state:
When animal.status = 'adopted', the profile page should show a different experience:
- Status badge: "Found their home 🏠" in sage color — no pulsing dot
- WaitingBar: change label to "[X] days — now home" in sage color
  (daysWaiting = adopted_date - intake_date, capped — they're no longer waiting)
- Primary CTA changes to: "Read [Name]'s Happy Tails story →"
  - If a linked approved happy_tail exists: link to /happy-tails/[happy_tail_id]
  - If not yet: "Story coming soon — check back" (disabled button)
- A warm adoption announcement banner at the top (below photo):
  - Sage-tinted background
  - "[Name] found their family." — large text
  - "Adopted [Month Year]" + adopter's city if available
  - "This story inspired [X] more people to inquire about adoption" — show whatsapp_tap_count
- The WhatsApp CTA is hidden (no point inquiring about an adopted animal)
- The rest of profile (story, traits, what comes with) stays visible — it's now a testimonial

TASK 2 — sitemap.ts:
Create app/sitemap.ts (Next.js 14 Metadata API):
- Include all published animal profiles (is_published=true) — including adopted ones
- Include all approved happy tails
- Include static pages: /, /discover, /happy-tails, /about, /faq
- Adopted animal profiles: changeFrequency='yearly', priority=0.4
- Active animal profiles: changeFrequency='weekly', priority=0.8
- Homepage: changeFrequency='daily', priority=1.0
- Returns proper XML sitemap format

TASK 3 — robots.txt:
Create app/robots.ts:
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://milaap.dpdns.org/sitemap.xml

TASK 4 — llms.txt:
Create /public/llms.txt (served at milaap.dpdns.org/llms.txt):
Content (write this yourself based on the platform):
# Milaap — Nepal Animal Adoption Platform
> [One paragraph description of what Milaap is and does]
## How to adopt through Milaap
[Step by step]
## Organizations currently on Milaap
[List with cities]
## Contact
[ACN contact]
```

**Verify:**
- [ ] Manually change Bruno's status to 'adopted' in Supabase → profile shows adopted state
- [ ] "Found their home 🏠" badge shows in sage
- [ ] WhatsApp button hidden on adopted profile
- [ ] `/sitemap.xml` returns valid XML with Bruno's URL
- [ ] `/robots.txt` returns correct content
- [ ] `/llms.txt` is accessible
- [ ] Change Bruno's status back to 'available' after testing

---

### Day 10 — Profile polish + mobile perfection

**Goal:** The profile page is pixel-perfect on mobile. Smooth animations. Real feel.

**Prompt:**
```
Read CLAUDE.md §6 (design system). Today is polish only — no new features.

Review the full animal profile page and apply these refinements:

1. SCROLL BEHAVIOR:
   - Smooth scrolling: add scroll-smooth to html element
   - Section transitions: each content section below the hero fades in as it enters the viewport
     Use Intersection Observer API (not a library)
     Fade + translateY(12px) → translateY(0), duration 400ms, staggered by 80ms per section

2. PHOTO GALLERY REFINEMENTS:
   - Add swipe gesture support on mobile (touchstart/touchend, min 50px swipe = next/prev)
   - Pinch-to-zoom on individual photos (CSS touch-action: pinch-zoom)
   - Photo counter: "1 / 3" top-right of photo area, 10px white text, semi-transparent bg

3. WAITING BAR REFINEMENT:
   - The fill should animate in on page load: start at 0%, animate to final % over 800ms
   - Use CSS animation with a delay of 300ms (after page content has rendered)
   - Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)

4. TYPOGRAPHY AUDIT:
   - Verify all text uses Satoshi Rounded (not fallback)
   - Animal name: ensure it doesn't overflow on very long names (max 2 lines, ellipsis)
   - One-liner: max 3 lines on mobile, fade-out bottom edge if longer

5. COLOR CONSISTENCY CHECK:
   - ALL buttons: verify they use exact hex values from CLAUDE.md §6, not Tailwind defaults
   - NO terracotta used decoratively — only on buttons, waiting bar, and active states
   - Stone (#8A8078) for all metadata and captions consistently

6. MOBILE SPACING:
   - Content padding: 20px sides on mobile, 28px on tablet, centered max-width 680px on desktop
   - Section gap: 24px between all sections consistently
   - Bottom padding: 100px (to clear the sticky CTA bar)

7. PERFORMANCE:
   - The hero image must use Next.js <Image> with priority={true} (above the fold)
   - Gallery images: priority={false}, loading="lazy"
   - Verify no layout shift on image load (use explicit width/height or aspect-ratio)

8. ACCESSIBILITY:
   - All images have meaningful alt text: "[Name] — [species] available for adoption at [org]"
   - WhatsApp button has aria-label="Message [OrgName] about [AnimalName] on WhatsApp"
   - Photo gallery has role="img" and aria-label="Photos of [Name]"
   - Color contrast: run through WCAG AA check mentally — stone text on linen bg passes
```

**Manual steps:**
Test the profile on 3 devices/sizes:
1. Your phone (real device) — check swipe gestures, sticky bar, spacing
2. Browser DevTools at 375px (iPhone SE) — check nothing overflows
3. Browser DevTools at 1440px (desktop) — check max-width centering

Also run Lighthouse on the profile page. Target: Performance 85+, Accessibility 90+.

**Verify:**
- [ ] Sections animate in on scroll (Intersection Observer working)
- [ ] Waiting bar animates from 0 to final width on page load
- [ ] Swipe gesture works on mobile for photo navigation
- [ ] Lighthouse Performance: 85+, Accessibility: 90+
- [ ] No horizontal scroll on 375px viewport
- [ ] All images have alt text (check in DevTools → Accessibility tab)

---

**Week 2 milestone:** Share the Bruno profile URL with 3 real people. Ask them one question: "Would you tap the WhatsApp button?" If yes — Phase 1 complete.

---

# PHASE 2 — Discovery Feed
## Weeks 3–4: The browsing experience

---

## Week 3 — Discovery feed

### Day 11 — Discovery feed — data + card component

**Goal:** The AnimalCard component and the data layer for the discovery feed.

**Prompt:**
```
Read CLAUDE.md §1 (sort order), §6 (design system).

Build the AnimalCard component and the discovery data layer.

1. Create /components/animal/AnimalCard.tsx:
   This is the card shown in the discovery feed. Specs:
   - White bg, rounded-xl (20px), overflow hidden, shadow-sm, hover shadow-md
   - Photo: full-bleed top, height 240px on mobile card, object-cover
     - Use Next.js <Image> with appropriate sizes prop
     - Loading: show LoadingSkeleton (from Day 2)
   - Status badge: absolute positioned, top-left corner of photo, 12px from edges
   - Org badge: absolute top-right: "[OrgName] · [City]" — 10px, semi-transparent dark bg, rounded
   - WaitingBar: directly below photo area, full width — this is the most important element
   - Animal name: Satoshi Bold, 32px, charcoal
   - One-liner: 14px italic, stone, max 2 lines with ellipsis, Satoshi Light Italic
   - Tags row: max 4 tags, overflow hidden. Tags use linen-dark bg, rounded-full, 10px text
     Order: species+age, then good_with_kids, apartment_ok, vaccinated
   - CTA row: "Meet [Name] →" (terracotta button, flex-1) + "♡" icon button + "↗" share icon button
   - "↑ Next animal" hint: 10px stone, centered, below CTA row, only shows on first card
   
2. Create /lib/animals.ts with server-side data functions:
   - getDiscoveryFeed(options: { species?, size?, city?, page?, limit? }): 
     Returns animals where is_published=true, status in ('available','reserved','fostered')
     Sorted by: intake_date ASC (longest waiting first — this is critical)
     Computed field: (current_date - intake_date) as days_waiting
     Also returns: max days_waiting across all active animals (for WaitingBar percentage)
     Paginated: 12 per page

3. Build the /discover page shell (app/(public)/discover/page.tsx):
   - Server component: fetch first page of animals + max_days_waiting
   - Pass to client component for scroll/filter handling
   - Show the AnimalCard for each animal
   - For now: a simple responsive grid (1 column mobile, 2 column tablet)
   - Loading state: 6 skeleton cards (same dimensions as AnimalCard)
   - Empty state: "No animals available right now. Check back soon." + Milaa mascot placeholder
```

**Verify:**
- [ ] AnimalCard renders Bruno correctly with all sections
- [ ] WaitingBar percentage is correct (if Bruno is the only animal, bar is 100%)
- [ ] Tags row shows max 4 tags, no overflow
- [ ] /discover shows the card grid
- [ ] Skeleton cards appear on slow connection (use DevTools throttling to test)

---

### Day 12 — Discovery feed — vertical scroll mode + filter

**Goal:** The full-screen vertical scroll experience on mobile. Filter sheet.

**Prompt:**
```
Read CLAUDE.md §1 (sort order is always days_waiting DESC — longest first).

Today: the mobile-first full-screen scroll mode for /discover.

SCROLL MODE (mobile):
- On mobile (< 768px): switch from grid to single-column full-screen card mode
  - Each card: height = 100svh (full screen height)
  - One animal at a time fills the screen
  - Vertical scroll snaps to each card: scroll-snap-type: y mandatory on container
    Each card: scroll-snap-align: start
  - Photo: 55% of card height, full-bleed
  - Content: 45% below photo, with all card elements
  - Momentum scrolling feels natural — CSS handles it, no JS scroll library
  
- On tablet/desktop (>= 768px): 2-column grid (from Day 11), no snap scrolling

ORDERING — critical detail:
- The "Unexpected" card: every 5th position in the feed, inject an animal with is_featured=true
  - If is_featured animal also happens to be the longest waiter, that's fine — show it naturally
  - If injected, the card shows an additional label: "Most people scroll past animals like [Name]."
  - This is editorial — not algorithmic. Just position 5, 10, 15 in the feed array

FILTER SHEET:
- Filter button: top-right of discover page, opens bottom sheet on mobile / side panel on desktop
- Filter options:
  - Species: All / Dog / Cat / Other (pill buttons)
  - Size: All / Small / Medium / Large (pills)
  - Good with kids: toggle (default: off)
  - Good with cats: toggle (default: off)
  - Apartment friendly: toggle (default: off)
  - City/Org: dropdown of available cities from DB
- "Show [X] animals" button at bottom of filter sheet (shows live count as filters change)
- "Clear filters" text button
- Active filters: show count badge on filter button ("Filter · 2")
- Filters are applied as query params: /discover?species=dog&kids=true
  Server component re-fetches with these params

INFINITE SCROLL (client-side):
- Load 12 animals initially (server)
- When user reaches the last 3 cards: fetch the next 12 via /api/animals (client)
- Append to the list — no page reload
- "You've seen all [X] animals" message at the end
- "Back to top" button appears at the end
```

**Verify:**
- [ ] On mobile: single full-screen card, snaps on scroll
- [ ] On desktop: 2-column grid
- [ ] Filter sheet opens, applies filters, URL updates with query params
- [ ] Refreshing with ?species=dog filter pre-applies it (server reads params)
- [ ] Infinite scroll loads next page when near the end
- [ ] "Most people scroll past..." label appears on every 5th card

---

### Day 13 — Discover page — SEO + metadata

**Goal:** The discovery page is properly indexed. Every filter combination has correct metadata.

**Prompt:**
```
Read CLAUDE.md §8 (SEO/GEO/AEO requirements).

1. Metadata for /discover:
export const metadata = {
  title: 'Adopt a rescue animal in Nepal | Milaap',
  description: 'Browse rescued dogs, cats, and animals available for adoption across Nepal. Each animal has a story. Find yours.',
}

2. Metadata for /discover with filters (use generateMetadata):
   - ?species=dog → "Adopt a rescue dog in Nepal | Milaap"
   - ?city=butwal → "Adopt a rescue animal in Butwal | Milaap"
   - ?species=cat&city=kathmandu → "Adopt a rescue cat in Kathmandu | Milaap"

3. CollectionPage JSON-LD for /discover:
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Animals available for adoption in Nepal",
  "description": "...",
  "url": "https://milaap.dpdns.org/discover",
  "provider": { "@type": "Organization", "name": "Milaap Nepal" }
}

4. Add /discover and its filter variants to sitemap.ts:
   - /discover (priority 0.9, daily)
   - /discover?species=dog (priority 0.7, weekly)
   - /discover?species=cat (priority 0.7, weekly)
   - /discover?city=butwal etc. — generate from available cities in DB

5. Create /app/(public)/faq/page.tsx with real content:
   Build the full FAQ page with these questions and well-written answers:
   
   Q: How do I adopt an animal through Milaap?
   Q: Is adopting through Milaap free?
   Q: What happens after I message the organization?
   Q: Can I adopt an animal from another city?
   Q: What does "reserved" mean on an animal's profile?
   Q: What comes with an adoption through Milaap?
   Q: Can I foster instead of adopting permanently?
   Q: How do I know the organization is trustworthy?
   
   Each answer: direct, 2-4 sentences, plain language.
   
   Add FAQPage JSON-LD schema with all Q&As.
   Add HowTo schema for the adoption process (4 steps).
   
   Metadata:
   title: 'Frequently asked questions about animal adoption in Nepal | Milaap'
   description: 'Everything you need to know about adopting a rescued animal in Nepal through Milaap.'
```

**Verify:**
- [ ] `/discover?species=dog` has correct title tag in page source
- [ ] `/faq` renders all 8 questions with answers
- [ ] FAQPage JSON-LD present in /faq page source
- [ ] HowTo schema present with 4 steps
- [ ] Sitemap includes /discover filter variants

---

### Day 14 — Dynamic OG image generation

**Goal:** Every animal profile generates a beautiful social share preview automatically. When someone forwards a Milaap link on WhatsApp or Facebook, it shows the animal's photo, name, and waiting days.

**Prompt:**
```
Read CLAUDE.md §8 (OG image requirement), §10 (image strategy).

Build the dynamic OG image API route using @vercel/og (Edge Runtime):

1. Install: npm install @vercel/og

2. Create app/api/share-image/[slug]/route.tsx (Edge Runtime):
   - Fetch animal by slug (use service role key — server side)
   - Fetch the hero photo URL (first photo where is_hero=true)
   - Generate a 1200x630px image with:
     LEFT HALF (600px): 
       - Background: linen (#F7F2EB)
       - Milaap logo mark (SVG, 40x40) top-left with "Milaap Nepal" text
       - Animal name: large, Satoshi Bold, charcoal
       - Waiting bar: thin rectangle, terracotta fill
       - "[X] days waiting" in dusty-rose
       - One-liner text in stone italic
       - "[OrgName] · [City]" in small stone text bottom
     RIGHT HALF (600px):
       - Animal hero photo, object-cover, full height
       - Left edge: gradient from linen to transparent
   
   - Cache headers: Cache-Control: public, max-age=86400, s-maxage=86400
     (cache for 24h — photo won't change that fast)
   - If animal not found: return a default OG image
   - If no photo: right half shows a linen background with the logo mark

3. Verify the OG image URL is already in generateMetadata on the profile page:
   images: [{ url: `/api/share-image/${animal.slug}`, width: 1200, height: 630 }]
   If not, add it now.

4. Create /public/og-default.jpg replacement:
   Generate a simple static OG using the same @vercel/og approach for the homepage.
   Or: just create a good-looking static 1200x630 PNG using any image editor as a placeholder.
   Needs: Milaap logo, tagline "Two stories. One journey.", linen background.
```

**Manual steps:**
Test OG image at: `https://milaap.dpdns.org/api/share-image/bruno`
Then test social sharing preview using: https://opengraph.xyz — paste Bruno's profile URL and check the preview looks correct.

Also test on WhatsApp: send `https://milaap.dpdns.org/p/bruno` to yourself in WhatsApp. Confirm the preview shows Bruno's photo and name.

**Verify:**
- [ ] `/api/share-image/bruno` returns an image (open in browser)
- [ ] Image shows animal name, waiting days, and photo
- [ ] opengraph.xyz shows correct preview for Bruno's profile URL
- [ ] WhatsApp link preview shows photo (test on real WhatsApp)
- [ ] Cache headers present (check in DevTools → Network)

---

### Day 15 — Welcome page final + PWA setup

**Goal:** The welcome page is complete with real data. The platform is installable as a PWA.

**Prompt:**
```
Read CLAUDE.md §2 (PWA with next-pwa).

TASK 1 — Welcome page completions:
The welcome page from Day 5 may have used placeholder data. Today:
- Ensure the featured animal rotates: on each server render, pick a random is_featured animal
  (server-side random selection, changes per page load — not cached)
- Add a subtle "scroll to discover" indicator at the very bottom of the hero:
  A thin vertical line that animates (grows and fades) with the text "↓ scroll" in 10px stone
  Disappears once user scrolls

TASK 2 — PWA setup:
1. Configure next-pwa in next.config.js:
   - dest: 'public'
   - disable: process.env.NODE_ENV === 'development' (don't run SW in dev)
   
2. Create /public/manifest.json:
{
  "name": "Milaap Nepal",
  "short_name": "Milaap",
  "description": "Where rescued animals meet their families",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F7F2EB",
  "theme_color": "#C46F52",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}

3. Create PWA icons:
   - /public/icons/icon-192.png (192x192)
   - /public/icons/icon-512.png (512x512)
   Both should show the Milaap logo mark on a terracotta (#C46F52) background, white paths
   For now: create simple placeholder PNGs using canvas or any image editor
   (The real icons come when final logo files are provided)

4. Add to root layout <head>:
   <link rel="manifest" href="/manifest.json" />
   <meta name="theme-color" content="#C46F52" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="default" />
   <link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

**Manual steps:**
On your phone:
1. Visit `https://milaap.dpdns.org` in Chrome/Safari
2. Try "Add to Home Screen"
3. Confirm it installs with the correct name "Milaap Nepal" and icon
4. Open the installed PWA — confirm no browser chrome, correct theme color

**Verify:**
- [ ] PWA installs on phone with correct name and icon
- [ ] Theme color is terracotta in the browser bar
- [ ] Welcome page featured animal changes on refresh (random selection)
- [ ] Scroll indicator appears on welcome page
- [ ] Manifest at `/manifest.json` is valid JSON

---

**Phase 2 milestone:** Share the /discover URL with 5 people. Ask: "Did you scroll through more than 3 animals?" If yes — discovery is working. If no — investigate what stopped them.

---

# PHASE 3 — Admin CMS
## Weeks 5–7: Volunteer tools

---

## Week 5 — Auth + admin shell

### Day 16 — Auth + admin layout

**Goal:** Volunteers can log in and see the CMS. Non-authenticated visitors are redirected to login.

**Prompt:**
```
Read CLAUDE.md §3 (roles), §5 (app structure admin section).

Build the admin authentication and layout shell.

1. Create app/(admin)/layout.tsx:
   Admin layout has a sidebar (desktop) and bottom nav (mobile).
   Different from public layout — no public header/footer.
   
   Sidebar (desktop, 240px fixed):
   - Top: Milaap logo mark + "Admin" label
   - Org name of logged-in user (fetched from users join organizations)
   - Nav sections:
     📊 Dashboard (/)
     🐾 Animals (/admin/animals)
     ❤️ Happy Tails (/admin/happy-tails)  
     📈 Analytics (/admin/analytics)
     🏢 Our Profile (/admin/org) — org_admin only
     👥 Team (/admin/team) — org_admin only
   - Bottom: user name, role badge, sign out button
   
   Mobile (< 768px): bottom navigation bar with icons only
   - Dashboard, Animals, Happy Tails, Analytics
   
   Colors: sidebar bg charcoal (#2D2926), text linen (#F7F2EB) at 0.7 opacity
   Active nav item: terracotta (#C46F52) left border, text at full opacity
   
2. Create app/(admin)/login/page.tsx:
   - Email + password form (no OAuth)
   - Logo centered at top
   - "Sign in to Milaap Admin" heading
   - On submit: supabase.auth.signInWithPassword()
   - Success: redirect to /admin
   - Error: show error message in a red/muted alert below the form
   - bg-linen, centered card, max-width 400px

3. Middleware protection (update lib/supabase/middleware.ts):
   - Routes starting with /admin (except /admin/login): require auth
   - If not authenticated: redirect to /admin/login
   - After login: redirect to /admin

4. Create placeholder pages for all admin routes so sidebar nav doesn't 404.
```

**Verify:**
- [ ] Visiting `/admin` without auth redirects to `/admin/login`
- [ ] Logging in with the platform_admin account redirects to `/admin`
- [ ] Sidebar shows org name (All Care Nepal) and user's name
- [ ] Sign out button works and redirects to `/admin/login`
- [ ] Mobile bottom nav renders at < 768px

---

### Day 17 — CMS Dashboard (stats + reminder queue)

**Goal:** The first screen volunteers see. Impact numbers + the follow-up reminder queue.

**Prompt:**
```
Read CLAUDE.md §4 (database map — followup_reminders table), §7 (follow-up reminder creation).

Build app/(admin)/page.tsx — the CMS dashboard.

IMPACT STATS ROW (4 stat boxes):
- Animals published (count where is_published=true for this org)
- WhatsApp taps today (count analytics_events where event_type='whatsapp_tap', 
  organization_id = current user's org, created_at >= today)
- Follow-ups due (count followup_reminders where status='pending', 
  due_date <= today + 2 days, organization_id = current user's org)
- Total adoptions (count animals where status='adopted', organization_id = current user's org)

Each stat box: white bg, linen-dark border, rounded-xl, centered
Stat number: 28px, Satoshi Bold, terracotta
Stat label: 10px uppercase stone

FOLLOW-UP REMINDER QUEUE:
Fetch followup_reminders for this org where status='pending', order by due_date ASC
Group visually:
- URGENT (due_date <= today): terracotta left border on card
- DUE SOON (due_date <= today + 3 days): dusty-rose left border
- UPCOMING (due_date > today + 3 days): linen-dark left border

Each reminder card shows:
- Animal photo thumbnail (from linked animal.photos[0])
- Animal name + reminder type ("30-day check-in" or "6-month update")
- Adopter name + WhatsApp number (masked: show first 4 digits + *****)
- Due date (relative: "Today", "In 2 days", "July 15")
- "💬 Send message" button → opens WhatsApp Composer modal

WHATSAPP COMPOSER MODAL:
- When "Send message" clicked:
  - Modal/sheet slides up
  - Shows pre-written message from reminder.message_ne (or message_en)
  - Message is editable (textarea, pre-filled)
  - Unique submission link is embedded in the message: https://milaap.dpdns.org/happy-tails/submit/{token}
  - "Open in WhatsApp →" button:
    - Builds wa.me link with the adopter's WhatsApp number + encoded message
    - Opens WhatsApp
    - After clicking: show "Mark as sent?" confirmation
  - "Mark as sent" → updates reminder status='sent', sent_at=now(), sent_by=current user
  - Sent reminders move to a collapsed "Sent" section below

HAPPY TAILS PENDING SECTION:
- Count badge: "X pending approval"
- Preview cards for pending happy_tails (organization_id = this org)
- Shows: animal name, adopter name, submitted X days ago, photo thumbnail, story excerpt
- "Review" button → goes to /admin/happy-tails/[id]
```

**Verify:**
- [ ] Stats row shows correct numbers (verify against DB manually)
- [ ] Reminder cards appear with correct urgency styling
- [ ] Composer modal opens with pre-written message
- [ ] "Open in WhatsApp" opens WhatsApp with correct number and message
- [ ] After marking sent: card moves to "Sent" section
- [ ] Reminder status updates in DB (check Table Editor)

---

### Day 18 — Animal list + quick status change

**Goal:** Volunteers can see all their org's animals and update status in one click.

**Prompt:**
```
Read CLAUDE.md §4 (animals table), §3 (RLS — volunteers only see their org's animals).

Build app/(admin)/animals/page.tsx:

ANIMAL LIST TABLE:
Fetch all animals for current user's organization_id (RLS enforces this automatically)
Include: (current_date - intake_date) as days_waiting

Columns (table on desktop, cards on mobile):
- Photo thumbnail (40x40, rounded, first hero photo)
- Name + species/gender tag
- Status (Badge component — click to change)
- Days waiting (number, colored: >180 days = terracotta, >90 = dusty-rose, <90 = stone)
- WhatsApp taps (analytics count for this animal)
- Last updated (relative time: "2 days ago")
- Actions: Edit (pencil icon) → /admin/animals/[id] | QR (qr icon) → /admin/animals/[id]/qr

QUICK STATUS CHANGE:
- Clicking the status Badge opens a small dropdown:
  - Available / Reserved / Fostered / Medical Hold / Adopted
  - If changing TO 'adopted': show a small inline form first:
    - "Adopter name (for records):" text input
    - "Adopter city:" text input
    - "Adopter WhatsApp (for follow-up):" tel input
    - These values save to the animal record
    - THEN the trigger fires and creates followup_reminders automatically
  - On status change: update animal, refresh row in place (no full page reload)

SEARCH + FILTER:
- Search bar: live search by animal name (client-side)
- Status filter: pill buttons — All / Available / Reserved / Fostered / Medical Hold / Adopted
- Species filter: All / Dog / Cat

ADD ANIMAL button: top-right, terracotta, links to /admin/animals/new

TABLE HEADER: shows "X animals · Y available · Z adopted" for current org
```

**Verify:**
- [ ] Animal list shows Bruno (and any other test animals)
- [ ] Quick status change works — try changing Bruno to Reserved, then back to Available
- [ ] Changing to Adopted shows the adopter info form
- [ ] After changing to Adopted: two followup_reminders rows created in DB (check Table Editor)
- [ ] Days waiting column shows correct number
- [ ] Search filters the list client-side

---

### Day 19 — Add/Edit animal form — Steps 1-3

**Goal:** The CMS form for creating a new animal. Steps 1 (basics), 2 (story), 3 (personality tags).

**Prompt:**
```
Read CLAUDE.md §5, §6 (forms styling), §9 (AI quality check — DO NOT call yet, that's Step 6).

Build app/(admin)/animals/new/page.tsx (and reuse for /admin/animals/[id]/page.tsx):

Multi-step form. Each step on its own screen section, progress indicator at top.
Progress bar: 6 steps, thin terracotta line fills as steps complete.

STEP 1 — BASICS:
Fields (all with labels, placeholder text, and helper text below):
- Name * (text input)
  Helper: "The name the animal is known by at the shelter"
- Species * (segmented control: Dog / Cat / Rabbit / Other)
- Breed (text input, optional)
  Placeholder: "Mixed breed, Labrador mix, etc. — optional"
- Gender * (segmented: Male / Female / Unknown)
- Age (two inputs side by side: "X years" and "X months")
  Helper: "Estimate is fine — 'about 2 years' is better than leaving blank"
- Size * (segmented: Small / Medium / Large / XL)
- Intake date * (date picker)
  Helper: "The date this animal came into your care — this drives the waiting counter shown publicly"
- Color (text, optional)

STEP 2 — THE STORY:
- One-liner (EN) * — text input, max 80 characters, live character counter
  Label: "The sentence that makes someone stop scrolling"
  Helper: "Describe them as you'd describe a friend. Not their breed — their personality."
  Placeholder: "First to greet you every morning. Still waiting for someone to come home to."
  
- One-liner (Nepali) — text input
  Label: "Nepali version (auto-translated — please review)"
  Auto-fill button: "Translate →" (calls /api/admin/translate with the EN text)
  Note: build a simple /api/admin/translate route that calls Gemini for translation

- Full story (EN) * — rich textarea (NO rich text editor — just a textarea with good styling)
  Min-height: 200px, resize: vertical
  Label: "Bruno's full story"
  Helper: "How did they arrive? What have they overcome? Who are they now? Min 80 words."
  Live word count shown: "142 words ✓" in sage when > 80, in stone when < 80

- Full story (Nepali) — textarea
  Auto-fill button: "Translate →" (same API)

- Personality paragraph (EN) — textarea
  Label: "Complete this: '[Name] is the kind of [dog/cat] who...'"
  Placeholder: "Bruno is the kind of dog who remembers where everyone sits and always chooses the spot closest to you."
  Helper: "This appears as a pull-quote on the profile. Make it specific and human."

STEP 3 — PERSONALITY TAGS:
3-state toggles for each: Yes / No / Unknown (default: Unknown)
Good with kids | Good with dogs | Good with cats | Apartment ok | Needs garden
Energy level: Low / Medium / High (segmented)

Style: card for each toggle, clean and spacious. Not a table.
"Unknown" values will not show as tags on the public profile.
```

**Verify:**
- [ ] Can navigate forward and back through steps 1-3
- [ ] Character counter on one-liner updates in real time
- [ ] Word counter on full story shows sage ✓ when over 80 words
- [ ] Translate button fills the Nepali field (test with a short sentence)
- [ ] Personality tag toggles cycle: Unknown → Yes → No → Unknown
- [ ] Progress bar updates with each step

---

### Day 20 — Add/Edit animal form — Steps 4-6 + AI quality check

**Goal:** Medical info, photo upload, and the AI quality check before publish.

**Prompt:**
```
Read CLAUDE.md §9 (Gemini quality check), §10 (image strategy — compress before upload).

Continue the animal form:

STEP 4 — MEDICAL:
Simple toggles (Yes/No only, no Unknown):
- Vaccinated: toggle switch
- Neutered/Spayed: toggle switch  
- Microchipped: toggle switch

Medical notes (textarea, internal):
Label: "Medical notes (internal — not shown publicly)"
Placeholder: "Any ongoing conditions, medications, behavioral notes for the team"

STEP 5 — PHOTOS:
- Upload area: drag-and-drop zone OR click to browse
  Accepts: jpg, jpeg, png, webp
  Max: 5 photos
  
- On each file selected:
  1. Show preview thumbnail immediately (FileReader API)
  2. Compress using compressForUpload() from lib/image-compress.ts (see CLAUDE.md §7)
  3. Show compressed file size: "Compressed to 67KB ✓" in sage
  4. Upload to Supabase Storage at path: /{org_id}/{animal_id_temp}/{timestamp}_{index}.webp
     For new animals before saving: use a temporary UUID as animal_id_temp, 
     store this in component state to link photos when the animal is finally saved
  5. Store returned path in component state

- Drag to reorder photos (HTML5 drag API — no library)
- First photo = hero photo (shown on cards and OG image)
- Label shown on first photo: "Hero photo — shown on cards and in social shares"
- Delete button (X) on each photo

- Photo tips card below upload area (collapsible):
  📷 Natural light works best
  📷 Animal should fill 60% of the frame
  📷 Include at least one photo showing their face clearly
  📷 Action shots show personality — include one if possible

STEP 6 — QUALITY CHECK + PUBLISH:
This is the final step before publishing.

Layout:
- Summary of all filled fields (read-only preview)
- "Run quality check" button — PRIMARY ACTION

On click "Run quality check":
- Loading state: "Checking your profile..." with spinner
- Call /api/admin/quality-check (POST) which calls lib/gemini.ts
- Show results as a list of checks (from CLAUDE.md §9):
  ✓ or ⚠ or ✗ for each check
  Error checks (✗): block publish until fixed
  Warning checks (⚠): can override
  
- If all errors pass: "Publish" button becomes active (terracotta)
- If errors exist: "Publish" button is disabled, list errors highlighted in red
- "Save as draft" button always available (skips quality check, is_published=false)

On "Publish":
- Save all animal data to database (insert or update)
- Set is_published=true
- The trigger sets published_at=now()
- Redirect to /admin/animals with success toast: "[Name] is now live on Milaap 🎉"

On "Save as draft":
- Save with is_published=false
- Redirect to /admin/animals with toast: "Saved as draft — not yet visible to the public"
```

**Manual steps:**
Create a full test animal through the form:
1. Fill all steps completely
2. Upload at least 2 photos (real dog photos)
3. Run quality check — it should pass if content is good
4. Publish the animal
5. Visit `/p/[new-slug]` — confirm the full profile renders correctly with real photos

**Verify:**
- [ ] Photo upload compresses files (check Supabase Storage — files should be under 150KB)
- [ ] Drag-to-reorder works for photos
- [ ] Quality check runs and shows results
- [ ] Errors block publish; warnings allow override
- [ ] Successfully publishing an animal creates a live profile at `/p/[slug]`
- [ ] "Save as draft" saves without publishing

---

## Week 6 — CMS Features

### Day 21 — QR Generator + Share Asset Generation

**Goal:** Volunteers can generate QR codes and share assets for any animal in one tap.

**Prompt:**
```
Read CLAUDE.md §11 (canvas share assets), §7 (analytics tracking).

TASK 1 — QR Generator page (/admin/animals/[id]/qr):
- Generate QR code linking to: https://milaap.dpdns.org/p/[animal.slug]?src=qr
  (the ?src=qr lets analytics distinguish QR traffic)
- Use qrcode npm package (client-side generation)
- Display: large QR on the page, centered
- Download options:
  - "Download QR (PNG)" → canvas.toBlob() → download as milaap-[name]-qr.png
  - "Download QR (SVG)" → qrcode.toString(url, {type:'svg'}) → download as SVG
- Also generate a print-ready POSTER:
  - 210x297mm (A4) layout rendered on canvas
  - Shows: animal hero photo (top 50%), animal name (large), QR code (bottom-right)
  - "Scan to meet [Name]" text in Satoshi Bold
  - Org name + Milaap logo bottom
  - "Download Poster (PNG)" button
- QR and poster should use exact brand colors (terracotta qr modules, linen bg)

TASK 2 — Share Asset Generation (/components/share/ShareAssetGenerator.tsx):
The ShareSheet stub from Day 8 said "Day 21 — build it now"

Two canvas-rendered assets using Canvas API:

INSTAGRAM STORY (1080x1920):
- Background: linen (#F7F2EB)
- Animal photo: top 60% of canvas, object-cover
- Gradient: photo to linen (middle 10%)
- Bottom 40%:
  - Milaap logo mark (SVG) + "Milaap Nepal" — top-left, small
  - Org handle "@[orgInstagram]" — top-right, small, stone
  - Animal name: 80px, Satoshi Bold, charcoal
  - WaitingBar visual (drawn on canvas: thin rect, terracotta fill)
  - "[X] days waiting" in dusty-rose
  - One-liner in italic stone
  - "milaap.dpdns.org/p/[slug]" very small, bottom

INSTAGRAM POST (1080x1080):
- Left half: same text/brand info
- Right half: animal photo
- Terracotta strip at bottom: "Two stories. One journey."

Both:
- "Download Story" / "Download Post" buttons
- Show loading state while canvas renders (it takes 1-2s for image fetch + draw)
- Track share_tap analytics event on download

Wire these into the ShareSheet from Day 8 — replace the stubs with real generation.
```

**Manual steps:**
Test QR code:
1. Download the QR from `/admin/animals/bruno/qr`
2. Scan it with your phone — confirm it opens Bruno's profile with `?src=qr` in the URL
3. Check analytics_events — confirm a `profile_view` event with source='qr' was recorded

Test share assets:
1. On Bruno's profile, open the Share sheet
2. Generate Instagram Story
3. Download and confirm it looks correct
4. Try posting it as a story draft on your phone

**Verify:**
- [ ] QR code downloads and scans correctly to the right URL
- [ ] QR scan creates analytics event with source='qr'
- [ ] Instagram Story asset generates (may take 1-2s)
- [ ] Story asset shows animal name, waiting days, and logo
- [ ] Download triggers browser file download

---

### Day 22 — Happy Tails — Public page + submission flow

**Goal:** The Happy Tails public page and the adopter submission form.

**Prompt:**
```
Read CLAUDE.md §5 (app structure — happy-tails pages).

TASK 1 — Public Happy Tails page (/happy-tails):
Fetch: happy_tails where status='approved', join animal (name, species, intake_date, adopted_date), join organization (name, city)

Page structure:
- Header: "They found their home. Because someone looked."
- Subtext: "Every story here is proof that waiting ends."
- Impact bar (4 stats):
  - Total adoptions: count of approved happy_tails
  - Organizations: count of distinct org IDs
  - Average days saved: avg(days_waited) across all approved happy_tails
  - Cities reached: count of distinct adopter_city values
- Filter pills: All / Dogs / Cats / Long waiters (>150 days) / Recent (last 30 days)
- Story cards:
  - Before/After photo layout: shelter photo (from animal) → home photo (from happy_tail)
  - Arrow symbol between them: "→" 
  - Animal name + days waited
  - Story quote (first 150 characters if longer)
  - Adopter name + city + month/year adopted
  - "Share story ↗" button — shares this specific happy tail
- Bottom CTA: "Someone is still waiting. See who's waiting now →" → /discover

TASK 2 — Happy Tails submission page (/happy-tails/submit/[token]):
This is accessed from the WhatsApp message link. No auth required.

On load:
- Validate the token: query followup_reminders where submission_token=[token]
- If not found: "This link has expired or is not valid."
- If token_expires_at < now(): "This link has expired."
- If already submitted (linked happy_tail_id exists): "Thank you — [Name]'s story is already submitted!"

If valid, show the submission form:
- "[Name] found their home with you. 🐾" — warm headline
- "How are they doing? Share a moment." — subtext
- Photo upload: single photo, compressed before upload to Supabase Storage
- Story textarea: "How has [Name] changed your life? (Two sentences is perfect)"
- Name field: "Your first name"
- City field: "Your city"
- Submit button: "Share [Name]'s story →"

On submit:
- Insert into happy_tails (animal_id, org_id from reminder, story, photo, adopter info, days_waited snapshot)
- Update followup_reminders: set happy_tail_id = new happy_tail id
- Show confirmation: "Thank you. [Name]'s story will inspire someone to open their home too. 🐾"
- Do NOT redirect — let them read the confirmation
```

**Verify:**
- [ ] `/happy-tails` renders (empty state is fine if no approved stories yet)
- [ ] Impact stats show correct numbers
- [ ] Submit page works with a valid token (manually copy a token from `followup_reminders` table)
- [ ] Submission creates a `happy_tails` row with `status='pending'`
- [ ] Expired token shows appropriate message

---

### Day 23 — Happy Tails CMS approval workflow

**Goal:** Volunteers can review and approve/reject Happy Tails submissions from the CMS.

**Prompt:**
```
Build app/(admin)/happy-tails/page.tsx:

PENDING APPROVALS section:
- Cards for each happy_tail where status='pending' and organization_id = current org
- Each card:
  - Animal photo (shelter) + submission photo (home) side by side
  - Animal name + days_waited
  - Adopter name + city + submitted X days ago
  - Full story text
  - Two actions:
    ✓ Approve & Publish: sets status='approved', approved_by=current user, approved_at=now()
    ✗ Reject: opens inline reason textarea → sets status='rejected', rejection_reason=text

After approve: the story immediately appears on /happy-tails public page
After approve: offer to "Generate share assets for this story →" 
  (same canvas generation as Day 21, but for a happy tail: before/after + quote)

APPROVED section:
- Compact list of approved happy tails for this org
- Shows: animal name, adopter city, approved date, view count (from analytics)
- "View on site →" link
- Share assets download button

REJECTED section: collapsed, just a count and expandable list

ADMIN PAGE METADATA:
Title: "Happy Tails — Milaap Admin"
```

**Verify:**
- [ ] Pending submissions appear in the approval queue
- [ ] Approving a happy tail immediately makes it visible on `/happy-tails`
- [ ] Rejection stores the reason in the DB
- [ ] After approval, share asset generation is offered

---

### Day 24 — Analytics dashboard

**Goal:** Volunteers can see which animals perform best and how inquiries are trending.

**Prompt:**
```
Build app/(admin)/analytics/page.tsx:

All data filtered to current user's organization_id.

TIME RANGE SELECTOR:
- Last 7 days / Last 30 days / All time (default: 30 days)
- Pill buttons, updates all charts/numbers

OVERVIEW STATS (top row):
- Total profile views in period
- Total WhatsApp taps in period
- WhatsApp tap rate: (taps / views * 100)%
- Happy Tails submitted in period

ANIMAL PERFORMANCE TABLE:
Columns: Photo, Name, Status, Views, Taps, Tap Rate %, Days Waiting
Sort by: Tap Rate (descending) — shows which animals convert best
Highlight: animals with 0 taps despite many views (they need better stories)
Color code Tap Rate: > 20% sage, 10-20% stone, < 10% dusty-rose (needs attention)

TRAFFIC SOURCES (simple bar chart):
- QR / Direct / Social / Embed / Unknown
- Show as horizontal bars with percentage labels
- No chart library — pure CSS width percentages

ADOPTION FUNNEL (simple numbers):
Profile views → WhatsApp taps → Adoptions
Show the conversion at each step:
"[X] views → [Y] taps ([Z]%) → [W] adoptions ([V]%)"

WAITING TIME INSIGHT:
"Average waiting time at adoption for your animals: [X] days"
"Longest currently waiting: [Name], [X] days" → clickable, goes to /admin/animals/[id]
```

**Verify:**
- [ ] All stats show correct numbers (verify 2-3 manually against DB)
- [ ] Animal performance table sorts by tap rate
- [ ] Time range selector updates numbers
- [ ] Traffic sources show percentages that add to 100%

---

## Week 7 — Multi-org + Organization Profile

### Day 25 — Organization profile CMS + public org page

**Goal:** Each org can manage their profile. Public org pages build trust.

**Prompt:**
```
TASK 1 — Admin org profile (/admin/org) — org_admin only:
Editable fields:
- Organization name
- Description (EN + NE)
- City + District
- WhatsApp number (critical — changing this changes where ALL inquiry redirects go)
  Show current number, warn: "Changing this affects all animal inquiry redirects"
- Website URL, Facebook URL, Instagram URL
- Registration number (shown publicly as trust signal)
- Founded year
- Animals rescued count (manual number for display)
- Logo upload (compressed, stored in storage)
- Cover photo upload

Save button: "Update organization profile"
Changes are immediate — no approval workflow for org edits.

TASK 2 — Public organization page (/org/[slug]):
Fetch org by slug. If not found: 404.

Sections:
- Cover photo (full-bleed, 300px height, gradient overlay)
- Logo + org name + city
- Verification badge if verified: "✓ Verified organization"
- Registration number: "Registered NGO · [number]"
- Description text (EN or NE based on language)
- Stats row: Animals rescued / Years operating / Currently available
- "Visit their animals →" button → /discover?org=[slug]
- Available animals grid: 3 most recent available animals from this org
  Each is a mini AnimalCard linking to the full profile
- "See all animals from [OrgName] →" if more than 3

LocalBusiness JSON-LD schema:
{
  "@type": "AnimalShelter",
  "name": org.name,
  "url": "https://milaap.dpdns.org/org/[slug]",
  "telephone": org.whatsapp_display,
  ...
}
```

**Verify:**
- [ ] Can edit org profile at `/admin/org` and save changes
- [ ] Changing WhatsApp number shows warning
- [ ] Public page `/org/acn-butwal` renders with org details
- [ ] JSON-LD schema present on public org page
- [ ] Available animals show on the org page

---

### Day 26 — Platform admin tools + second org onboarding

**Goal:** The platform admin can create and manage organizations. The platform is ready for a second NGO.

**Prompt:**
```
Read CLAUDE.md §3 (platform_admin role).

Build platform admin features (only visible to platform_admin role):

1. /admin/platform (new route, platform_admin only):
   - List of all organizations: name, city, verification_status, animal_count, created_at
   - Filters: by verification status
   - "Add organization" button

2. Add Organization modal:
   Fields: name, slug, city, whatsapp_number, website_url, registration_number
   On submit: insert into organizations, then:
   - Show the created org's ID
   - Instructions: "Now create a volunteer account in Supabase Auth and assign this org_id"
   (Volunteer account creation remains a manual step — Supabase Auth)

3. Verify/Suspend organization toggle:
   - Verified orgs show the verification badge publicly
   - Suspended orgs: animals hidden from public discovery feed
   - One-click toggle with confirmation dialog

4. Update the discovery feed query:
   Ensure animals.organization_id → organizations.verification_status = 'verified' OR 'pending'
   Suspended org animals are excluded.

MANUAL STEPS for onboarding a second org:
After building the above, test the full onboarding:
1. Go to /admin/platform → Add Organization → fill details for a test org "Paws Kathmandu"
2. Go to Supabase Auth → Add user → create test-orgadmin@test.com
3. Copy the UID, run SQL:
   insert into users (id, organization_id, full_name, role)
   values ('NEW-UID', 'NEW-ORG-ID', 'Test Org Admin', 'org_admin');
4. Log in as test-orgadmin@test.com
5. Verify they can ONLY see their own org's animals (no cross-org data)
6. Add a test animal for this org
7. Verify it appears in the shared /discover feed alongside ACN's animals
```

**Verify:**
- [ ] `/admin/platform` only accessible to platform_admin
- [ ] Can create a new organization from the platform admin
- [ ] Second org volunteer account can log in and only sees their animals
- [ ] Second org's animals appear in the shared /discover feed
- [ ] Suspended org's animals disappear from /discover

---

# PHASE 4 — Polish & Launch
## Weeks 8–9: SEO completion, About page, launch

### Day 27 — About page + FAQ final

**Goal:** The trust-building pages that convert skeptics and improve SEO/AEO.

**Prompt:**
```
Read CLAUDE.md §8 (GEO/AEO requirements).

TASK 1 — /about page:
Sections:
1. Hero: "Two stories. One journey." — the platform's tagline as the headline
2. "What is Milaap?": clear one-paragraph explanation, written to be AI-readable
3. "About All Care Nepal": who built this and why. Include ACN's founding story briefly.
   Link to allcarenepal.org. ACN logo.
4. "How it works": 4-step visual (not just text):
   Step 1: Discover — Browse animals by story, not specs
   Step 2: Connect — Message the rescue org directly via WhatsApp
   Step 3: Meet — Visit the shelter, meet the animal
   Step 4: Home — Complete the adoption and begin a new chapter
5. "Organizations on Milaap": grid of verified org cards with logo, city, animal count
6. "Join Milaap" section for other NGOs:
   "If you run an animal rescue in Nepal and want to list your animals on Milaap, reach out."
   Contact button → mailto or WhatsApp to ACN

HowTo JSON-LD (4 steps, same as above)
Organization JSON-LD for Milaap platform itself
WebSite JSON-LD with SearchAction (pointing to /discover)

TASK 2 — /faq final polish:
From Day 13 you built the FAQ structure. Today:
- Review all 8 answers for quality and AEO optimization
- Each answer: first sentence is the direct answer (the snippet Google will pull)
- Add 4 more questions:
  Q: Which cities in Nepal can I adopt from?
  Q: How long does the adoption process take?
  Q: What should I prepare before bringing an animal home?
  Q: How can my organization join Milaap?
- Ensure FAQPage JSON-LD is complete with all 12 questions
```

**Verify:**
- [ ] `/about` renders all 6 sections
- [ ] HowTo JSON-LD in page source
- [ ] Organization cards show verified orgs
- [ ] `/faq` has 12 questions with complete FAQPage schema
- [ ] WebSite schema with SearchAction on about page

---

### Day 28 — Performance audit + error states

**Goal:** The platform performs well on slow connections. Every error state is handled gracefully.

**Prompt:**
```
Performance and error handling pass across the entire platform.

PERFORMANCE:
1. Run Lighthouse on these 3 pages and fix any issues below 85:
   - / (welcome)
   - /discover
   - /p/bruno
   
   Common issues to fix:
   - Images: ensure all use Next.js <Image> with proper sizes prop
   - Fonts: ensure Satoshi is preloaded in <head> with rel="preload"
   - JavaScript: check for unnecessary client components — convert to server where possible
   - LCP: the hero image on welcome and profile pages should load in < 2.5s on 3G

2. Add loading.tsx files for slow data fetches:
   - app/(public)/discover/loading.tsx → 6 skeleton cards
   - app/(public)/p/[slug]/loading.tsx → skeleton profile (photo area + content blocks)
   - app/(admin)/loading.tsx → admin skeleton

ERROR STATES:
Build these gracefully:
- app/(public)/not-found.tsx:
  "This page got lost on the way home."
  Milaa mascot (the SVG dog illustration from Day 4... or simple SVG if not built yet)
  "→ Back to discover" button
  
- app/(public)/error.tsx:
  "Something went wrong on our end. Try again in a moment."
  Retry button (calls router.refresh())
  
- app/(admin)/error.tsx:
  "Something went wrong. Please refresh or contact the platform team."
  Show error.message in a code block (admin can debug)

- Animal profile when Supabase is slow (> 3s):
  Show skeleton, then data, never a blank white screen

OFFLINE STATE (PWA):
- app/offline/page.tsx:
  "You're offline. The animals are still waiting — reconnect to see them."
  Shows the last-viewed animal names from service worker cache if available
  Simple reconnect check button
```

**Verify:**
- [ ] Lighthouse Performance: 85+ on welcome, discover, and profile pages
- [ ] LCP < 2.5s on throttled 3G in Lighthouse
- [ ] /unknown-slug shows the custom 404 page (not Next.js default)
- [ ] /admin/unknown shows the admin error page
- [ ] Loading skeletons appear on slow connection (DevTools throttle to Slow 3G)

---

### Day 29 — Launch checklist execution

**MANUAL — work through this list top to bottom:**

**Google Search Console:**
- [ ] Go to search.google.com/search-console
- [ ] Add property: `https://milaap.dpdns.org`
- [ ] Verify via HTML tag method (add to `<head>` in layout.tsx, redeploy)
- [ ] Submit sitemap: `https://milaap.dpdns.org/sitemap.xml`
- [ ] Request indexing for: `/`, `/discover`, `/p/bruno`, `/happy-tails`, `/faq`, `/about`

**Real content:**
- [ ] All ACN's current available animals entered in the CMS with full stories
- [ ] At least 2 animals have is_featured=true
- [ ] All animals have at least 2 photos each
- [ ] All photos compressed under 150KB (check Supabase Storage)
- [ ] All animals have Nepali one-liner filled (reviewed, not just auto-translated)
- [ ] At least 1 Happy Tails story live (even if from a previous adoption, enter it manually)
- [ ] ACN org profile complete: logo, description, registration number, social links

**Testing on real devices:**
- [ ] iPhone Safari: welcome, discover, profile, WhatsApp tap
- [ ] Android Chrome: same
- [ ] PWA install on both devices
- [ ] WhatsApp tap opens correct org number with pre-filled message
- [ ] Share link shows correct OG preview on WhatsApp (send to yourself)
- [ ] QR code scans correctly on both devices

**Social media:**
- [ ] Update ACN's Instagram bio: "🐾 Adopt through Milaap → milaap.dpdns.org"
- [ ] Update ACN's Facebook about section with Milaap link
- [ ] Prepare 3 Instagram Story share assets for launch day

---

### Day 30 — Launch + monitoring

**Goal:** The platform is live, announced, and being monitored.

**MANUAL — launch day:**

1. **Announce on ACN's channels:**
   - Instagram post: the welcome screen screenshot + link
   - Facebook post: Bruno's story + Milaap link
   - WhatsApp broadcast to ACN's existing network: "We built something for you..."

2. **Monitor in real-time:**
   - Supabase dashboard → Table Editor → `analytics_events` — watch events come in
   - Vercel dashboard → Functions → check for any 500 errors
   - Google Search Console → Coverage → check for crawl errors after 24h

3. **Create the first real Happy Tails submission:**
   - If ACN has a recent adoption: contact the adopter, ask for a photo and two sentences
   - Enter it through the CMS (or have them submit via the token link)
   - Approve it → post the Happy Tails card to Instagram Stories

**Prompt for Day 30:**
```
Read CLAUDE.md. Final task:

Build a simple internal health check page at /api/health (no auth required):
Returns JSON:
{
  "status": "ok",
  "timestamp": "ISO date",
  "checks": {
    "database": "ok" | "error",
    "storage": "ok" | "error",
    "animalCount": number,
    "publishedCount": number
  }
}

Database check: try a simple SELECT 1 query
Storage check: try listing the animal-photos bucket

This lets you check the platform is working with one URL visit.
```

**Verify:**
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] First Instagram post is live with milaap.dpdns.org link
- [ ] At least 3 analytics events visible in Supabase within an hour of launch
- [ ] Google Search Console shows sitemap accepted (may take 24-48h to process)

---

## APPENDIX — Troubleshooting common issues

### "Supabase RLS blocking my query"
Check: is the user authenticated? Does their `organization_id` match the data?
Debug: Go to Supabase → SQL Editor → run the query manually with the user's ID to see what RLS returns.

### "WhatsApp link doesn't open on iOS"
iOS requires `https://wa.me/` not `https://api.whatsapp.com/send`. 
Ensure lib/whatsapp.ts uses `https://wa.me/977${number}?text=${encoded}`.

### "Images not showing from Supabase Storage"
Check the bucket is public. Check the URL: `NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/public/animal-photos/{path}`.
If using Cloudflare, ensure the Storage URL is allowed through (not blocked by Cloudflare rules).

### "Gemini API returning 429 (rate limit)"
Free tier: 15 req/min. You're hitting this only if testing rapidly.
Add a 2-second delay between consecutive quality checks in testing. Production volume won't hit this.

### "Photo upload fails (413 entity too large)"
Supabase Storage default upload limit is 50MB. The compressed files should be under 150KB — this should never happen. If it does, check compression is actually running before upload.

### "Waiting bar shows wrong percentage"
The `max_days_waiting` query is fetching from all orgs, not just the current one. Check the query in `lib/animals.ts` — it should query across ALL published, non-adopted animals.

### "PWA not installable"
Requirements: HTTPS, valid manifest.json, service worker registered. Check all three. Cloudflare handles HTTPS. Check `/manifest.json` returns valid JSON. Check DevTools → Application → Service Workers.

---

*Milaap Build Guide — 30 days to launch*
*Built by All Care Nepal · allcarenepal.org*
*"Two stories. One journey."*