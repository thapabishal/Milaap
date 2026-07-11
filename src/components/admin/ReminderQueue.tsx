'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import WhatsAppComposerModal from './WhatsAppComposerModal'

type Photo = { path: string; is_hero: boolean; caption?: string }

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
    photos: Photo[]
  }
}

interface SentReminder extends Reminder {
  sent_at: string
}

interface Props {
  initialReminders: Reminder[]
  initialSent: SentReminder[]
  supabaseUrl: string
}

function urgencyGroup(dueDate: string): 'urgent' | 'soon' | 'upcoming' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000)
  if (diffDays <= 0) return 'urgent'
  if (diffDays <= 3) return 'soon'
  return 'upcoming'
}

function formatDueDate(dueDate: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 6) return `In ${diffDays} days`
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function heroPhotoUrl(photos: Photo[], supabaseUrl: string): string | null {
  const hero = photos.find((p) => p.is_hero) ?? photos[0]
  if (!hero) return null
  return `${supabaseUrl}/storage/v1/object/public/animal-photos/${hero.path}`
}

const urgencyStyles = {
  urgent: {
    border: 'border-l-terracotta',
    dot: 'bg-terracotta',
    label: 'URGENT',
    labelColor: 'text-terracotta',
  },
  soon: {
    border: 'border-l-dusty-rose',
    dot: 'bg-dusty-rose',
    label: 'DUE SOON',
    labelColor: 'text-dusty-rose',
  },
  upcoming: {
    border: 'border-l-linen-dark',
    dot: 'bg-stone/30',
    label: 'UPCOMING',
    labelColor: 'text-stone',
  },
}

export default function ReminderQueue({ initialReminders, initialSent, supabaseUrl }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [sent, setSent] = useState<SentReminder[]>(initialSent)
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null)
  const [sentOpen, setSentOpen] = useState(false)

  async function handleMarkSent(id: string) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('followup_reminders')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error

    const moved = reminders.find((r) => r.id === id)
    if (moved) {
      setReminders((prev) => prev.filter((r) => r.id !== id))
      setSent((prev) => [{ ...moved, sent_at: new Date().toISOString() } as SentReminder, ...prev])
    }
  }

  return (
    <>
      {/* Active modal */}
      {activeReminder && (
        <WhatsAppComposerModal
          reminder={activeReminder}
          onClose={() => setActiveReminder(null)}
          onMarkSent={handleMarkSent}
        />
      )}

      {reminders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm text-stone">All caught up — no pending reminders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const urgency = urgencyGroup(reminder.due_date)
            const styles = urgencyStyles[urgency]
            const photoUrl = heroPhotoUrl(reminder.animal.photos, supabaseUrl)
            const dueLabel = formatDueDate(reminder.due_date)

            return (
              <div
                key={reminder.id}
                className={`bg-white border border-linen-dark border-l-4 ${styles.border} rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Animal thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-linen flex-shrink-0">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={reminder.animal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone/30 text-xl">
                        🐾
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-charcoal text-sm font-satoshi">
                        {reminder.animal.name}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.08em] font-medium px-1.5 py-0.5 bg-linen rounded text-stone">
                        {reminder.reminder_type === '30day' ? '30-day check-in' : '6-month update'}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone mt-0.5 truncate">
                      {reminder.adopter_name} · +977 {reminder.adopter_whatsapp.slice(0, 4)}*****
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      <span className={`text-[10px] uppercase tracking-[0.06em] font-medium ${styles.labelColor}`}>
                        {styles.label}
                      </span>
                      <span className="text-[10px] text-stone">· {dueLabel}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setActiveReminder(reminder)}
                    className="flex-shrink-0 bg-charcoal text-linen rounded-full px-4 py-2 text-xs font-semibold tracking-[0.04em] hover:bg-[#1A1612] transition-colors whitespace-nowrap"
                  >
                    💬 Send
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sent section — collapsed */}
      {sent.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setSentOpen((v) => !v)}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-stone font-medium hover:text-charcoal transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform ${sentOpen ? 'rotate-180' : ''}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sent ({sent.length})
          </button>

          {sentOpen && (
            <div className="mt-3 space-y-2">
              {sent.map((reminder) => {
                const photoUrl = heroPhotoUrl(reminder.animal.photos, supabaseUrl)
                return (
                  <div
                    key={reminder.id}
                    className="bg-white border border-linen-dark rounded-xl flex items-center gap-3 p-3 opacity-60"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-linen flex-shrink-0">
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoUrl} alt={reminder.animal.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone/30 text-base">🐾</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{reminder.animal.name}</p>
                      <p className="text-[11px] text-stone">
                        Sent ·{' '}
                        {new Date(reminder.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-[10px] text-stone/60 uppercase tracking-[0.06em]">✓ Sent</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </>
  )
}
