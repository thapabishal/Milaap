'use client'

import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
// Side-effect import: initialises i18next exactly once
import i18n from '@/lib/i18n/config'

interface I18nProviderProps {
  children: ReactNode
}

export default function I18nProvider({ children }: I18nProviderProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
