import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlatformManager, { type OrgRow } from '@/components/admin/PlatformManager'

export const metadata: Metadata = {
  title: 'Platform Admin — Milaap',
}

async function getData(): Promise<OrgRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Strictly platform_admin only
  if (profile?.role !== 'platform_admin') redirect('/admin')

  // Fetch all orgs + animal count via separate query
  const [orgsRes, countsRes] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, slug, city, verification_status, created_at')
      .order('created_at', { ascending: false }),

    supabase
      .from('animals')
      .select('organization_id', { count: 'exact' })
      .eq('is_published', true),
  ])

  // Build animal count map
  const countMap: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (countsRes.data ?? []) as any[]) {
    countMap[row.organization_id] = (countMap[row.organization_id] ?? 0) + 1
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((orgsRes.data ?? []) as any[]).map((o) => ({
    id:                  o.id,
    name:                o.name,
    slug:                o.slug,
    city:                o.city,
    verification_status: o.verification_status,
    animal_count:        countMap[o.id] ?? 0,
    created_at:          o.created_at,
  }))
}

export default async function PlatformAdminPage() {
  const orgs = await getData()

  const verified  = orgs.filter((o) => o.verification_status === 'verified').length
  const pending   = orgs.filter((o) => o.verification_status === 'pending').length
  const suspended = orgs.filter((o) => o.verification_status === 'suspended').length

  return (
    <div className="px-5 md:px-8 py-6 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
            Platform Admin
          </h1>
          <span className="text-[10px] uppercase tracking-[0.08em] text-terracotta font-medium bg-terracotta/10 border border-terracotta/20 px-2 py-0.5 rounded-full">
            Platform only
          </span>
        </div>
        <p className="text-[13px] text-stone">
          {orgs.length} organizations · {verified} verified · {pending} pending · {suspended} suspended
        </p>
      </div>

      <PlatformManager initialOrgs={orgs} />
    </div>
  )
}
