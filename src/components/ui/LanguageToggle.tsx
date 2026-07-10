'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'milaap_lang'
type Lang = 'en' | 'ne'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const [lang, setLang] = useState<Lang>('en')

  // Sync component state from i18n on mount (i18n may have already detected language)
  useEffect(() => {
    const current = i18n.language?.startsWith('ne') ? 'ne' : 'en'
    setLang(current)
  }, [i18n.language])

  function handleSwitch(next: Lang) {
    if (next === lang) return
    setLang(next)
    localStorage.setItem(STORAGE_KEY, next)
    i18n.changeLanguage(next)
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-linen-dark rounded-pill px-3 py-1.5 shadow-[0_1px_6px_rgba(45,41,38,0.08)]"
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => handleSwitch('en')}
        className={[
          'text-xs font-medium tracking-[0.06em] uppercase transition-colors px-1',
          lang === 'en' ? 'text-charcoal' : 'text-stone hover:text-charcoal',
        ].join(' ')}
        aria-pressed={lang === 'en'}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-linen-dark text-xs select-none" aria-hidden="true">|</span>
      <button
        type="button"
        onClick={() => handleSwitch('ne')}
        className={[
          'text-xs font-medium tracking-[0.06em] uppercase transition-colors px-1',
          lang === 'ne' ? 'text-charcoal' : 'text-stone hover:text-charcoal',
        ].join(' ')}
        aria-pressed={lang === 'ne'}
        aria-label="Switch to Nepali"
      >
        NE
      </button>
    </div>
  )
}
