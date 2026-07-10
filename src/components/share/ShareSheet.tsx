'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '@/lib/analytics'
import { useToast } from '@/components/ui/useToast'

interface ShareSheetProps {
  open: boolean
  onClose: () => void
  animalName: string
  animalSlug: string
  animalId: string
  organizationId: string
  daysWaiting: number
  oneLiner: string
}

export default function ShareSheet({
  open,
  onClose,
  animalName,
  animalSlug,
  animalId,
  organizationId,
  daysWaiting,
  oneLiner,
}: ShareSheetProps) {
  const { t, i18n } = useTranslation()
  const { toast, ToastPortal } = useToast()
  const url = `https://milaap.dpdns.org/p/${animalSlug}`

  // Defer rendering until client-side — prevents SSR/client i18n key mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Close on Escape, lock body scroll
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  function handleWhatsApp() {
    trackEvent('share_tap', animalId, organizationId)
    const text = t('animal.shareWhatsappText', {
      name: animalName,
      days: daysWaiting,
      oneLiner,
      url,
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    onClose()
  }

  async function handleCopyLink() {
    trackEvent('share_tap', animalId, organizationId)
    try {
      await navigator.clipboard.writeText(url)
      toast(t('animal.shareSheet_copied'), 'success')
    } catch {
      toast(url, 'info')
    }
    onClose()
  }

  const isNepali = i18n.language?.startsWith('ne')

  // Don't render translated content until mounted — avoids SSR/i18n hydration mismatch
  if (!mounted) return null

  return (
    <>
      <ToastPortal />

      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet — slides up on mobile, centred modal on desktop */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('animal.shareSheet_title', { name: animalName })}
          className={[
            'absolute bottom-0 inset-x-0 md:inset-auto md:top-1/2 md:left-1/2',
            'md:-translate-x-1/2 md:-translate-y-1/2',
            'bg-linen rounded-t-2xl md:rounded-2xl md:w-96',
            'shadow-[0_-8px_40px_rgba(45,41,38,0.16)]',
            'transition-transform duration-300',
            open ? 'translate-y-0' : 'translate-y-full md:translate-y-[-40%]',
          ].join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-charcoal/20" aria-hidden="true" />
          </div>

          {/* Title */}
          <p className="text-center text-sm font-semibold text-charcoal px-6 py-3 border-b border-linen-dark">
            {t('animal.shareSheet_title', { name: animalName })}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-0.5 px-4 py-3">

            {/* Instagram Story — stub */}
            <ShareOption
              icon="📖"
              label={t('animal.shareSheet_instagram_story')}
              sublabel={t('animal.shareSheet_comingSoon')}
              disabled
              onClick={() => {}}
            />

            {/* Instagram Post — stub */}
            <ShareOption
              icon="🖼"
              label={t('animal.shareSheet_instagram_post')}
              sublabel={t('animal.shareSheet_comingSoon')}
              disabled
              onClick={() => {}}
            />

            {/* WhatsApp */}
            <ShareOption
              icon="💬"
              label={t('animal.shareSheet_whatsapp')}
              onClick={handleWhatsApp}
            />

            {/* Copy link */}
            <ShareOption
              icon="🔗"
              label={t('animal.shareSheet_copyLink')}
              onClick={handleCopyLink}
            />
          </div>

          <div className="h-safe-area-bottom pb-6" />
        </div>
      </div>
    </>
  )
}

interface ShareOptionProps {
  icon: string
  label: string
  sublabel?: string
  disabled?: boolean
  onClick: () => void
}

function ShareOption({ icon, label, sublabel, disabled, onClick }: ShareOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-colors',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-linen-dark active:bg-linen-dark',
      ].join(' ')}
    >
      <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">{icon}</span>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-charcoal">{label}</span>
        {sublabel && (
          <span className="text-[10px] text-stone mt-0.5">{sublabel}</span>
        )}
      </span>
    </button>
  )
}
