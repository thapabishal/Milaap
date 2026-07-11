'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type AnimalDraft, type PhotoEntry, EMPTY_DRAFT, validateStep } from './types'
import AnimalFormStep1 from './AnimalFormStep1'
import AnimalFormStep2 from './AnimalFormStep2'
import AnimalFormStep3 from './AnimalFormStep3'
import AnimalFormStep4 from './AnimalFormStep4'
import AnimalFormStep5 from './AnimalFormStep5'
import AnimalFormStep6 from './AnimalFormStep6'

const STEPS = [
  { number: 1, label: 'Basics' },
  { number: 2, label: 'Story' },
  { number: 3, label: 'Traits' },
  { number: 4, label: 'Medical' },
  { number: 5, label: 'Photos' },
  { number: 6, label: 'Review' },
]
const TOTAL_STEPS = STEPS.length

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
  animalId?: string
  orgId: string
}

export default function AnimalFormShell({ initialData, animalId, orgId }: Props) {
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<AnimalDraft>({ ...EMPTY_DRAFT, ...initialData })
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Stable temp ID used as storage folder prefix for photos before animal is saved
  const tempAnimalId = useRef(animalId ?? crypto.randomUUID()).current
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

  async function upsert(publish: boolean): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any

    // Build photos jsonb — only uploaded ones
    const photosJson = photos
      .filter((p) => p.path)
      .map((p, i) => ({ path: p.path!, is_hero: i === 0 }))

    const payload = {
      organization_id: orgId,
      name: draft.name.trim(),
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
      medical_notes: draft.medical_notes.trim() || null,
      photos: photosJson,
      is_published: publish,
    }

    if (animalId) {
      const { error } = await supabase
        .from('animals')
        .update(payload)
        .eq('id', animalId)
      if (error) throw new Error(error.message)
      return animalId
    } else {
      const { data, error } = await supabase
        .from('animals')
        .insert([{ ...payload, slug: generateSlug(draft.name) }])
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      return (data as { id: string }).id
    }
  }

  async function handleSaveDraft() {
    setSaving(true)
    setError(null)
    try {
      await upsert(false)
      // Store toast message in sessionStorage, read on the list page
      sessionStorage.setItem(
        'admin_toast',
        `Saved as draft — ${draft.name} is not yet visible to the public`
      )
      router.push('/admin/animals')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  async function handlePublish() {
    setSaving(true)
    setError(null)
    try {
      await upsert(true)
      sessionStorage.setItem('admin_toast', `${draft.name} is now live on Milaap 🎉`)
      router.push('/admin/animals')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed')
      setSaving(false)
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
                if (s.number < step) { setStep(s.number); setError(null) }
              }}
              className={[
                'flex flex-col items-center gap-1',
                s.number < step ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
              aria-label={`Step ${s.number}: ${s.label}`}
            >
              <div className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors',
                s.number < step   ? 'bg-terracotta text-white' :
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
        <div className="h-[2px] bg-linen-dark rounded-full overflow-hidden -mt-1">
          <div
            className="h-full bg-terracotta rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Step card ── */}
      <div className="bg-white border border-linen-dark rounded-2xl p-6 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <h2 className="font-satoshi font-bold text-xl text-charcoal mb-1">
          {step === 1 && 'The basics'}
          {step === 2 && 'The story'}
          {step === 3 && 'Personality & traits'}
          {step === 4 && 'Medical details'}
          {step === 5 && 'Photos'}
          {step === 6 && 'Review & publish'}
        </h2>
        <p className="text-[12px] text-stone mb-6">
          {step === 1 && 'Start with the essential details about this animal.'}
          {step === 2 && 'This is what makes people fall in love. Take your time.'}
          {step === 3 && 'Help families understand if this animal is a good fit.'}
          {step === 4 && 'Internal medical status — vaccination and neutered shown publicly.'}
          {step === 5 && 'Upload photos — the first photo is the hero shown on the discovery feed.'}
          {step === 6 && 'Run the quality check, then publish or save as draft.'}
        </p>

        {step === 1 && <AnimalFormStep1 data={draft} onChange={patch} />}
        {step === 2 && <AnimalFormStep2 data={draft} onChange={patch} />}
        {step === 3 && <AnimalFormStep3 data={draft} onChange={patch} />}
        {step === 4 && <AnimalFormStep4 data={draft} onChange={patch} />}
        {step === 5 && (
          <AnimalFormStep5
            orgId={orgId}
            tempAnimalId={tempAnimalId}
            photos={photos}
            onPhotosChange={setPhotos}
          />
        )}
        {step === 6 && (
          <AnimalFormStep6
            draft={draft}
            photos={photos}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            saving={saving}
          />
        )}

        {error && (
          <div className="mt-4 px-4 py-2.5 bg-terracotta/8 border border-terracotta/20 rounded-xl">
            <p className="text-[12px] text-terracotta">{error}</p>
          </div>
        )}
      </div>

      {/* ── Navigation (hidden on step 6 — actions are inside the card) ── */}
      {step < TOTAL_STEPS && (
        <div className="flex items-center justify-between mt-5">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="bg-transparent text-stone border border-linen-dark rounded-full px-6 py-2.5 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            {draft.name.trim() && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="text-[12px] text-stone hover:text-charcoal transition-colors"
              >
                {saving ? 'Saving…' : 'Save draft'}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="bg-terracotta text-white rounded-full px-7 py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.2)]"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Back button on step 6 */}
      {step === TOTAL_STEPS && (
        <div className="mt-5">
          <button
            type="button"
            onClick={handleBack}
            className="bg-transparent text-stone border border-linen-dark rounded-full px-6 py-2.5 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
