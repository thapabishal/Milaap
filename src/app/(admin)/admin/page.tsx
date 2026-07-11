import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ReminderQueue from '@/components/admin/ReminderQueue'

// ─── types ────────────────────────────────────────────────
type Photo = { path: string; is_hero: boolean; caption?: string }

interface DashboardData {
  orgId: string
  stats: {
    published: number
    whatsappToday: number
    followupsDue: number
    totalAdoptions: number
  }
  reminders: {
    id: string
    adopter_name: string
    adopter_whatsapp: string
    reminder_type: '30day' | '6month' | 'custom'
    due_date: string
    message_en: string | null
    message_ne: string | null
    submission_token: string
    animal: { name: string; photos: Photo[] }
  }[]
  sentReminders: {
    id: string
    adopter_name: string
    adopter_whatsapp: string
    reminder_type: '30day' | '6month' | 'custom'
    due_date: string
    message_en: string | null
    message_ne: string | null
    submission_token: string
    sent_at: string
    animal: { name: string; photos: Photo[] }
  }[]
  pendingHappyTails: {
    id: string
    adopter_name: string
    created_at: string
    photo_url: string
    story_en: string
    animal: { name: string; photos: Photo[] }
  }[]
}

// ─── data fetching ────────────────────────────────────────
async function getDashboardData(): Promise<DashboardData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  // Get current user's org
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/admin/login')
  const orgId: string = profile.organization_id

  // Today boundaries
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const dueSoonCutoff = new Date()
  dueSoonCutoff.setDate(dueSoonCutoff.getDate() + 2)

  // Parallel queries
  const [
    publishedRes,
    whatsappRes,
    followupCountRes,
    adoptionsRes,
    remindersRes,
    sentRes,
    happyTailsRes,
  ] = await Promise.all([
    // Animals published
    supabase
      .from('animals')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_published', true),

    // WhatsApp taps today
    supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('event_type', 'whatsapp_tap')
      .gte('created_at', todayStart.toISOString()),

    // Follow-ups due (within next 2 days)
    supabase
      .from('followup_reminders')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .lte('due_date', dueSoonCutoff.toISOString().split('T')[0]),

    // Total adoptions
    supabase
      .from('animals')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'adopted'),

    // Pending reminders with animal details
    supabase
      .from('followup_reminders')
      .select(`
        id, adopter_name, adopter_whatsapp, reminder_type,
        due_date, message_en, message_ne, submission_token,
        animals ( name, photos )
      `)
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true }),

    // Recently sent reminders (last 10)
    supabase
      .from('followup_reminders')
      .select(`
        id, adopter_name, adopter_whatsapp, reminder_type,
        due_date, message_en, message_ne, submission_token, sent_at,
        animals ( name, photos )
      `)
      .eq('organization_id', orgId)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(10),

    // Pending happy tails
    supabase
      .from('happy_tails')
      .select(`
        id, adopter_name, created_at, photo_url, story_en,
        animals ( name, photos )
      `)
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
  ])

  function normaliseAnimal(raw: { name: string; photos: Photo[] } | Photo[] | null | undefined): { name: string; photos: Photo[] } {
    if (!raw) return { name: 'Unknown', photos: [] }
    if (Array.isArray(raw)) return { name: 'Unknown', photos: raw }
    return { name: raw.name, photos: Array.isArray(raw.photos) ? raw.photos : [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reminders = (remindersRes.data ?? []).map((r: any) => ({
    ...r,
    animal: normaliseAnimal(r.animals),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sentReminders = (sentRes.data ?? []).map((r: any) => ({
    ...r,
    animal: normaliseAnimal(r.animals),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingHappyTails = (happyTailsRes.data ?? []).map((h: any) => ({
    ...h,
    animal: normaliseAnimal(h.animals),
  }))

  return {
    orgId,
    stats: {
      published: publishedRes.count ?? 0,
      whatsappToday: whatsappRes.count ?? 0,
      followupsDue: followupCountRes.count ?? 0,
      totalAdoptions: adoptionsRes.count ?? 0,
    },
    reminders,
    sentReminders,
    pendingHappyTails,
  }
}

// ─── stat box ─────────────────────────────────────────────
function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white border border-linen-dark rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[88px]">
      <span className="text-[28px] font-bold text-terracotta font-satoshi leading-none">
        {value}
      </span>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">
        {label}
      </span>
    </div>
  )
}

// ─── happy tail card ──────────────────────────────────────
function HappyTailCard({
  id,
  adopter_name,
  created_at,
  photo_url,
  story_en,
  animal,
  supabaseUrl,
}: {
  id: string
  adopter_name: string
  created_at: string
  photo_url: string
  story_en: string
  animal: { name: string; photos: Photo[] }
  supabaseUrl: string
}) {
  const submittedDaysAgo = Math.floor(
    (Date.now() - new Date(created_at).getTime()) / 86400000
  )
  const submittedLabel =
    submittedDaysAgo === 0
      ? 'Today'
      : submittedDaysAgo === 1
      ? 'Yesterday'
      : `${submittedDaysAgo} days ago`

  const thumbUrl = photo_url
    ? `${supabaseUrl}/storage/v1/object/public/animal-photos/${photo_url}`
    : null

  return (
    <div className="bg-white border border-linen-dark rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)] flex gap-0">
      {/* Photo */}
      <div className="w-20 flex-shrink-0 bg-linen">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={animal.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-stone/20">🐾</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-charcoal text-sm font-satoshi">{animal.name}</p>
            <p className="text-[11px] text-stone">{adopter_name} · {submittedLabel}</p>
          </div>
          <Link
            href={`/admin/happy-tails/${id}`}
            className="flex-shrink-0 bg-transparent text-stone border border-linen-dark rounded-full px-3 py-1.5 text-[11px] tracking-[0.04em] hover:border-charcoal/20 transition-colors whitespace-nowrap"
          >
            Review →
          </Link>
        </div>
        <p className="mt-2 text-[12px] text-stone leading-relaxed line-clamp-2">
          {story_en}
        </p>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const data = await getDashboardData()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  return (
    <div className="px-5 md:px-8 py-6 max-w-3xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
          Dashboard
        </h1>
        <p className="text-[13px] text-stone mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Impact stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatBox value={data.stats.published} label="Animals published" />
        <StatBox value={data.stats.whatsappToday} label="WhatsApp taps today" />
        <StatBox value={data.stats.followupsDue} label="Follow-ups due" />
        <StatBox value={data.stats.totalAdoptions} label="Total adoptions" />
      </div>

      {/* ── Follow-up reminder queue ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-satoshi font-semibold text-base text-charcoal">
            Follow-up Reminders
          </h2>
          {data.reminders.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium bg-linen border border-linen-dark rounded-full px-2 py-1">
              {data.reminders.length} pending
            </span>
          )}
        </div>

        <ReminderQueue
          initialReminders={data.reminders}
          initialSent={data.sentReminders}
          supabaseUrl={supabaseUrl}
        />
      </section>

      {/* ── Happy Tails pending ── */}
      {data.pendingHappyTails.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-satoshi font-semibold text-base text-charcoal">
              Happy Tails
            </h2>
            <span className="text-[10px] uppercase tracking-[0.08em] text-terracotta font-medium bg-terracotta/8 border border-terracotta/20 rounded-full px-2 py-1">
              {data.pendingHappyTails.length} pending approval
            </span>
          </div>

          <div className="space-y-3">
            {data.pendingHappyTails.map((ht) => (
              <HappyTailCard
                key={ht.id}
                id={ht.id}
                adopter_name={ht.adopter_name}
                created_at={ht.created_at}
                photo_url={ht.photo_url}
                story_en={ht.story_en}
                animal={ht.animal}
                supabaseUrl={supabaseUrl}
              />
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/admin/happy-tails"
              className="text-[12px] text-stone hover:text-charcoal transition-colors"
            >
              View all happy tails →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
