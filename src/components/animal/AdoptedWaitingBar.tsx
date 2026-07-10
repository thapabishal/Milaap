'use client'

import { useTranslation } from 'react-i18next'

interface AdoptedWaitingBarProps {
  /** Days between intake_date and adopted_date */
  daysWaited: number
}

export default function AdoptedWaitingBar({ daysWaited }: AdoptedWaitingBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 mb-3">
      {/* Full bar — 100% fill in sage, they're home */}
      <div className="flex-1 h-[2px] bg-linen-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-status-adopted rounded-full transition-all duration-500"
          style={{ width: '100%' }}
          role="progressbar"
          aria-valuenow={daysWaited}
          aria-valuemin={0}
          aria-valuemax={daysWaited}
          aria-label={`Waited ${daysWaited} days before adoption`}
        />
      </div>
      <span className="text-[10px] uppercase tracking-[0.08em] text-status-adopted whitespace-nowrap font-medium">
        {t('animal.daysNowHome', { count: daysWaited })}
      </span>
    </div>
  )
}
