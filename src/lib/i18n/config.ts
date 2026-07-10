import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './en.json'
import ne from './ne.json'

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        ne: { translation: ne },
      },
      fallbackLng: 'en',
      supportedLngs: ['en', 'ne'],
      interpolation: {
        // React already escapes values
        escapeValue: false,
      },
      detection: {
        // Check localStorage first, then navigator
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: 'milaap_lang',
        caches: ['localStorage'],
      },
    })
}

export default i18n
