'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type AnimalDraft, EMPTY_DRAFT, validateStep } from './types'
import AnimalFormStep1 from './AnimalFormStep1'
import AnimalFormStep2 from './AnimalFormStep2'
import AnimalFormStep3 from './AnimalFormStep3'

const STEPS = [
  { number: 1, label: 'Basics' },
  { number: 2, label: 'Story' },
  { number: 3, label: 'Traits' },
  { number: 4, label: 'Photos' },
  { number: 5, label: 'Medical' },
  { number: 6, label: 'Review' },
]

const TOTAL_STEPS = STEPS.length

// Generate a URL-safe slug from animal name + short uuid suffix
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

interface Props {
  initialData?: Partial<AnimalDraft>
  animalId?: string          // present when editing
  orgId: string
}

export default function AnimalFormShell({ initialData, animalId, orgId }: Props) {
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<AnimalDraft>({ ...EMPTY_DRAFT, ...initialData })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function patch(p: Partial<AnimalDraft>) {
    setDraft((prev) => ({ ...prev, ...p }))
    setError(null)
  }

  function handleNext() {
    const err = validateStep(step, draft)
    if (err) { setError(err); return }
    setError(null)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function handleBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleSaveDraft() {
    setSaving(true)
    setError(null)
    try {
      await upsert(false)
      router.push('/admin/animals')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function upsert(publish: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    const payload = {
      organization_id: orgId,
      name: draft.name.trim(),
      slug: animalId ? undefined : generateSlug(draft.name),
      species: draft.species,
      breed: draft.breed.trim() || null,
      gender: draft.gender,
      age_years: draft.age_years,
      age_months: draft.age_months,
      size: draft.size,
      intake_date: draft.intake_date,
      color: draft.color.trim() || null,
      one_liner: draft.one_liner.trim(),
      one_liner_ne: draft.one_liner_ne.trim() || null,
      story_en: draft.story_en.trim(),
      story_ne: draft.story_ne.trim() || null,
      personality_en: draft.personality_en.trim() || null,
      good_with_kids: draft.good_with_kids,
      good_with_dogs: draft.good_with_dogs,
      good_with_cats: draft.good_with_cats,
      apartment_ok: draft.apartment_ok,
      needs_garden: draft.needs_garden,
      energy_level: draft.energy_level,
      is_vaccinated: draft.is_vaccinated,
      is_neutered: draft.is_neutered,
      is_microchipped: draft.is_microchipped,
      is_published: publish,
    }

    if (animalId) {
      // Remove slug from patch — slug never changes after creation
      const { slug: _slug, ...patchPayload } = payload as typeof payload & { slug?: string }
      void _slug
      const { error } = await supabase.from('animals').update(patchPayload).eq('id', animalId)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase.from('animals').insert([payload])
      if (error) throw new Error(error.message)
    }
  }

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="max-w-2xl">
      {/* ── Progress bar ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s) => (
            <button
              key={s.number}
              type="button"
              onClick={() => {
                // Only allow navigating to completed steps
                if (s.number < step) { setStep(s.number); setError(null) }
              }}
              className={[
                'flex flex-col items-center gap-1 group',
                s.number < step ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
              aria-label={`Step ${s.number}: ${s.label}`}
            >
              <div className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors',
                s.number < step  ? 'bg-terracotta text-white' :
                s.number === step ? 'bg-white border-2 border-terracotta text-terracotta' :
                'bg-linen-dark text-stone',
              ].join(' ')}>
                {s.number < step ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : s.number}
              </div>
              <span className={[
                'text-[9px] uppercase tracking-[0.06em] font-medium hidden sm:block',
                s.number === step ? 'text-terracotta' : 'text-stone',
              ].join(' ')}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Thin progress line */}
        <div className="h-[2px] bg-linen-dark rounded-full overflow-hidden -mt-1">
          <div
            className="h-full bg-terracotta rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="bg-white border border-linen-dark rounded-2xl p-6 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <h2 className="font-satoshi font-bold text-xl text-charcoal mb-1">
          {step === 1 && 'The basics'}
          {step === 2 && 'The story'}
          {step === 3 && 'Personality & traits'}
          {step === 4 && 'Photos'}
          {step === 5 && 'Medical details'}
          {step === 6 && 'Review & save'}
        </h2>
        <p className="text-[12px] text-stone mb-6">
          {step === 1 && 'Start with the essential details about this animal.'}
          {step === 2 && 'This is what makes people fall in love. Take your time.'}
          {step === 3 && 'Help families understand if this animal is a good fit.'}
          {step === 4 && 'Upload photos — the hero photo appears on the discovery feed.'}
          {step === 5 && 'Internal medical status — not shown publicly except vaccination and neutered.'}
          {step === 6 && 'Everything looks good? Save as draft or publish now.'}
        </p>

        {step === 1 && <AnimalFormStep1 data={draft} onChange={patch} />}
        {step === 2 && <AnimalFormStep2 data={draft} onChange={patch} />}
        {step === 3 && <AnimalFormStep3 data={draft} onChange={patch} />}

        {/* Steps 4, 5, 6 — placeholders for future builds */}
        {step === 4 && (
          <div className="py-10 text-center">
            <p className="text-2xl mb-2">📷</p>
            <p className="text-sm text-stone">Photo upload — coming in the next step.</p>
          </div>
        )}
        {step === 5 && (
          <div className="py-10 text-center">
            <p className="text-2xl mb-2">🩺</p>
            <p className="text-sm text-stone">Medical notes — coming in the next step.</p>
          </div>
        )}
        {step === 6 && (
          <div className="space-y-4">
            <div className="bg-linen border border-linen-dark rounded-xl p-4 text-sm text-charcoal space-y-1">
              <p><span className="font-semibold">Name:</span> {draft.name || '—'}</p>
              <p><span className="font-semibold">Species:</span> {draft.species} · {draft.gender}</p>
              <p><span className="font-semibold">Intake date:</span> {draft.intake_date || '—'}</p>
              <p><span className="font-semibold">Story length:</span> {draft.story_en.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>
            <p className="text-[11px] text-stone">
              Saving as draft keeps the profile private. Publish will run an AI quality check first.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-2.5 bg-terracotta/8 border border-terracotta/20 rounded-xl">
            <p className="text-[12px] text-terracotta">{error}</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-5">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="bg-transparent text-stone border border-linen-dark rounded-full px-6 py-2.5 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
          {/* Save as draft (available from step 1 onward if name is filled) */}
          {draft.name.trim() && step < 6 && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="text-[12px] text-stone hover:text-charcoal transition-colors"
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-terracotta text-white rounded-full px-7 py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.2)]"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="bg-charcoal text-linen rounded-full px-7 py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#1A1612] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save as draft'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
