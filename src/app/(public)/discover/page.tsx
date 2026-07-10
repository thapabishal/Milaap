import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getDiscoveryFeed } from '@/lib/animals'
import DiscoveryFeed from '@/components/animal/DiscoveryFeed'
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

// ── Skeleton grid shown by Suspense while server fetches ──
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <AnimalCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Server-fetched feed ────────────────────────────────────
async function Feed() {
  const { animals, maxDaysWaiting } = await getDiscoveryFeed({ limit: 12 })

  return (
    <DiscoveryFeed
      animals={animals}
      maxDaysWaiting={maxDaysWaiting}
    />
  )
}

// ── Page ───────────────────────────────────────────────────
export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-linen">
      <div className="px-5 md:px-7 max-w-[680px] mx-auto pt-8 pb-16">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="font-satoshi font-bold text-[28px] tracking-[-0.02em] text-charcoal leading-tight">
            Find a companion
          </h1>
          <p className="mt-1 text-sm text-stone font-light">
            Sorted by longest waiting — every day matters.
          </p>
        </div>

        {/* Feed — Suspense shows skeletons during server fetch */}
        <Suspense fallback={<LoadingGrid />}>
          <Feed />
        </Suspense>
      </div>
    </div>
  )
}
