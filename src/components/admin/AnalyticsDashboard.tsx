'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────
export interface AnimalStat {
  id: string
  name: string
  slug: string
  status: string
  days_waiting: number
  photo_path: string | null
  views: number
  taps: number
}

export interface SourceStat {
  source: string
  count: number
}

export interface AnalyticsPayload {
  views: number
  taps: number
  happyTailsSubmitted: number
  animalStats: AnimalStat[]
  sources: SourceStat[]
  adoptions: number
  avgDaysAtAdoption: number | null
  longestWaiting: { id: string; name: string; days: number } | null
}

export type RangeKey = '7d' | '30d' | 'all'

interface Props {
  data: Record<RangeKey, AnalyticsPayload>
  supabaseUrl: string
}

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d',  label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
]

// ── Helpers ───────────────────────────────────────────────
function pct(num: number, den: number): string {
  if (den === 0) return '0%'
  return `${((num / den) * 100).toFixed(1)}%`
}

function tapRateColor(rate: number): string {
  if (rate >= 20) return 'text-sage font-semibold'
  if (rate >= 10) return 'text-stone'
  return 'text-dusty-rose'
}

function tapRateBg(rate: number): string {
  if (rate >= 20) return 'bg-sage'
  if (rate >= 10) return 'bg-stone/40'
  return 'bg-dusty-rose'
}

function photoUrl(path: string | null, supabaseUrl: string): string | null {
  if (!path) return null
  return `${supabaseUrl}/storage/v1/object/public/animal-photos/${path}`
}

// ── Stat box ──────────────────────────────────────────────
function StatBox({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="bg-white border border-linen-dark rounded-xl p-5 flex flex-col items-center justify-center text-center">
      <span className="text-[28px] font-bold text-terracotta font-satoshi leading-none">{value}</span>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">{label}</span>
      {sub && <span className="mt-1 text-[11px] text-stone/60">{sub}</span>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function AnalyticsDashboard({ data, supabaseUrl }: Props) {
  const [range, setRange] = useState<RangeKey>('30d')
  const d = data[range]

  const tapRate = d.views > 0 ? (d.taps / d.views) * 100 : 0
  const totalSources = d.sources.reduce((s, x) => s + x.count, 0)

  // Sort animals: tap rate desc, then by views desc for 0-tap animals
  const sortedAnimals = [...d.animalStats].sort((a, b) => {
    const ra = a.views > 0 ? a.taps / a.views : 0
    const rb = b.views > 0 ? b.taps / b.views : 0
    if (rb !== ra) return rb - ra
    return b.views - a.views
  })

  return (
    <div className="space-y-8">

      {/* ── Time range selector ── */}
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={[
              'px-4 py-2 rounded-full text-sm transition-colors border',
              range === r.key
                ? 'bg-charcoal text-linen border-charcoal'
                : 'bg-white text-stone border-linen-dark hover:border-charcoal/20',
            ].join(' ')}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Overview stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox value={d.views.toLocaleString()}  label="Profile views" />
        <StatBox value={d.taps.toLocaleString()}   label="WhatsApp taps" />
        <StatBox
          value={`${tapRate.toFixed(1)}%`}
          label="Tap rate"
          sub="taps ÷ views"
        />
        <StatBox value={d.happyTailsSubmitted} label="Stories submitted" />
      </div>

      {/* ── Animal performance table ── */}
      <section>
        <h2 className="font-satoshi font-semibold text-base text-charcoal mb-3">
          Animal performance
        </h2>
        <div className="bg-white border border-linen-dark rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
          {sortedAnimals.length === 0 ? (
            <p className="p-8 text-center text-sm text-stone">No data yet for this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-linen-dark">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium w-10" />
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Views</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Taps</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Tap Rate</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium hidden sm:table-cell">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {sortedAnimals.map((a, i) => {
                  const aRate = a.views > 0 ? (a.taps / a.views) * 100 : 0
                  const needsAttention = a.views >= 10 && a.taps === 0
                  const thumb = photoUrl(a.photo_path, supabaseUrl)
                  return (
                    <tr
                      key={a.id}
                      className={[
                        'transition-colors hover:bg-linen/50',
                        i < sortedAnimals.length - 1 ? 'border-b border-linen-dark' : '',
                        needsAttention ? 'bg-dusty-rose/5' : '',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-linen flex-shrink-0">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt={a.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone/30 text-base">🐾</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-charcoal font-satoshi">{a.name}</p>
                        <p className="text-[11px] text-stone capitalize">{a.status.replace('_', ' ')}</p>
                        {needsAttention && (
                          <p className="text-[10px] text-dusty-rose mt-0.5">↑ Needs a better story</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone tabular-nums">{a.views}</td>
                      <td className="px-4 py-3 text-stone tabular-nums">{a.taps}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-linen-dark rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${tapRateBg(aRate)}`}
                              style={{ width: `${Math.min(100, aRate * 3)}%` }}
                            />
                          </div>
                          <span className={`text-xs tabular-nums ${tapRateColor(aRate)}`}>
                            {aRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone tabular-nums hidden sm:table-cell">
                        {a.days_waiting}d
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-[11px] text-stone mt-2">
          Sorted by tap rate. Highlighted rows have many views but zero taps — they need story improvements.
        </p>
      </section>

      {/* ── Traffic sources ── */}
      <section>
        <h2 className="font-satoshi font-semibold text-base text-charcoal mb-3">
          Traffic sources
        </h2>
        <div className="bg-white border border-linen-dark rounded-xl p-5 space-y-3 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
          {d.sources.length === 0 ? (
            <p className="text-sm text-stone text-center py-4">No source data yet.</p>
          ) : (
            d.sources
              .sort((a, b) => b.count - a.count)
              .map((s) => {
                const widthPct = totalSources > 0 ? (s.count / totalSources) * 100 : 0
                return (
                  <div key={s.source} className="flex items-center gap-3">
                    <span className="text-[11px] uppercase tracking-[0.06em] text-stone font-medium w-16 flex-shrink-0 capitalize">
                      {s.source}
                    </span>
                    <div className="flex-1 h-2 bg-linen-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terracotta rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-stone tabular-nums w-20 text-right flex-shrink-0">
                      {s.count.toLocaleString()} ({widthPct.toFixed(0)}%)
                    </span>
                  </div>
                )
              })
          )}
        </div>
      </section>

      {/* ── Adoption funnel ── */}
      <section>
        <h2 className="font-satoshi font-semibold text-base text-charcoal mb-3">
          Adoption funnel
        </h2>
        <div className="bg-white border border-linen-dark rounded-xl p-5 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex flex-col items-center px-4 py-3 bg-linen rounded-xl border border-linen-dark">
              <span className="font-satoshi font-bold text-2xl text-charcoal">{d.views.toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-[0.06em] text-stone mt-1">Views</span>
            </div>

            <div className="text-stone text-lg px-1">→</div>

            <div className="flex flex-col items-center px-4 py-3 bg-linen rounded-xl border border-linen-dark">
              <span className="font-satoshi font-bold text-2xl text-terracotta">{d.taps.toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-[0.06em] text-stone mt-1">WA taps</span>
              <span className="text-[10px] text-stone/60">{pct(d.taps, d.views)} conversion</span>
            </div>

            <div className="text-stone text-lg px-1">→</div>

            <div className="flex flex-col items-center px-4 py-3 bg-linen rounded-xl border border-linen-dark">
              <span className="font-satoshi font-bold text-2xl text-sage">{d.adoptions}</span>
              <span className="text-[10px] uppercase tracking-[0.06em] text-stone mt-1">Adoptions</span>
              <span className="text-[10px] text-stone/60">{pct(d.adoptions, d.taps)} of taps</span>
            </div>
          </div>

          <p className="mt-4 text-[12px] text-stone">
            {d.views} views → {d.taps} taps ({pct(d.taps, d.views)}) → {d.adoptions} adoptions ({pct(d.adoptions, d.taps)} of taps)
          </p>
        </div>
      </section>

      {/* ── Waiting time insight ── */}
      <section>
        <h2 className="font-satoshi font-semibold text-base text-charcoal mb-3">
          Waiting time
        </h2>
        <div className="bg-white border border-linen-dark rounded-xl p-5 space-y-3 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-dusty-rose/15 flex items-center justify-center text-lg flex-shrink-0">
              ⏳
            </div>
            <div>
              <p className="text-sm text-charcoal">
                <span className="font-semibold">Average waiting time at adoption:</span>{' '}
                {d.avgDaysAtAdoption !== null
                  ? <span className="text-terracotta font-bold">{d.avgDaysAtAdoption} days</span>
                  : <span className="text-stone">No adoptions yet</span>}
              </p>
            </div>
          </div>

          {d.longestWaiting && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center text-lg flex-shrink-0">
                🐾
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-charcoal">
                  <span className="font-semibold">Longest currently waiting:</span>{' '}
                  <span className="text-terracotta font-bold">{d.longestWaiting.name}</span>
                  {', '}
                  <span className="font-semibold">{d.longestWaiting.days} days</span>
                </p>
              </div>
              <Link
                href={`/admin/animals/${d.longestWaiting.id}`}
                className="flex-shrink-0 text-[12px] text-terracotta hover:text-[#B05A3E] transition-colors font-medium"
              >
                Edit profile →
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
