'use client'

import type { AnimalDraft } from './types'
import SegmentedControl from './SegmentedControl'

interface Props {
  data: AnimalDraft
  onChange: (patch: Partial<AnimalDraft>) => void
}

type TriState = true | false | null

interface CompatCard {
  key: keyof AnimalDraft
  label: string
  icon: string
  description: string
}

const COMPAT_CARDS: CompatCard[] = [
  { key: 'good_with_kids', label: 'Good with kids',  icon: '👶', description: 'Safe and comfortable around children' },
  { key: 'good_with_dogs', label: 'Good with dogs',  icon: '🐕', description: 'Gets along with other dogs' },
  { key: 'good_with_cats', label: 'Good with cats',  icon: '🐈', description: 'Gets along with cats' },
  { key: 'apartment_ok',   label: 'Apartment ok',    icon: '🏠', description: 'Suited to apartment living' },
  { key: 'needs_garden',   label: 'Needs garden',    icon: '🌿', description: 'Needs outdoor space to thrive' },
]

function TriStateToggle({
  value,
  onChange,
}: {
  value: TriState
  onChange: (v: TriState) => void
}) {
  return (
    <div className="inline-flex bg-linen border border-linen-dark rounded-xl p-1 gap-0.5">
      {([
        { v: true,  label: 'Yes',     cls: true  === value ? 'bg-sage/20 text-sage border-sage/30'          : '' },
        { v: null,  label: 'Unknown', cls: null  === value ? 'bg-white text-charcoal border-linen-dark shadow-sm' : '' },
        { v: false, label: 'No',      cls: false === value ? 'bg-terracotta/10 text-terracotta border-terracotta/20' : '' },
      ] as { v: TriState; label: string; cls: string }[]).map(({ v, label, cls }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={[
            'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
            value === v
              ? cls
              : 'text-stone border-transparent hover:text-charcoal',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function AnimalFormStep3({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-[11px] text-stone uppercase tracking-[0.08em] font-medium">
        Compatibility
      </p>
      <p className="text-xs text-stone/70 -mt-3">
        &ldquo;Unknown&rdquo; values will not show as tags on the public profile — only fill in what you know.
      </p>

      {/* Compat cards */}
      <div className="space-y-3">
        {COMPAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-white border border-linen-dark rounded-xl px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl flex-shrink-0">{card.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal font-satoshi">{card.label}</p>
                <p className="text-[11px] text-stone">{card.description}</p>
              </div>
            </div>
            <TriStateToggle
              value={(data[card.key] as TriState) ?? null}
              onChange={(v) => onChange({ [card.key]: v })}
            />
          </div>
        ))}
      </div>

      {/* Energy level */}
      <div className="bg-white border border-linen-dark rounded-xl px-4 py-4 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-charcoal font-satoshi">Energy level</p>
            <p className="text-[11px] text-stone">How active is this animal day-to-day?</p>
          </div>
          <SegmentedControl
            options={[
              { value: 'low',    label: '🧘 Low' },
              { value: 'medium', label: '🐾 Medium' },
              { value: 'high',   label: '⚡ High' },
            ]}
            value={data.energy_level ?? 'medium'}
            onChange={(v) => onChange({ energy_level: v as AnimalDraft['energy_level'] })}
          />
        </div>
      </div>

      {/* Medical */}
      <p className="text-[11px] text-stone uppercase tracking-[0.08em] font-medium pt-2">
        Medical status
      </p>
      <div className="space-y-3">
        {([
          { key: 'is_vaccinated',   label: 'Vaccinated',   icon: '💉' },
          { key: 'is_neutered',     label: 'Neutered / Spayed', icon: '✂️' },
          { key: 'is_microchipped', label: 'Microchipped', icon: '📡' },
        ] as { key: keyof AnimalDraft; label: string; icon: string }[]).map((item) => (
          <div
            key={item.key}
            className="bg-white border border-linen-dark rounded-xl px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm font-semibold text-charcoal font-satoshi">{item.label}</p>
            </div>
            <div className="inline-flex bg-linen border border-linen-dark rounded-xl p-1 gap-0.5">
              {(['Yes', 'No'] as const).map((lbl) => {
                const isYes = lbl === 'Yes'
                const active = (data[item.key] as boolean) === isYes
                return (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => onChange({ [item.key]: isYes })}
                    className={[
                      'px-4 py-1 rounded-lg text-xs font-medium transition-all border',
                      active
                        ? isYes
                          ? 'bg-sage/20 text-sage border-sage/30'
                          : 'bg-white text-charcoal border-linen-dark shadow-sm'
                        : 'text-stone border-transparent hover:text-charcoal',
                    ].join(' ')}
                  >
                    {lbl}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
