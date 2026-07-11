import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalyticsDashboard, {
  type AnalyticsPayload,
  type RangeKey,
} from '@/components/admin/AnalyticsDashboard'

export const metadata: Metadata = {
  title: 'Analytics — Milaap Admin',
}

// ── Date helpers ─────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function rangeStart(key: RangeKey): string | null {
  if (key === '7d')  return daysAgo(7)
  if (key === '30d') return daysAgo(30)
  return null
}

// ── Build payload for one time range ─────────────────────
async function buildPayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  key: RangeKey
): Promise<AnalyticsPayload> {
  const since = rangeStart(key)

  // ── Analytics events ─────────────────────────────────
  let eventsQuery = supabase
    .from('analytics_events')
    .select('event_type, source, animal_id')
    .eq('organization_id', orgId)

  if (since) eventsQuery = eventsQuery.gte('created_at', since)

  // ── Happy tails submitted ────────────────────────────
  let htQuery = supabase
    .from('happy_tails')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  if (since) htQuery = htQuery.gte('created_at', since)

  // ── Animals for this org (all — for performance table) ─
  const animalsQuery = supabase
    .from('animals')
    .select('id, name, slug, status, intake_date, photos, adopted_date')
    .eq('organization_id', orgId)

  // ── Adoptions in period ──────────────────────────────
  let adoptionsQuery = supabase
    .from('animals')
    .select('id, intake_date, adopted_date', { count: 'exact' })
    .eq('organization_id', orgId)
    .eq('status', 'adopted')

  if (since) adoptionsQuery = adoptionsQuery.gte('adopted_date', since.split('T')[0])

  const [eventsRes, htRes, animalsRes, adoptionsRes] = await Promise.all([
    eventsQuery,
    htQuery,
    animalsQuery,
    adoptionsQuery,
  ])

  // ── Process events ───────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events: { event_type: string; source: string; animal_id: string }[] = eventsRes.data ?? []

  const views = events.filter((e) => e.event_type === 'profile_view').length
  const taps  = events.filter((e) => e.event_type === 'whatsapp_tap').length

  // Source counts (all event types)
  const sourceMap: Record<string, number> = {}
  for (const e of events) {
    sourceMap[e.source] = (sourceMap[e.source] ?? 0) + 1
  }
  const sources = Object.entries(sourceMap).map(([source, count]) => ({ source, count }))

  // Per-animal tap/view counts
  const viewsByAnimal: Record<string, number> = {}
  const tapsByAnimal:  Record<string, number> = {}
  for (const e of events) {
    if (!e.animal_id) continue
    if (e.event_type === 'profile_view')  viewsByAnimal[e.animal_id] = (viewsByAnimal[e.animal_id] ?? 0) + 1
    if (e.event_type === 'whatsapp_tap')  tapsByAnimal[e.animal_id]  = (tapsByAnimal[e.animal_id]  ?? 0) + 1
  }

  // ── Build animal stats ───────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animalStats = ((animalsRes.data ?? []) as any[]).map((a) => {
    const intake = new Date(a.intake_date)
    intake.setHours(0, 0, 0, 0)
    const days_waiting = Math.max(0, Math.floor((today.getTime() - intake.getTime()) / 86400000))

    type Photo = { path: string; is_hero: boolean }
    const photos: Photo[] = Array.isArray(a.photos) ? a.photos : []
    const hero = photos.find((p) => p.is_hero) ?? photos[0]

    return {
      id:          a.id,
      name:        a.name,
      slug:        a.slug,
      status:      a.status,
      days_waiting,
      photo_path:  hero?.path ?? null,
      views:       viewsByAnimal[a.id] ?? 0,
      taps:        tapsByAnimal[a.id]  ?? 0,
    }
  })

  // ── Waiting time insight ─────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adoptedAnimals: any[] = adoptionsRes.data ?? []
  let avgDaysAtAdoption: number | null = null

  if (adoptedAnimals.length > 0) {
    const daysArr = adoptedAnimals
      .filter((a) => a.intake_date && a.adopted_date)
      .map((a) => {
        const intake  = new Date(a.intake_date)
        const adopted = new Date(a.adopted_date)
        return Math.max(0, Math.floor((adopted.getTime() - intake.getTime()) / 86400000))
      })
    if (daysArr.length > 0) {
      avgDaysAtAdoption = Math.round(daysArr.reduce((s, d) => s + d, 0) / daysArr.length)
    }
  }

  // Longest currently waiting (available, not adopted)
  const active = animalStats
    .filter((a) => ['available', 'reserved', 'fostered', 'medical_hold'].includes(a.status))
    .sort((a, b) => b.days_waiting - a.days_waiting)

  const longestWaiting = active.length > 0
    ? { id: active[0].id, name: active[0].name, days: active[0].days_waiting }
    : null

  return {
    views,
    taps,
    happyTailsSubmitted: htRes.count ?? 0,
    animalStats,
    sources,
    adoptions: adoptionsRes.count ?? 0,
    avgDaysAtAdoption,
    longestWaiting,
  }
}

// ── Page ─────────────────────────────────────────────────
export default async function AdminAnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.organization_id) redirect('/admin/login')
  const orgId: string = profile.organization_id

  // Fetch all three ranges in parallel
  const [p7d, p30d, pAll] = await Promise.all([
    buildPayload(supabase, orgId, '7d'),
    buildPayload(supabase, orgId, '30d'),
    buildPayload(supabase, orgId, 'all'),
  ])

  const data: Record<RangeKey, AnalyticsPayload> = {
    '7d':  p7d,
    '30d': p30d,
    'all': pAll,
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">Analytics</h1>
        <p className="text-[13px] text-stone mt-0.5">Performance data for your organisation</p>
      </div>

      <AnalyticsDashboard data={data} supabaseUrl={supabaseUrl} />
    </div>
  )
}
