'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildWhatsAppURL } from '@/lib/whatsapp'
import { trackEvent } from '@/lib/analytics'
import ShareSheet from '@/components/share/ShareSheet'

interface AnimalCTAProps {
  animalId: string
  animalName: string
  animalSlug: string
  animalOneLiner: string
  daysWaiting: number
  orgName: string
  orgWhatsapp: string
  organizationId: string
}

export default function AnimalCTA({
  animalId,
  animalName,
  animalSlug,
  animalOneLiner,
  daysWaiting,
  orgName,
  orgWhatsapp,
  organizationId,
}: AnimalCTAProps) {
  const { t, i18n } = useTranslation()
  const [shareOpen, setShareOpen]         = useState(false)
  const [showOverlay, setShowOverlay]     = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // ── Scroll observer for sticky bar ──────────────────────
  useEffect(() => {
    // The gallery is ~65vh tall; observe a sentinel element instead
    function onScroll() {
      setStickyVisible(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── WhatsApp handler ────────────────────────────────────
  function handleWhatsApp() {
    const lang = i18n.language?.startsWith('ne') ? 'ne' : 'en'
    const url = buildWhatsAppURL(orgWhatsapp, animalName, animalSlug, orgName, lang)

    trackEvent('whatsapp_tap', animalId, organizationId)

    // Show interest overlay simultaneously — does not block WhatsApp
    setShowOverlay(true)
    window.open(url, '_blank')

    setTimeout(() => setShowOverlay(false), 1500)
  }

  return (
    <>
      {/* ── Main CTA section ──────────────────────────── */}
      <section ref={heroRef} className="mt-8 flex flex-col gap-3">

        {/* Primary — dark button */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="w-full bg-charcoal text-linen rounded-pill px-7 py-4 text-sm font-semibold tracking-[0.04em] hover:bg-[#1A1612] transition-colors flex items-center justify-center gap-2.5"
        >
          💬 {t('animal.whatsappCta', { org: orgName, name: animalName })}
        </button>

        {/* Secondary CTAs */}
        <div className="flex flex-col items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="text-sm text-stone hover:text-charcoal transition-colors tracking-[0.01em]"
          >
            {t('animal.shareStory', { name: animalName })}
          </button>
          <a
            href="/about#fostering"
            className="text-xs text-stone/70 hover:text-stone transition-colors"
          >
            {t('animal.fosterInstead')}
          </a>
        </div>
      </section>

      {/* ── Interest overlay ───────────────────────────── */}
      <div
        aria-live="polite"
        className={[
          'fixed inset-0 z-50 flex items-center justify-center px-8',
          'pointer-events-none transition-opacity duration-300',
          showOverlay ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        <div className="bg-linen rounded-2xl shadow-[0_8px_40px_rgba(45,41,38,0.16)] px-8 py-6 max-w-xs text-center">
          <p className="text-sm text-charcoal leading-relaxed">
            {t('animal.whatsappInterest', { name: animalName, org: orgName })}
          </p>
        </div>
      </div>

      {/* ── Sticky bottom bar ─────────────────────────── */}
      <div
        className={[
          'fixed bottom-0 inset-x-0 z-30 md:hidden',
          'bg-charcoal border-t border-linen/10',
          'transition-transform duration-300',
          stickyVisible ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
          <span className="text-xs text-linen/60 font-medium truncate pr-3">
            {animalName}
          </span>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="shrink-0 bg-terracotta text-white rounded-pill px-5 py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_16px_rgba(196,111,82,0.3)]"
          >
            {t('animal.meetCta', { name: animalName })}
          </button>
        </div>
        {/* Safe area spacer for iOS home indicator */}
        <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>

      {/* ── Share sheet ───────────────────────────────── */}
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        animalName={animalName}
        animalSlug={animalSlug}
        animalId={animalId}
        organizationId={organizationId}
        daysWaiting={daysWaiting}
        oneLiner={animalOneLiner}
      />
    </>
  )
}
