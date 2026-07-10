'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MOBILE_NAV = [
  { href: '/admin',             icon: '📊', label: 'Dashboard' },
  { href: '/admin/animals',     icon: '🐾', label: 'Animals' },
  { href: '/admin/happy-tails', icon: '❤️', label: 'Tails' },
  { href: '/admin/analytics',   icon: '📈', label: 'Analytics' },
]

export default function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#2D2926] border-t border-linen/10"
      aria-label="Mobile admin navigation"
    >
      <ul className="flex">
        {MOBILE_NAV.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin' || pathname === '/admin/'
            : pathname.startsWith(item.href)

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-center',
                  'transition-colors',
                  isActive
                    ? 'text-[#C46F52]'
                    : 'text-[#F7F2EB]/50 hover:text-[#F7F2EB]/80',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
                <span className="text-[9px] uppercase tracking-[0.08em] font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      {/* iOS safe area */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
