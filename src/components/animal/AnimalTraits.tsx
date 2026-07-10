'use client'

import { useTranslation } from 'react-i18next'

type EnergyLevel = 'low' | 'medium' | 'high' | null

interface AnimalTraitsProps {
  animalName: string
  good_with_kids: boolean | null
  good_with_dogs: boolean | null
  good_with_cats: boolean | null
  apartment_ok:   boolean | null
  is_vaccinated:  boolean
  is_neutered:    boolean
  energy_level:   EnergyLevel
}

interface Trait {
  label: string
  icon: string
  color: 'sage' | 'dusty-rose' | 'stone'
}

export default function AnimalTraits({
  animalName,
  good_with_kids,
  good_with_dogs,
  good_with_cats,
  apartment_ok,
  is_vaccinated,
  is_neutered,
  energy_level,
}: AnimalTraitsProps) {
  const { t } = useTranslation()

  const traits: Trait[] = []

  if (good_with_kids === true)  traits.push({ label: t('animal.goodWithKids'), icon: '✓', color: 'sage' })
  if (good_with_dogs === true)  traits.push({ label: t('animal.goodWithDogs'), icon: '✓', color: 'sage' })
  if (good_with_cats === true)  traits.push({ label: t('animal.goodWithCats'), icon: '✓', color: 'sage' })
  if (good_with_cats === false) traits.push({ label: t('animal.notGoodWithCats'), icon: '✕', color: 'stone' })
  if (apartment_ok === true)    traits.push({ label: t('animal.apartmentOk'), icon: '✓', color: 'sage' })
  if (is_vaccinated)            traits.push({ label: t('animal.vaccinated'), icon: '✓', color: 'sage' })
  if (is_neutered)              traits.push({ label: t('animal.neutered'), icon: '✓', color: 'sage' })
  if (energy_level === 'high')  traits.push({ label: t('animal.highEnergy'), icon: '⚡', color: 'dusty-rose' })

  if (traits.length === 0) return null

  const colorClass: Record<Trait['color'], string> = {
    sage:        'text-sage',
    'dusty-rose':'text-dusty-rose',
    stone:       'text-stone',
  }

  return (
    <section className="mt-8" aria-labelledby="traits-heading">
      <h2
        id="traits-heading"
        className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-3"
      >
        {t('animal.goodToKnow')}
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {traits.map((trait) => (
          <div
            key={trait.label}
            className="bg-white border border-linen-dark rounded-md px-3 py-2.5 flex items-center gap-2"
          >
            <span className={['text-xs font-medium', colorClass[trait.color]].join(' ')} aria-hidden="true">
              {trait.icon}
            </span>
            <span className={['text-xs font-medium', colorClass[trait.color]].join(' ')}>
              {trait.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
