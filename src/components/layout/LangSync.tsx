'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Syncs document.documentElement.lang with the active i18n language.
 * Renders nothing — side-effect only.
 */
export default function LangSync() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = i18n.language?.startsWith('ne') ? 'ne' : 'en'
    document.documentElement.lang = lang
  }, [i18n.language])

  return null
}
