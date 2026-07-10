'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import MilaapLogo from './MilaapLogo'
import LanguageToggle from '@/components/ui/LanguageToggle'

const NAV_LINKS = [
  { key: 'nav.discover',   href: '/discover' },
  { key: 'nav.happyTails', href: '/happy-tails' },
  { key: 'nav.about',      href: '/about' },
] as const

export default function PublicHeader() {
  const { t } = useTranslation()
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)

  // Sticky scroll detection
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change (body scroll lock too)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={[
          'fixed top-0 inset-x-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(45,41,38,0.08)]'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="Milaap — home">
            <MilaapLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map(({ key, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-stone hover:text-charcoal transition-colors tracking-[0.01em]"
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Right side: language toggle (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* Language toggle rendered inline on desktop, hidden on mobile
                (the fixed-position LanguageToggle covers mobile too) */}
            <div className="hidden md:block">
              {/* Inline variant — re-use same component, it's fixed-pos on its own */}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span
                className={[
                  'block w-5 h-[1.5px] bg-charcoal rounded-full transition-transform duration-200 origin-center',
                  menuOpen ? 'translate-y-[6.5px] rotate-45' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block w-5 h-[1.5px] bg-charcoal rounded-full transition-opacity duration-200',
                  menuOpen ? 'opacity-0' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block w-5 h-[1.5px] bg-charcoal rounded-full transition-transform duration-200 origin-center',
                  menuOpen ? '-translate-y-[6.5px] -rotate-45' : '',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in drawer */}
      <div
        className={[
          'fixed inset-0 z-30 md:hidden transition-opacity duration-300',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-charcoal/30"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel — slides in from right */}
        <nav
          className={[
            'absolute top-0 right-0 h-full w-72 bg-linen flex flex-col pt-20 px-8 gap-1',
            'shadow-[-4px_0_24px_rgba(45,41,38,0.12)]',
            'transition-transform duration-300',
            menuOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(({ key, href }) => (
            <Link
              key={href}
              href={href}
              className="py-3 text-lg font-medium text-charcoal border-b border-linen-dark hover:text-terracotta transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t(key)}
            </Link>
          ))}

          {/* Language toggle inside drawer */}
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.1em] text-stone mb-3 font-medium">
              Language
            </p>
            <MobileLangToggle />
          </div>
        </nav>
      </div>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-16" aria-hidden="true" />
    </>
  )
}

/** Inline language toggle for the mobile drawer */
function MobileLangToggle() {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('ne') ? 'ne' : 'en'

  function handleSwitch(next: 'en' | 'ne') {
    if (next === lang) return
    localStorage.setItem('milaap_lang', next)
    i18n.changeLanguage(next)
  }

  return (
    <div className="flex gap-3">
      {(['en', 'ne'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => handleSwitch(l)}
          className={[
            'text-sm font-medium uppercase tracking-[0.06em] transition-colors',
            lang === l ? 'text-charcoal' : 'text-stone hover:text-charcoal',
          ].join(' ')}
          aria-pressed={lang === l}
        >
          {l === 'en' ? 'EN' : 'NE'}
        </button>
      ))}
    </div>
  )
}
