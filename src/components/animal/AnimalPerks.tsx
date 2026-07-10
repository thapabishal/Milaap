'use client'

import { useTranslation } from 'react-i18next'

interface AnimalPerksProps {
  animalName: string
}

const PERKS = [
  { key: 'animal.perk_vet',     icon: '🩺' },
  { key: 'animal.perk_vaccine', icon: '💉' },
  { key: 'animal.perk_support', icon: '💬' },
  { key: 'animal.perk_foster',  icon: '🏠' },
] as const

export default function AnimalPerks({ animalName }: AnimalPerksProps) {
  const { t } = useTranslation()

  return (
    <section
      className="mt-8 bg-[rgba(196,111,82,0.06)] border border-[rgba(196,111,82,0.15)] rounded-xl px-5 py-4"
      aria-labelledby="perks-heading"
    >
      <h2
        id="perks-heading"
        className="text-[10px] uppercase tracking-[0.14em] text-terracotta font-medium mb-4"
      >
        {t('animal.whatComes', { name: animalName })}
      </h2>

      <ul className="flex flex-col gap-2">
        {PERKS.map(({ key, icon }) => (
          <li key={key} className="flex items-start gap-3 text-xs text-charcoal leading-relaxed">
            <span className="text-sm shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
