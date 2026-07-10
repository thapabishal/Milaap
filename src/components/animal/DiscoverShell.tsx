'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DiscoveryFeed from '@/components/animal/DiscoveryFeed'
import FilterSheet, { activeFilterCount } from '@/components/animal/FilterSheet'
import type { AnimalSummary } from '@/lib/animals'

interface DiscoverShellProps {
  initialAnimals: AnimalSummary[]
  initialMaxDays: number
  initialTotal: number
  cities: string[]
  searchParams: Record<string, string | undefined>
}

export default function DiscoverShell({
  initialAnimals,
  initialMaxDays,
  initialTotal,
  cities,
  searchParams,
}: DiscoverShellProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const sp = useSearchParams()
  const filterCount = activeFilterCount(sp)

  return (
    <>
      {/* ── Page header ───────────────────────────────────── */}
      <div className="px-5 md:px-7 max-w-[680px] mx-auto pt-8 pb-4 flex items-end justify-between">
        <div>
          <h1 className="font-satoshi font-bold text-[28px] tracking-[-0.02em] text-charcoal leading-tight">
            Find a companion
          </h1>
          <p className="mt-1 text-sm text-stone font-light">
            Sorted by longest waiting — every day matters.
          </p>
        </div>

        {/* Filter button */}
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          aria-label={filterCount > 0 ? `Filters active: ${filterCount}` : 'Open filters'}
          className={[
            'shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors',
            filterCount > 0
              ? 'bg-charcoal text-linen'
              : 'bg-white border border-linen-dark text-stone hover:border-charcoal/20',
          ].join(' ')}
        >
          <span>Filter</span>
          {filterCount > 0 && (
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-terracotta text-white text-[9px] font-bold"
              aria-hidden="true"
            >
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Feed ──────────────────────────────────────────── */}
      {/* Mobile: feed bleeds to edges (DiscoveryFeed handles -mx-5 internally)  */}
      {/* Desktop: constrained in grid with standard padding                     */}
      <div className="md:px-7 md:max-w-[680px] md:mx-auto md:pb-16">
        <DiscoveryFeed
          initialAnimals={initialAnimals}
          initialMaxDays={initialMaxDays}
          initialTotal={initialTotal}
        />
      </div>

      {/* ── Filter sheet ──────────────────────────────────── */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        cities={cities}
        totalCount={initialTotal}
      />
    </>
  )
}
