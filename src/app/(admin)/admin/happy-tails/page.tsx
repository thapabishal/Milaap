import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HappyTailsManager, { type HappyTailRow } from '@/components/admin/HappyTailsManager'

export const metadata: Metadata = {
  title: 'Happy Tails — Milaap Admin',
}

async function getData(): Promise<{
  rows: HappyTailRow[]
  currentUserId: string
}> {
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

  const { data, error } = await supabase
    .from('happy_tails')
    .select(`
      id, adopter_name, adopter_city, story_en,
      photo_url, shelter_photo_url,
      days_waited, created_at, approved_at,
      rejection_reason, status,
      animals ( id, name, slug, species ),
      organizations ( id, name )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Happy tails admin fetch:', error.message)
    return { rows: [], currentUserId: user.id }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: HappyTailRow[] = (data ?? []).map((r: any) => ({
    id:               r.id,
    adopter_name:     r.adopter_name,
    adopter_city:     r.adopter_city ?? null,
    story_en:         r.story_en,
    photo_url:        r.photo_url,
    shelter_photo_url: r.shelter_photo_url ?? null,
    days_waited:      r.days_waited ?? null,
    created_at:       r.created_at,
    approved_at:      r.approved_at ?? null,
    rejection_reason: r.rejection_reason ?? null,
    status:           r.status,
    animal: {
      id:      r.animals?.id ?? '',
      name:    r.animals?.name ?? 'Unknown',
      slug:    r.animals?.slug ?? '',
      species: r.animals?.species ?? 'other',
    },
    organization: {
      id:   r.organizations?.id ?? '',
      name: r.organizations?.name ?? '',
    },
  }))

  return { rows, currentUserId: user.id }
}

export default async function AdminHappyTailsPage() {
  const { rows, currentUserId } = await getData()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const pending  = rows.filter((r) => r.status === 'pending').length
  const approved = rows.filter((r) => r.status === 'approved').length

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
            Happy Tails
          </h1>
          <p className="text-[13px] text-stone mt-0.5">
            {pending > 0
              ? `${pending} pending review · ${approved} published`
              : `${approved} published stories`}
          </p>
        </div>
      </div>

      <HappyTailsManager
        initialRows={rows}
        currentUserId={currentUserId}
        supabaseUrl={supabaseUrl}
      />
    </div>
  )
}
