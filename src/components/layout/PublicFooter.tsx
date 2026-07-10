'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import MilaapLogo from './MilaapLogo'

const NAV_LINKS = [
  { key: 'nav.discover',   href: '/discover' },
  { key: 'nav.happyTails', href: '/happy-tails' },
  { key: 'nav.about',      href: '/about' },
  { href: '/faq',          label: 'FAQ' },
] as const

export default function PublicFooter() {
  const { t } = useTranslation()

  return (
    <footer className="bg-charcoal text-linen/70 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col gap-8">

        {/* Top row: logo + tagline */}
        <div className="flex flex-col gap-3">
          <MilaapLogo variant="full" className="[&_span]:text-linen/90" />
          <p className="text-sm italic text-linen/50 font-light tracking-[0.01em]">
            Two stories. One journey.
          </p>
        </div>

        {/* Nav links */}
        <nav
          className="flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Footer navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-linen/60 hover:text-linen transition-colors"
            >
              {'key' in link ? t(link.key) : link.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-linen/10" />

        {/* Bottom row: credit + copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-linen/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span>{t('footer.builtBy')}</span>
            <span className="hidden sm:inline text-linen/20">·</span>
            <a
              href="https://allcarenepal.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-linen/60 hover:text-linen transition-colors underline underline-offset-2"
            >
              {t('footer.website')}
            </a>
          </div>
          <span className="text-linen/30">© 2025 All Care Nepal</span>
        </div>
      </div>
    </footer>
  )
}
