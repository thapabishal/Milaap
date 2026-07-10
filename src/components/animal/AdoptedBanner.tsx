'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'

interface AdoptedBannerProps {
  animalName: string
  adoptedDate: string | null
  adopterCity: string | null
  whatsappTapCount: number
  happyTailId: string | null
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function AdoptedBanner({
  animalName,
  adoptedDate,
  adopterCity,
  whatsappTapCount,
  happyTailId,
}: AdoptedBannerProps) {
  const { t } = useTranslation()

  return (
    <div
      className="bg-status-adopted/10 border border-status-adopted/20 rounded-xl px-6 py-5 flex flex-col gap-2"
      role="region"
      aria-label="Adoption announcement"
    >
      {/* Main announcement */}
      <p className="font-satoshi font-bold text-[22px] leading-snug tracking-[-0.01em] text-status-adopted">
        {t('animal.adopted_foundFamily', { name: animalName })}
      </p>

      {/* Adopted date + city */}
      {adoptedDate && (
        <p className="text-sm text-status-adopted/80">
          {t('animal.adopted_date', { monthYear: formatMonthYear(adoptedDate) })}
          {adopterCity ? ` · ${adopterCity}` : ''}
        </p>
      )}

      {/* Inspiration count */}
      {whatsappTapCount > 0 && (
        <p className="text-xs text-stone/70 italic">
          {t('animal.adopted_inspired', { count: whatsappTapCount })}
        </p>
      )}

      {/* Happy Tails CTA */}
      <div className="mt-2">
        {happyTailId ? (
          <Link
            href={`/happy-tails/${happyTailId}`}
            className="inline-flex items-center text-sm font-semibold text-status-adopted hover:text-status-adopted/80 transition-colors tracking-[0.01em]"
          >
            {t('animal.adopted_happyTailsCta', { name: animalName })}
          </Link>
        ) : (
          <span className="text-sm text-stone/50 italic">
            {t('animal.adopted_storyComing')}
          </span>
        )}
      </div>
    </div>
  )
}
