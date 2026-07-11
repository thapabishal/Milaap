import Link from 'next/link'
import { headers } from 'next/headers'
import AdminSignOutButton from '@/components/admin/AdminSignOutButton'

interface AdminSidebarProps {
  userName: string
  userRole: 'volunteer' | 'org_admin' | 'platform_admin'
  orgName: string | null
  isOrgAdmin: boolean
}

const ROLE_LABEL: Record<string, string> = {
  volunteer:      'Volunteer',
  org_admin:      'Org Admin',
  platform_admin: 'Platform Admin',
}

interface NavItem {
  href: string
  icon: string
  label: string
  adminOnly?: boolean
  platformOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin',             icon: '📊', label: 'Dashboard' },
  { href: '/admin/animals',     icon: '🐾', label: 'Animals' },
  { href: '/admin/happy-tails', icon: '❤️', label: 'Happy Tails' },
  { href: '/admin/analytics',   icon: '📈', label: 'Analytics' },
  { href: '/admin/org',         icon: '🏢', label: 'Our Profile', adminOnly: true },
  { href: '/admin/team',        icon: '👥', label: 'Team',         adminOnly: true },
  { href: '/admin/platform',    icon: '🌐', label: 'Platform',     platformOnly: true },
]

export default async function AdminSidebar({
  userName,
  userRole,
  orgName,
  isOrgAdmin,
}: AdminSidebarProps) {
  // Read current path from headers to highlight active nav item
  const headersList = await headers()
  const currentPath = headersList.get('x-pathname') ?? ''

  const isPlatformAdmin = userRole === 'platform_admin'

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.platformOnly) return isPlatformAdmin
    if (item.adminOnly)    return isOrgAdmin
    return true
  })

  return (
    <aside
      className="hidden md:flex flex-col fixed inset-y-0 left-0 w-[240px] bg-[#2D2926] z-30"
      aria-label="Admin navigation"
    >
      {/* ── Top: logo + org ─────────────────────────── */}
      <div className="px-5 pt-6 pb-4 border-b border-linen/10">
        <div className="flex items-center gap-2 mb-4">
          {/* Logo mark — white paths on charcoal bg */}
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M4 26 C8 18, 14 14, 28 6"  stroke="#C46F52" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M4 6 C10 14, 18 18, 28 26"  stroke="#F7F2EB" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3" fill="#C46F52" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="text-[#F7F2EB] font-satoshi font-bold text-base tracking-[-0.01em]">
              Milaap
            </span>
            <span className="text-[#F7F2EB]/40 text-[10px] uppercase tracking-[0.1em] font-medium">
              Admin
            </span>
          </div>
        </div>

        {/* Org name */}
        {orgName && (
          <p className="text-[11px] text-[#F7F2EB]/50 font-medium truncate">
            {orgName}
          </p>
        )}
      </div>

      {/* ── Nav items ────────────────────────────────── */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto" aria-label="Main navigation">
        <ul className="flex flex-col gap-0.5">
          {visibleItems.map((item) => {
            const isActive = item.href === '/admin'
              ? currentPath === '/admin' || currentPath === '/admin/'
              : currentPath.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    'border-l-2',
                    isActive
                      ? 'border-[#C46F52] text-[#F7F2EB] bg-[#F7F2EB]/8'
                      : 'border-transparent text-[#F7F2EB]/70 hover:text-[#F7F2EB] hover:bg-[#F7F2EB]/5',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-base w-5 text-center shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Bottom: user + sign out ───────────────────── */}
      <div className="px-4 py-4 border-t border-linen/10 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[#F7F2EB] text-sm font-medium truncate">{userName}</p>
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#C46F52] font-medium">
            {ROLE_LABEL[userRole] ?? userRole}
          </span>
        </div>
        <AdminSignOutButton />
      </div>
    </aside>
  )
}
