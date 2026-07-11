import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnimalFormShell from '@/components/admin/form/AnimalFormShell'

async function getOrgId(): Promise<string> {
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
  return profile.organization_id as string
}

export default async function AdminNewAnimalPage() {
  const orgId = await getOrgId()

  return (
    <div className="px-5 md:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-stone mb-6">
        <Link href="/admin/animals" className="hover:text-charcoal transition-colors">
          Animals
        </Link>
        <span>/</span>
        <span className="text-charcoal font-medium">Add new</span>
      </div>

      <div className="mb-6">
        <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
          Add a new animal
        </h1>
        <p className="text-[13px] text-stone mt-0.5">
          Complete all steps to create this animal&apos;s profile.
        </p>
      </div>

      <AnimalFormShell orgId={orgId} />
    </div>
  )
}
