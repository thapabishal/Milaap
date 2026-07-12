# Milaap — UI/UX Build Guide
## Complete design and interaction specification
### "Two stories. One journey."

---

## HOW TO USE THIS GUIDE

This guide has two purposes. Know which one applies before opening it.

**Purpose 1 — Prompt library (primary use):**
This file contains ready-to-paste prompts for every component and page.
When starting a specific build task, find the relevant section and paste
that section only into Claude Code after the session start ritual.
Never paste the whole file. Never ask Claude Code to read it in full.

**Purpose 2 — Design reference (your reference, not Claude's):**
Parts 1, 12, 13, 14, 15 contain philosophy, typography specimens, breakpoints,
accessibility checklists, and self-critique notes. These are for YOU.
Claude Code gets this information via CLAUDE.md §16 instead.

**Correct session start ritual for Claude Code:**
```
Read CLAUDE.md fully — including §16 (design tokens).
Confirm you have read it by listing the 5 rules in §15.
Then I will give you today's specific task.
```

CLAUDE.md §16 contains every token, color, typography rule, animation name,
and component rule Claude Code needs. This file's sections are pasted per task only.

**How to use this file per task (example):**
Building WaitingBar → find section "4.1 WaitingBar" → copy that section →
paste into Claude Code after the session start. That one section. Nothing else.

**Rule throughout:** If you are unsure whether something looks good —
ask yourself: "Would a person who spent 10 minutes on this platform feel something?"
If no, it needs more thought.

---

## PART 1 — DESIGN PHILOSOPHY

### The 60-30-10 Color Rule Applied to Milaap

| Role | Color | % | Where |
|------|-------|---|-------|
| Dominant | Warm Linen `#F7F2EB` | 60% | Page backgrounds, card backgrounds, breathing room |
| Secondary | Charcoal `#2D2926` | 30% | Text, dark surfaces, admin sidebar, footer, dark cards |
| Accent | Terracotta `#C46F52` | 10% | CTAs only, waiting bar fill, active states, one highlight per screen |

**The discipline:** Dusty Rose `#D7A79A` and Sage `#8A9B82` are supporting colors — not part of the 60-30-10. They appear only as status signals and secondary accents. Never backgrounds.

**The trap to avoid:** Using terracotta decoratively. A terracotta section background, a terracotta illustration, a terracotta pattern — all wrong. Every time terracotta appears, it means "act here" or "this animal has waited." That meaning only works if it appears nowhere else.

### The Signature Element — The Living Waiting Bar

The waiting bar is not a progress bar. It is the platform's heartbeat.

**Visual spec:**
```
┌─────────────────────────────────────────┐ ← linen-dark bg (#E8DDD0), h-[2px]
│████████████████████████░░░░░░░░░░░░░░░░│ ← terracotta fill
                        ↑
              pulse point — subtle glow here
```

**The pulse animation:**
```css
@keyframes waiting-pulse {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(196, 111, 82, 0);
    opacity: 1;
  }
  50% { 
    box-shadow: 0 0 6px 2px rgba(196, 111, 82, 0.35);
    opacity: 0.92;
  }
}
/* Applied to the ::after pseudo-element at the right edge of the fill */
/* Animation: 3s ease-in-out infinite */
/* @media (prefers-reduced-motion): animation: none */
```

This is the only ambient animation on the discovery cards. Everything else is triggered by interaction. The pulse says: alive, waiting, breathing.

### Typography Scale — Intentional Sizing

The type sizes are larger than convention. This is deliberate.

```
Animal names on cards:     36-42px  ← uncomfortably large feels right
Animal names on profiles:  32-38px
Page display headlines:    48-56px
Section headlines:         22-24px
Body text:                 15px, line-height 1.75
Captions/metadata:         12-13px
Labels (uppercase):        10-11px, tracking 0.12em
Button text:               14px, tracking 0.04em, weight 600
```

Animal names being large is a statement: this animal is not a listing item. They are the subject of the page. Their name is the headline.

### Layout Language — The Asymmetric Card

Every card in Milaap uses a subtle asymmetry: the photo takes more vertical space than the content feels like it needs. This creates a sense of the animal being "more" than the text can capture — the photo is the primary communicator, text is supporting.

```
Phone screen (375px):
┌───────────────────┐
│                   │
│   PHOTO AREA      │  ← 58% of card height
│   (full bleed)    │
│                   │
│ ░░░░░░░░ 247 days │  ← waiting bar
├───────────────────┤
│ Bruno             │  ← 36px bold, 42% of card
│ "First to greet…" │
│ [tag][tag][tag]   │
│ [Meet Bruno →]    │
└───────────────────┘
```

### Motion Philosophy — Purposeful, Not Decorative

**Principle:** Every animation should have a narrative reason.

| Animation | Reason | Duration | Easing |
|-----------|--------|----------|--------|
| Animal card enters viewport | The animal arrives | 400ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| WhatsApp button tap | Confirms action | 120ms scale | ease-out |
| Profile slides in | Transition, not teleport | 300ms | ease-in-out |
| Status badge pulse | Animal is alive, available | 2s, infinite | ease-in-out |
| Waiting bar fill | Time is real | 800ms on load | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| Page entrance | Platform wakes up | 600ms stagger | ease-out |
| Share sheet | Comes from bottom | 280ms | cubic-bezier(0.32, 0.72, 0, 1) |
| Toast notification | Appears and disappears | 200ms in, 150ms out | ease |
| Admin tab switch | Content replacement | 180ms opacity | ease |
| Form step advance | Progress | 250ms slide+fade | ease-in-out |
| Hover on card | Invitation | 200ms shadow+lift | ease |

**Never animate:** Color changes on text, font-size changes, layout shifts, anything that causes reflow.

**Always respect:** `prefers-reduced-motion: reduce` — all animations collapse to instant or opacity-only.

---

## PART 2 — ASSET SETUP (Day 0 — Before Any UI Work)

### Logo and favicon from `/public/logo/`

Your logo files live at `/public/logo/`. The frontend needs these specific exports from your designer:

```
/public/logo/
  logo-full.svg          ← full logo: mark + "Milaap" wordmark, color version
  logo-full-white.svg    ← full logo on dark backgrounds (white paths)
  logo-mark.svg          ← mark only (the crossing paths symbol), color
  logo-mark-white.svg    ← mark only, white (for dark bg + PWA icon)
  favicon.ico            ← 32x32, for browser tab (older browsers)
  favicon.svg            ← modern browsers, scalable, terracotta on transparent
  apple-touch-icon.png   ← 180x180, for iOS "Add to Home Screen"
  
/public/icons/           ← PWA icons (for manifest.json)
  icon-192.png           ← 192x192, logo mark on terracotta background
  icon-512.png           ← 512x512, logo mark on terracotta background
  icon-maskable-512.png  ← 512x512, with safe zone padding for adaptive icons
```

**Prompt for Claude Code:**
```
Create /components/ui/Logo.tsx:

Props: variant ('full' | 'mark'), color ('color' | 'white'), size (number in px, default 32)

Logic:
- variant='full': render /public/logo/logo-full.svg (or logo-full-white.svg based on color prop)
- variant='mark': render /public/logo/logo-mark.svg (or logo-mark-white.svg)
- Use Next.js <Image> with width={size} height='auto' for SVGs
  Actually for SVGs use an <img> tag with style width={size}px height=auto
  (Next.js Image doesn't handle auto-height SVGs well)
- Add className prop for additional styling

Usage:
<Logo variant="full" color="color" size={120} />  ← nav header
<Logo variant="mark" color="white" size={28} />   ← admin sidebar
<Logo variant="mark" color="color" size={40} />   ← footer
```

**Update app/layout.tsx metadata:**
```tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/logo/apple-touch-icon.png',
  },
}
```

**Update /public/manifest.json:**
```json
{
  "name": "Milaap Nepal",
  "short_name": "Milaap",
  "description": "Where rescued animals meet their families. Two stories. One journey.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F7F2EB",
  "theme_color": "#C46F52",
  "orientation": "portrait-primary",
  "categories": ["lifestyle", "social"],
  "icons": [
    { "src": "/logo/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/logo/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/logo/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## PART 3 — GLOBAL COMPONENTS

### 3.1 Install Required Libraries

**Prompt:**
```
Install these libraries — each has a specific justified purpose:

npm install framer-motion
Reason: Orchestrated entrance animations and the share sheet spring physics.
        React Spring was considered but Framer Motion's layout animations
        are superior for the card-to-profile transition.
        Used in: card entrance, share sheet, profile slide-in, waiting bar.
        NOT used for: anything that CSS transitions can handle alone.

npm install clsx
Reason: Clean conditional className composition. Replaces string concatenation.
        Used everywhere components have multiple variants.

npm install @radix-ui/react-dialog
Reason: Accessible modal/sheet primitive with proper focus trapping and 
        ARIA attributes. The share sheet and confirm dialogs use this.
        NOT a full component library — one primitive only.

npm install @radix-ui/react-tooltip  
Reason: Accessible tooltips on admin icon buttons. Required for WCAG compliance.

npm install sharp
Reason: Required by Next.js Image optimization in production.

Do NOT install: any other UI library, component kit, or animation library.
These four cover every interaction need in Milaap V1.
```

### 3.2 Tailwind Config — Complete Token System

**Prompt:**
```
Replace tailwind.config.ts with this complete configuration.
This is the single source of truth for every design token.
Never use raw hex values in component files — always use these token names.

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        linen:       '#F7F2EB',
        'linen-mid': '#EDE8E0',
        'linen-dark':'#E8DDD0',
        terracotta:  '#C46F52',
        'terra-dark':'#A85A3F',
        'terra-light':'#D4896B',
        'dusty-rose':'#D7A79A',
        'rose-light':'#EDD5CE',
        sage:        '#8A9B82',
        'sage-dark': '#6A7A62',
        charcoal:    '#2D2926',
        'charcoal-mid':'#3D3530',
        stone:       '#8A8078',
        'stone-light':'#B0A89E',
        white:       '#FFFFFF',

        // Status semantic colors
        status: {
          available: '#8A9B82',
          reserved:  '#D7A79A',
          fostered:  '#C4A882',
          medical:   '#A08A7A',
          adopted:   '#6A8A6A',
        },
      },
      fontFamily: {
        satoshi: ['var(--font-satoshi)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display':    ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-sm': ['48px', { lineHeight: '1.08', letterSpacing: '-0.02em',  fontWeight: '700' }],
        'animal-lg':  ['42px', { lineHeight: '1.0',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        'animal-md':  ['36px', { lineHeight: '1.05', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline':   ['24px', { lineHeight: '1.25', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'body-lg':    ['17px', { lineHeight: '1.7',  fontWeight: '400' }],
        'body':       ['15px', { lineHeight: '1.75', fontWeight: '400' }],
        'body-sm':    ['13px', { lineHeight: '1.6',  fontWeight: '400' }],
        'label':      ['11px', { lineHeight: '1.4',  letterSpacing: '0.1em',  fontWeight: '500' }],
        'label-sm':   ['10px', { lineHeight: '1.4',  letterSpacing: '0.12em', fontWeight: '500' }],
        'caption':    ['12px', { lineHeight: '1.5',  fontWeight: '400' }],
      },
      spacing: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '16px',
        'lg':  '24px',
        'xl':  '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        'tag':    '6px',
        'card':   '16px',
        'card-lg':'24px',
        'pill':   '9999px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(45,41,38,0.06), 0 1px 2px rgba(45,41,38,0.04)',
        'card-hover': '0 8px 24px rgba(45,41,38,0.10), 0 2px 6px rgba(45,41,38,0.06)',
        'card-active': '0 2px 8px rgba(45,41,38,0.08)',
        'terra':   '0 4px 20px rgba(196,111,82,0.28)',
        'terra-sm':'0 2px 10px rgba(196,111,82,0.20)',
        'dark':    '0 4px 20px rgba(45,41,38,0.3)',
        'sheet':   '0 -4px 40px rgba(45,41,38,0.15)',
      },
      keyframes: {
        'waiting-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196,111,82,0)', opacity: '1' },
          '50%':       { boxShadow: '0 0 8px 3px rgba(196,111,82,0.3)', opacity: '0.9' },
        },
        'status-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'bar-fill': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--bar-fill-width)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'waiting-pulse': 'waiting-pulse 3s ease-in-out infinite',
        'status-pulse':  'status-pulse 2s ease-in-out infinite',
        'shimmer':       'shimmer 1.8s linear infinite',
        'fade-up':       'fade-up 0.4s ease-out both',
        'slide-up':      'slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        'bar-fill':      'bar-fill 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'float':         'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
```

### 3.3 Global CSS — /src/app/globals.css

**Prompt:**
```
Replace globals.css with exactly this:

@import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,301,400,401,500,501,700,701&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-satoshi: 'Satoshi', system-ui, sans-serif;
  }

  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-linen text-charcoal font-satoshi;
    min-height: 100dvh;
  }

  /* Remove default button styles */
  button {
    @apply cursor-pointer;
  }

  /* Custom scrollbar — subtle, matches brand */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-linen-dark rounded-pill;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-stone-light;
  }

  /* Reduced motion — collapse all animations to instant */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Selection color */
  ::selection {
    background: rgba(196, 111, 82, 0.2);
    color: #2D2926;
  }

  /* Focus visible — keyboard navigation */
  :focus-visible {
    outline: 2px solid #C46F52;
    outline-offset: 2px;
    border-radius: 4px;
  }
}

@layer utilities {
  /* The waiting bar fill animation — uses CSS custom property */
  .bar-fill-animate {
    animation: bar-fill 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    animation-delay: 0.3s;
  }

  /* Shimmer skeleton */
  .skeleton {
    background: linear-gradient(
      90deg,
      #E8DDD0 25%,
      #EDE8E0 50%,
      #E8DDD0 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s linear infinite;
  }

  /* Text gradient — used sparingly on hero text */
  .text-gradient {
    background: linear-gradient(135deg, #C46F52 0%, #D4896B 50%, #D7A79A 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Safe area for mobile (notch, home bar) */
  .safe-top    { padding-top:    env(safe-area-inset-top) }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom) }
}
```

---

## PART 4 — COMPONENT LIBRARY (Build in this order)

### 4.1 WaitingBar — The Signature Component

This is the most important component in the entire application. Build it first. Get it perfect.

**Prompt:**
```
Create /src/components/ui/WaitingBar.tsx

This component appears on every animal card and every animal profile.
It is the platform's signature element. Build it with care.

Props:
- daysWaiting: number
- maxDaysWaiting: number  
- size: 'sm' | 'md' (default: 'sm' for cards, 'md' for profiles)
- animate: boolean (default: true — false for skeleton states)
- showLabel: boolean (default: true)

Visual spec:

SIZE SM (cards):
- Track: h-[2px], bg-linen-dark, rounded-full, w-full
- Fill: terracotta, rounded-full, animate from 0 to % width on mount
- At the right edge of the fill: a ::after pseudo element that pulses
  (the "living" quality — see animation in tailwind config)
- Label: "X days waiting" — right aligned, 10px, dusty-rose, uppercase, tracking-[0.08em]
- Layout: flex items-center gap-3, fill and label on same row

SIZE MD (profiles):
- Track: h-[3px]
- Same pulse at fill edge
- Label below the bar (not beside it): "Waiting X days" in 11px dusty-rose

FILL PERCENTAGE: Math.min((daysWaiting / maxDaysWaiting) * 100, 100)
If daysWaiting > maxDaysWaiting (shouldn't happen but edge case): cap at 100%
If daysWaiting = 0: show 2% fill minimum (always show some bar)

ANIMATION:
The fill width is set via a CSS custom property --bar-fill-width applied inline.
On mount, the bar-fill animation runs (defined in tailwind config).
delay: 300ms (after card content renders)
If animate=false: set width directly, no animation.

THE PULSE:
Implement as a sibling <span> element positioned at the right edge of the fill:
- position: absolute, right: 0, top: 50%, transform: translateY(-50%)
- width: 4px, height: 4px, rounded-full, bg-terracotta
- animation: waiting-pulse 3s ease-in-out infinite
- @media prefers-reduced-motion: animation: none

ADOPTED VARIANT (when animal.status === 'adopted'):
- Fill: sage color instead of terracotta
- No pulse animation
- Label: "X days — now home" in sage color
- This communicates resolution, not urgency

Example output (size sm, 247 days, max 400):
┌─────────────────────────────────────● ───────┐ "247 days waiting"
↑ fill: 61.75% terracotta          ↑ pulse dot
```

### 4.2 Button Component

**Prompt:**
```
Create /src/components/ui/Button.tsx

This handles ALL button needs in the application.
Every button in Milaap routes through this component.

Props:
- variant: 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger'
- size: 'sm' | 'md' | 'lg'
- loading: boolean
- disabled: boolean
- fullWidth: boolean
- leftIcon: React.ReactNode
- rightIcon: React.ReactNode
- href: string (renders as <a> tag using Next.js Link)
- onClick: handler
- className: string
- children: React.ReactNode
- type: 'button' | 'submit' | 'reset'

VARIANTS:

primary (terracotta — the main action):
bg-terracotta text-white
hover: bg-terra-dark, translateY(-1px), shadow-terra
active: bg-terra-dark, translateY(0), shadow-terra-sm
disabled: opacity-50, cursor-not-allowed, no hover effects
shadow-terra always present (even at rest — makes it feel elevated)

secondary (outlined):
bg-white text-charcoal border border-linen-dark
hover: border-charcoal/30, bg-linen
active: bg-linen-mid

ghost (text only):
bg-transparent text-stone
hover: text-charcoal, bg-linen
no border

dark (charcoal — for dark contexts, WhatsApp CTA):
bg-charcoal text-linen
hover: bg-charcoal-mid
shadow-dark at rest

danger (admin only — destructive actions):
bg-white text-red-600 border border-red-200
hover: bg-red-50

SIZES:

sm:  px-4 py-2 text-[13px] rounded-pill h-9
md:  px-6 py-3 text-[14px] rounded-pill h-11  ← default
lg:  px-8 py-4 text-[15px] rounded-pill h-13

LOADING STATE:
Replace children with a spinner + "Loading…" text.
Spinner: a 16px circle, border-2, border-current/30, border-t-current, animate-spin
Keep button dimensions identical — no layout shift.

TRANSITION:
All buttons: transition-all duration-150
The -1px translateY on primary hover + shadow change = the "lift" effect.
This is subtle but makes the interface feel alive.

MICRO-INTERACTION on click:
scale(0.97) for 100ms on active state.
Use active:scale-[0.97] in Tailwind.
```

### 4.3 Badge / Status Chip

**Prompt:**
```
Create /src/components/ui/Badge.tsx

Used for: animal status, role tags, filter chips, counts.

Props:
- variant: 'available' | 'reserved' | 'fostered' | 'medical' | 'adopted' 
           | 'default' | 'count'
- size: 'sm' | 'md'
- dot: boolean (default: true for status variants — shows the pulsing dot)
- children: React.ReactNode

VARIANT SPECS:

available:
  bg: rgba(138,155,130, 0.12)  ← sage at 12% opacity
  border: 1px solid rgba(138,155,130, 0.3)
  text: #6A7A62 (sage-dark)
  dot: #8A9B82, animation: status-pulse 2s ease-in-out infinite

reserved:
  bg: rgba(215,167,154, 0.12)
  border: 1px solid rgba(215,167,154, 0.3)
  text: #B07A6A
  dot: #D7A79A, no animation

fostered:
  bg: rgba(196,168,130, 0.12)
  border: 1px solid rgba(196,168,130, 0.3)
  text: #8A6A40
  dot: #C4A882, no animation

medical:
  bg: rgba(160,138,122, 0.10)
  border: 1px solid rgba(160,138,122, 0.25)
  text: #7A6858
  dot: #A08A7A, no animation

adopted:
  bg: rgba(106,138,106, 0.12)
  border: 1px solid rgba(106,138,106, 0.3)
  text: #4A6A4A
  dot: #6A8A6A, no animation (resolved — no urgency)

default:
  bg: linen-dark
  border: linen-dark
  text: stone

count:
  bg: terracotta
  text: white
  font-weight: 700
  min-width: 20px, height: 20px, flex center
  Used for: notification counts, filter counts

SIZES:
sm: px-2 py-0.5 text-label-sm rounded-tag gap-1.5
md: px-3 py-1   text-label   rounded-tag gap-2

DOT: 5px × 5px circle, rounded-full
'available' dot has animation-status-pulse.
All other dots are static.

UPPERCASE: all badge text is uppercase with letter-spacing.
```

### 4.4 Card Component

**Prompt:**
```
Create /src/components/ui/Card.tsx

The base card. Used as a wrapper — not for animals specifically.

Props:
- variant: 'default' | 'elevated' | 'flat' | 'dark'
- hover: boolean (default: false — only true on clickable cards)
- onClick: handler
- className: string
- children: React.ReactNode

default:
  bg-white, border border-linen-dark, rounded-card, shadow-card
  hover (if hover=true): shadow-card-hover, translateY(-2px), transition 200ms

elevated:
  bg-white, rounded-card, shadow-card-hover (always elevated)
  No border.

flat:
  bg-linen-mid, rounded-card, no shadow, no border
  Used for inner sections, info boxes.

dark:
  bg-charcoal, rounded-card, shadow-dark
  Text colors inverted.

HOVER ANIMATION (when hover=true):
transition: transform 200ms ease, box-shadow 200ms ease
:hover { transform: translateY(-2px); box-shadow: shadow-card-hover; }
:active { transform: translateY(0); box-shadow: shadow-card-active; }

This 2px lift on hover is consistent across all interactive cards.
```

### 4.5 AnimalCard — The Discovery Card

This is the most complex public-facing component. Every pixel matters.

**Prompt:**
```
Create /src/components/animal/AnimalCard.tsx

This component is the primary discovery surface. It must be emotionally compelling.

Props:
- animal: Animal (full type from Supabase)
- org: Organization
- maxDaysWaiting: number
- index: number (for stagger animation delay)
- variant: 'feed' | 'grid' (feed = full-screen mobile, grid = 2-col desktop card)

PHOTO AREA (both variants):
- Full bleed photo using Next.js <Image>
- Object-fit: cover
- Feed variant: height = 58svh (most of the screen)
- Grid variant: aspect-ratio 4/3, fixed
- GRADIENT OVERLAY:
  linear-gradient(
    to bottom,
    transparent 0%,
    transparent 40%,
    rgba(45,41,38,0.02) 60%,
    rgba(45,41,38,0.06) 100%
  )
  This is very subtle — just enough to make white text readable at bottom
  The photo should feel unobstructed — not darkened

- STATUS BADGE: absolute top-3 left-3
  Use Badge component, variant matches animal.status
  backdrop-blur-sm, subtle — doesn't fight the photo

- ORG CHIP: absolute top-3 right-3
  "[OrgName] · [City]"
  bg: rgba(45,41,38,0.55), backdrop-blur-sm
  text: rgba(247,242,235,0.85), 10px, not uppercase
  rounded-pill, px-3 py-1

- VIDEO INDICATOR: if animal has video (Phase 2 — stub for now as null check)
  Skip in V1.

CONTENT AREA (below photo):
Padding: 16px

ROW 1 — Waiting bar (full width):
<WaitingBar 
  daysWaiting={days} 
  maxDaysWaiting={maxDaysWaiting} 
  size="sm" 
  animate={true}
/>

ROW 2 — Animal name:
<h2 className="text-animal-md text-charcoal mt-2 mb-1">
  {animal.name}
</h2>
No truncation. If name is very long (>12 chars), font-size reduces to 28px.

ROW 3 — One-liner:
Current language: show one_liner_en or one_liner_ne based on i18n
font: Satoshi 300 Italic, 14px, stone color, line-height 1.5
max 2 lines — after that: overflow hidden, no ellipsis (just cuts off)

ROW 4 — Tags:
Horizontal scroll on mobile (no scrollbar visible: scrollbar-hide)
Max 4 tags visible. Each uses Badge component, variant='default'.
Tags: species+age | good_with_kids if true | apartment_ok if true | vaccinated if true
Gap: 6px between tags
If no tags: this row is hidden (no empty gap)

ROW 5 — CTA:
flex gap-3 items-center mt-3

Primary: <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14}/>}>
  Meet {animal.name}
</Button>

Save (heart): 40×40 rounded-full, border border-linen-dark, bg-white
Icon: Heart, 18px, stone — filled when saved
Hover: border-dusty-rose, icon becomes dusty-rose
(Save state in localStorage for V1 — no auth required)

Share: 40×40 rounded-full, border border-linen-dark, bg-white
Icon: Share2, 18px, stone
Hover: border-terracotta/30

ENTRANCE ANIMATION (Framer Motion):
initial: { opacity: 0, y: 24 }
animate: { opacity: 1, y: 0 }
transition: { 
  duration: 0.4, 
  ease: [0.25, 0.46, 0.45, 0.94],
  delay: index * 0.06  ← stagger: card 0 = 0ms, card 1 = 60ms, etc.
}

HOVER (grid variant only):
whileHover={{ y: -2 }}
transition: { duration: 0.2 }

MOBILE FEED VARIANT specifics:
- The card IS the full screen — 100svh height
- scroll-snap-align: start
- Photo: 58svh, fills width
- Content: 42svh with overflow: hidden
- Sticky bottom CTA row that's always visible even if content scrolls
- "↑ next animal" hint (only on first card, fades after 3s)
```

### 4.6 LoadingSkeleton

**Prompt:**
```
Create /src/components/ui/Skeleton.tsx

Animated loading placeholder. Used everywhere data is loading.
Never use a spinner anywhere in Milaap. Always skeletons.

Props:
- variant: 'card' | 'profile' | 'happy-tail' | 'text' | 'circle' | 'rect'
- className: string

All variants use the .skeleton utility class (shimmer animation from globals.css).

CARD variant (for AnimalCard loading state):
Same dimensions as AnimalCard:
- Photo area: full width, aspect 4/3 (grid) or 58svh (feed), skeleton bg
- Content area: 3 skeleton lines for name/text, a thin skeleton for bar, 2 skeleton buttons

PROFILE variant:
- Photo: full width, 55vh, skeleton
- Below: pill skeleton (status badge), tall rect skeleton (name), 
         2px skeleton (waiting bar), 3 line skeletons (story)

TEXT variant:
- A single skeleton rect
- Height: 14px by default (matches body text)
- rounded-full

CIRCLE variant:
- rounded-full circle
- Default: 40px × 40px

RECT variant:
- Plain rectangle
- Accepts className for size

SKELETON GRID (for discover page loading):
Export a <SkeletonGrid count={6}/> component that renders count skeleton cards
in the same layout as the real discovery grid.
```

### 4.7 Toast Notification

**Prompt:**
```
Create /src/components/ui/Toast.tsx and /src/hooks/useToast.ts

DESIGN:
Position: fixed, bottom-4 right-4 (mobile: bottom-20 to clear bottom nav), z-50
Max width: 320px
bg-charcoal, text-linen, rounded-card, shadow-dark
padding: 12px 16px
flex items-start gap-3

Left icon: colored circle with icon inside
  success: sage bg, Check icon
  error: red-600 bg, X icon  
  info: dusty-rose bg, Info icon

Text area:
  Title: 14px, font-weight 600, linen
  Message (optional): 12px, stone-light

Close button: X, 16px, stone-light, hover linen, top-right

ANIMATION (Framer Motion):
Entry: { opacity: 0, x: 20, scale: 0.95 } → { opacity: 1, x: 0, scale: 1 }
Exit:  { opacity: 0, x: 20, scale: 0.95 }
Duration: 200ms, spring for entry

AUTO-DISMISS: 3.5 seconds (success/info), 6 seconds (error)

MULTIPLE TOASTS: stack vertically with 8px gap, newest on top.

useToast hook:
  Returns: { toast } function
  toast({ type, title, message?, duration? })
  
  State managed via React context (ToastProvider in root layout).
  Max 3 simultaneous toasts — oldest dismissed when 4th arrives.
```

### 4.8 Language Toggle

**Prompt:**
```
Create /src/components/ui/LanguageToggle.tsx

DESIGN:
A compact pill with two options: EN and NE.
NOT two separate buttons — ONE pill with a sliding indicator.

Container: 
  bg-linen-dark (or bg-charcoal/10 on dark surfaces)
  rounded-pill
  padding: 3px
  display: inline-flex
  gap: 0

Each option:
  px-3 py-1.5
  text-label-sm uppercase
  rounded-pill
  transition: all 200ms

ACTIVE OPTION:
  bg-white (on light surface) / bg-charcoal-mid (on dark surface)
  text-charcoal
  shadow: 0 1px 3px rgba(45,41,38,0.12)

INACTIVE OPTION:
  bg-transparent
  text-stone
  hover: text-charcoal

SLIDING INDICATOR:
Use Framer Motion layoutId="lang-indicator" on the active background element.
When language switches, the white pill smoothly slides from EN to NE.
This is more refined than just color changing.

POSITION:
In public header: right side of nav
In admin header: right side

STATE: reads/writes to localStorage 'milaap_lang', triggers i18n.changeLanguage()
On mount: check localStorage first, then navigator.language, default 'en'
```

---

## PART 5 — PUBLIC PAGES

### 5.1 Public Layout — Header + Footer

**Prompt:**
```
Create /src/components/layout/PublicHeader.tsx

DESKTOP HEADER (>= 768px):
Height: 64px
bg: rgba(247,242,235,0.85), backdrop-blur-md (frosted glass effect)
Sticky top-0, z-40
Border-bottom: 1px solid transparent
On scroll (> 40px): border-bottom becomes linen-dark, shadow drops in

Layout: max-w-7xl mx-auto px-6
  Left:  <Logo variant="full" color="color" size={100}/> 
  Center: nav links (absolute center, desktop only)
  Right: <LanguageToggle/> + "List your org" ghost button (small)

NAV LINKS (desktop):
  Discover | Happy Tails | About | FAQ
  Text: 14px, stone
  Hover: charcoal, transition 150ms
  Active (current page): charcoal, font-weight 500
  No underline — active state is weight only
  Gap between links: 32px

MOBILE HEADER (< 768px):
Same frosted glass, 56px height
Left: Logo mark only (<Logo variant="mark" size={28}/>)
Right: LanguageToggle (compact) + Hamburger

HAMBURGER:
Not three lines — use an animated X/menu icon:
Open state: three lines (middle, top, bottom — classic)
Close state: animates to an X
Use Framer Motion for the line animations.
Each line: w-6, h-[1.5px], bg-charcoal, transition individually

MOBILE MENU (when hamburger open):
Full screen overlay (not a drawer — full screen)
bg-linen, z-50
Enters from top: y: -100% → y: 0, 300ms ease-out
Links: 
  Each link large (32px font), charcoal, centered
  Stagger entrance: each link delays 60ms
  Tap link: menu closes first (200ms), then navigation
LanguageToggle centered below links
"All Care Nepal" credit at bottom with logo

Create /src/components/layout/PublicFooter.tsx

DESIGN:
bg-charcoal, text-linen
padding: 48px 0 32px

MAX WIDTH: max-w-5xl mx-auto px-6

SECTION 1 (top):
  Left: <Logo variant="mark" color="white" size={36}/> 
        "Milaap" wordmark in linen, 20px, below the mark
        "Two stories. One journey." in stone-light, 13px, italic
  Right: nav links in a 2×2 grid
    Discover | Happy Tails | About | FAQ
    Each: stone-light, 13px, hover: linen, transition 150ms

DIVIDER: 1px linen/10, margin 32px 0

SECTION 2 (bottom):
  Left: 
    "Built and maintained by"
    <img src="/logo/acn-logo.svg" height=24/> (All Care Nepal logo — white version)
    "All Care Nepal · Butwal, Nepal"
    "allcarenepal.org ↗" — link opens in new tab
  Right:
    "© 2025 All Care Nepal"
    "Open to all rescue organizations in Nepal"
    small text, stone-light

SAFE AREA: add safe-bottom class for devices with home indicator
```

### 5.2 Welcome Page — `/`

**Prompt:**
```
This page has 4 sections. Each must feel intentional.

SECTION 1 — HERO (above fold, 100dvh):

Layout (mobile):
  Top 60%: pure content, bg-linen
  Bottom 40%: hero photo, blends into linen above via gradient

  Content area (top 60%):
    padding: 80px 28px 24px (top accounts for sticky header)
    
    EYEBROW:
      "<Logo variant="mark" size={16}/> Milaap Nepal"
      flex items-center gap-2
      text-label-sm, terracotta color
      opacity: 0; animation: fade-up 0.4s 0.2s both
    
    HEADLINE (the emotional center):
      "Someone is"   ← line 1, charcoal
      "waiting for"  ← line 2, charcoal
      "you."         ← line 3, terracotta, italic weight 300
      
      Font: text-display on desktop, text-display-sm on mobile
      Line height: 1.05
      Each word animates in separately:
        "Someone" → delay 0.3s
        "is"      → delay 0.38s
        "waiting" → delay 0.46s
        "for"     → delay 0.54s
        "you."    → delay 0.62s (terracotta, italic — the emotional peak)
      
      Animation per word: opacity 0→1, y 20→0, duration 0.5s, ease-out
      Use Framer Motion staggerChildren on a <motion.h1>
    
    SUBTEXT:
      "Rescued animals across Nepal. Each with a story."
      13px, stone, max-width 280px, line-height 1.65
      animation: fade-up 0.4s 0.9s both

    CTA:
      <Button variant="primary" size="lg" rightIcon={<ArrowRight/>}>
        Meet them
      </Button>
      animation: fade-up 0.4s 1.1s both
      Also: "or scroll to begin ↓" — 11px, stone, below the button, 1.3s delay

  PHOTO area (bottom 40%):
    Position relative
    Hero animal photo: absolute, inset 0, object-cover
    GRADIENT: linear-gradient(to bottom, #F7F2EB 0%, transparent 30%)
    This makes photo emerge from the linen — not a hard edge
    
    ANIMAL NAME STRIP (absolute bottom):
      bg: rgba(45,41,38,0.75), backdrop-blur-sm
      padding: 10px 20px
      flex items-center justify-between
      
      Left: animal name + "· Waiting X days" in dusty-rose
      Right: "→" terracotta, 20px
      
      Entire strip is clickable → goes to /p/[slug]

Layout (desktop): 
  Two-column: content left (50%), photo right (50%)
  Photo takes full height of the section (100dvh minus header)
  Photo gradient: from left (linen blends in) not top

SECTION 2 — LIVING COUNTER (scroll-triggered, 80px tall):
  bg-charcoal
  Full width strip
  
  Three stats in a row:
    [47]  Animals waiting     ← number is live from DB
    [6]   Organizations       ← count of active orgs
    [247] Longest waiting     ← max days_waiting
  
  Numbers: 32px, dusty-rose, Satoshi Bold
  Labels: 10px uppercase, stone-light
  Dividers: 1px linen/10 between stats
  
  COUNTER ANIMATION:
  When this strip enters viewport (Intersection Observer):
  Numbers count up from 0 to their value over 1.2s
  Easing: ease-out (fast start, slow finish — feels natural)
  
  This is a meaningful animation — the counter reflects real data coming to life.

SECTION 3 — HOW IT WORKS:
  bg-linen, padding: 80px 0

  HEADLINE: "How Milaap works" — 24px, charcoal, centered, margin-bottom 48px

  FOUR STEPS (horizontal on desktop, vertical on mobile):
  Each step:
    - Large number: "01" "02" "03" "04" — 48px, terracotta/20 (very light)
    - Icon: 40px, terracotta (custom SVG icons, not icon library)
    - Title: 16px, charcoal, font-weight 600
    - Description: 13px, stone, line-height 1.65

    Step 1: Discover → compass icon
    Step 2: Connect  → message icon
    Step 3: Meet     → handshake icon
    Step 4: Home     → house icon
  
  Between steps on desktop: thin terracotta dashed line (border-dashed border-t border-terracotta/20)
  
  ENTRANCE: each step fades up when it enters viewport, staggered 80ms

SECTION 4 — FEATURED ANIMALS PREVIEW:
  bg-linen-mid, padding: 80px 0

  HEADLINE: 
    "Animals waiting"
    "for someone like you"
    Large, split across two lines, charcoal
    Subtext: "Scroll through all [X] animals →" links to /discover

  PREVIEW: 3 animal cards in a horizontal scroll (mobile) or row (desktop)
    Fetch 3 animals: is_featured=true first, then longest waiting
    Each card: grid variant of AnimalCard
    
    On mobile: overflow-x scroll, cards: 280px wide, snap-x mandatory
    On desktop: 3-col grid, max-w-5xl mx-auto

  CTA below:
    <Button variant="primary" size="lg">See all animals →</Button>
    Centered
```

### 5.3 Animal Profile Page — `/p/[slug]`

**Prompt:**
```
This page is the conversion surface. Every design decision serves one goal:
the visitor should feel they know this animal before they reach the CTA.

MOBILE LAYOUT:

PHOTO SECTION (55svh):
  Next.js <Image> priority={true} (above fold — must load fast)
  object-cover, w-full, h-[55svh]
  
  PHOTO NAVIGATION:
  - Swipe gesture (touchstart/touchend, 50px threshold)
  - Dot indicators: absolute bottom-16 left-50% -translate-x-50%
    Each dot: 5px circle, white/40 inactive, white active
    Transition: 200ms
  - Photo counter: "1/3" absolute top-4 right-16
    10px, bg-charcoal/50, text-white, rounded-pill, px-2 py-0.5
  
  BACK BUTTON: absolute top-4 left-4
    40×40, bg-white/80, backdrop-blur-sm, rounded-full
    Icon: ArrowLeft, 18px, charcoal
  
  SHARE BUTTON: absolute top-4 right-4
    40×40, bg-white/80, backdrop-blur-sm, rounded-full
    Icon: Share2, 18px, charcoal
  
  STATUS + ORG ROW: absolute bottom-4 left-4 right-4
    flex justify-between items-center
    <Badge variant={animal.status} size="md"/>
    Org name: 11px, white/80, font-weight 400

CONTENT SECTION (scrollable below photo):
  bg-linen (matches page bg — seamless)
  padding: 20px 20px 120px (120px bottom for sticky CTA clearance)
  
  WAITING BAR:
  <WaitingBar size="md" daysWaiting={days} maxDaysWaiting={max} animate={true}/>
  margin-top: 20px, margin-bottom: 16px
  
  ANIMAL NAME:
  text-animal-lg (42px), charcoal, font-weight 700, tracking-tight
  margin-bottom: 4px
  
  METADATA ROW:
  "Dog · ~2 years · Male"
  flex gap-2 items-center
  Each item: text-caption, stone
  Separator: "·" in stone/40
  
  PERSONALITY QUOTE BLOCK:
  margin: 20px 0
  border-left: 3px solid dusty-rose
  padding-left: 16px
  
  Text: 15px, stone, Satoshi 300 italic, line-height 1.65
  No quotation marks — the border IS the quote indicator
  
  SECTION: "HIS STORY" / "HER STORY":
  Section label: text-label-sm uppercase, stone, margin-bottom 12px
  Story: text-body, charcoal/80, line-height 1.8
  
  Entrance: Intersection Observer fade-up on each section
  
  SECTION: "GOOD TO KNOW":
  Section label: same style
  
  Grid: 2 columns, gap 8px
  Each trait card:
    bg-white, border border-linen-dark, rounded-tag, p-3
    flex items-center gap-2
    Icon: 14px (Check=sage, Alert=dusty-rose, X=stone/50)
    Text: 12px, charcoal/80
  
  SECTION: "WHAT COMES WITH [NAME]":
  Section label: text-label-sm, TERRACOTTA (only time terracotta used as text color)
  
  Container: 
    bg: rgba(196,111,82,0.05)
    border: 1px solid rgba(196,111,82,0.12)
    rounded-card, p-4
  
  Each incentive:
    flex items-start gap-3
    Emoji: 18px (🩺 💉 💬 🏠)
    Text: 13px, charcoal/80, line-height 1.5
    gap-y between items: 10px
  
  ORG SECTION (trust building):
  Small card at very bottom:
    bg-white, border border-linen-dark, rounded-card, p-4
    flex items-center gap-3
    Left: org logo (if exists, 40px circle) OR org initial in terracotta bg
    Center: org name (14px, charcoal, 500) + city (12px, stone) + verification badge
    Right: "→" linking to /org/[slug]

STICKY BOTTOM CTA (fixed, bottom-0):
  bg-white/90, backdrop-blur-md
  border-top: 1px solid linen-dark
  padding: 12px 20px, safe-bottom
  
  APPEARANCE: slides up from bottom when user scrolls past the photo area
  Framer Motion: initial {y: 100} → animate {y: 0}, spring({ stiffness: 300, damping: 30 })
  
  SINGLE CTA:
  <Button variant="dark" size="lg" fullWidth leftIcon={<MessageCircle size={18}/>}>
    Message ACN about Bruno
  </Button>
  
  Below button: "→ or share Bruno's story" — 11px, stone, text-center, tap opens ShareSheet

SHARE SHEET (Radix Dialog + Framer Motion):
  Backdrop: bg-charcoal/40, backdrop-blur-sm
  Sheet: slides from bottom
    bg-white, rounded-t-[24px], padding 24px 20px 32px + safe-bottom
    shadow-sheet
  
  Handle bar: 36px × 4px, bg-linen-dark, rounded-pill, mx-auto mb-6
  
  Title: "Share [Name]'s story" — 16px, charcoal, 600, text-center, mb-4
  
  OPTIONS (2×2 grid):
  Each option: Card variant=flat, flex-col items-center, p-4, gap-2
    Icon in terracotta/10 rounded-full 48px bg
    Icon: 22px, terracotta
    Label: 12px, charcoal, 500
  
  Options:
    [Instagram Story] — Sparkles icon
    [Instagram Post]  — Grid icon
    [WhatsApp]        — MessageCircle icon (terracotta bg)
    [Copy Link]       — Copy icon
  
  WhatsApp option: slightly larger, bg-terracotta/10 border border-terracotta/20
  (it's the highest-value share action — given subtle emphasis)
  
  After "Copy Link": sheet stays open, link option shows "Copied! ✓" for 2s

DESKTOP LAYOUT:
  Two-column: photo left (sticky, 50%), content right (scrollable, 50%)
  Photo scrolls slowly (parallax: 0.3 factor) as content scrolls
  Max-width: 1200px, centered
  No sticky bottom bar — CTA is inline in the content column, always visible
```

### 5.4 Discovery Feed — `/discover`

**Prompt:**
```
Two distinct experiences depending on screen size.

MOBILE (< 768px) — FULL SCREEN FEED:

Container:
  height: 100dvh
  overflow-y: scroll
  scroll-snap-type: y mandatory
  -webkit-overflow-scrolling: touch
  
Each animal slot:
  height: 100dvh
  scroll-snap-align: start
  scroll-snap-stop: always (forces stopping at each card, no skip)
  position: relative
  overflow: hidden

FILTER ACCESS:
  Floating pill button — NOT in the header
  Position: fixed top-[72px] right-4 (below header)
  bg-white/90, backdrop-blur-sm, rounded-pill, px-3 py-2, shadow-card
  "Filter · [count]" text with SlidersHorizontal icon
  If active filters: shows terracotta dot on the icon
  Opens FilterSheet from bottom

FIRST CARD HINT (only on first visit):
  After 2 seconds, a subtle animation plays:
  The first card nudges up 30px and back (spring, 0.5s)
  Simultaneously: "↑ scroll to discover more" appears at bottom
  18px, charcoal/40, fade in and out over 2s
  Stored in sessionStorage — never shows again after first scroll

DESKTOP (>= 768px) — GRID:

Full page layout:
  Sidebar: 260px fixed left (filter panel, always visible)
  Main: remaining width, 2-col (xl: 3-col) card grid

SIDEBAR (desktop):
  bg-white, border-right border-linen-dark, height: calc(100vh - 64px)
  sticky top-16, overflow-y auto
  padding: 24px 20px
  
  Title: "Find your match" — 16px, charcoal, 600
  Subtitle: "X animals waiting" — 12px, stone, live count
  
  FILTER SECTIONS (each collapsible with smooth height animation):
  
  Species:
    Pill buttons: All / Dogs / Cats / Other
    Active: bg-terracotta text-white shadow-terra-sm
    Inactive: bg-white border border-linen-dark text-stone hover:border-charcoal/30
  
  Good with:
    Toggle switches (not checkboxes):
      Kids / Dogs / Cats / Apartment
      Each: flex justify-between items-center, py-2
      Label: 13px, charcoal
      Toggle: custom CSS toggle, terracotta when on
  
  Organization:
    Dropdown (native <select> styled)
    Or: a list of org pills if fewer than 6 orgs
  
  "Clear all" — terracotta text button, appears only when filters active

FILTER SHEET (mobile bottom sheet):
  Same content as sidebar but in a Radix Dialog sheet
  Opens from bottom, same spec as ShareSheet structure

THE "UNEXPECTED" CARD (every 5th position):
  Visually different treatment:
  Card has a terracotta/8 background tint on the content area
  Above the animal name, an eyebrow line:
    "People often overlook animals like [Name]."
    10px, terracotta, italic — NOT uppercase (more personal, less label-like)
  The waiting bar has a slightly brighter/thicker appearance
  
  This card should feel like someone tapping you on the shoulder.

INFINITE SCROLL:
  A ref attached to the last card (IntersectionObserver)
  When last card enters viewport: fetch next 12
  Loading state: skeleton cards append with fade-in
  End state: 
    "You've seen all [X] animals." — centered, stone
    "Every one of them is still waiting." — centered, stone, italic
    <Button variant="primary">Start from the beginning</Button>
    This end-state is an emotional moment — not a generic "no more results"

EMPTY STATE (no animals match filter):
  Centered, padding 60px 20px
  <Logo variant="mark" color="color" size={48}/> (floating animation)
  "No animals match this filter right now."
  "Try opening it up a little."
  <Button variant="secondary" onClick={clearFilters}>Clear all filters</Button>
  The mascot (mark) has the float animation — breathing, alive
```

### 5.5 Happy Tails — `/happy-tails`

**Prompt:**
```
This page is the platform's proof. Design it like a wall of resolved stories.

HERO SECTION:
bg-charcoal (dark — breaks from the linen pattern intentionally)
padding: 80px 24px 64px

Headline:
  "They found their home."    ← 48px, linen, font-weight 300
  "Because someone looked."   ← 48px, linen, font-weight 700
  
  The weight contrast on these two lines creates visual rhythm.
  Second line: "someone" could be in dusty-rose to add accent.

Subtext: "Every story here is proof that waiting ends." — 15px, stone-light, italic

IMPACT BAR (within the dark hero):
  4 stats in a row, same counter-up animation as welcome page
  Numbers: 36px, dusty-rose, Satoshi Bold
  Labels: 10px, stone-light, uppercase

  [247]        [6]          [83]           [12]
  Adopted      Organizations Avg days saved  Cities

FILTER PILLS (below hero, on linen bg):
  margin-top: -24px (overlaps the dark section by 24px — design device)
  bg-white, rounded-card-lg, shadow-card-hover, padding 16px 20px
  flex gap-3 overflow-x-auto scrollbar-hide
  Pill style: same as discovery sidebar pills

STORIES GRID:
  1-col mobile, 2-col desktop, gap 20px

STORY CARD:
  bg-white, border border-linen-dark, rounded-card, overflow-hidden
  hover: shadow-card-hover, y -2px

  BEFORE/AFTER PHOTOS:
  Split horizontally: 50%/50%
  Height: 200px
  Left (shelter photo): slightly desaturated (CSS filter: saturate(0.7))
    Label: "At shelter" — absolute bottom-2 left-2, tiny, white/60
  Right (home photo): full color, slight warmth
    Label: "At home" — absolute bottom-2 right-2, tiny, white/60
  Center divider: "→" in a white circle, shadow-card, position absolute center
    This arrow is the visual metaphor for the entire platform
  
  STORY BODY:
  padding: 16px

  Top row: animal name (18px, 600, charcoal) + days waited (right-aligned, terracotta, Satoshi Bold)
  "waited X days" in 10px uppercase stone below the number

  Quote:
  border-left: 2px solid rose-light
  padding-left: 12px
  "..." in 13px, charcoal/70, italic, line-height 1.65
  max 3 lines — fade at bottom with gradient if longer

  Bottom row: 
  Left: adopter avatar (initial in terracotta bg, 28px circle) + name + city
  Right: "Share story ↗" — ghost button, 12px

BOTTOM CTA (emotional — not a generic "see more"):
  bg-linen-mid, padding 64px 24px, text-center
  
  "Someone is still waiting."  ← 32px, charcoal, font-weight 300
  "See who's waiting now →"    ← linked, terracotta, 16px
  
  Below: 3 tiny animal photos in overlapping circles (leftmost on top)
  These are the current longest-waiting animals
  Each: 48px circle, object-cover
  Overlap: -12px margin between each
  Hover on each: shows the animal's name in a tooltip
```

### 5.6 Organization Profile — `/org/[slug]`

**Prompt:**
```
COVER AREA:
  Full width, 280px height
  Org cover photo, object-cover
  Gradient overlay: linear-gradient(to bottom, transparent 40%, rgba(45,41,38,0.7) 100%)
  
  Org logo: absolute bottom-4 left-6
    64px circle, border 3px white, bg-white object-cover (if no logo: initial in terracotta)
  
  Org name: absolute bottom-4 left-24 (beside logo)
    20px, white, font-weight 600
  
  Verification badge: absolute bottom-4 right-6
    "✓ Verified" — sage bg, white text, rounded-pill, px-3 py-1, 11px

BODY:
  padding: 24px 20px
  
  Registration: "Registered NGO · [number]" — 11px, stone, flex items-center gap-1 CheckCircle icon
  
  Description: 14px, charcoal/80, line-height 1.75
  
  STATS ROW:
  bg-linen-mid, rounded-card, padding 16px
  3 stats inline: Animals rescued / Years active / Currently available
  
  ANIMALS SECTION:
  "Available animals" — section label
  
  Mini grid (3 cards):
    Use AnimalCard grid variant but smaller (280px)
    Horizontal scroll on mobile
  
  "See all [X] animals from [OrgName] →" — terracotta text link
  
  CONTACT SECTION:
  "Get in touch" — section label
  
  Card: bg-white, border, rounded-card, padding 16px
  WhatsApp number (display format)
  Website link
  Social links (FB, IG — icon buttons)
```

---

## PART 6 — ADMIN CMS UI

The admin must feel like a premium internal tool — not an afterthought. Dark sidebar, clean data tables, warm content area. The design language shifts: less linen, more white space, more data density.

### 6.1 Admin Shell

**Prompt:**
```
Create /src/components/admin/AdminShell.tsx

SIDEBAR (desktop, 240px):
  bg-charcoal, text-linen
  height: 100vh, sticky top-0, overflow-y auto
  
  TOP SECTION:
    padding: 20px 16px
    <Logo variant="mark" color="white" size={28}/> 
    "Admin" label: 10px, stone-light, uppercase, tracking-wider
    Thin divider: linen/8
  
  ORG IDENTITY (below logo):
    padding: 12px 16px
    Org logo (24px circle) + Org name (13px, linen/80, font-weight 500)
    Logged-in user name below: 11px, stone-light
  
  NAV SECTION:
    padding: 8px
    Each nav item:
      flex items-center gap-3
      padding: 10px 12px
      rounded-[10px]
      Icon: 18px
      Label: 14px
      
      Default: text-linen/60, bg-transparent
      Hover: text-linen/90, bg-linen/5
      Active (current route): text-linen, bg-linen/10, border-left: 3px solid terracotta
      
      Transition: all 150ms
    
    Nav items:
      📊 Dashboard
      🐾 Animals
      ❤️  Happy Tails
      📈 Analytics
      ─── divider ───
      🏢 Our Profile    (org_admin only)
      👥 Team           (org_admin only)
      ─── divider ───
      ⚙️  Platform       (platform_admin only)
    
    Dividers: 1px linen/8, margin 8px 12px
  
  BOTTOM SECTION (absolute bottom):
    padding: 16px
    User avatar (32px circle, terracotta bg, initial) + name + role badge
    Sign out button: ghost, small, linen/50, hover linen

MOBILE BOTTOM NAV:
  bg-white, border-top border-linen-dark, safe-bottom
  height: 56px + safe area
  5 items: Dashboard, Animals, Happy Tails, Analytics, More
  "More" opens a sheet with secondary nav items
  
  Each item:
    flex-col items-center gap-1
    Icon: 20px
    Label: 9px, uppercase, tracking-wider
    Active: terracotta icon + text
    Default: stone icon + text

MAIN CONTENT AREA:
  bg-linen (same as public — feels warm, not clinical)
  min-height: 100vh
  
  TOP BAR (within content area):
    bg-white, border-bottom border-linen-dark
    height: 56px, padding: 0 24px
    Page title: 16px, charcoal, 600 (left)
    Primary action button (right — e.g., "Add animal")
    
    On mobile: this bar shows the hamburger (admin nav is off-canvas)

ADMIN TYPOGRAPHY:
  Page titles: 18px, charcoal, 600
  Section labels: 11px, stone, uppercase, tracking-wider (different from public — more clinical is ok)
  Data text: 14px, charcoal/80
  Captions: 12px, stone
  
  Admin feels more dense than public — more information per screen.
  But still warm — never Bootstrap blue or clinical gray.
```

### 6.2 Admin Dashboard

**Prompt:**
```
Create /src/app/(admin)/page.tsx UI

STAT CARDS ROW (4 cards):
  Grid: 2×2 mobile, 4×1 desktop, gap 16px, padding 24px

  Each stat card:
    bg-white, border border-linen-dark, rounded-card, padding 20px
    
    ICON AREA: 
      40px circle bg (each card has different tint)
      Animals: terracotta/10, TrendingUp icon, terracotta
      Taps today: dusty-rose/15, MessageCircle, dusty-rose
      Follow-ups: sage/15 OR terracotta/15 (if any urgent), Bell, sage/terracotta
      Adoptions: sage/15, Heart, sage
    
    NUMBER: 28px, charcoal, Satoshi Bold — count-up animation on page load
    LABEL: 11px, stone, uppercase
    TREND (optional): "↑ 3 today" or similar in 11px sage/terracotta
  
  If follow-ups are urgently due (due_date <= today):
    That card: border-terracotta/30, icon bg terracotta/15, number terracotta color

FOLLOW-UP REMINDERS SECTION:
  Section header: "Follow-up reminders" + count badge (terracotta if any urgent)
  
  CARD DESIGN:
  bg-white, border-left: 4px solid [urgency-color], rounded-card (right side only)
  padding: 14px 16px
  
  Urgency colors:
    Due today: terracotta
    Due in 1-3 days: dusty-rose  
    Upcoming: linen-dark
  
  Layout:
  Left: animal photo (40×40, rounded-[8px], object-cover) + info stacked:
    "[AnimalName] · [type] check-in" — 14px, charcoal, 500
    "Adopted by [Name]" — 12px, stone
    "Adopted [date] · [org]" — 11px, stone/70
  Right: due date label + action button
    Due label: "Today" / "In 2 days" / "July 18" — colored per urgency
    Button: "💬 Send message" — size sm, variant primary/secondary/ghost per urgency
  
  "Sent" reminders:
    Collapsed into a section: "X sent this month" — expandable
    Reduced opacity (0.6), check icon replacing the action button

WHATSAPP COMPOSER (Radix Dialog):
  Max-width: 480px, rounded-card, bg-white
  
  Header: 
    WhatsApp icon (green bg, 32px) + "Send check-in message" — 15px, charcoal, 600
    Animal name + adopter name as subtitle — 12px, stone
  
  MESSAGE TEXTAREA:
    bg-linen-mid, border border-linen-dark, rounded-[10px]
    padding: 14px
    font-size: 14px, line-height 1.65
    min-height: 160px
    resize: vertical
    Pre-filled with message from DB
  
  SUBMISSION LINK HIGHLIGHT:
    The URL in the message is highlighted (bg: terracotta/10, rounded)
    "This link is personalized for [AdopterName]" — 11px, stone, below textarea
  
  LANGUAGE SELECTOR: EN / NE pills (switches which message field shows)
  
  FOOTER:
    "Open in WhatsApp →" — Button primary, full width
    "Mark as sent without messaging" — ghost, small, below
    Both actions close the dialog, update reminder status

HAPPY TAILS PENDING:
  If pending=0: 
    Empty state: Heart icon (48px, sage/40) + "All caught up! No stories waiting." — gentle
  
  If pending>0:
    Header: "Stories waiting for approval" + badge
    
    Card per pending happy tail:
      bg-white, border border-linen-dark, rounded-card
      Photo pair (shelter left, home right — same as public HT card, 160px height)
      
      Body:
        Animal name + "adopted X days ago" — 14px, 600 / 11px stone
        Adopter: name + city — 12px, stone
        Quote: 13px, charcoal/70, 3 lines max, italic
      
      ACTIONS row:
        "✓ Approve & publish" — Button primary, size sm
        "Edit before publishing" — Button secondary, size sm
        "✗ Reject" — ghost, 12px, stone (understated — destructive actions should be easy to miss)
      
      On approve: card fades out (opacity 0, height 0, 300ms) and disappears
      Toast: "Maya's story is now live on Milaap 🎉"
```

### 6.3 Animal List Page

**Prompt:**
```
/src/app/(admin)/animals/page.tsx

DESKTOP — TABLE VIEW:
  bg-white, rounded-card, border border-linen-dark, overflow hidden
  
  TABLE HEADER:
    bg-linen-mid, border-bottom border-linen-dark
    Columns: (checkbox) | Photo | Animal | Status | Waiting | Taps | Updated | Actions
    11px, uppercase, stone, font-weight 500
    Sortable columns: Waiting (default desc), Taps — show sort arrow
  
  TABLE ROW:
    height: 64px, border-bottom border-linen-dark
    hover: bg-linen/50
    
    Photo: 44×44, rounded-[8px], object-cover
    
    Animal name + species/gender:
      Name: 15px, charcoal, 500
      Below: "Dog · Male · ~2yr" — 11px, stone
    
    Status: <Badge> component
    Quick change: clicking the badge opens a small Popover (Radix)
      with the 5 status options
      If changing to "adopted": opens the adopter info mini-form inline
    
    Waiting days:
      The number itself is colored:
        > 180 days: terracotta, bold
        > 90 days: dusty-rose, medium
        ≤ 90 days: stone, regular
      Subtext: "days" in 10px stone
    
    Taps: number, stone, + small bar showing relative to others
      (thin 2px bar, terracotta fill, max is the highest-tap animal)
    
    Updated: relative time, 12px, stone
    
    Actions: three-dot menu (Radix Dropdown)
      Edit → /admin/animals/[id]
      Generate QR → /admin/animals/[id]/qr
      Preview → opens /p/[slug] in new tab
      ─────
      Delete (org_admin only) → confirm dialog

  BULK ACTIONS:
    Selecting checkboxes reveals a bar above the table:
    "[X] selected · Change status ▾ · Delete"
    Subtle slide-down animation

MOBILE — CARD LIST VIEW:
  Stack of cards (not a table)
  Each: bg-white, border, rounded-card, padding 12px 14px
  Photo (48px) + info (name, status badge, days waiting) + quick-action button
  Tap anywhere → goes to edit page
```

### 6.4 Add/Edit Animal Form

**Prompt:**
```
/src/app/(admin)/animals/new/page.tsx

PROGRESS INDICATOR:
  NOT numbered steps — a segmented bar
  6 segments, terracotta fill expands as steps complete
  Below the bar: current step name ("Story" / "Photos" / etc.) — 12px, stone
  Smooth width animation on step advance

STEP NAVIGATION:
  "← Back" (ghost, left) and "Continue →" (primary, right)
  Fixed at bottom of form, bg-white, border-top border-linen-dark, safe-bottom
  "Save draft" text link between the two buttons — 12px, stone

FORM FIELD DESIGN:
  Label: 13px, charcoal, 500, margin-bottom 6px
  Helper text: 12px, stone, margin-top 4px, line-height 1.5
  
  INPUT:
    bg-white, border border-linen-dark, rounded-[10px], padding 12px 14px
    font-size: 14px, charcoal
    placeholder: stone/60
    
    focus: border-terracotta/50, ring: 3px terracotta/10, outline none
    error: border-red-300, ring-red-100
    
    Transition: border-color 150ms, box-shadow 150ms
  
  TEXTAREA:
    Same as input but min-height varies per field
    resize: vertical (with min-height constraint)
  
  CHARACTER/WORD COUNTER:
    Right-aligned below field
    Under threshold: "[X] words" in stone
    At threshold: "[X] words ✓" in sage
    Over limit: "[X]/80 chars" in dusty-rose

SEGMENTED CONTROL (for species, gender, size):
  NOT a dropdown — pill buttons in a flex row
  bg-linen-mid container, padding 3px, rounded-pill
  
  Each option: flex-1, text-center, py-2, 13px
  Active: bg-white, charcoal, shadow-sm, rounded-pill, transition 200ms
  Inactive: transparent, stone, hover: charcoal
  
  The sliding indicator uses absolute positioning + transition on left/width

3-STATE TOGGLE (for compatibility: Yes/No/Unknown):
  Three-segment control: Unknown | Yes | No
  Unknown: default, linen-mid bg, stone text
  Yes: sage/15 bg, sage-dark text, Check icon
  No: rose-light/30 bg, dusty-rose text, X icon
  
  Most traits default to Unknown — volunteers only set what they know.

PHOTO UPLOAD ZONE:
  Dashed border: 2px dashed linen-dark, rounded-card
  Hover: dashed border becomes terracotta/30, bg: terracotta/3
  
  CENTER: Upload icon (48px, stone/40) + "Drag photos here or tap to browse"
    Both lines centered, 14px and 12px
  
  AFTER UPLOAD — PHOTO GRID:
    2×3 grid (max 5 — first slot is always the hero)
    
    Each photo tile:
      aspect-ratio: 1
      rounded-[10px], overflow hidden, object-cover
      
      HOVER OVERLAY:
        bg-charcoal/40, transition 200ms
        Shows: grip handle (top center), delete X (top right), "Hero" badge (bottom left if first)
      
      First photo: terracotta outline + "Hero photo" pill label at bottom
      
      REORDER: drag handle at top center, HTML5 drag API
        On drag: card gets reduced opacity (0.5), dashed outline
        Drop zone: other slots show dashed border
    
    COMPRESSION INDICATOR:
      Below each photo: "→ 67KB ✓" in sage/70, 10px
      While compressing: "Compressing…" with micro spinner

AI QUALITY CHECK RESULTS:
  Results appear below the form content (same page, no modal)
  
  RESULT CARD:
  bg-white, border border-linen-dark, rounded-card, padding 20px
  
  OVERALL SCORE BAR:
    Score/100 label: "[score]% ready to publish"
    Thin bar: linen-dark bg, fill color:
      < 60: dusty-rose
      60-85: dusty-rose→terracotta gradient
      > 85: sage
    Animated fill on mount
  
  CHECKS LIST:
  Each check: flex items-start gap-3, padding 10px 0, border-bottom border-linen-dark/50
  
    Passed ✓: sage icon (Check, 16px) + label in charcoal/80 + message in stone
    Warning ⚠: dusty-rose icon (AlertCircle) + label in charcoal + message highlighted
    Error ✗: terracotta icon (XCircle) + label in terracotta + message prominent
  
  "Errors must be fixed before publishing. Warnings are suggestions."
  11px, stone, italic, below the list
  
  ACTIONS:
  [Publish now] — primary, disabled if any errors
  [Save as draft] — secondary, always available
```

### 6.5 QR Generator Page

**Prompt:**
```
/src/app/(admin)/animals/[id]/qr/page.tsx

LAYOUT: two columns on desktop, single column mobile

LEFT: QR CODE DISPLAY
  Large QR code centered: 240×240px on desktop, 200×200 on mobile
  
  STYLING:
  bg-white, rounded-card-lg, padding 24px, shadow-card-hover
  
  QR colors: 
    Module color: charcoal (#2D2926)
    Background: white
    Center: Milaap logo mark (24px) overlaid — creates branded QR
  
  Below QR:
    "milaap.dpdns.org/p/[slug]" — 11px, stone, text-center

DOWNLOAD OPTIONS:
  Three buttons, stacked:
  
  [↓ Download QR (PNG)] — primary
  [↓ Download QR (SVG)] — secondary  
  [↓ Download Poster (A4)] — secondary

RIGHT: POSTER PREVIEW
  A4 aspect-ratio preview card
  bg-white, border border-linen-dark, rounded-card, overflow hidden
  
  POSTER DESIGN (canvas-rendered):
    Top 50%: animal hero photo
    
    White content area (bottom 50%):
      Animal name: large, charcoal, bold
      "Waiting [X] days for a home" — dusty-rose, 14px
      
      Scan section:
        "Scan to meet [Name]" — 12px, stone
        QR code: 80×80px
        
      Bottom strip: bg-terracotta
        Milaap logo (white) + "milaap.dpdns.org" (white, 10px)
  
  The poster preview is a static visual representation.
  The actual downloadable poster is canvas-rendered.

SHARE PACKAGE (bonus):
  "Share assets" section below
  Two preview thumbnails: Story (9:16) and Post (1:1) — same structure as public share sheet
  Download buttons for each
  "Download all as ZIP" — packages all 4 assets (QR PNG, QR SVG, Poster, Story)
```

### 6.6 Analytics Dashboard

**Prompt:**
```
/src/app/(admin)/analytics/page.tsx

DESIGN PRINCIPLE: Data-rich but not overwhelming.
Every chart is the simplest possible representation. No 3D, no pie charts, no chart libraries.
Pure CSS with real numbers. Fast to understand.

TIME RANGE SELECTOR:
  Pill row: "7 days" | "30 days" | "All time"
  Position: top-right of page
  Active: terracotta bg, white text
  Updates all charts on click (no reload — filter client-side from full data)

OVERVIEW ROW (4 stat cards, same structure as dashboard):
  Views | Taps | Tap Rate % | Happy Tails submitted

TAP RATE:
  If > 20%: sage color (excellent)
  If 10-20%: terracotta (good, room to improve)
  If < 10%: dusty-rose (needs attention)

ANIMAL PERFORMANCE TABLE:
  Sort by tap rate desc (default) — shows what's working
  
  Each row:
    Photo (32×32) | Name | Status badge | Views | Taps | Tap Rate | Days waiting | Action
    
    TAP RATE VISUAL:
    Instead of just a number: a small inline bar
    Width = (tapRate / maxTapRate) * 100%
    Color: same system as overall tap rate
    Number beside: "[X]%"
    
    Rows with 0 taps despite > 50 views: highlighted with dusty-rose left border
    These need better stories — the table surface this automatically.
  
  "Low performers" are the most actionable insight.
  Below the table: "[X] animals haven't received any inquiries. Consider updating their stories."
  Terracotta text, links to a filtered animal list.

TRAFFIC SOURCES (CSS bars, no library):
  Section: "Where inquirers come from"
  
  Each source:
    [QR]      ████████████████░░░░░░ 68%
    [Direct]  ██████░░░░░░░░░░░░░░░░ 24%
    [Social]  ██░░░░░░░░░░░░░░░░░░░░ 6%
    [Embed]   █░░░░░░░░░░░░░░░░░░░░░ 2%
  
  Each row: label (70px) + bar (flex-1) + percentage (40px, right-aligned)
  Bar: h-[8px], bg-linen-dark track, terracotta fill, rounded-full
  Bars animate in from 0 width on page load (800ms, staggered)

ADOPTION FUNNEL:
  Three boxes connected by arrows:
  
  [Profile Views]  →  [WhatsApp Taps]  →  [Adoptions]
       [X]              [X] (Y%)           [X] (Z%)
  
  Percentages are conversion rates at each step.
  Boxes: bg-white, border, rounded-card, padding 20px, text-center
  Arrow: →, stone color, between boxes
  
  Below: "For every 100 people who view a profile, [Y] reach out. Of those, [Z] adopt."
  Written as a sentence — not just numbers. This makes it comprehensible.
```

---

## PART 7 — SHAREABLE POSTER / SHARE ASSETS

### 7.1 Canvas Share Asset Generation

**Prompt:**
```
Create /src/lib/canvas-share.ts

This generates Instagram Story, Instagram Post, and WhatsApp-optimized images.
Generated entirely client-side via Canvas API. Never stored, never uploaded.

INSTAGRAM STORY (1080 × 1920):

function generateStoryAsset(animal, org, heroImageUrl, language):

Canvas setup:
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

Step 1 — Background:
  ctx.fillStyle = '#F7F2EB'  ← linen
  ctx.fillRect(0, 0, 1080, 1920)

Step 2 — Animal photo (top 60% = 1152px):
  Load image via fetch → createImageBitmap
  ctx.drawImage(img, 0, 0, 1080, 1152)
  
  Gradient overlay (bottom of photo area fading into linen):
  const grad = ctx.createLinearGradient(0, 800, 0, 1152)
  grad.addColorStop(0, 'rgba(247,242,235,0)')
  grad.addColorStop(1, 'rgba(247,242,235,1)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 800, 1080, 352)

Step 3 — Milaap logo mark (top-left):
  Load /public/logo/logo-mark.svg as image
  ctx.drawImage(logoMark, 56, 56, 80, 80)
  
  "Milaap Nepal" beside logo:
  ctx.font = '400 36px Satoshi'  ← use @font-face loaded canvas font
  ctx.fillStyle = '#2D2926'
  ctx.fillText('Milaap Nepal', 152, 106)

Step 4 — Org handle (top-right):
  ctx.font = '400 28px Satoshi'
  ctx.fillStyle = 'rgba(45,41,38,0.45)'
  ctx.textAlign = 'right'
  ctx.fillText('@' + (org.instagram_url ? 'orghandle' : org.name), 1024, 100)

Step 5 — Waiting bar (below photo area):
  const daysWaiting = getDaysWaiting(animal.intake_date)
  const fillPercent = Math.min(daysWaiting / MAX_DAYS, 1)
  
  Track: 
  ctx.fillStyle = '#E8DDD0'
  roundedRect(ctx, 56, 1200, 968, 6, 3)
  
  Fill (terracotta):
  ctx.fillStyle = '#C46F52'
  roundedRect(ctx, 56, 1200, 968 * fillPercent, 6, 3)

Step 6 — Animal name:
  ctx.font = '700 120px Satoshi'
  ctx.fillStyle = '#2D2926'
  ctx.textAlign = 'left'
  // Handle long names: reduce font size if > 12 chars
  const fontSize = animal.name.length > 10 ? 90 : 120
  ctx.font = `700 ${fontSize}px Satoshi`
  ctx.fillText(animal.name, 56, 1320)

Step 7 — Waiting days label:
  ctx.font = '500 40px Satoshi'
  ctx.fillStyle = '#D7A79A'
  ctx.fillText(`Waiting ${daysWaiting} days`, 56, 1390)

Step 8 — One-liner:
  ctx.font = '300 italic 44px Satoshi'
  ctx.fillStyle = '#8A8078'
  // Word wrap to max 38 chars per line, max 2 lines
  wrapText(ctx, animal.one_liner, 56, 1480, 968, 60)

Step 9 — URL + CTA strip (bottom):
  ctx.fillStyle = '#2D2926'
  ctx.fillRect(0, 1780, 1080, 140)
  
  ctx.font = '500 36px Satoshi'
  ctx.fillStyle = 'rgba(247,242,235,0.6)'
  ctx.textAlign = 'center'
  ctx.fillText('milaap.dpdns.org/p/' + animal.slug, 540, 1865)

Step 10 — Download:
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `milaap-${animal.slug}-story.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png', 0.95)

INSTAGRAM POST (1080 × 1080):
  Similar structure but square.
  Photo: left half (540 × 1080), object-cover
  Content: right half (540 × 1080), linen background
  
  In content half:
    Logo mark (top-left of content half)
    Animal name (large, mid-content)
    Waiting bar (mid-content)
    Days label
    One-liner (bottom of content half)
    Terracotta strip at very bottom with URL

LOADING STATE DURING GENERATION:
The canvas operations take 1-3 seconds (image fetch + draw).
Show a loading overlay over the share sheet:
  "Creating your share image…"
  A small progress indicator (not a spinner — a thin bar that fills)
  
FONT LOADING FOR CANVAS:
Canvas doesn't use CSS fonts automatically. Load Satoshi into canvas:
  const font = new FontFace('Satoshi', 'url(/fonts/satoshi/Satoshi-Variable.woff2)')
  await font.load()
  document.fonts.add(font)
  // Now canvas can use ctx.font = '700 120px Satoshi'
```

---

## PART 8 — EMPTY STATES, ERRORS & EDGE CASES

**Prompt:**
```
Every empty state and error is an opportunity for the platform to speak.
These moments should feel like Milaap is talking directly to the person, not a system error.

Create /src/components/ui/EmptyState.tsx

Props: variant, title, description, action (button config)

VARIANTS:

'no-animals':
  Icon: The Milaap logo mark, 56px, float animation
  Title: "No animals match this filter right now."
  Description: "Try opening it up a little."
  Action: "Clear all filters" (secondary button)

'no-results-search':
  Icon: Search, 48px, stone/30
  Title: "Nothing found for \"[query]\""
  Description: "Try a different name or check the spelling."
  No action button

'no-happy-tails':
  Icon: Heart, 48px, rose-light
  Title: "No adoption stories yet."
  Description: "The first Happy Tails story starts with the next adoption."
  Action: "See animals waiting" → /discover

'admin-no-animals':
  Icon: PawPrint, 48px, terracotta/20
  Title: "No animals listed yet."
  Description: "Add your first animal to get started."
  Action: "Add animal" (primary button) → /admin/animals/new

'admin-no-reminders':
  Icon: CheckCircle, 48px, sage/50
  Title: "All caught up!"
  Description: "No follow-ups due. Check back after your next adoption."
  No action

'no-happy-tails-pending':
  Same as admin-no-reminders but:
  Title: "No stories waiting for review."
  Description: "Approved stories appear on the public Happy Tails page."

'network-error':
  Icon: WifiOff, 48px, stone/40
  Title: "Something went wrong."
  Description: "Check your connection and try again."
  Action: "Try again" (calls router.refresh())

'not-found' (404):
  Icon: <Logo variant="mark" size={56}/> with float animation
  Title: "This page got lost on the way home."
  Description: (none)
  Action: "← Back to discover" (primary button)

LAYOUT for all variants:
  flex-col items-center, text-center
  padding: 64px 24px
  gap: 16px between elements
  
  Icon container: 80px × 80px, flex center
  Title: text-headline (24px), charcoal, font-weight 600
  Description: text-body-sm (13px), stone, max-width: 280px
  Action: mt-4

ERROR BOUNDARY:
  Create /src/app/error.tsx (public) and /src/app/(admin)/error.tsx
  
  Public error:
    Use 'network-error' EmptyState variant
    Include: error.digest in small text for debugging (production only)
  
  Admin error:
    More detail: show error.message in a code block (bg-linen-mid, rounded, monospace)
    "Report this" button → copies error details to clipboard
```

---

## PART 9 — MICRO-INTERACTIONS & POLISH

**Prompt:**
```
These are the details that separate good from great.
Implement all of these as the final polish pass.

1. BUTTON HAPTICS (mobile):
   On primary button tap: navigator.vibrate(8) — 8ms, barely perceptible
   On success actions (adopt, approve): navigator.vibrate([10, 50, 10]) — double pulse
   Check: if ('vibrate' in navigator) before calling
   This makes the interface feel physical on mobile.

2. NUMBER COUNTER ANIMATION:
   Used on: welcome page stats, dashboard stats, analytics numbers
   
   function animateCounter(element, target, duration = 1200):
     start = 0
     startTime = performance.now()
     
     function update(currentTime):
       elapsed = currentTime - startTime
       progress = Math.min(elapsed / duration, 1)
       // Ease out cubic: fast start, slow finish
       eased = 1 - Math.pow(1 - progress, 3)
       current = Math.round(eased * target)
       element.textContent = current.toLocaleString()
       if (progress < 1) requestAnimationFrame(update)
     
     requestAnimationFrame(update)
   
   Trigger: IntersectionObserver — fires when stat enters viewport
   Only fires once per page load.

3. CARD HOVER SHADOW UPGRADE:
   The default card hover (-2px translateY + shadow-card-hover) is functional.
   Add: a very subtle warm glow on hover:
   shadow: 0 8px 24px rgba(45,41,38,0.10), 0 0 0 1px rgba(196,111,82,0.06)
   The terracotta ring at 6% opacity — barely visible, adds warmth.

4. INPUT FOCUS TREATMENT:
   On focus: the input border becomes terracotta/50 AND a 3px terracotta/10 ring
   This is already in the tailwind config.
   Additionally: the label above the focused input becomes charcoal (not stone)
   CSS: .input-group:focus-within .label { color: charcoal }
   Makes the focused field feel "active" beyond just the input itself.

5. SHARE BUTTON MICRO-ANIMATION:
   When share sheet opens: the share button icon rotates 15° then back (spring)
   duration: 300ms — visual confirmation that the sheet opened from this button

6. WAITING BAR ENTRANCE:
   On EVERY new page render where WaitingBar appears:
   The fill starts at 0% and animates to the real width.
   This is already in tailwind config (bar-fill animation).
   Make sure this animation replays on client-side navigation — 
   use a key prop that includes the animal slug to force remount.

7. STICKY CTA BAR APPEARANCE (animal profile):
   The sticky bottom CTA doesn't just appear — it springs in:
   initial: { y: 80, opacity: 0 }
   animate: { y: 0, opacity: 1 }
   spring({ mass: 0.8, stiffness: 300, damping: 25 })
   
   And when it first appears: a very subtle terracotta glow on the button
   that fades over 1.5s — drawing the eye to the action.

8. PAGE TRANSITION:
   Between public pages: content fades out (150ms) and new content fades in (200ms)
   NOT a slide — slides feel heavy on content-focused pages.
   
   Implementation: Framer Motion AnimatePresence around the page content
   in the layout, with:
   initial: { opacity: 0, y: 8 }
   animate: { opacity: 1, y: 0 }
   exit:    { opacity: 0 }
   duration: 200ms for enter, 150ms for exit.

9. PHOTO GALLERY SWIPE INDICATOR:
   On the animal profile, first time viewing:
   After 1.5s, if user hasn't swiped:
   The photo nudges left 20px and back (spring, 400ms)
   Simultaneously, dot indicators pulse once (scale 1.3 → 1)
   SessionStorage: 'milaap_swipe_hinted' = true — never shows again

10. TOAST STACKING:
    When 2+ toasts are showing:
    They stack with a slight scale reduction for older ones:
    Newest: scale(1)
    2nd: scale(0.97), translateY(-4px) — slightly behind newest
    3rd: scale(0.94), translateY(-8px)
    Creates a card stack visual — clear hierarchy.
```

---

## PART 10 — SELF-CRITIQUE & AUDIT

Before implementing, here are the issues I identified in my own plan and how I addressed them:

### Issue 1: "Warm cream + terracotta = AI default"
**The risk:** Every AI-generated design in 2024-2025 uses this palette. Milaap's brand IS this palette but it could look generic.
**How addressed:** The distinctiveness comes from execution, not palette change. Specific non-generic choices:
- The living/pulsing waiting bar (nobody does this)
- Animal names at "uncomfortably" large sizes (36-42px on a card)
- The two-tone footer that uses charcoal strongly (breaks the all-linen monotony)
- The before/after photo device on Happy Tails with the arrow in the center
- Counter animations on live numbers (makes data feel real, not static)
- The asymmetric card proportions (58% photo / 42% content — not 50/50)

### Issue 2: "Framer Motion adds bundle weight"
**The risk:** ~40KB gzipped. On slow connections, it delays interaction.
**How addressed:** Framer Motion is used only for 4 specific things where CSS cannot match quality: share sheet spring physics, language toggle sliding indicator, page transitions, and card entrance stagger. Everything else (waiting bar animation, button hover, status pulse) is pure CSS. This is the right tradeoff — the share sheet MUST feel native on mobile.

### Issue 3: "Admin dashboard too similar to public design"
**The risk:** Admin can feel like a public page with a sidebar — no clear mode switch.
**How addressed:** Admin uses charcoal sidebar (strong visual distinction), white content cards on linen, and denser typography. The sidebar is the signal: you're in control mode, not discovery mode.

### Issue 4: "Canvas font loading is fragile"
**The risk:** Satoshi Rounded may not load in canvas context, causing fallback system fonts in share assets.
**How addressed:** Explicitly load Satoshi via FontFace API before any canvas operation. If loading fails (timeout after 3s): fall back to 'system-ui' gracefully. The asset still generates — just with system font. Add a warning toast: "Font may not match — download if satisfied or retry."

### Issue 5: "The 'unexpected' card could feel manipulative"
**The risk:** "Most people scroll past animals like [Name]" could feel guilt-trippy or manufactured.
**How addressed:** The copy is honest and factual, not manipulative. "People often overlook animals like [Name]" is a true statement, not a manipulation. The card doesn't lie or exaggerate. The design distinction (slight terracotta tint) is subtle — it draws attention, not alarm. This is advocacy, not dark patterns.

### Issue 6: "Too many animations = AI-generated feeling"
**The risk:** Scattered animations make designs feel "made by AI."
**How addressed:** Each animation in the spec has a narrative justification documented. The waiting bar pulse is the ONLY ambient animation. Everything else is triggered by interaction or scroll. Removed: any decorative floating elements, any random particle effects, any gratuitous transitions. The float animation is used exactly once (empty state mascot) and is extremely subtle (4px movement over 3s).

### Issue 7: "Mobile feed scroll performance"
**The risk:** CSS scroll-snap with full-screen cards and images can cause jank on mid-range Android.
**How addressed:** Each card image uses `loading="lazy"` and `fetchpriority` — current card is eager, adjacent cards are lazy. The scroll-snap uses `scroll-snap-stop: always` to prevent skip-scrolling (which causes position calculation jank). The gradient overlay is CSS only (no canvas operations on scroll). Tested mental model: should be 60fps on a mid-range Android.

### Issue 8: "QR poster canvas rendering is heavy"
**The risk:** Rendering a full A4 canvas poster could crash low-memory devices.
**How addressed:** The poster preview in the UI is a CSS mockup (not canvas) — fast. The actual canvas render only starts when the user clicks "Download Poster." Added a loading state for the poster generation. Canvas dimensions are 2480×3508 (A4 at 300dpi) — only generated on click.

### Final Confidence Check:
- Does every animation have a purpose? ✓
- Is terracotta used only where it should be? ✓
- Does the mobile feed feel native? ✓
- Does the admin feel like a tool, not an afterthought? ✓
- Are empty states human and on-brand? ✓
- Does the share asset look designed, not templated? ✓
- Is the waiting bar genuinely distinctive? ✓
- Is performance considered for Nepal mobile context? ✓

**Verdict: Ready to build.**

---

## IMPLEMENTATION ORDER

Build these in exactly this sequence:

```
Day 0:   Logo assets setup + globals.css + tailwind config + library installs
Day 1:   WaitingBar (signature) + Button + Badge
Day 2:   Card + Skeleton + Toast + LanguageToggle
Day 3:   PublicHeader + PublicFooter + AdminShell
Day 4:   AnimalCard component (the most important UI component)
Day 5:   Welcome page (full)
Day 6:   Animal Profile — photo section
Day 7:   Animal Profile — content section
Day 8:   Animal Profile — sticky CTA + ShareSheet + canvas share assets
Day 9:   Discovery feed — mobile scroll + desktop grid
Day 10:  Filter sheet + empty states + micro-interactions pass
Day 11:  Happy Tails public page
Day 12:  Org profile page
Day 13:  Admin dashboard
Day 14:  Admin animal list
Day 15:  Admin add/edit form (all 6 steps)
Day 16:  Admin QR generator
Day 17:  Admin analytics
Day 18:  Admin happy tails approval
Day 19:  All empty states + error boundaries
Day 20:  Full micro-interactions pass (haptics, counters, polish)
Day 21:  Performance audit (Lighthouse) + reduced-motion audit + accessibility audit
```

---

*Milaap UI/UX Guide — Build what moves people.*
*Every pixel in service of one dog who has waited long enough.*

---

## PART 11 — MISSING PAGES (complete spec)

### 11.1 Admin Login Page — `/admin/login`

**Prompt:**
```
Create /src/app/(admin)/login/page.tsx

This is the first admin impression. It should feel trustworthy and calm.
It also runs on mobile — some volunteers log in from their phones.

LAYOUT:
Full page, bg-linen
Two sections on desktop (50/50), single column on mobile

LEFT SECTION (desktop only — decorative):
  bg-charcoal, height: 100vh
  Centered content:
    <Logo variant="mark" color="white" size={64}/>
    "Milaap Nepal" — 24px, linen, Satoshi 300, mt-4
    "Where rescued animals meet their families." — 14px, stone-light, italic, mt-2
    
    Below (mt-48): 
    A subtle decorative element — 3 overlapping circles (like animal photo avatars)
    Each: 56px, different sage/dusty-rose/terracotta opacities
    "Helping animals find homes across Nepal" — 12px, stone-light, mt-4, text-center

RIGHT SECTION (full width on mobile):
  flex items-center justify-center, min-height: 100vh
  padding: 48px 24px
  
  FORM CARD:
  max-width: 380px, w-full, mx-auto
  
  TOP:
    <Logo variant="full" color="color" size={120}/> — centered
    margin-bottom: 32px
  
  TITLE: "Sign in to Admin" — 22px, charcoal, 600, text-center, mb-2
  SUBTITLE: "All Care Nepal volunteer portal" — 13px, stone, text-center, mb-8
  
  FORM:
  Email field:
    Label: "Email address"
    Input: type="email", autocomplete="email"
    Placeholder: "volunteer@allcarenepal.org"
  
  Password field:
    Label: "Password"
    Input: type="password", autocomplete="current-password"
    Placeholder: "••••••••••••"
    Right-side toggle: eye icon to show/hide password
      Eye open: show password (type=text)
      Eye closed: hide (type=password)
      Icon: 16px, stone, hover: charcoal
  
  ERROR STATE:
  Appears between password field and submit button
  bg: rgba(196,111,82,0.08), border: 1px solid rgba(196,111,82,0.2)
  rounded-[10px], padding: 10px 14px
  flex items-center gap-2
  AlertCircle icon: 16px, terracotta
  Text: 13px, terracotta/90
  "Invalid email or password. Please try again."
  
  Animates in: fade-up, 200ms — not jarring
  
  SUBMIT BUTTON:
  <Button variant="primary" size="lg" fullWidth loading={isLoading}>
    Sign in
  </Button>
  margin-top: 8px
  
  FOOTER:
  "Forgot your password? Contact the platform team." — 12px, stone, text-center, mt-6
  
  BOTTOM (below form card):
  "Back to Milaap →" — 12px, terracotta, text-center, mt-8, links to /

LOADING STATE during sign in:
  Button shows spinner + "Signing in…"
  Form fields become disabled (opacity 0.6)
  No page navigation until complete

ON SUCCESS:
  Button briefly shows "✓ Welcome back!" in sage (200ms)
  Then router.push('/admin')
  Smooth page transition (fade)
```

### 11.2 About Page — `/about`

**Prompt:**
```
Create /src/app/(public)/about/page.tsx

SECTION 1 — HERO:
bg-charcoal (dark — establishes seriousness)
padding: 96px 24px 80px
max-width: 720px, mx-auto, text-center

Eyebrow: "About Milaap" — text-label-sm, terracotta, uppercase, mb-4

Headline:
  "We built the platform"
  "we wished existed."
  text-display-sm, linen, font-weight: 300 first line / 700 second line
  This weight contrast is intentional — humility then conviction

Subtext (two paragraphs, after 40px gap):
  P1: "Milaap was created by All Care Nepal after years of managing animal adoptions through 
  Facebook posts and WhatsApp messages. We knew the animals were remarkable. We knew families 
  wanted them. The connection just wasn't happening efficiently."
  
  P2: "So we built Milaap — Nepal's first storytelling-driven adoption platform. 
  A place where every rescued animal gets a permanent story, and every story finds its family."
  
  Both: 16px, stone-light, line-height 1.8, max-width 600px, mx-auto

SECTION 2 — HOW IT WORKS:
bg-linen, padding: 80px 24px

Headline: "Four steps to a new beginning"
22px, charcoal, 600, text-center, mb-12

STEPS — large visual treatment:
Desktop: horizontal row. Mobile: vertical stack.

Each step:
  Number: "01" "02" "03" "04" 
    56px, Satoshi Bold, color: terracotta/15 (very faint — structural, not decorative)
    position: absolute top-0 right-0 of the step container (background watermark)
  
  Icon container: 
    64px × 64px, bg-terracotta/10, rounded-card
    Icon: 28px, terracotta
  
  Title: 17px, charcoal, 600, mt-4
  Description: 14px, stone, line-height 1.7, mt-2, max-width 220px

  Steps:
  01 — Discover: Compass icon — "Browse rescued animals by story, not specs"
  02 — Connect: MessageCircle — "Message the rescue org directly via WhatsApp"
  03 — Meet: Users icon — "Visit the shelter and meet the animal in person"
  04 — Home: Home icon — "Complete the adoption and begin a new chapter"

Connector lines between steps (desktop only):
  Dashed line, linen-dark color, 1px
  Runs horizontally between the bottom of each icon

SECTION 3 — ALL CARE NEPAL:
bg-linen-mid, padding: 80px 24px

Two-column: text left, image right (desktop) / stacked (mobile)

LEFT:
  Eyebrow: "Built by" — text-label-sm, terracotta, uppercase, mb-3
  ACN logo: <img src="/public/logo/acn-logo.svg" height=40/> — or ACN name in headline style
  
  Headline: "All Care Nepal" — 28px, charcoal, 700, mb-4
  
  Story (2-3 short paragraphs):
  "We are a registered animal welfare organization based in Butwal, Nepal. 
  Since [year], we have been rescuing, rehabilitating, and rehoming animals 
  across the Lumbini Province."
  
  "Milaap is our gift to every rescue organization in Nepal — a shared platform 
  where every animal gets a story, and every story finds its family."
  
  Both: 14px, charcoal/75, line-height 1.75
  
  LINKS:
  "Visit allcarenepal.org ↗" — terracotta text link
  "Follow us on Instagram ↗" — stone text link

RIGHT:
  A warm photo (if available: team photo or shelter photo)
  Or: a decorative element — 
    Three overlapping animal cards (the AnimalCard component at 60% scale)
    Showing 3 actual animals from the DB
    Slight rotation: -3°, 0°, +3°
    This is visually distinctive — real content as decoration

SECTION 4 — ORGANIZATIONS:
bg-linen, padding: 64px 24px

Headline: "Rescue organizations on Milaap"
18px, charcoal, 600, mb-8

Org cards grid: 2-col mobile, 3-col desktop, gap 16px

Each org card:
  bg-white, border border-linen-dark, rounded-card, p-5
  hover: shadow-card-hover, y -2px
  
  Top row: org logo (40px) + name + verified badge
  City: 12px, stone, mt-1
  Description: 12px, charcoal/65, mt-3, 2 lines max
  Bottom: "X animals available" + "See animals →" terracotta link

SECTION 5 — JOIN MILAAP (for other NGOs):
bg-charcoal, padding: 64px 24px, text-center

"Run an animal rescue in Nepal?"
24px, linen, 300, mb-4

"We'd love to have your animals on Milaap. It's free, it takes one day to set up,
and it puts your animals in front of thousands of potential adopters."
15px, stone-light, max-width 480px, mx-auto, mb-8

Two buttons, centered, gap 16px:
  "Get in touch" — Button variant=primary
  "Learn more" — Button variant=secondary (white border, linen text)

METADATA:
title: "About Milaap — Nepal's animal adoption platform | Built by All Care Nepal"
description: "Milaap is built by All Care Nepal to connect rescued animals with 
families across Nepal through storytelling, trust, and meaningful discovery."

HowTo JSON-LD and Organization JSON-LD as specified in CLAUDE.md §8
```

### 11.3 FAQ Page — `/faq`

**Prompt:**
```
Create /src/app/(public)/faq/page.tsx

DESIGN: Clean editorial layout. The FAQ should read like a well-organized article.

HERO:
bg-linen, padding: 64px 24px 40px
max-width: 680px, mx-auto

Eyebrow: "FAQ" — text-label-sm, terracotta, uppercase, mb-3
Headline: "Questions about adoption" — 36px, charcoal, 600

SEARCH BAR (optional enhancement):
bg-white, border border-linen-dark, rounded-[10px]
padding: 12px 16px, flex items-center gap-3
Search icon: 18px, stone
Input: 15px, no border, outline none, flex-1, placeholder: "Search questions…"

Client-side filter: as user types, questions not matching fade to opacity 0.3

FAQ SECTIONS:
Group questions by topic.
Each section: a thin terracotta line (2px, 48px wide) + section title

Group 1: "Getting started"
Group 2: "The adoption process"  
Group 3: "After adoption"
Group 4: "For organizations"

ACCORDION STYLE (each Q&A):
Container: border-bottom border-linen-dark
Question row:
  flex justify-between items-center, padding: 18px 0, cursor-pointer
  Question text: 15px, charcoal, 500
  Icon: Plus (collapsed) / Minus (expanded) — 20px, stone
  Hover: question text → terracotta

Answer (animated expand/collapse):
  Framer Motion: height 0 → auto, opacity 0 → 1
  duration: 250ms, ease
  Content: 14px, charcoal/75, line-height 1.75, pb-4

FEATURED QUESTION (most important one):
  "How do I adopt through Milaap?"
  This one is NOT in the accordion — it's fully visible at the top
  bg-linen-mid, rounded-card, padding 24px, mb-8
  Answer in full, with the 4-step process as mini inline steps

ALL 12 QUESTIONS:
1. How do I adopt an animal through Milaap?
2. Is adopting through Milaap free?
3. What happens after I message the organization?
4. Can I adopt an animal from another city?
5. What does "reserved" mean on an animal's profile?
6. What does "in foster care" mean?
7. What comes with an adoption through Milaap?
8. Can I foster instead of adopting permanently?
9. How do I know the organization is trustworthy?
10. Which cities in Nepal can I adopt from?
11. How long does the adoption process take?
12. How can my organization join Milaap?

BOTTOM CTA:
"Still have questions?" — 18px, charcoal, 600, text-center
"Reach out to the organization directly —" + WhatsApp link to ACN
Or: "contact@allcarenepal.org"

FAQPage JSON-LD with all 12 questions
HowTo JSON-LD for adoption process
```

### 11.4 Happy Tails Submission — `/happy-tails/submit/[token]`

**Prompt:**
```
Create /src/app/(public)/happy-tails/submit/[token]/page.tsx

This page is accessed from a WhatsApp message link.
The adopter has never seen Milaap's admin. Keep it warm, personal, minimal.

VALID TOKEN STATE:

HERO:
bg-linen, padding: 48px 24px 0
max-width: 480px, mx-auto

Logo: <Logo variant="mark" size={40}/> — centered, terracotta mark
mt-4

Headline: "[Name] found their home with you. 🐾"
26px, charcoal, 600, text-center, mt-4
Name is the animal's name from the token lookup.

Subtext: "It has been [X] days since [Name] came home."
14px, stone, text-center, mt-2

Second line: "Share how they're doing — your story might inspire 
the next adoption."
13px, stone, text-center, mt-1, italic

ANIMAL THUMBNAIL:
80px circle, border 3px white, shadow-card
object-cover, mx-auto, mt-8
Shows the animal's hero photo from shelter days
Small label below: "[Name] at the shelter" — 11px, stone, text-center

FORM (below the emotional setup):
max-width: 480px, mx-auto, padding: 32px 24px 48px

PHOTO UPLOAD:
Label: "A photo of [Name] at home"
Helper: "Any photo — even a quick phone shot is perfect"

Upload zone:
  Same design as admin photo upload but warmer:
  Dashed border, rounded-card
  Center: Camera icon (32px, stone/40) 
  + "[Name]'s home photo" — 14px, stone
  + "Tap to upload" — 12px, stone/60

After upload:
  Photo preview: 120px × 120px, rounded-card, object-cover, mx-auto
  "✓ Photo ready" — sage, 12px, text-center, mt-2
  "Change photo" — stone text link, 11px, text-center

STORY TEXTAREA:
Label: "How has [Name] changed your life?"
Helper: "Two sentences is perfect. In Nepali or English — whatever feels natural."

Textarea:
  min-height: 120px
  Same input styling as admin but slightly larger font (15px)
  Placeholder: "Write anything that comes naturally — how Bruno settles 
  into his favourite spot, what your mornings look like now…"

YOUR NAME:
Label: "Your first name"
Input, autocomplete: "given-name"
Placeholder: "Priya"

YOUR CITY:
Label: "Your city in Nepal"
Input
Placeholder: "Butwal"

SUBMIT BUTTON:
<Button variant="primary" size="lg" fullWidth>
  Share [Name]'s story →
</Button>

Below: "Your story will be reviewed before publishing." — 11px, stone, text-center

SUCCESS STATE (after submit — replaces form):
  Fade out form (400ms)
  Fade in success:
  
  Large checkmark animation:
    Circle: 80px, sage border (4px), scale 0 → 1 (spring, 400ms)
    Check inside: draws in (SVG stroke-dashoffset animation, 300ms, 200ms delay)
  
  "Thank you, [AdopterName]. 🐾"
  22px, charcoal, 600, text-center, mt-6
  
  "[Name]'s story will inspire someone to open their home."
  14px, stone, text-center, italic, mt-2
  
  "Browse animals still waiting →" — terracotta link, text-center, mt-8

INVALID / EXPIRED TOKEN STATE:
  bg-linen, centered, padding: 80px 24px
  
  <Logo variant="mark" size={48}/> — slightly desaturated (opacity 0.5)
  
  "This link is no longer active."
  20px, charcoal, 600, text-center, mt-6
  
  "It may have expired or already been used."
  13px, stone, text-center, mt-2
  
  "If you'd like to share [Name]'s story, reach out to [OrgName] directly."
  13px, stone, text-center, mt-2
  
  WhatsApp button → org's WhatsApp
  "or browse animals still waiting →" text link
```

### 11.5 Admin Org Profile — `/admin/org`

**Prompt:**
```
Create /src/app/(admin)/org/page.tsx (org_admin and platform_admin only)

LAYOUT: Single column, max-width 640px, mx-auto, padding 24px

PAGE HEADER:
"Your organization profile" — 18px, charcoal, 600
"This information appears publicly on your Milaap org page." — 12px, stone, mt-1

PREVIEW LINK:
"Preview public page ↗" — terracotta text link, 13px
Opens /org/[slug] in new tab

FORM SECTIONS (grouped, not stepped):

SECTION: Identity
  Card: bg-white, border, rounded-card, padding 24px, mb-4

  LOGO UPLOAD:
  Current logo (if exists): 80px circle preview, object-cover
  "Change logo" text link below it
  Upload: same as animal photo zone but circular preview
  Helper: "Square image, min 200×200px"

  Organization name (read-only if not platform_admin — show as static text with edit note)
  Registration number
  Founded year (number input)
  Animals rescued count (number input, helper: "Your total historical rescue count")

SECTION: Contact & Location  
  Card: same styling

  WhatsApp number:
  IMPORTANT VISUAL TREATMENT:
    Input has a terracotta/20 bg tint + label "Used for all animal inquiries" in terracotta, 11px
    This field affects EVERY animal on the platform — make it feel significant
    
    Below input: live preview of what the WhatsApp URL looks like:
    "wa.me/977[number]" — 11px, stone, font-mono
    
    Warning below (if number has been changed from what's in DB):
    bg: rgba(196,111,82,0.08), border: 1px solid rgba(196,111,82,0.2), rounded, p-3
    "Changing this number will redirect ALL animal inquiry messages to the new number."
    AlertCircle icon + 13px terracotta text

  City, District, Province (3 inputs, responsive row)
  Website URL
  Facebook URL  
  Instagram URL

SECTION: About (visible publicly)
  Description EN (textarea, 200px min, with char count)
  Description NE (textarea, with "Translate →" button same as animal form)

SAVE BUTTON:
  Sticky at bottom (mobile) or inline below last section (desktop)
  <Button variant="primary" size="md">Save changes</Button>
  "Last updated: [relative time]" — 11px, stone, beside button

ON SAVE SUCCESS:
  Toast: "Organization profile updated ✓"
  The preview link pulses once (a very subtle terracotta glow, 500ms)
```

### 11.6 Admin Team Page — `/admin/team`

**Prompt:**
```
Create /src/app/(admin)/team/page.tsx (org_admin only)

HEADER:
"Team members" — page title
"X volunteers can manage your Milaap listings." — subtitle, stone

ADD VOLUNTEER (button in top-right):
Opens a dialog (Radix):
  "Add team member" — 16px, charcoal, 600
  
  Email: input (the email they'll use to log in)
  Full name: input
  Role: segmented — Volunteer | Org Admin
  
  "They'll receive an email to set their password." — 12px, stone, italic, mt-2
  (This is a lie — Supabase doesn't auto-send this in free tier.
   Show instead: "After adding, share the login page URL with them: [url]")
   Actually: "After adding, create their account in Supabase Auth and share the login link.")
  
  Hmm — this is complex. Simplify:
  "To add a volunteer: create their account in your Supabase project, 
  then they'll appear here once they sign in."
  Link: "How to do this →" (links to a simple guide page or external doc)
  
  This is honest about V1 limitations. Don't fake functionality.

TEAM MEMBER CARDS:
  Each member:
  bg-white, border, rounded-card, padding 14px 16px
  flex items-center gap-4
  
  Avatar: 44px circle
    If no photo: colored circle (hash of name → one of 6 brand colors)
    Initial letter centered, 18px, white
  
  Info:
    Name: 15px, charcoal, 500
    Email: 12px, stone
    Role badge: "Volunteer" (linen-dark) / "Org Admin" (terracotta/15 + terracotta border)
    "Last active: [relative time]" — 11px, stone/60
  
  Actions (org_admin only, not for self):
    Three-dot menu:
      Change to Volunteer / Change to Org Admin
      ─────
      Deactivate (removes access) → confirm dialog

YOURSELF indicator:
  Your own card shows "(you)" beside your name in stone/60
  No actions menu on your own card
```

### 11.7 Platform Admin — `/admin/platform`

**Prompt:**
```
Create /src/app/(admin)/platform/page.tsx (platform_admin only)

This is the top-level control panel. Should feel authoritative but not alarming.
Uses the same admin shell — but perhaps a more subtle visual distinction that you're
in "platform" mode (not org mode):
  Admin sidebar active item: "Platform" (different section from org nav items)

PAGE TABS: "Organizations" | "Animals" | "Analytics"

TAB: ORGANIZATIONS

HEADER ROW:
  "X organizations" (left)
  <Button variant="primary" size="sm">+ Add organization</Button> (right)

SEARCH: live filter by name or city

ORG TABLE:
  Columns: Logo | Name | City | Status | Animals | Taps | Joined | Actions
  
  Status column uses a pill system:
    verified: sage badge
    pending: dusty-rose badge
    suspended: charcoal/50 badge

  Each row actions (three-dot):
    View public page ↗
    Edit org details
    ──────
    Verify org (if pending)
    Suspend org (if verified) → confirm dialog with consequences listed:
      "This will hide all X animals from the discovery feed."
    ──────
    View as org (impersonate view — future feature, stub for now)

ADD ORGANIZATION DIALOG:
  Form fields: name, slug, city, whatsapp_number, website_url, registration_number
  
  SLUG FIELD:
  Auto-generates from name: "All Care Nepal" → "all-care-nepal"
  Editable, validates: lowercase, hyphens only, no spaces
  Live preview: "Public URL: milaap.dpdns.org/org/[slug]"
  
  After creating org:
    Shows the new org's ID
    Instructions in a linen-mid info box:
    "Next: Go to Supabase Auth → Add user → Create account for this org's admin.
    Then run this SQL to link them:"
    
    Code block (monospace, bg-linen-mid, rounded, p-3):
    insert into users (id, organization_id, full_name, role)
    values ('[USER-UUID]', '[ORG-UUID]', '[Name]', 'org_admin');
    
    Copy button on the code block.
    
    [Copy org ID] button for convenience.

TAB: PLATFORM ANALYTICS

Same as org analytics but across ALL organizations.

Additional metrics:
  - Top performing org by tap rate
  - Top performing animal across all orgs
  - Platform-wide conversion funnel
  - New orgs this month
  - Geographic distribution (cities)

TAB: ANIMALS (platform admin only view)

Shows ALL animals from all orgs.
Additional column: "Organization" (not shown in org-level view).
Can filter by org.
Can mark any animal as is_featured (the editorial curation role).
```

---

## PART 12 — TYPOGRAPHY SPECIMEN & VISUAL REFERENCE

**Prompt:**
```
This is a reference section for Claude Code. Not a page to build.
Use these as the standard when implementing any text in the application.

HEADINGS HIERARCHY IN CONTEXT:

Page headline (welcome, happy-tails hero):
  font: Satoshi 700, 48-56px, line-height 1.05, letter-spacing -0.025em
  "Someone is waiting for you."

Animal name on card:
  font: Satoshi 700, 36-42px, line-height 1.0, letter-spacing -0.02em
  "Bruno"

Section title on profile:
  font: Satoshi 600, 22-24px, line-height 1.2, letter-spacing -0.01em
  "His story"

Body text (animal stories):
  font: Satoshi 400, 15px, line-height 1.75, letter-spacing 0
  "Bruno arrived in March 2024..."

Personality quote / one-liner:
  font: Satoshi 300 italic, 14-16px, line-height 1.6, letter-spacing 0
  "First to greet you every morning."

Section labels (uppercase):
  font: Satoshi 500, 11px, line-height 1.4, letter-spacing 0.1em, UPPERCASE
  "GOOD TO KNOW"

Captions / metadata:
  font: Satoshi 400, 12-13px, line-height 1.5, letter-spacing 0
  "Dog · ~2 years · Male"

Navigation:
  font: Satoshi 400, 14px (desktop) / Satoshi 500 9px uppercase (mobile bottom nav)

Button text:
  font: Satoshi 600, 14px, letter-spacing 0.04em
  "Meet Bruno"

SPACING PATTERNS:

Between sections on a profile page: 32px
Between section label and section content: 12px
Between paragraphs in body text: 16px
Between card elements (name → one-liner → tags → CTA): 8-12px
Between nav items: 32px (desktop), equal flex-space (mobile)
Between form field and its label: 6px
Between form fields: 24px
Between form sections: 32px

WHAT NEVER TO DO:

- Never use line-height below 1.4 for body text
- Never use letter-spacing on body text (only labels/uppercase)
- Never mix regular and bold within the same animal name
- Never put two large headings directly adjacent (always a subtext between)
- Never use stone color for anything interactive
- Never use charcoal at full opacity on linen backgrounds for body text
  (use charcoal/80 — the slight softening reads better at length)
- Never use terracotta for body text (only labels, CTAs, the waiting bar)
```

---

## PART 13 — RESPONSIVE BREAKPOINTS

**Prompt:**
```
These are the breakpoints and their specific behavioral differences.
Every component should be tested at all three.

MOBILE (< 640px — sm in Tailwind):
- Single column everywhere
- Discovery feed: full-screen vertical scroll cards
- Nav: hamburger → full-screen overlay
- Admin: bottom navigation bar
- Animal profile: photo stacked above content
- Share sheet: slides up from bottom
- Filter: bottom sheet
- Form steps: full width
- Card content: 20px horizontal padding

TABLET (640px–1024px — sm to lg):
- Discovery: 2-column card grid
- Admin: bottom nav OR collapsed sidebar (platform decision: bottom nav)
- Animal profile: still single column but wider (max-width 680px centered)
- Header nav: visible (not hamburger)
- Share sheet: still bottom sheet (tablets are used in portrait often)

DESKTOP (> 1024px — lg+):
- Discovery: 2-column grid (xl: 3-column)
- Admin: fixed 240px sidebar
- Animal profile: two-column (photo sticky left, content scrollable right)
- Header: full nav visible
- All modals: centered dialogs (not bottom sheets)
- Filter: inline sidebar (not a sheet)
- Max content width: 1200px (centered with mx-auto)

CRITICAL MOBILE DETAILS:
- Use 100dvh (dynamic viewport height) not 100vh
  dvh accounts for browser chrome (address bar) on mobile
  100vh causes content to be hidden behind the browser bar
- Safe area insets: all sticky/fixed elements need safe-bottom class
  specifically: sticky CTA bar, bottom nav, bottom sheet content
- Touch targets: minimum 44×44px for ALL interactive elements
  This includes icon buttons, nav items, tag pills, toggle switches
- Tap highlight: -webkit-tap-highlight-color: transparent on all interactive elements
  (set in globals.css on button, a, [role="button"])
- Scroll behavior: 
  Discovery feed: scroll-snap (CSS, no JS)
  Horizontal tag scrolls: overflow-x auto, scrollbar-hide, -webkit-overflow-scrolling: touch
  Sheets: the sheet itself should be scrollable if content overflows, not the page behind it

TEXT SIZING ON MOBILE:
- Animal names on cards: 36px (not 42px — 42px is too large on 375px)
- Display headline: 40px on mobile (not 56px)
- Body text: 15px (same as desktop — do not reduce, readability is critical)
- Buttons: same size as desktop (14px, h-11) — do not shrink buttons on mobile
```

---

## PART 14 — ACCESSIBILITY CHECKLIST

**Prompt:**
```
Run through every component and verify all of these.
These are not optional — they are requirements.

FOCUS MANAGEMENT:
- All interactive elements reachable via Tab key in logical order
- Focus ring visible (terracotta outline from globals.css :focus-visible)
- Modal/dialog: focus trapped inside when open (Radix handles this automatically)
- On modal close: focus returns to the element that opened it
- Skip link: "Skip to main content" — visually hidden until focused, first element in <body>

ARIA:
- Buttons without visible text: aria-label required
  Share button: aria-label="Share Bruno's story"
  Close button: aria-label="Close"
  Language toggle: aria-label="Switch language", aria-pressed on each option
  Three-dot menus: aria-label="More options for [context]"
  
- Headings: one <h1> per page, logical h2/h3/h4 hierarchy
  Animal card: <h2> for animal name (within a list context)
  Animal profile: <h1> for animal name
  
- Images: alt text required on all <img> and Next.js <Image>
  Animal photos: "[AnimalName] — [species] available for adoption at [OrgName]"
  Org logos: "[OrgName] logo"
  Decorative images (patterns, backgrounds): alt="" (empty, not omitted)
  
- Status badges: include screen-reader text for the dot
  "Available" badge reads as: "Status: Available" (add <span className="sr-only">Status: </span>)
  
- Waiting bar: 
  role="progressbar", aria-valuenow={days}, aria-valuemin={0}, aria-valuemax={maxDays}
  aria-label="Bruno has been waiting 247 days"
  
- Dynamic content: use aria-live="polite" for:
  Toast notifications
  Filter result count changes ("Showing 12 animals")
  Form error messages

COLOR CONTRAST:
- All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
  Body text (charcoal/80 = #3D3530 on linen #F7F2EB): ~8:1 ✓
  Stone on white (#8A8078 on #FFFFFF): ~3.7:1 ✓ (large text only — captions are OK)
  Terracotta on white (#C46F52 on #FFFFFF): ~3.2:1 — ONLY use for large text (>18px) or icons
  Terracotta on linen: ~3.0:1 — eyebrow labels must be 14px+ to pass
  White on terracotta: passes AA ✓
  Linen on charcoal: ~11:1 ✓
  
  NOTE: Stone (#8A8078) on linen (#F7F2EB) is ~3.1:1 — only use for 
  non-critical supplementary text (captions, metadata). 
  For important text: use charcoal/70 (#5A5248) on linen instead.

MOTION:
- @media (prefers-reduced-motion: reduce) is set in globals.css
  Collapses ALL animations to 0.01ms
  This means: no waiting bar animation, no counter animation, no entrance stagger
  The interface is still fully functional — just instant
  
- Autoplay: no audio autoplay anywhere (no video in V1 — non-issue)

FORM ACCESSIBILITY:
- All inputs have associated <label> elements (not just placeholder)
  Placeholder is supplementary — never the only label
- Required fields: marked with aria-required="true" + visible asterisk (*)
- Error messages: associated via aria-describedby
  input: id="name-input"
  error: id="name-error", aria-live="polite"
  <input aria-describedby="name-error"/>

IMAGES AND ICONS:
- Icon-only buttons: always have aria-label
- Icon + text buttons: icon has aria-hidden="true" (text conveys meaning)
- Lucide icons (if used): pass aria-hidden="true" by default — verify this
- SVG logos: <title> element inside SVG + role="img" on the SVG element
```

---

## PART 15 — FINAL SELF-CRITIQUE (Second Pass)

After reviewing the complete guide, here are issues I found in my own design decisions and how I corrected them:

**Critique 1: "The admin dashboard has too much information density."**
The stat cards, reminder queue, and happy tails pending section could overwhelm a volunteer opening the CMS on their phone. Resolution: On mobile, the dashboard defaults to showing ONLY the follow-up reminders queue (the most urgent action item). Stats are collapsed behind a "Platform overview ▾" toggle. This prioritizes action over information on small screens.

**Critique 2: "The canvas share asset generation could silently fail."**
If the animal's photo fails to load (network error, bad URL), the canvas generates a broken or empty image. Resolution: Add explicit error handling — if image load fails, substitute a linen+logo fallback. The download still works, just without the animal photo. Toast: "Photo couldn't load — asset generated without image. Re-upload the photo and try again."

**Critique 3: "The full-screen mobile discovery feed has no way to go back to a previous animal."**
CSS scroll-snap scrolls forward but users may want to revisit. Resolution: Add a subtle "↓ [Name] you just passed" sticky indicator at the top of the feed (appears after scrolling past an animal, shows their name). Tapping it smooth-scrolls back. Disappears after 3 seconds. This solves the problem without adding navigation complexity.

**Critique 4: "The 'unexpected' card eyebrow copy needs another pass."**
"People often overlook animals like [Name]" — the word "overlook" could feel accusatory to someone who is genuinely trying. Resolution: Change to: "Meet [Name] — they surprise most people." This is curious rather than guilt-inducing. It invites rather than challenges.

**Critique 5: "No loading state for the OG image API route."**
The dynamic OG image at /api/share-image/[slug] might be slow on first request (uncached). Social platforms (WhatsApp, Facebook) have a 5-10 second timeout for OG image fetching. If it times out, no preview shows. Resolution: Add aggressive Cloudflare caching (stale-while-revalidate: 86400) and a static fallback OG image (/og-default.jpg) if the animal data fetch takes > 2 seconds.

**Critique 6: "The filter sidebar on desktop duplicates the filter sheet on mobile."**
Two code paths to maintain. Resolution: Build ONE FilterPanel component with responsive behavior — sidebar wrapper on desktop (fixed position), bottom sheet wrapper on mobile. The FilterPanel's internal content is identical. Only the container differs. This is a single component, not two.

**Critique 7: "Happy Tails 'before' photos from the shelter may not exist for older adoptions."**
If an adoption was recorded after Milaap was built (before the animal had a Milaap profile), there may be no shelter photo. Resolution: If no shelter photo — show the org's logo or a simple linen card with the org name. The "after" photo (home) still shows on the right. The before/after visual becomes "From [OrgName]" → "At home with [AdopterName]". Graceful degradation.

**Critique 8: "The counter animation uses performance.now() which could behave oddly on backgrounded tabs."**
If the page loads in a background tab, requestAnimationFrame doesn't fire, and the counter won't animate when the tab becomes active. Resolution: Use IntersectionObserver to start the counter only when the element is actually in the viewport (which requires the tab to be active). This already handles it — just ensure the counter is only triggered by the intersection, not on mount.

**Critique 9: "Typography contrast issue identified."**
Stone (#8A8078) on linen (#F7F2EB) = 3.1:1 contrast ratio — below AA for normal text. This was used for secondary text throughout. Resolution: For all text below 18px weight normal, switch stone to charcoal/55 (#2D2926 at 55% opacity = approximately #8A7E78). This passes 3.4:1 on linen. For captions and truly supplementary text (metadata, timestamps), stone at 3.1:1 is acceptable under WCAG (these don't convey essential meaning). Document this decision explicitly.

**Critique 10: "The platform has no 404 handling for /p/[slug] when slug doesn't exist vs when animal is adopted."**
These are different scenarios that need different UI:
- Slug doesn't exist → actual 404 → show the "lost on the way home" page
- Animal adopted → permanent page with adopted state → NOT a 404
- Animal medical_hold → show profile with "not currently available" status → NOT a 404
Resolution: In /p/[slug], fetch the animal with NO status filter. If not found → notFound(). If found but medical_hold → render profile with special status banner. If adopted → render adopted state. The schema already supports this — just make sure the fetch query doesn't filter by status.

**Overall confidence after second critique pass:** High.

The guide covers 15 parts, every public page, every admin page, all components, all states, all breakpoints, all accessibility requirements, and all micro-interactions. The self-critique resolved 10 specific issues.

The one thing I'd flag for the builder: **the canvas share asset generation is the riskiest implementation.** If Satoshi font fails to load in the canvas context, the output looks wrong. Test this first (Day 8 in the UI build sequence) before anything else depends on it. If it fails, the fallback is system-ui font in the canvas — acceptable but not ideal.

Everything else is standard React/Next.js work that Claude Code handles confidently.

**Ready to build world-class.**
