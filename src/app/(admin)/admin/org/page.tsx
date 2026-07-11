import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrgProfileForm, { type OrgData } from '@/components/admin/OrgProfileForm'

export const metadata: Metadata = {
  title: 'Organization Profile — Milaap Admin',
}

async function getData(): Promise<{ org: OrgData; isOrgAdmin: boolean }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.organization_id) redirect('/admin/login')

  const isOrgAdmin = profile.role === 'org_admin' || profile.role === 'platform_admin'

  const { data: org, error } = await supabase
    .from('organizations')
    .select(`
      id, name, description, description_ne,
      city, district, whatsapp_number,
      website_url, facebook_url, instagram_url,
      registration_number, founded_year,
      animals_rescued_count, logo_url, cover_url
    `)
    .eq('id', profile.organization_id)
    .maybeSingle()

  if (error || !org) redirect('/admin/login')

  return {
    org: org as OrgData,
    isOrgAdmin,
  }
}

export default async function AdminOrgPage() {
  const { org, isOrgAdmin } = await getData()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  return (
    <div className="px-5 md:px-8 py-6">
      <div className="mb-6">
        <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
          Organization Profile
        </h1>
        <p className="text-[13px] text-stone mt-0.5">
          Changes are live immediately on the public profile page.
        </p>
      </div>

      {!isOrgAdmin ? (
        <div className="bg-white border border-linen-dark rounded-xl p-8 text-center max-w-md">
          <p className="text-sm text-stone">
            Only org admins can edit the organization profile. Contact your org admin to make changes.
          </p>
        </div>
      ) : (
        <OrgProfileForm org={org} supabaseUrl={supabaseUrl} />
      )}
    </div>
  )
}
