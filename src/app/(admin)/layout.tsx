import { redirect, headers as nextHeaders } from 'next/navigation'
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
  const headersList = await nextHeaders()
  const pathname    = headersList.get('x-pathname') ?? ''

  // Login page renders without the sidebar shell — just show the page
  const isLoginPage = pathname === '/admin/login'
  if (isLoginPage) {
    return <>{children}</>
  }

  const adminUser = await getAdminUser()
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
