import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'
import LanguageToggle from '@/components/ui/LanguageToggle'
import type { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      {/* Fixed language toggle — visible on all public pages */}
      <LanguageToggle />
    </>
  )
}
