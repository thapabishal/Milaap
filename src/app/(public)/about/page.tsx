import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About Milaap — Animal Adoption Platform for Nepal | All Care Nepal',
  description:
    'Milaap is Nepal\'s storytelling-driven animal adoption platform. Built by All Care Nepal, it connects rescued animals with families through stories and direct WhatsApp conversations.',
  openGraph: {
    title: 'About Milaap Nepal',
    description: 'How Milaap connects rescued animals with families across Nepal.',
    siteName: 'Milaap Nepal',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://milaap.dpdns.org/about' },
}

// ── JSON-LD schemas ───────────────────────────────────────

const howtoSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to adopt a rescue animal in Nepal through Milaap',
  description: 'A step-by-step guide to adopting a rescued animal through Milaap Nepal.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Discover', text: 'Browse rescued animals on the Discover page. Each animal has a rescue story, personality description, and days-waiting counter. Animals are sorted by longest waiting first.' },
    { '@type': 'HowToStep', position: 2, name: 'Connect', text: 'Tap "Meet [Name]" to open WhatsApp with a pre-filled message to the rescue organization. No forms, no accounts — just a direct conversation.' },
    { '@type': 'HowToStep', position: 3, name: 'Meet', text: 'The organization will respond and arrange a meet-and-greet at the shelter. This is where you spend time with the animal before deciding.' },
    { '@type': 'HowToStep', position: 4, name: 'Home', text: 'Complete the adoption agreement, pay the adoption fee if applicable, and bring your new companion home to begin a new chapter together.' },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Milaap Nepal',
  url: 'https://milaap.dpdns.org',
  description: 'Milaap is a multi-organization animal adoption platform for Nepal, connecting rescued animals with families through storytelling and WhatsApp-based adoption conversations.',
  foundingOrganization: {
    '@type': 'NGO',
    name: 'All Care Nepal',
    url: 'https://allcarenepal.org',
    location: { '@type': 'Place', name: 'Butwal, Rupandehi, Nepal' },
  },
  areaServed: { '@type': 'Country', name: 'Nepal' },
  knowsAbout: ['animal adoption', 'animal rescue', 'pet adoption Nepal', 'dog adoption Nepal', 'cat adoption Nepal'],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Milaap Nepal',
  url: 'https://milaap.dpdns.org',
  description: 'Nepal\'s storytelling-driven animal adoption platform.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://milaap.dpdns.org/discover?species={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
}

// ── Steps data ────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    title: 'Discover',
    description: 'Browse animals by story, not specs. Each profile has a rescue narrative, personality description, and a waiting counter. Longest waiting always shows first.',
    icon: '🔍',
  },
  {
    number: '02',
    title: 'Connect',
    description: 'Tap "Meet [Name]" and WhatsApp opens with a pre-filled message to the rescue org. No forms, no middleman — a direct human conversation.',
    icon: '💬',
  },
  {
    number: '03',
    title: 'Meet',
    description: 'Visit the shelter and spend time with the animal. The organization will help you understand if it\'s a good fit for your home.',
    icon: '🤝',
  },
  {
    number: '04',
    title: 'Home',
    description: 'Complete the adoption and begin a new chapter. You\'ll receive guidance on settling in — and maybe one day share your Happy Tail.',
    icon: '🏠',
  },
]

// ── Data fetch ────────────────────────────────────────────

interface OrgCard {
  id: string
  name: string
  slug: string
  city: string
  logo_url: string | null
  animal_count: number
}

async function getVerifiedOrgs(): Promise<OrgCard[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const [orgsRes, countsRes] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, slug, city, logo_url')
      .eq('verification_status', 'verified')
      .eq('is_active', true)
      .order('name', { ascending: true }),

    supabase
      .from('animals')
      .select('organization_id')
      .eq('is_published', true)
      .in('status', ['available', 'reserved', 'fostered']),
  ])

  const countMap: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (countsRes.data ?? []) as any[]) {
    countMap[row.organization_id] = (countMap[row.organization_id] ?? 0) + 1
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((orgsRes.data ?? []) as any[]).map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    city: o.city,
    logo_url: o.logo_url,
    animal_count: countMap[o.id] ?? 0,
  }))
}

// ── Page ──────────────────────────────────────────────────

export default async function AboutPage() {
  const orgs = await getVerifiedOrgs()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([howtoSchema, organizationSchema, websiteSchema]) }} />

      <main className="min-h-screen bg-linen">

        {/* ── Hero ── */}
        <section className="max-w-4xl mx-auto px-5 pt-16 pb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.14em] text-dusty-rose font-medium mb-4">
            About Milaap
          </p>
          <h1 className="font-satoshi font-bold text-5xl md:text-6xl text-charcoal leading-tight tracking-[-0.02em] mb-5">
            Two stories.<br />One journey.
          </h1>
          <p className="text-base text-stone leading-relaxed max-w-xl mx-auto">
            Every adoption is two stories meeting in the middle — the animal&apos;s rescue, and a family&apos;s search. Milaap is where they find each other.
          </p>
        </section>

        {/* ── What is Milaap ── */}
        <section className="max-w-3xl mx-auto px-5 py-10">
          <div className="bg-white border border-linen-dark rounded-2xl p-8 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
            <h2 className="font-satoshi font-semibold text-xl text-charcoal mb-4">What is Milaap?</h2>
            <p className="text-sm text-stone leading-relaxed">
              Milaap is a multi-organization animal adoption platform for Nepal. It connects people looking to adopt with rescue organizations across the country through storytelling-driven animal profiles and direct WhatsApp conversations. Every animal on Milaap has a permanent profile with a rescue story, personality description, and a direct contact button to the specific organization caring for them. Milaap is not a marketplace — it is a discovery layer that makes finding the right rescue animal as human and story-driven as the adoption itself.
            </p>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="max-w-4xl mx-auto px-5 py-10">
          <h2 className="font-satoshi font-bold text-2xl text-charcoal text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.number} className="bg-white border border-linen-dark rounded-2xl p-6 flex flex-col gap-3 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-satoshi font-bold text-[13px] text-linen-dark">{step.number}</span>
                </div>
                <div>
                  <h3 className="font-satoshi font-bold text-base text-charcoal mb-1">{step.title}</h3>
                  <p className="text-[13px] text-stone leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── About ACN ── */}
        <section className="max-w-3xl mx-auto px-5 py-10">
          <div className="bg-charcoal rounded-2xl p-8 text-linen">
            <div className="flex items-start gap-5 mb-5">
              {/* ACN logo mark */}
              <div className="w-14 h-14 rounded-xl bg-linen/10 flex items-center justify-center flex-shrink-0">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Milaap / All Care Nepal logo">
                  <path d="M4 26 C8 18, 14 14, 28 6" stroke="#C46F52" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M4 6 C10 14, 18 18, 28 26" stroke="#F7F2EB" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="16" cy="16" r="3" fill="#C46F52" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-linen/50 font-medium mb-1">Built by</p>
                <h2 className="font-satoshi font-bold text-xl text-linen leading-tight">All Care Nepal</h2>
                <p className="text-[13px] text-linen/60">Butwal, Rupandehi, Nepal</p>
              </div>
            </div>
            <p className="text-sm text-linen/80 leading-relaxed mb-4">
              All Care Nepal is a registered animal welfare organization founded in Butwal, Nepal. Since its founding, ACN has rescued hundreds of animals across the Lumbini Province — dogs, cats, and others — providing veterinary care, rehabilitation, and rehoming. Milaap was built by ACN as an open platform: not just for ACN&apos;s animals, but for all verified rescue organizations in Nepal who share the same mission. Every animal, regardless of which organization cares for them, has an equal chance of being found.
            </p>
            <a
              href="https://allcarenepal.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-terracotta hover:text-dusty-rose transition-colors font-medium"
            >
              Visit allcarenepal.org ↗
            </a>
          </div>
        </section>

        {/* ── Organizations on Milaap ── */}
        {orgs.length > 0 && (
          <section className="max-w-4xl mx-auto px-5 py-10">
            <h2 className="font-satoshi font-bold text-2xl text-charcoal text-center mb-2">
              Organizations on Milaap
            </h2>
            <p className="text-sm text-stone text-center mb-8">
              Verified rescue organizations listing animals for adoption.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgs.map((org) => {
                const logoUrl = org.logo_url
                  ? `${supabaseUrl}/storage/v1/object/public/org-assets/${org.logo_url}`
                  : null
                return (
                  <Link
                    key={org.id}
                    href={`/org/${org.slug}`}
                    className="bg-white border border-linen-dark rounded-xl p-5 flex items-center gap-4 hover:shadow-[0_4px_16px_rgba(45,41,38,0.08)] transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-lg bg-linen border border-linen-dark flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt={`${org.name} logo`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🏢</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-satoshi font-semibold text-charcoal text-sm truncate">{org.name}</p>
                      <p className="text-[11px] text-stone">{org.city}</p>
                      {org.animal_count > 0 && (
                        <p className="text-[10px] text-terracotta font-medium mt-0.5">
                          {org.animal_count} animal{org.animal_count !== 1 ? 's' : ''} available
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Join Milaap ── */}
        <section className="max-w-3xl mx-auto px-5 py-10 pb-20">
          <div className="bg-linen border border-linen-dark rounded-2xl p-8 text-center">
            <p className="text-2xl mb-3">🐾</p>
            <h2 className="font-satoshi font-bold text-xl text-charcoal mb-3">
              Does your organization rescue animals in Nepal?
            </h2>
            <p className="text-sm text-stone leading-relaxed max-w-md mx-auto mb-6">
              If you run a registered animal rescue in Nepal and want to list your animals on Milaap, we&apos;d love to hear from you. Listing is free for verified NGOs.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://wa.me/9779867002067?text=Namaste! I run an animal rescue organization in Nepal and I'm interested in listing on Milaap."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-charcoal text-linen rounded-full px-6 py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#1A1612] transition-colors"
              >
                <span>💬</span> Message us on WhatsApp
              </a>
              <a
                href="mailto:hello@allcarenepal.org?subject=Join Milaap — Organisation Enquiry"
                className="inline-flex items-center gap-2 bg-transparent text-stone border border-linen-dark rounded-full px-6 py-3 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors"
              >
                ✉ Send an email
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
