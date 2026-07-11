import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import AnimalCard from '@/components/animal/AnimalCard'
import type { AnimalSummary } from '@/lib/animals'
import { daysWaiting } from '@/lib/animals'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface OrgFull {
  id: string
  name: string
  slug: string
  description: string | null
  description_ne: string | null
  city: string
  district: string | null
  whatsapp_number: string
  whatsapp_display: string | null
  website_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  registration_number: string | null
  founded_year: number | null
  animals_rescued_count: number | null
  logo_url: string | null
  cover_url: string | null
  verification_status: string
}

async function getData(slug: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const [orgRes, animalsRes, adoptedCountRes] = await Promise.all([
    supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(),

    supabase
      .from('animals')
      .select(`
        id, name, slug, species, breed,
        age_years, age_months, gender, size,
        one_liner, good_with_kids, good_with_cats,
        apartment_ok, is_vaccinated, is_neutered,
        energy_level, status, intake_date, photos,
        organization_id, is_featured,
        organizations ( name, slug, city, whatsapp_number )
      `)
      .eq('organization_id', (await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
        .then((r: { data: { id: string } | null }) => r.data?.id ?? ''))
      )
      .eq('is_published', true)
      .in('status', ['available', 'reserved', 'fostered'])
      .order('intake_date', { ascending: true })
      .limit(6),

    supabase
      .from('animals')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('status', 'adopted'),
  ])

  if (orgRes.error || !orgRes.data) return null

  const org: OrgFull = orgRes.data

  // Refetch animals with correct org_id now we have it
  const animalsRes2 = await supabase
    .from('animals')
    .select(`
      id, name, slug, species, breed,
      age_years, age_months, gender, size,
      one_liner, good_with_kids, good_with_cats,
      apartment_ok, is_vaccinated, is_neutered,
      energy_level, status, intake_date, photos,
      organization_id, is_featured,
      organizations ( name, slug, city, whatsapp_number )
    `)
    .eq('organization_id', org.id)
    .eq('is_published', true)
    .in('status', ['available', 'reserved', 'fostered'])
    .order('intake_date', { ascending: true })
    .limit(6)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawAnimals: any[] = animalsRes2.data ?? []
  const animals: AnimalSummary[] = rawAnimals.map((a) => ({
    ...a,
    days_waiting: daysWaiting(a.intake_date),
  }))

  const maxDaysWaiting = animals.length > 0
    ? Math.max(...animals.map((a) => a.days_waiting))
    : 1

  // Count available animals total for "see all" logic
  const { count: totalAvailable } = await supabase
    .from('animals')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .eq('is_published', true)
    .in('status', ['available', 'reserved', 'fostered'])

  // Count adopted for stats
  const { count: totalAdopted } = await supabase
    .from('animals')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .eq('status', 'adopted')

  void animalsRes
  void adoptedCountRes

  return { org, animals, maxDaysWaiting, totalAvailable: totalAvailable ?? 0, totalAdopted: totalAdopted ?? 0 }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any
  const { data: org } = await supabase
    .from('organizations')
    .select('name, city, description')
    .eq('slug', slug)
    .maybeSingle()

  if (!org) return { title: 'Organization not found | Milaap Nepal' }

  return {
    title: `${org.name} — Animal Adoption | Milaap Nepal`,
    description: org.description ?? `Meet the animals waiting for a home at ${org.name} in ${org.city}.`,
    openGraph: {
      title: `${org.name} | Milaap Nepal`,
      siteName: 'Milaap Nepal',
    },
    alternates: { canonical: `https://milaap.dpdns.org/org/${slug}` },
  }
}

export default async function OrgPublicPage({ params }: PageProps) {
  const { slug } = await params
  const result = await getData(slug)
  if (!result) notFound()

  const { org, animals, maxDaysWaiting, totalAvailable, totalAdopted } = result
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const logoUrl  = org.logo_url  ? `${supabaseUrl}/storage/v1/object/public/org-assets/${org.logo_url}`  : null
  const coverUrl = org.cover_url ? `${supabaseUrl}/storage/v1/object/public/org-assets/${org.cover_url}` : null

  const yearsOperating = org.founded_year
    ? new Date().getFullYear() - org.founded_year
    : null

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AnimalShelter',
    name: org.name,
    url: `https://milaap.dpdns.org/org/${org.slug}`,
    telephone: org.whatsapp_display ?? `+977${org.whatsapp_number}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: org.city,
      addressCountry: 'NP',
    },
    ...(org.description ? { description: org.description } : {}),
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(org.website_url ? { sameAs: [org.website_url] } : {}),
  }

  const showSeeAll = totalAvailable > 3

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-linen">
        {/* ── Cover photo ── */}
        <div className="relative h-[300px] bg-linen-dark overflow-hidden">
          {coverUrl ? (
            <Image src={coverUrl} alt={`${org.name} cover`} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-linen-dark to-dusty-rose/20" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent" />
        </div>

        {/* ── Org identity ── */}
        <div className="max-w-4xl mx-auto px-5">
          {/* Logo + name row — overlaps cover */}
          <div className="flex items-end gap-4 -mt-10 mb-6 relative z-10">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border-2 border-white shadow-md flex-shrink-0">
              {logoUrl ? (
                <Image src={logoUrl} alt={`${org.name} logo`} width={80} height={80} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-linen flex items-center justify-center text-2xl">🏢</div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">{org.name}</h1>
              <p className="text-sm text-stone">{org.city}{org.district ? `, ${org.district}` : ''}</p>
            </div>
          </div>

          {/* Verification + registration */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {org.verification_status === 'verified' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sage bg-sage/10 border border-sage/25 px-3 py-1 rounded-full">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Verified organization
              </span>
            )}
            {org.registration_number && (
              <span className="text-[11px] text-stone">
                Registered NGO · {org.registration_number}
              </span>
            )}
          </div>

          {/* Description */}
          {org.description && (
            <p className="text-sm text-stone leading-relaxed mb-6 max-w-2xl">{org.description}</p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {org.animals_rescued_count && (
              <div className="bg-white border border-linen-dark rounded-xl p-4 text-center">
                <p className="font-satoshi font-bold text-2xl text-terracotta">{org.animals_rescued_count.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-stone mt-1">Animals rescued</p>
              </div>
            )}
            {yearsOperating && (
              <div className="bg-white border border-linen-dark rounded-xl p-4 text-center">
                <p className="font-satoshi font-bold text-2xl text-terracotta">{yearsOperating}+</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-stone mt-1">Years operating</p>
              </div>
            )}
            <div className="bg-white border border-linen-dark rounded-xl p-4 text-center">
              <p className="font-satoshi font-bold text-2xl text-terracotta">{totalAvailable}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-stone mt-1">Available now</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-10 flex-wrap">
            <Link
              href={`/discover?org=${org.slug}`}
              className="bg-terracotta text-white rounded-full px-6 py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)]"
            >
              Visit their animals →
            </Link>
            {org.website_url && (
              <a
                href={org.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent text-stone border border-linen-dark rounded-full px-6 py-3 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors"
              >
                Visit website ↗
              </a>
            )}
          </div>

          {/* ── Available animals ── */}
          {animals.length > 0 && (
            <section className="mb-12">
              <h2 className="font-satoshi font-semibold text-xl text-charcoal mb-5">
                Animals waiting at {org.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {animals.slice(0, 3).map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    maxDaysWaiting={maxDaysWaiting}
                  />
                ))}
              </div>
              {showSeeAll && (
                <div className="mt-5">
                  <Link
                    href={`/discover?org=${org.slug}`}
                    className="text-sm text-terracotta hover:text-[#B05A3E] transition-colors font-medium"
                  >
                    See all animals from {org.name} →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Social links */}
          {(org.facebook_url || org.instagram_url) && (
            <div className="flex gap-3 pb-10 flex-wrap">
              {org.facebook_url && (
                <a href={org.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="text-[12px] text-stone hover:text-charcoal transition-colors">
                  Facebook ↗
                </a>
              )}
              {org.instagram_url && (
                <a href={org.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="text-[12px] text-stone hover:text-charcoal transition-colors">
                  Instagram ↗
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
