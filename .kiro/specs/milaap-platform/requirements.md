# Requirements Document

## Introduction

Milaap is a multi-organization animal adoption platform for Nepal, built and maintained by All Care Nepal. It connects rescued animals with adopting families through storytelling-driven discovery and WhatsApp-based adoption conversations. The platform's tagline is "Two stories. One journey." — a rescued animal's story, and the story of the family that finds them.

The platform is built on Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, and Supabase (PostgreSQL + Auth + Storage). It supports multiple rescue organizations under a single shared discovery feed, an English/Nepali language toggle, analytics event tracking with no PII, AI-powered content quality checks via Google Gemini 1.5 Flash, QR code generation, client-side share asset generation using the Canvas API, and Progressive Web App (PWA) support.

The build follows four phases:
- **Phase 1** — Design system + single animal profile page
- **Phase 2** — Discovery feed + CMS (Content Management System)
- **Phase 3** — Happy Tails + Analytics + Admin tools
- **Phase 4** — PWA + Share assets + QR + Polish + Launch


## Glossary

- **Milaap**: The platform name. Means "meeting" in Nepali.
- **Animal**: A rescued animal record with a permanent profile, story, and status.
- **Slug**: A unique URL-safe identifier for an animal (e.g., `bruno`). Never changes.
- **WaitingBar**: The platform's signature UI component — a thin horizontal progress bar showing how long an animal has been waiting relative to the longest-waiting animal in the system. Appears on every animal card and profile without exception.
- **days_waiting**: The computed value `current_date - intake_date`. Never stored — always computed.
- **max_days_waiting**: The maximum `days_waiting` across all currently active (non-adopted), published animals. Used as the 100% reference for WaitingBar fill percentage.
- **Discovery Feed**: The public `/discover` page listing all published, non-adopted animals sorted by `days_waiting DESC`.
- **Happy Tails**: Adopter-submitted stories shared after an adoption. Goes through volunteer approval before being published publicly.
- **Follow-up Reminder**: An automatically created CMS task that prompts volunteers to contact adopters 30 days and 6 months after adoption to request a Happy Tails story.
- **Submission Token**: A unique UUID that forms the URL for a Happy Tails submission. It is the security boundary — no auth is required, but the token must be valid and unexpired.
- **CMS**: The password-protected admin area used by volunteers and org admins to manage animals, approve Happy Tails, and view analytics.
- **Organization (Org)**: An NGO rescue organization listed on Milaap. Each has its own WhatsApp number for adoption inquiries.
- **Platform Admin**: A user with access across all organizations and the ability to create/verify orgs.
- **Org Admin**: A user who manages one organization's animals and team.
- **Volunteer**: A user who creates/edits animals for one organization.
- **RLS**: Row Level Security — the Supabase/PostgreSQL enforcement layer that ensures users only access data for their organization.
- **Terracotta**: The primary brand action color (`#C46F52`). Used exclusively for primary buttons, the WaitingBar fill, and active navigation states.
- **Linen**: The primary background color (`#F7F2EB`).
- **Charcoal**: The primary text and dark surface color (`#2D2926`).
- **Satoshi**: The self-hosted Satoshi Rounded font used throughout the platform. No other font family is used.
- **OG Image**: Open Graph image generated dynamically per animal for social sharing previews.
- **Share Asset**: A Canvas API-rendered image (Instagram Story or Post format) generated client-side and never stored on the server.
- **QR Code**: A QR code linking to an animal's profile URL with `?src=qr` tracking, generated client-side.
- **PWA**: Progressive Web App — allows the platform to be installed on mobile home screens.
- **Gemini**: Google Gemini 1.5 Flash, the AI model used for content quality checks. Called only on explicit publish action.
- **i18n**: Internationalization via i18next. Supports English (`en`) and Nepali (`ne`).
- **intake_date**: The date an animal came into the organization's care. Drives the waiting counter.
- **adopted_date**: The date an animal's status changed to `adopted`.
- **ACN**: All Care Nepal — the organization that builds and maintains Milaap.


## Requirements

---

### Requirement 1: Design System and Visual Foundation

**User Story:** As a developer building the platform, I want a complete, consistent design system defined as Tailwind tokens, so that every component uses the correct colors, typography, spacing, and animations without hardcoding values.

#### Acceptance Criteria

1. THE Platform SHALL load the Satoshi Rounded font from self-hosted `.woff2` files in `/public/fonts/satoshi/` via `next/font/local` and expose it as a CSS variable `--font-satoshi` applied globally.
2. THE Platform SHALL configure all brand colors — linen (`#F7F2EB`), terracotta (`#C46F52`), dusty-rose (`#D7A79A`), sage (`#8A9B82`), charcoal (`#2D2926`), stone (`#8A8078`), linen-dark (`#E8DDD0`) — as named Tailwind tokens in `tailwind.config.ts` so that components use semantic class names rather than raw hex values.
3. THE Platform SHALL configure all status colors — `status-available` (`#8A9B82`), `status-reserved` (`#D7A79A`), `status-fostered` (`#C4A882`), `status-medical` (`#A08A7A`), `status-adopted` (`#6A8A6A`) — as Tailwind tokens, used exclusively for status display.
4. THE Platform SHALL configure the full typography scale — `text-display` (56px/700), `text-display-sm` (48px/700), `text-animal-lg` (42px/700), `text-animal-md` (36px/700), `text-headline` (24px/600), `text-body-lg` (17px/400), `text-body` (15px/400/leading-7), `text-body-sm` (13px/400), `text-label` (11px/500/uppercase), `text-label-sm` (10px/500/uppercase), `text-caption` (12px/400) — as Tailwind tokens.
5. THE Platform SHALL configure all named shadows — `shadow-card`, `shadow-card-hover`, `shadow-terra`, `shadow-terra-sm`, `shadow-dark`, `shadow-sheet` — as Tailwind tokens.
6. THE Platform SHALL configure all border radius tokens — `rounded-tag` (6px), `rounded-card` (16px), `rounded-card-lg` (24px), `rounded-pill` (9999px) — in `tailwind.config.ts`.
7. THE Platform SHALL configure animation keyframes — `animate-waiting-pulse`, `animate-status-pulse`, `animate-shimmer`, `animate-fade-up`, `animate-slide-up`, `animate-bar-fill`, `animate-float` — in Tailwind config.
8. WHEN the user has set `prefers-reduced-motion: reduce`, THE Platform SHALL collapse all animations to a duration of `0.01ms` via a global `globals.css` rule without requiring per-component overrides.
9. THE Platform SHALL never use terracotta (`#C46F52`) for decorative backgrounds, illustrations, or body text — only for primary action buttons, WaitingBar fill, and active navigation states.
10. THE Platform SHALL never introduce UI component libraries (Shadcn, MUI, Chakra, or Radix primitives beyond `@radix-ui/react-dialog` and `@radix-ui/react-tooltip`).

---

### Requirement 2: Base UI Component Library

**User Story:** As a developer, I want a reusable set of base UI components built from Tailwind tokens, so that every page is consistent and I never rebuild common elements from scratch.

#### Acceptance Criteria

1. THE Button Component SHALL support variants `primary` (terracotta background), `secondary` (ghost/transparent), and `dark` (charcoal background), and sizes `sm`, `md`, and `lg`, with an optional `loading` prop that shows a spinner and disables the button.
2. THE Badge Component SHALL support variants `available`, `reserved`, `fostered`, `medical`, `adopted`, and `default`, using the defined status color tokens, and SHALL render a pulsing dot (using `animate-status-pulse`) when the variant is `available`.
3. THE WaitingBar Component SHALL render a 2px-height horizontal bar with a linen-dark background and a terracotta fill whose width equals `(daysWaiting / maxDaysWaiting) * 100%`, clamped to a minimum of 2% and maximum of 100%.
4. THE WaitingBar Component SHALL animate from 0% to the final fill width on mount using `animate-bar-fill` (800ms, cubic-bezier easing) with a 300ms delay.
5. THE WaitingBar Component SHALL show a small pulsing dot (`animate-waiting-pulse`) at the right edge of the fill for active (non-adopted) animals.
6. WHEN an animal's status is `adopted`, THE WaitingBar Component SHALL display in sage color without the pulse dot, and the label SHALL read "[X] days — now home".
7. THE WaitingBar Component SHALL include `role="progressbar"`, `aria-valuenow={days}`, `aria-valuemax={max}`, and `aria-label="[Name] has been waiting X days"` for accessibility.
8. THE LoadingSkeleton Component SHALL render a shimmer animation (`animate-shimmer`) using linen-dark as the base color, and SHALL never be replaced by a spinner component anywhere on the platform.
9. THE Toast Component SHALL support `success` (sage), `error` (muted red), and `info` (charcoal) variants, auto-dismiss after 3 seconds, and appear in the top-right corner of the screen.
10. THE LanguageToggle Component SHALL render fixed in the top-right corner (z-50), display `EN | NE` as two text buttons, highlight the active language in charcoal, and on click SHALL call `i18n.changeLanguage()` and persist the selection to `localStorage` under the key `milaap_lang`.


---

### Requirement 3: Internationalization (English / Nepali)

**User Story:** As a visitor to Milaap, I want to read the platform in English or Nepali, so that I can use it comfortably in my preferred language.

#### Acceptance Criteria

1. THE Platform SHALL use i18next with `react-i18next` to manage all user-facing strings, with `en` as the default language and `ne` as the alternate.
2. THE Platform SHALL detect the saved language from `localStorage` key `milaap_lang` on mount and apply it before first render, so no language flash occurs on page load.
3. WHEN a user taps the LanguageToggle to switch languages, THE Platform SHALL re-render all i18n strings instantly without a page reload.
4. THE Platform SHALL store all English strings in `/lib/i18n/en.json` and all Nepali strings in `/lib/i18n/ne.json`, covering at minimum: navigation labels, welcome page text, animal status labels, trait labels, footer text, and all CTA button text.
5. WHEN the active language is Nepali and an animal's `story_ne` field is empty, THE Platform SHALL display `story_en` with a note "(Translation coming soon)" rather than showing blank content.
6. THE Platform SHALL update the `<html lang>` attribute to `"ne"` or `"en"` to match the active language.
7. THE Animal Profile Page SHALL display `story_ne` or `story_en` based on the currently active language, and SHALL display `one_liner_ne` or `one_liner` accordingly.

---

### Requirement 4: Public Layout — Header, Footer, and Navigation

**User Story:** As a visitor, I want a consistent header and footer on every public page, so that I can navigate the platform and understand who built it.

#### Acceptance Criteria

1. THE PublicHeader Component SHALL render the Milaap logo (SVG mark with terracotta left path and charcoal right path) on the left, and navigation links (Discover, Happy Tails, About) on the right, with the LanguageToggle.
2. WHILE the user has scrolled to the top of a public page, THE PublicHeader Component SHALL render with a transparent background; WHILE the user has scrolled down, THE PublicHeader Component SHALL render with a white background and a smooth transition.
3. THE PublicHeader Component SHALL render a hamburger menu on viewports narrower than 768px, which on tap opens a slide-in navigation panel from the right.
4. THE PublicFooter Component SHALL include the Milaap logo mark, the tagline "Two stories. One journey.", navigation links, the text "Built and maintained by All Care Nepal · Butwal, Nepal", a link to `allcarenepal.org`, and a copyright notice, on a charcoal background with linen-colored text.
5. THE Platform SHALL render the PublicHeader and PublicFooter on all public-facing pages: `/`, `/discover`, `/p/[slug]`, `/happy-tails`, `/org/[slug]`, `/faq`, and `/about`.
6. THE Platform SHALL never add authentication or login requirements to any public-facing page.

---

### Requirement 5: Welcome Page

**User Story:** As a first-time visitor, I want an emotionally compelling landing page, so that I feel moved to discover the animals waiting for adoption.

#### Acceptance Criteria

1. THE Welcome Page SHALL render a hero headline "Someone is waiting for you." where "Someone is waiting for" is in charcoal and "you." is in terracotta italic, each word animating in sequentially with an 80ms stagger beginning 200ms after page load using CSS transitions.
2. THE Welcome Page SHALL display a featured animal's hero photo fetched server-side from the database (selecting a random `is_featured = true`, `is_published = true`, `status = 'available'` animal), with the animal's name and days waiting overlaid at the bottom of the image.
3. THE Welcome Page SHALL show a count of currently published, non-adopted animals (`status IN ('available', 'reserved', 'fostered')`) fetched server-side, displayed in dusty-rose in a bottom strip on a charcoal background.
4. THE Welcome Page SHALL include a primary CTA button "Meet them →" linking to `/discover`, which fades in after the headline animation completes (after approximately 800ms).
5. THE Welcome Page SHALL include the Open Graph metadata: title `'Milaap — Where rescued animals meet their families | Nepal'`, description, and an OG image from `/og-default.jpg`.
6. THE Welcome Page SHALL include a `<link rel="canonical">` tag pointing to `https://milaap.dpdns.org/`.
7. THE Welcome Page SHALL show a subtle animated "↓ scroll" indicator at the bottom of the hero section that disappears once the user scrolls.


---

### Requirement 6: Animal Profile Page

**User Story:** As a potential adopter, I want to read an animal's full story on a permanent, beautiful profile page, so that I feel an emotional connection and decide to make contact.

#### Acceptance Criteria

1. THE Animal Profile Page SHALL be accessible at `/p/[slug]` and SHALL fetch the animal record by slug, joining the owning organization's `name`, `whatsapp_number`, `slug`, and `city`.
2. IF an animal slug is not found in the database, THEN THE Animal Profile Page SHALL return a 404 response using Next.js `notFound()`.
3. WHEN an animal's status is `medical_hold`, THE Animal Profile Page SHALL still render the full profile and SHALL display a "Not currently available" status badge rather than returning a 404 or hiding the profile.
4. WHEN an animal's status is `adopted`, THE Animal Profile Page SHALL still render the full profile with an adoption announcement banner showing "Found their family", the adoption month/year, and the adopter's city if available, and SHALL hide the WhatsApp CTA button.
5. THE Animal Profile Page SHALL display a full-bleed photo gallery at a height of 65vh on mobile and 55vh on desktop, with dot indicators, tap-left/tap-right navigation, swipe gesture support (minimum 50px swipe distance), and a photo counter ("1 / 3") in the top-right corner.
6. THE Animal Profile Page SHALL display the WaitingBar component directly below the status-and-org row, with `daysWaiting` computed server-side as `current_date - intake_date` and `maxDaysWaiting` computed as the maximum `current_date - intake_date` across all non-adopted published animals.
7. THE Animal Profile Page SHALL display the animal's name, species, estimated age, and gender below the WaitingBar.
8. THE Animal Profile Page SHALL display the animal's personality quote (from `personality_en`) with a 2px dusty-rose left border and Satoshi Light Italic styling, if the field is filled.
9. THE Animal Profile Page SHALL display the full story in the language currently active (`story_en` for English, `story_ne` for Nepali), under a gendered section label ("HIS STORY" / "HER STORY" / "THEIR STORY").
10. THE Animal Profile Page SHALL display a "Good to Know" trait grid showing only non-null compatibility traits, with sage coloring for positive traits and stone for neutral/negative traits.
11. THE Animal Profile Page SHALL display a "What Comes With [Name]" section with a terracotta-tinted background listing the four adoption incentives: free first vet check, rabies vaccination included, adopter support WhatsApp group, and emergency foster option.
12. THE Animal Profile Page SHALL include a primary WhatsApp CTA button (dark variant) that when tapped: fires a `whatsapp_tap` analytics event, builds the WhatsApp URL via `buildWhatsAppURL()`, shows a 1.5-second overlay with a "We've noted your interest" message, and opens WhatsApp in a new tab.
13. THE Animal Profile Page SHALL display a sticky bottom bar on mobile that appears after scrolling past the hero photo, containing the animal's name and a "Meet [Name]" button that triggers the same WhatsApp behavior as the primary CTA.
14. THE Animal Profile Page SHALL fire a `profile_view` analytics event on client-side load (fire-and-forget), capturing the `source` query parameter (`qr`, `social`, `direct`, or `unknown`).
15. THE Animal Profile Page SHALL include `generateMetadata` producing a title `"[Name] — [species] for adoption in [City] | Milaap Nepal"`, a description from `one_liner`, an OG image URL pointing to `/api/share-image/[slug]`, Animal JSON-LD schema, and BreadcrumbList schema.
16. THE Animal Profile Page SHALL include `robots: { index: true, follow: true }` so adopted animal profiles remain indexed in search engines.
17. THE Animal Profile Page SHALL trigger a smooth scroll-fade animation (opacity + translateY 12px) for each content section below the hero as it enters the viewport, using the Intersection Observer API with an 80ms stagger per section.

---

### Requirement 7: Share Sheet

**User Story:** As a visitor who wants to share an animal's story, I want a share sheet that provides multiple sharing options, so that I can promote the animal on social media or copy the link easily.

#### Acceptance Criteria

1. THE ShareSheet Component SHALL open as a bottom sheet on mobile (sliding up from the bottom, with a charcoal handle bar) and as a modal on desktop, triggered by a "Share [Name]'s story" button on the animal profile.
2. THE ShareSheet Component SHALL offer four options: "Instagram Story" (triggers Canvas-based story asset generation), "Instagram Post" (triggers Canvas-based post asset generation), "WhatsApp" (opens WhatsApp with a pre-filled message containing the animal name, days waiting, one-liner, and profile URL), and "Copy link" (copies the profile URL to clipboard and shows a success toast).
3. WHEN a user taps a sharing option, THE ShareSheet Component SHALL fire a `share_tap` analytics event before executing the share action.
4. THE ShareSheet Component SHALL use `@radix-ui/react-dialog` for the modal/bottom-sheet to ensure accessible focus trapping.


---

### Requirement 8: Discovery Feed

**User Story:** As a potential adopter, I want to browse all available animals across all organizations, sorted by how long they have been waiting, so that the animals who have waited the longest get noticed first.

#### Acceptance Criteria

1. THE Discovery Feed SHALL fetch all animals where `is_published = true` and `status IN ('available', 'reserved', 'fostered')`, sorted by `intake_date ASC` (longest waiting first). This sort order SHALL never be changed or made configurable — no "sort by newest" option SHALL ever exist.
2. THE Discovery Feed SHALL compute `(current_date - intake_date) AS days_waiting` for every animal in the query and include the system-wide `max_days_waiting` value so WaitingBar percentages are accurate.
3. THE Discovery Feed SHALL display 12 animals per page initially and load the next 12 via infinite scroll when the user reaches within 3 cards of the end, without a page reload.
4. THE Discovery Feed SHALL inject a featured animal (`is_featured = true`) at every 5th position in the feed array, with an editorial label "Most people scroll past animals like [Name]."
5. THE Discovery Feed SHALL render in a full-screen vertical scroll-snap mode on viewports narrower than 768px (one animal per screen, `scroll-snap-type: y mandatory`), and in a 2-column card grid on viewports 768px and wider.
6. THE AnimalCard Component SHALL display: the hero photo, an absolute-positioned status Badge, an org name and city badge, the WaitingBar (full width, directly below photo), the animal's name (Satoshi Bold, 32px), the one-liner (Satoshi Light Italic, max 2 lines with ellipsis), up to 4 trait tags, and a "Meet [Name] →" CTA button.
7. THE AnimalCard Component SHALL display the WaitingBar on every card without exception.
8. THE Discovery Feed SHALL support filter options — species (All/Dog/Cat/Other), size (All/Small/Medium/Large), good with kids (toggle), good with cats (toggle), apartment friendly (toggle), and city/org (dropdown) — applied via URL query parameters so filtered views are shareable and server-rendered.
9. THE Discovery Feed SHALL show a live animal count on the filter sheet's submit button that updates as filters change.
10. WHEN no animals match the active filters, THE Discovery Feed SHALL display an empty state message rather than a blank page.
11. WHEN the user reaches the end of the feed, THE Discovery Feed SHALL display "You've seen all [X] animals" and a "Back to top" button.
12. THE Discovery Feed Page SHALL include metadata: title `'Adopt a rescue animal in Nepal | Milaap'` for the base page, and species/city-specific titles (e.g., "Adopt a rescue dog in Nepal") when filter query parameters are present.
13. THE Discovery Feed Page SHALL include a CollectionPage JSON-LD schema.

---

### Requirement 9: WhatsApp Adoption Flow

**User Story:** As a potential adopter, I want tapping the adoption button to open WhatsApp with a pre-filled message to the correct organization, so that I can start a conversation without knowing the organization's number.

#### Acceptance Criteria

1. THE WhatsApp URL Builder (`lib/whatsapp.ts`) SHALL construct the URL as `https://wa.me/977{org.whatsapp_number}?text={encodedMessage}` where the message differs by active language: Nepali message includes the animal's name and org name in Nepali script, and English message uses English phrasing.
2. THE WhatsApp URL Builder SHALL encode the message text using `encodeURIComponent` to ensure special characters, Nepali Unicode, and spaces are correctly handled.
3. WHEN a user taps the WhatsApp CTA, THE Platform SHALL open the constructed URL in a new tab, opening WhatsApp on mobile devices.
4. THE WhatsApp CTA SHALL direct inquiries to the `whatsapp_number` of the specific organization that owns the animal, not a generic or platform-level number.
5. THE Platform SHALL never expose adopter communication details or contact history — the platform's role ends when WhatsApp opens.

---

### Requirement 10: Analytics Event Tracking

**User Story:** As an organization volunteer, I want to see how many people viewed each animal and tapped the adoption button, so that I can understand which animals need better stories.

#### Acceptance Criteria

1. THE Analytics Tracker (`lib/analytics.ts`) SHALL support event types `profile_view`, `whatsapp_tap`, `share_tap`, and `happy_tails_view`.
2. WHEN an analytics event is fired, THE Analytics Tracker SHALL POST to `/api/analytics/event` with `type`, `animalId`, `organizationId`, and optional `source`, using fire-and-forget (`fetch` without `await`), so analytics failures never block the user interface.
3. THE Analytics API Route SHALL insert a row into the `analytics_events` table and SHALL never store personally identifiable information (no IP addresses, no user agents, no session IDs, no names).
4. THE Analytics API Route SHALL accept `source` values from the `analytics_source` enum: `qr`, `direct`, `social`, `embed`, `unknown`.
5. THE Analytics Dashboard SHALL display per-organization metrics including total profile views, total WhatsApp taps, tap rate (taps ÷ views × 100%), animal performance ranked by tap rate, traffic source breakdown, and an adoption funnel.
6. THE Analytics Dashboard SHALL support time range filters: last 7 days, last 30 days, and all time.
7. THE Analytics Dashboard SHALL be accessible only to authenticated users and SHALL show only data for the currently logged-in user's organization (enforced by RLS).

