'use client'

import { useEffect, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastItemProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-sage text-white',
  error:   'bg-[#A05050] text-white',
  info:    'bg-charcoal text-linen',
}

const icons: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter transition
    const enterTimer = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 3s
    const exitTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 3000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [toast.id, onDismiss])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-card text-sm font-medium',
        'shadow-[0_4px_16px_rgba(45,41,38,0.15)] min-w-[260px] max-w-xs',
        'transition-all duration-300',
        variantClasses[toast.variant],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
      ].join(' ')}
    >
      <span className="shrink-0 text-base leading-none" aria-hidden="true">
        {icons[toast.variant]}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
