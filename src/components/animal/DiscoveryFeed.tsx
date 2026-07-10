'use client'

import AnimalCard from '@/components/animal/AnimalCard'
import AnimalCardSkeleton from '@/components/animal/AnimalCardSkeleton'
import MilaapLogo from '@/components/layout/MilaapLogo'
import type { AnimalSummary } from '@/lib/animals'

interface DiscoveryFeedProps {
  animals: AnimalSummary[]
  maxDaysWaiting: number
  loading?: boolean
}

export default function DiscoveryFeed({
  animals,
  maxDaysWaiting,
  loading = false,
}: DiscoveryFeedProps) {

  // ── Loading state: 6 skeleton cards ───────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <AnimalCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────
  if (animals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <MilaapLogo variant="mark" className="opacity-20 scale-150" />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-stone font-light">
            No animals available right now.
          </p>
          <p className="text-xs text-stone/60">
            Check back soon — new rescues are added regularly.
          </p>
        </div>
      </div>
    )
  }

  // ── Feed grid ──────────────────────────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {animals.map((animal, index) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          maxDaysWaiting={maxDaysWaiting}
          showScrollHint={index === 0}
        />
      ))}
    </div>
  )
}
