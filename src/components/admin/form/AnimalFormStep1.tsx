'use client'

import type { AnimalDraft } from './types'
import FormField from './FormField'
import SegmentedControl from './SegmentedControl'

interface Props {
  data: AnimalDraft
  onChange: (patch: Partial<AnimalDraft>) => void
}

const inputClass =
  'w-full text-sm text-charcoal bg-white border border-linen-dark rounded-xl px-4 py-2.5 focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-stone/40'

export default function AnimalFormStep1({ data, onChange }: Props) {
  return (
    <div className="space-y-6">

      {/* Name */}
      <FormField
        label="Name"
        required
        htmlFor="name"
        helper="The name the animal is known by at the shelter"
      >
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Bruno, Sita, Momo"
          className={inputClass}
        />
      </FormField>

      {/* Species */}
      <FormField label="Species" required>
        <SegmentedControl
          options={[
            { value: 'dog',    label: 'Dog' },
            { value: 'cat',    label: 'Cat' },
            { value: 'rabbit', label: 'Rabbit' },
            { value: 'other',  label: 'Other' },
          ]}
          value={data.species}
          onChange={(v) => onChange({ species: v as AnimalDraft['species'] })}
        />
      </FormField>

      {/* Breed */}
      <FormField label="Breed" htmlFor="breed">
        <input
          id="breed"
          type="text"
          value={data.breed}
          onChange={(e) => onChange({ breed: e.target.value })}
          placeholder="Mixed breed, Labrador mix, etc. — optional"
          className={inputClass}
        />
      </FormField>

      {/* Gender */}
      <FormField label="Gender" required>
        <SegmentedControl
          options={[
            { value: 'male',    label: 'Male' },
            { value: 'female',  label: 'Female' },
            { value: 'unknown', label: 'Unknown' },
          ]}
          value={data.gender}
          onChange={(v) => onChange({ gender: v as AnimalDraft['gender'] })}
        />
      </FormField>

      {/* Age */}
      <FormField
        label="Age"
        helper="Estimate is fine — 'about 2 years' is better than leaving blank"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              min={0}
              max={30}
              value={data.age_years ?? ''}
              onChange={(e) => onChange({ age_years: e.target.value === '' ? null : Number(e.target.value) })}
              placeholder="0"
              className={`${inputClass} pr-14`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-stone pointer-events-none">
              years
            </span>
          </div>
          <div className="flex-1 relative">
            <input
              type="number"
              min={0}
              max={11}
              value={data.age_months ?? ''}
              onChange={(e) => onChange({ age_months: e.target.value === '' ? null : Number(e.target.value) })}
              placeholder="0"
              className={`${inputClass} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-stone pointer-events-none">
              months
            </span>
          </div>
        </div>
      </FormField>

      {/* Size */}
      <FormField label="Size" required>
        <SegmentedControl
          options={[
            { value: 'small',  label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large',  label: 'Large' },
            { value: 'xlarge', label: 'XL' },
          ]}
          value={data.size}
          onChange={(v) => onChange({ size: v as AnimalDraft['size'] })}
        />
      </FormField>

      {/* Intake date */}
      <FormField
        label="Intake date"
        required
        htmlFor="intake_date"
        helper="The date this animal came into your care — this drives the waiting counter shown publicly"
      >
        <input
          id="intake_date"
          type="date"
          value={data.intake_date}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => onChange({ intake_date: e.target.value })}
          className={inputClass}
        />
      </FormField>

      {/* Color */}
      <FormField label="Color" htmlFor="color">
        <input
          id="color"
          type="text"
          value={data.color}
          onChange={(e) => onChange({ color: e.target.value })}
          placeholder="e.g. Golden, Black and white, Tabby — optional"
          className={inputClass}
        />
      </FormField>
    </div>
  )
}
