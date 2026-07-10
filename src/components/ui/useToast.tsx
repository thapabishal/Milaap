'use client'

import { useState, useCallback } from 'react'
import { ToastContainer } from './Toast'
import type { ToastVariant, ToastMessage } from './Toast'

let counter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${++counter}`
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const ToastPortal = () => (
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
  )

  return { toast, ToastPortal }
}
