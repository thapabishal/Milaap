import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HappyTailsGrid, { type HappyTail } from '@/components/public/HappyTailsGrid'

export const metadata: Metadata = {
  title: 'Happy Tails — Animals Who Found Their Home | Milaap Nepal',
  description: 'Real stories of animals rescued in Nepal who found their forever families through Milaap. Every story here proves that waiting ends.',
  openGraph: {
    title: 'Happy Tails | Milaap Nepal',
    description: 'Real adoption stories from Nepal. Every animal here waited — and was found.',
    siteName: 'Milaap Nepal',
  },
  alternates: { canonical: 'https://milaap.dpdns.org/happy-tails' },
}

interface Stats {
  totalAdoptions: number
  organizations: number
  avgDaysWaited: number
  citiesReached: number
}

async function getData(): Promise<{ happyTails: HappyTail[]; stats: Stats }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data, error } = await supabase
    .from('happy_tails')
    .select(`
      id, adopter_name, adopter_city, story_en,
      photo_url, shelter_photo_url,
      days_waited, approved_at,
      animals ( name, species, intake_date, adopted_date ),
      organizations ( name, city )
    `)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })

  if (error) {
    console.error('Happy tails fetch error:', error.message)
    return { happyTails: [], stats: { totalAdoptions: 0, organizations: 0, avgDaysWaited: 0, citiesReached: 0 } }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[]

  const happyTails: HappyTail[] = rows.map((r) => ({
    id:               r.id,
    adopter_name:     r.adopter_name,
    adopter_city:     r.adopter_city ?? null,
    story_en:         r.story_en,
    photo_url:        r.photo_url,
    shelter_photo_url: r.shelter_photo_url ?? null,
    days_waited:      r.days_waited ?? null,
    approved_at:      r.approved_at,
    animal: {
      name:         r.animals?.name ?? 'Unknown',
      species:      r.animals?.species ?? 'other',
      intake_date:  r.animals?.intake_date ?? '',
      adopted_date: r.animals?.adopted_date ?? null,
    },
    organization: {
      name: r.organizations?.name ?? '',
      city: r.organizations?.city ?? '',
    },
  }))

  // Compute stats
  const orgIds    = new Set(rows.map((r) => r.organizations?.name).filter(Boolean))
  const cities    = new Set(rows.map((r) => r.adopter_city).filter(Boolean))
  const waited    = rows.map((r) => r.days_waited).filter((d): d is number => typeof d === 'number')
  const avgWaited = waited.length
    ? Math.round(waited.reduce((a, b) => a + b, 0) / waited.length)
    : 0

  return {
    happyTails,
    stats: {
      totalAdoptions: rows.length,
      organizations:  orgIds.size,
      avgDaysWaited:  avgWaited,
      citiesReached:  cities.size,
    },
  }
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-4">
      <span className="font-satoshi font-bold text-3xl text-terracotta leading-none">{value}</span>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">{label}</span>
    </div>
  )
}

export default async function HappyTailsPage() {
  const { happyTails, stats } = await getData()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  return (
    <div className="min-h-screen bg-linen">
      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.12em] text-dusty-rose font-medium mb-4">
          Happy Tails
        </p>
        <h1 className="font-satoshi font-bold text-4xl md:text-5xl text-charcoal leading-tight tracking-[-0.02em] mb-4">
          They found their home.<br />Because someone looked.
        </h1>
        <p className="text-base text-stone leading-relaxed max-w-xl mx-auto">
          Every story here is proof that waiting ends.
        </p>
      </section>

      {/* ── Impact bar ── */}
      <section className="max-w-4xl mx-auto px-5 mb-12">
        <div className="bg-white border border-linen-dark rounded-2xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-linen-dark shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
          <StatPill value={stats.totalAdoptions} label="Adoptions" />
          <StatPill value={stats.organizations}  label="Organizations" />
          <StatPill value={`${stats.avgDaysWaited}d`} label="Avg days waited" />
          <StatPill value={stats.citiesReached}  label="Cities reached" />
        </div>
      </section>

      {/* ── Stories ── */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <HappyTailsGrid happyTails={happyTails} supabaseUrl={supabaseUrl} />
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-linen-dark bg-white py-14 text-center px-5">
        <p className="text-sm text-stone mb-2">Someone is still waiting.</p>
        <h2 className="font-satoshi font-bold text-2xl text-charcoal mb-5">
          See who&apos;s waiting now.
        </h2>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 bg-terracotta text-white rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)]"
        >
          Meet the animals waiting →
        </Link>
      </section>
    </div>
  )
}
