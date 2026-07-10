'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { AnimalSpecies, AnimalSize } from '@/lib/animals'

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  cities: string[]
  totalCount: number
}

interface FilterState {
  species:  AnimalSpecies | ''
  size:     AnimalSize | ''
  kids:     boolean
  cats:     boolean
  apt:      boolean
  city:     string
}

function readFilters(sp: URLSearchParams): FilterState {
  return {
    species: (sp.get('species') ?? '') as AnimalSpecies | '',
    size:    (sp.get('size')    ?? '') as AnimalSize | '',
    kids:    sp.get('kids') === 'true',
    cats:    sp.get('cats') === 'true',
    apt:     sp.get('apt')  === 'true',
    city:    sp.get('city') ?? '',
  }
}

export function activeFilterCount(sp: URLSearchParams): number {
  let n = 0
  if (sp.get('species')) n++
  if (sp.get('size'))    n++
  if (sp.get('kids') === 'true') n++
  if (sp.get('cats') === 'true') n++
  if (sp.get('apt')  === 'true') n++
  if (sp.get('city'))    n++
  return n
}

export default function FilterSheet({
  open,
  onClose,
  cities,
  totalCount,
}: FilterSheetProps) {
  const router     = useRouter()
  const pathname   = usePathname()
  const sp         = useSearchParams()
  const [, startTransition] = useTransition()

  const [filters, setFilters] = useState<FilterState>(() => readFilters(sp))

  // Sync when URL changes externally
  useEffect(() => {
    setFilters(readFilters(sp))
  }, [sp])

  // Lock body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function apply() {
    const params = new URLSearchParams()
    if (filters.species) params.set('species', filters.species)
    if (filters.size)    params.set('size',    filters.size)
    if (filters.kids)    params.set('kids',    'true')
    if (filters.cats)    params.set('cats',    'true')
    if (filters.apt)     params.set('apt',     'true')
    if (filters.city)    params.set('city',    filters.city)

    const qs = params.toString()
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ''}`)
    })
    onClose()
  }

  function clear() {
    setFilters({ species: '', size: '', kids: false, cats: false, apt: false, city: '' })
    startTransition(() => { router.push(pathname) })
    onClose()
  }

  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setFilters((f) => ({ ...f, [k]: v }))

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Sheet — slides up on mobile, right panel on desktop */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter animals"
          className={[
            // Mobile: bottom sheet
            'absolute bottom-0 inset-x-0 bg-linen rounded-t-2xl',
            'max-h-[88svh] overflow-y-auto',
            // Desktop: right panel
            'md:inset-auto md:top-0 md:right-0 md:bottom-0 md:w-80',
            'md:rounded-none md:max-h-none',
            'shadow-[0_-8px_40px_rgba(45,41,38,0.16)] md:shadow-[-8px_0_40px_rgba(45,41,38,0.12)]',
            'transition-transform duration-300',
            open
              ? 'translate-y-0 md:translate-x-0'
              : 'translate-y-full md:translate-x-full',
          ].join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-charcoal/20" aria-hidden="true" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-linen-dark">
            <h2 className="text-sm font-semibold text-charcoal tracking-[0.02em]">Filter</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="text-stone hover:text-charcoal transition-colors p-1"
            >
              ✕
            </button>
          </div>

          <div className="px-5 py-5 flex flex-col gap-6">

            {/* ── Species ──────────────────────────────── */}
            <FilterGroup label="Species">
              <PillGroup
                options={[
                  { value: '',      label: 'All' },
                  { value: 'dog',   label: 'Dog' },
                  { value: 'cat',   label: 'Cat' },
                  { value: 'other', label: 'Other' },
                ]}
                value={filters.species}
                onChange={(v) => set('species', v as AnimalSpecies | '')}
              />
            </FilterGroup>

            {/* ── Size ─────────────────────────────────── */}
            <FilterGroup label="Size">
              <PillGroup
                options={[
                  { value: '',       label: 'All' },
                  { value: 'small',  label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large',  label: 'Large' },
                ]}
                value={filters.size}
                onChange={(v) => set('size', v as AnimalSize | '')}
              />
            </FilterGroup>

            {/* ── Toggles ───────────────────────────────── */}
            <FilterGroup label="Lifestyle">
              <div className="flex flex-col gap-3">
                <Toggle
                  label="Good with kids"
                  value={filters.kids}
                  onChange={(v) => set('kids', v)}
                />
                <Toggle
                  label="Good with cats"
                  value={filters.cats}
                  onChange={(v) => set('cats', v)}
                />
                <Toggle
                  label="Apartment friendly"
                  value={filters.apt}
                  onChange={(v) => set('apt', v)}
                />
              </div>
            </FilterGroup>

            {/* ── City ─────────────────────────────────── */}
            {cities.length > 0 && (
              <FilterGroup label="City / Organisation">
                <select
                  value={filters.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="w-full text-sm text-charcoal bg-white border border-linen-dark rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  aria-label="Filter by city"
                >
                  <option value="">All cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FilterGroup>
            )}
          </div>

          {/* ── Footer ───────────────────────────────── */}
          <div className="sticky bottom-0 bg-linen border-t border-linen-dark px-5 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={clear}
              className="text-sm text-stone hover:text-charcoal transition-colors shrink-0"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={apply}
              className="flex-1 bg-[#C46F52] text-white rounded-full py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors"
            >
              Show {totalCount} animal{totalCount !== 1 ? 's' : ''}
            </button>
          </div>

          {/* iOS safe area */}
          <div style={{ height: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-stone font-medium">{label}</p>
      {children}
    </div>
  )
}

interface PillGroupProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}

function PillGroup({ options, value, onChange }: PillGroupProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={[
            'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
            value === o.value
              ? 'bg-charcoal text-linen'
              : 'bg-linen-dark text-stone hover:bg-charcoal/10',
          ].join(' ')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between cursor-pointer select-none"
    >
      <span className="text-sm text-charcoal">{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          'relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0',
          value ? 'bg-[#C46F52]' : 'bg-linen-dark',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            value ? 'left-5' : 'left-1',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>
    </label>
  )
}
