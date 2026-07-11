import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnimalsTable from '@/components/admin/AnimalsTable'

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

async function getAnimals(): Promise<{ animals: Animal[]; orgId: string }> {
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

  // Fetch animals with computed days_waiting + analytics tap count
  // RLS ensures only this org's animals are returned
  const { data: rows, error } = await supabase
    .from('animals')
    .select(`
      id, name, species, gender, status,
      intake_date, updated_at, photos,
      adopted_by_name, adopted_by_city,
      whatsapp_tap_count
    `)
    .eq('organization_id', orgId)
    .order('intake_date', { ascending: true })

  if (error) {
    console.error('Failed to fetch animals:', error)
    return { animals: [], orgId }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animals: Animal[] = (rows ?? []).map((row: any) => {
    const intake = new Date(row.intake_date)
    intake.setHours(0, 0, 0, 0)
    const days_waiting = Math.floor((today.getTime() - intake.getTime()) / 86400000)

    return {
      id: row.id,
      name: row.name,
      species: row.species,
      gender: row.gender,
      status: row.status,
      days_waiting: Math.max(0, days_waiting),
      whatsapp_taps: row.whatsapp_tap_count ?? 0,
      updated_at: row.updated_at,
      photos: Array.isArray(row.photos) ? row.photos : [],
      adopted_by_name: row.adopted_by_name ?? null,
      adopted_by_city: row.adopted_by_city ?? null,
    }
  })

  return { animals, orgId }
}

export default async function AdminAnimalsPage() {
  const { animals } = await getAnimals()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  return (
    <div className="px-5 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
            Animals
          </h1>
          <p className="text-[13px] text-stone mt-0.5">
            Manage your organization&apos;s animal profiles
          </p>
        </div>
        <Link
          href="/admin/animals/new"
          className="bg-terracotta text-white rounded-full px-5 py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)] flex items-center gap-1.5 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add animal
        </Link>
      </div>

      <AnimalsTable animals={animals} supabaseUrl={supabaseUrl} />
    </div>
  )
}
