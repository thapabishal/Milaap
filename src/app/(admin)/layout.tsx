import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminMobileNav from '@/components/admin/AdminMobileNav'

interface AdminUser {
  id: string
  full_name: string
  role: 'volunteer' | 'org_admin' | 'platform_admin'
  organizations: { name: string } | null
}

async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('users')
    .select('id, full_name, role, organizations(name)')
    .eq('id', user.id)
    .maybeSingle()

  return (data as AdminUser | null)
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUser = await getAdminUser()

  // Not authenticated — redirect to login.
  // The login page itself is excluded via its own route group so this
  // layout never wraps it; no pathname check needed.
  if (!adminUser) redirect('/admin/login')

  const isOrgAdmin =
    adminUser.role === 'org_admin' || adminUser.role === 'platform_admin'

  return (
    <div className="flex min-h-screen bg-linen">
      <AdminSidebar
        userName={adminUser.full_name}
        userRole={adminUser.role}
        orgName={adminUser.organizations?.name ?? null}
        isOrgAdmin={isOrgAdmin}
      />
      <main className="flex-1 min-w-0 md:ml-[240px] pb-16 md:pb-0">
        {children}
      </main>
      <AdminMobileNav />
    </div>
  )
}
