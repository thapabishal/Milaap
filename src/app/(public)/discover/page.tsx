import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getDiscoveryFeed, getAvailableCities } from '@/lib/animals'
import type { AnimalSpecies, AnimalSize } from '@/lib/animals'
import DiscoverShell from '@/components/animal/DiscoverShell'
import AnimalCardSkeleton from '@/components/animal/AnimalCardSkeleton'

export const metadata: Metadata = {
  title: 'Discover Animals | Milaap Nepal',
  description: 'Find your next companion — dogs, cats, and more rescued animals waiting for a home in Nepal.',
  openGraph: {
    title: 'Discover Animals | Milaap Nepal',
    description: 'Find your next companion — rescued animals waiting for a home in Nepal.',
    siteName: 'Milaap Nepal',
  },
  twitter: { card: 'summary' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://milaap.dpdns.org/discover' },
}

interface SearchParams {
  species?: string
  size?: string
  city?: string
  kids?: string
  cats?: string
  apt?: string
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

// ── Page ───────────────────────────────────────────────────
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  return (
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
  )
}
