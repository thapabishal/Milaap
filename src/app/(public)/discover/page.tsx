import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getDiscoveryFeed, getAvailableCities } from '@/lib/animals'
import type { AnimalSpecies, AnimalSize } from '@/lib/animals'
import DiscoverShell from '@/components/animal/DiscoverShell'
import AnimalCardSkeleton from '@/components/animal/AnimalCardSkeleton'

// ── Types ──────────────────────────────────────────────────

interface SearchParams {
  species?: string
  size?: string
  city?: string
  kids?: string
  cats?: string
  apt?: string
}

// ── generateMetadata ───────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const sp = await searchParams

  // Build context-aware title
  const speciesLabel: Record<string, string> = {
    dog:    'dog',
    cat:    'cat',
    rabbit: 'rabbit',
    other:  'animal',
  }
  const species = sp.species ? speciesLabel[sp.species] ?? 'animal' : 'animal'
  const city    = sp.city
    ? sp.city.charAt(0).toUpperCase() + sp.city.slice(1)
    : null

  const title = city
    ? `Adopt a rescue ${species} in ${city} | Milaap`
    : sp.species
      ? `Adopt a rescue ${species} in Nepal | Milaap`
      : 'Adopt a rescue animal in Nepal | Milaap'

  const description =
    'Browse rescued dogs, cats, and animals available for adoption across Nepal. Each animal has a story. Find yours.'

  // Canonical: strip non-indexable filter params — only species/city are canonical
  const canonicalParams = new URLSearchParams()
  if (sp.species) canonicalParams.set('species', sp.species)
  if (sp.city)    canonicalParams.set('city',    sp.city)
  const qs        = canonicalParams.toString()
  const canonical = `https://milaap.dpdns.org/discover${qs ? `?${qs}` : ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Milaap Nepal',
    },
    twitter: { card: 'summary', title, description },
    robots: { index: true, follow: true },
    alternates: { canonical },
  }
}

// ── Loading fallback ───────────────────────────────────────

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <AnimalCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Server data fetch + render ─────────────────────────────

async function FeedWithData({ sp }: { sp: SearchParams }) {
  const [{ animals, maxDaysWaiting, totalCount }, cities] = await Promise.all([
    getDiscoveryFeed({
      species:      sp.species as AnimalSpecies | undefined,
      size:         sp.size    as AnimalSize    | undefined,
      city:         sp.city,
      goodWithKids: sp.kids === 'true' || undefined,
      goodWithCats: sp.cats === 'true' || undefined,
      apartmentOk:  sp.apt  === 'true' || undefined,
      page:         1,
      limit:        12,
    }),
    getAvailableCities(),
  ])

  return (
    <DiscoverShell
      initialAnimals={animals}
      initialMaxDays={maxDaysWaiting}
      initialTotal={totalCount}
      cities={cities}
      searchParams={sp}
    />
  )
}

// ── CollectionPage JSON-LD ─────────────────────────────────

function CollectionPageSchema({ sp }: { sp: SearchParams }) {
  const speciesLabel: Record<string, string> = {
    dog: 'dogs', cat: 'cats', rabbit: 'rabbits', other: 'animals',
  }
  const speciesPart = sp.species ? speciesLabel[sp.species] ?? 'animals' : 'animals'
  const cityPart    = sp.city
    ? ` in ${sp.city.charAt(0).toUpperCase() + sp.city.slice(1)}`
    : ' across Nepal'

  const qs = new URLSearchParams()
  if (sp.species) qs.set('species', sp.species)
  if (sp.city)    qs.set('city',    sp.city)
  const qStr = qs.toString()

  const schema = {
    '@context':   'https://schema.org',
    '@type':      'CollectionPage',
    name:         `${speciesPart.charAt(0).toUpperCase() + speciesPart.slice(1)} available for adoption${cityPart}`,
    description:  'Browse rescued animals available for adoption. Each animal has a rescue story, personality description, and a direct WhatsApp link to the organization caring for them.',
    url:          `https://milaap.dpdns.org/discover${qStr ? `?${qStr}` : ''}`,
    provider: {
      '@type': 'Organization',
      name:    'Milaap Nepal',
      url:     'https://milaap.dpdns.org',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── Page ───────────────────────────────────────────────────

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  return (
    <>
      <CollectionPageSchema sp={sp} />

      <div className="min-h-screen bg-linen">
        <Suspense fallback={
          <div className="px-5 md:px-7 max-w-[680px] mx-auto pt-8">
            <div className="mb-6 h-16 animate-shimmer rounded-lg" />
            <LoadingGrid />
          </div>
        }>
          <FeedWithData sp={sp} />
        </Suspense>
      </div>
    </>
  )
}
