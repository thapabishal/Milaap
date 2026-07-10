'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AnimalCard from '@/components/animal/AnimalCard'
import AnimalCardSkeleton from '@/components/animal/AnimalCardSkeleton'
import MilaapLogo from '@/components/layout/MilaapLogo'
import type { AnimalSummary, DiscoveryFeedResult } from '@/lib/animals'

interface DiscoveryFeedProps {
  /** Server-rendered first page */
  initialAnimals: AnimalSummary[]
  initialMaxDays: number
  initialTotal: number
}

const PAGE_SIZE = 12

// ── Build the API URL from current search params ───────────
function buildApiUrl(sp: URLSearchParams, page: number): string {
  const params = new URLSearchParams(sp)
  params.set('page', String(page))
  params.set('limit', String(PAGE_SIZE))
  return `/api/animals?${params.toString()}`
}

export default function DiscoveryFeed({
  initialAnimals,
  initialMaxDays,
  initialTotal,
}: DiscoveryFeedProps) {
  const sp = useSearchParams()

  const [animals, setAnimals]       = useState<AnimalSummary[]>(initialAnimals)
  const [maxDays, setMaxDays]       = useState(initialMaxDays)
  const [total, setTotal]           = useState(initialTotal)
  const [page, setPage]             = useState(2)
  const [loading, setLoading]       = useState(false)
  const [exhausted, setExhausted]   = useState(initialAnimals.length >= initialTotal)

  // Sentinel for infinite scroll trigger
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset when filters change (search params change)
  useEffect(() => {
    setAnimals(initialAnimals)
    setMaxDays(initialMaxDays)
    setTotal(initialTotal)
    setPage(2)
    setExhausted(initialAnimals.length >= initialTotal)
  }, [initialAnimals, initialMaxDays, initialTotal])

  // ── Fetch next page ────────────────────────────────────────
  const fetchNext = useCallback(async () => {
    if (loading || exhausted) return
    setLoading(true)

    try {
      const res  = await fetch(buildApiUrl(sp, page))
      const data = await res.json() as DiscoveryFeedResult

      setAnimals((prev) => {
        const existingIds = new Set(prev.map((a) => a.id))
        const fresh = data.animals.filter((a) => !existingIds.has(a.id))
        return [...prev, ...fresh]
      })
      setMaxDays(data.maxDaysWaiting)
      setTotal(data.totalCount)
      setPage((p) => p + 1)

      if (data.animals.length < PAGE_SIZE) setExhausted(true)
    } catch (err) {
      console.error('Infinite scroll fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, exhausted, sp, page])

  // ── Intersection Observer — trigger when 3 cards from end ──
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || exhausted) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchNext() },
      { rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNext, exhausted])

  // ── Empty state ────────────────────────────────────────────
  if (animals.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <MilaapLogo variant="mark" className="opacity-20 scale-150" />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-stone font-light">
            No animals match your filters.
          </p>
          <p className="text-xs text-stone/60">
            Try removing some filters or check back soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/*
        MOBILE  (< md): scroll-snap, full-screen cards, single column
        DESKTOP (≥ md): normal 2-column grid, no snap
      */}
      <div
        className={[
          // Mobile: full-viewport scroll-snap container
          'md:hidden',
          'flex flex-col',
          'overflow-y-scroll',
          'snap-y snap-mandatory',
          '-mx-5',               // bleed to page edges
          'h-[100svh]',
          '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        ].join(' ')}
        aria-label="Animal discovery feed"
      >
        {animals.map((animal, index) => (
          <SnapCard
            key={animal.id}
            animal={animal}
            maxDaysWaiting={maxDays}
            isFirst={index === 0}
            featured={animal.is_featured}
          />
        ))}

        {/* Sentinel — fires infinite scroll */}
        {!exhausted && (
          <div ref={sentinelRef} className="snap-start shrink-0 h-4" aria-hidden="true" />
        )}

        {/* Loading skeletons inside snap container */}
        {loading && (
          <div className="snap-start shrink-0 h-[100svh] px-5 py-4 flex flex-col gap-3">
            <AnimalCardSkeleton />
          </div>
        )}

        {/* End of feed */}
        {exhausted && (
          <EndOfFeed total={total} />
        )}
      </div>

      {/* DESKTOP: 2-column grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-5">
        {animals.map((animal, index) => (
          <div key={animal.id} className="flex flex-col gap-1">
            {animal.is_featured && (
              <FeaturedLabel name={animal.name} />
            )}
            <AnimalCard
              animal={animal}
              maxDaysWaiting={maxDays}
              showScrollHint={index === 0}
            />
          </div>
        ))}

        {loading && Array.from({ length: 2 }).map((_, i) => (
          <AnimalCardSkeleton key={`sk-${i}`} />
        ))}
      </div>

      {/* Desktop sentinel */}
      {!exhausted && (
        <div className="hidden md:block" ref={exhausted ? undefined : sentinelRef} aria-hidden="true" />
      )}

      {/* Desktop end of feed */}
      {exhausted && (
        <div className="hidden md:block">
          <EndOfFeed total={total} />
        </div>
      )}
    </>
  )
}

// ── SnapCard — full-screen scroll-snap card for mobile ─────

function SnapCard({
  animal,
  maxDaysWaiting,
  isFirst,
  featured,
}: {
  animal: AnimalSummary
  maxDaysWaiting: number
  isFirst: boolean
  featured: boolean
}) {
  return (
    <div className="snap-start shrink-0 h-[100svh] px-5 py-4 flex flex-col">
      {featured && (
        <FeaturedLabel name={animal.name} />
      )}
      <div className="flex-1 min-h-0">
        <AnimalCard
          animal={animal}
          maxDaysWaiting={maxDaysWaiting}
          showScrollHint={isFirst}
          snapMode
        />
      </div>
    </div>
  )
}

// ── FeaturedLabel ──────────────────────────────────────────

function FeaturedLabel({ name }: { name: string }) {
  return (
    <p className="text-[10px] text-stone/70 italic text-center mb-1.5 select-none" aria-hidden="true">
      Most people scroll past animals like {name}.
    </p>
  )
}

// ── EndOfFeed ──────────────────────────────────────────────

function EndOfFeed({ total }: { total: number }) {
  return (
    <div className="snap-start shrink-0 flex flex-col items-center justify-center gap-4 py-16 md:py-12">
      <p className="text-sm text-stone text-center">
        You&rsquo;ve seen all {total} animal{total !== 1 ? 's' : ''}.
      </p>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="text-xs text-stone/60 hover:text-stone transition-colors underline underline-offset-2"
      >
        Back to top
      </button>
    </div>
  )
}
