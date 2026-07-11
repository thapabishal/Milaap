'use client'

import { useState } from 'react'

interface Reminder {
  id: string
  adopter_name: string
  adopter_whatsapp: string
  reminder_type: '30day' | '6month' | 'custom'
  due_date: string
  message_en: string | null
  message_ne: string | null
  submission_token: string
  animal: {
    name: string
    photos: { path: string; is_hero: boolean; caption?: string }[]
  }
}

interface Props {
  reminder: Reminder
  onClose: () => void
  onMarkSent: (id: string) => Promise<void>
}

export default function WhatsAppComposerModal({ reminder, onClose, onMarkSent }: Props) {
  const defaultMessage =
    (reminder.message_ne || reminder.message_en || '').replace(
      '{token}',
      reminder.submission_token
    )

  const [message, setMessage] = useState(defaultMessage)
  const [step, setStep] = useState<'compose' | 'confirm'>('compose')
  const [loading, setLoading] = useState(false)

  function buildWhatsAppURL() {
    const phone = `977${reminder.adopter_whatsapp}`
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  function handleOpenWhatsApp() {
    window.open(buildWhatsAppURL(), '_blank', 'noopener,noreferrer')
    setStep('confirm')
  }

  async function handleMarkSent() {
    setLoading(true)
    await onMarkSent(reminder.id)
    setLoading(false)
    onClose()
  }

  const maskedNumber =
    reminder.adopter_whatsapp.slice(0, 4) + '*****'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px]" />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-[0_8px_40px_rgba(45,41,38,0.18)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-linen-dark">
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium">
              {reminder.reminder_type === '30day' ? '30-Day Check-in' : '6-Month Update'}
            </p>
            <p className="font-bold text-charcoal text-base font-satoshi">
              {reminder.animal.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone hover:bg-linen transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* Adopter info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-linen flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" fill="#8A8078"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal leading-tight">{reminder.adopter_name}</p>
              <p className="text-[11px] text-stone">+977 {maskedNumber}</p>
            </div>
          </div>

          {/* Submission link notice */}
          <div className="mb-3 px-3 py-2 bg-linen rounded-lg border border-linen-dark">
            <p className="text-[11px] text-stone">
              Submission link embedded:{' '}
              <span className="text-terracotta font-medium">
                /happy-tails/submit/{reminder.submission_token.slice(0, 8)}…
              </span>
            </p>
          </div>

          {/* Message textarea */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full text-sm text-charcoal bg-linen border border-linen-dark rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-terracotta/40 transition-colors leading-relaxed"
          />

          {step === 'compose' ? (
            <button
              onClick={handleOpenWhatsApp}
              className="mt-3 w-full bg-charcoal text-linen rounded-full py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#1A1612] transition-colors flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.554 4.11 1.522 5.837L0 24l6.335-1.501A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.993-1.365l-.358-.213-3.76.89.939-3.648-.234-.374A9.82 9.82 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
              Open in WhatsApp →
            </button>
          ) : (
            <div className="mt-3 p-4 bg-linen rounded-xl border border-linen-dark">
              <p className="text-sm font-semibold text-charcoal mb-3">Message sent via WhatsApp?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkSent}
                  disabled={loading}
                  className="flex-1 bg-terracotta text-white rounded-full py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors disabled:opacity-60"
                >
                  {loading ? 'Saving…' : '✓ Mark as sent'}
                </button>
                <button
                  onClick={() => setStep('compose')}
                  className="flex-1 bg-transparent text-stone border border-linen-dark rounded-full py-2.5 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors"
                >
                  Edit message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
