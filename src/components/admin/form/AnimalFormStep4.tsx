'use client'

import type { AnimalDraft } from './types'
import FormField from './FormField'

interface Props {
  data: AnimalDraft
  onChange: (patch: Partial<AnimalDraft>) => void
}

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  icon: string
}

function Toggle({ value, onChange, label, icon }: ToggleProps) {
  return (
    <div className="bg-white border border-linen-dark rounded-xl px-4 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <p className="text-sm font-semibold text-charcoal font-satoshi">{label}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50',
          value ? 'bg-sage' : 'bg-linen-dark',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            value ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

const textareaClass =
  'w-full text-sm text-charcoal bg-white border border-linen-dark rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-stone/40 resize-vertical leading-relaxed min-h-[100px]'

export default function AnimalFormStep4({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-[11px] text-stone uppercase tracking-[0.08em] font-medium">
        Medical status
      </p>
      <p className="text-[11px] text-stone/70 -mt-3">
        Vaccination and neutered status are shown publicly on the profile. Microchipped is internal only.
      </p>

      <div className="space-y-3">
        <Toggle
          icon="💉"
          label="Vaccinated"
          value={data.is_vaccinated}
          onChange={(v) => onChange({ is_vaccinated: v })}
        />
        <Toggle
          icon="✂️"
          label="Neutered / Spayed"
          value={data.is_neutered}
          onChange={(v) => onChange({ is_neutered: v })}
        />
        <Toggle
          icon="📡"
          label="Microchipped"
          value={data.is_microchipped}
          onChange={(v) => onChange({ is_microchipped: v })}
        />
      </div>

      <FormField
        label="Medical notes (internal — not shown publicly)"
        htmlFor="medical_notes"
        helper="Ongoing conditions, medications, behavioural notes for the team"
      >
        <textarea
          id="medical_notes"
          value={data.medical_notes}
          onChange={(e) => onChange({ medical_notes: e.target.value })}
          placeholder="Any ongoing conditions, medications, behavioral notes for the team"
          className={textareaClass}
        />
      </FormField>
    </div>
  )
}
