'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import AnimalStatusDropdown from './AnimalStatusDropdown'

type AnimalStatus = 'available' | 'reserved' | 'fostered' | 'medical_hold' | 'adopted'
type Species = 'dog' | 'cat' | 'rabbit' | 'other'
type Gender = 'male' | 'female' | 'unknown'

interface Animal {
  id: string
  name: string
  species: Species
  gender: Gender
  status: AnimalStatus
  days_waiting: number
  whatsapp_taps: number
  updated_at: string
  photos: { path: string; is_hero: boolean; caption?: string }[]
  adopted_by_name: string | null
  adopted_by_city: string | null
}

interface Props {
  animals: Animal[]
  supabaseUrl: string
}

const STATUS_FILTERS = [
  { value: 'all',          label: 'All' },
  { value: 'available',    label: 'Available' },
  { value: 'reserved',     label: 'Reserved' },
  { value: 'fostered',     label: 'Fostered' },
  { value: 'medical_hold', label: 'Medical Hold' },
  { value: 'adopted',      label: 'Adopted' },
] as const

const SPECIES_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
] as const

function daysColor(days: number): string {
  if (days > 180) return 'text-terracotta font-semibold'
  if (days > 90)  return 'text-dusty-rose font-medium'
  return 'text-stone'
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30)  return `${days} days ago`
  const months = Math.floor(days / 30)
  return `${months} mo ago`
}

function heroUrl(photos: Animal['photos'], supabaseUrl: string): string | null {
  const hero = photos.find((p) => p.is_hero) ?? photos[0]
  if (!hero) return null
  return `${supabaseUrl}/storage/v1/object/public/animal-photos/${hero.path}`
}

const speciesEmoji: Record<Species, string> = {
  dog: '🐕', cat: '🐈', rabbit: '🐇', other: '🐾',
}

export default function AnimalsTable({ animals: initial, supabaseUrl }: Props) {
  const [animals, setAnimals] = useState<Animal[]>(initial)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [speciesFilter, setSpeciesFilter] = useState<string>('all')

  // Summary counts
  const totalPublished = animals.length
  const totalAvailable = animals.filter((a) => a.status === 'available').length
  const totalAdopted   = animals.filter((a) => a.status === 'adopted').length

  const filtered = useMemo(() => {
    return animals.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (speciesFilter !== 'all' && a.species !== speciesFilter) return false
      return true
    })
  }, [animals, search, statusFilter, speciesFilter])

  function handleStatusChanged(
    id: string,
    newStatus: AnimalStatus,
    extra?: { adopted_by_name?: string; adopted_by_city?: string; adopter_whatsapp?: string }
  ) {
    setAnimals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: newStatus,
              adopted_by_name: extra?.adopted_by_name ?? a.adopted_by_name,
              adopted_by_city: extra?.adopted_by_city ?? a.adopted_by_city,
            }
          : a
      )
    )
  }

  return (
    <div>
      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-linen-dark rounded-full text-charcoal placeholder:text-stone/50 focus:outline-none focus:border-terracotta/40 transition-colors"
          />
        </div>

        {/* Species pills */}
        <div className="flex gap-1.5 flex-wrap">
          {SPECIES_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSpeciesFilter(f.value)}
              className={[
                'px-3 py-1.5 rounded-full text-xs tracking-[0.04em] transition-colors border',
                speciesFilter === f.value
                  ? 'bg-charcoal text-linen border-charcoal'
                  : 'bg-white text-stone border-linen-dark hover:border-charcoal/20',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={[
              'px-3 py-1.5 rounded-full text-[11px] tracking-[0.04em] transition-colors border',
              statusFilter === f.value
                ? 'bg-charcoal text-linen border-charcoal'
                : 'bg-white text-stone border-linen-dark hover:border-charcoal/20',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary line */}
      <p className="text-[11px] text-stone mb-3 uppercase tracking-[0.06em] font-medium">
        {totalPublished} animals · {totalAvailable} available · {totalAdopted} adopted
        {filtered.length !== animals.length && (
          <span className="ml-1 normal-case tracking-normal text-stone/60">
            — showing {filtered.length}
          </span>
        )}
      </p>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white border border-linen-dark rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-linen-dark">
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium w-10" />
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Name</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Status</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Waiting</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">WA taps</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Updated</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-stone text-sm">
                  No animals match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((animal, i) => {
                const photo = heroUrl(animal.photos, supabaseUrl)
                return (
                  <tr
                    key={animal.id}
                    className={[
                      'transition-colors hover:bg-linen/50',
                      i < filtered.length - 1 ? 'border-b border-linen-dark' : '',
                    ].join(' ')}
                  >
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-linen flex-shrink-0 flex items-center justify-center">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={animal.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base">{speciesEmoji[animal.species]}</span>
                        )}
                      </div>
                    </td>

                    {/* Name + species/gender */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-charcoal font-satoshi">{animal.name}</p>
                      <p className="text-[11px] text-stone capitalize">
                        {animal.species} · {animal.gender}
                      </p>
                    </td>

                    {/* Status badge — clickable */}
                    <td className="px-4 py-3">
                      <AnimalStatusDropdown
                        animalId={animal.id}
                        current={animal.status}
                        onChanged={handleStatusChanged}
                      />
                    </td>

                    {/* Days waiting */}
                    <td className="px-4 py-3">
                      <span className={`tabular-nums ${daysColor(animal.days_waiting)}`}>
                        {animal.days_waiting}d
                      </span>
                    </td>

                    {/* WA taps */}
                    <td className="px-4 py-3 text-stone tabular-nums">
                      {animal.whatsapp_taps}
                    </td>

                    {/* Last updated */}
                    <td className="px-4 py-3 text-stone text-[12px]">
                      {relativeTime(animal.updated_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/animals/${animal.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone hover:bg-linen hover:text-charcoal transition-colors"
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 2.5a1.5 1.5 0 012.122 2.122L5.5 12.743l-3 .757.757-3L11.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/animals/${animal.id}/qr`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone hover:bg-linen hover:text-charcoal transition-colors"
                          title="QR code"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <rect x="1.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
                            <rect x="9.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
                            <rect x="1.5" y="9.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
                            <path d="M9.5 9.5h2v2h-2v2h2m2-4v2h-2m2 2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-stone text-sm py-10">No animals match your filters.</p>
        ) : (
          filtered.map((animal) => {
            const photo = heroUrl(animal.photos, supabaseUrl)
            return (
              <div
                key={animal.id}
                className="bg-white border border-linen-dark rounded-xl shadow-[0_1px_3px_rgba(45,41,38,0.06)] p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Thumb */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-linen flex-shrink-0 flex items-center justify-center">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={animal.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{speciesEmoji[animal.species]}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-charcoal font-satoshi">{animal.name}</p>
                        <p className="text-[11px] text-stone capitalize">{animal.species} · {animal.gender}</p>
                      </div>
                      <AnimalStatusDropdown
                        animalId={animal.id}
                        current={animal.status}
                        onChanged={handleStatusChanged}
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-stone flex-wrap">
                      <span className={daysColor(animal.days_waiting)}>
                        {animal.days_waiting}d waiting
                      </span>
                      <span>💬 {animal.whatsapp_taps}</span>
                      <span>{relativeTime(animal.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-linen-dark">
                  <Link
                    href={`/admin/animals/${animal.id}`}
                    className="flex-1 text-center py-2 text-xs font-medium text-stone border border-linen-dark rounded-full hover:border-charcoal/20 transition-colors"
                  >
                    ✏️ Edit
                  </Link>
                  <Link
                    href={`/admin/animals/${animal.id}/qr`}
                    className="flex-1 text-center py-2 text-xs font-medium text-stone border border-linen-dark rounded-full hover:border-charcoal/20 transition-colors"
                  >
                    QR Code
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
