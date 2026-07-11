'use client'

import { useState, useRef } from 'react'
import { compressForUpload } from '@/lib/image-compress'

interface Reminder {
  id: string
  animal_id: string
  organization_id: string
  adopter_name: string
  animal: { name: string; intake_date: string; adopted_date: string | null }
}

interface Props {
  reminder: Reminder
  supabaseUrl: string
  supabaseAnonKey: string
}

type UploadState = 'idle' | 'compressing' | 'uploading' | 'done'

export default function SubmitHappyTailForm({ reminder, supabaseUrl, supabaseAnonKey }: Props) {
  const animalName = reminder.animal.name
  const [story, setStory]       = useState('')
  const [name, setName]         = useState(reminder.adopter_name !== 'the adopter' ? reminder.adopter_name : '')
  const [city, setCity]         = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [compressedSize, setCompressedSize] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPhotoPreview(preview)
    setPhotoFile(file)
    setUploadState('idle')
    setCompressedSize(null)
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!story.trim()) { setError('Please share a few words about your experience.'); return }
    if (!name.trim())  { setError('Please enter your first name.'); return }
    if (!photoFile)    { setError('Please add a photo of your animal at home.'); return }

    setSubmitting(true)
    try {
      // 1. Compress + upload photo
      setUploadState('compressing')
      const compressed = await compressForUpload(photoFile)
      setCompressedSize(compressed.size)

      setUploadState('uploading')
      const timestamp = Date.now()
      const storagePath = `${reminder.organization_id}/happy-tails/${timestamp}.webp`

      const uploadRes = await fetch(
        `${supabaseUrl}/storage/v1/object/animal-photos/${storagePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'image/webp',
            'x-upsert': 'false',
          },
          body: compressed,
        }
      )
      if (!uploadRes.ok) {
        const msg = await uploadRes.text()
        throw new Error(`Photo upload failed: ${msg}`)
      }
      setUploadState('done')

      // 2. Compute days waited snapshot
      const intakeDate   = reminder.animal.intake_date
        ? new Date(reminder.animal.intake_date)
        : null
      const adoptedDate  = reminder.animal.adopted_date
        ? new Date(reminder.animal.adopted_date)
        : new Date()
      const daysWaited = intakeDate
        ? Math.max(0, Math.floor((adoptedDate.getTime() - intakeDate.getTime()) / 86400000))
        : null

      // 3. Insert happy_tail via API route (uses service role to bypass RLS)
      const res = await fetch('/api/happy-tails/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminder_id:    reminder.id,
          animal_id:      reminder.animal_id,
          organization_id: reminder.organization_id,
          adopter_name:   name.trim(),
          adopter_city:   city.trim() || null,
          story_en:       story.trim(),
          photo_url:      storagePath,
          days_waited:    daysWaited,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Submission failed')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full text-sm text-charcoal bg-white border border-linen-dark rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-stone/40 leading-relaxed'

  // ── Confirmation screen ───────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 rounded-full bg-sage/15 flex items-center justify-center mx-auto mb-5 text-3xl">
          🐾
        </div>
        <h2 className="font-satoshi font-bold text-2xl text-charcoal mb-3 leading-tight">
          Thank you.
        </h2>
        <p className="text-base text-stone leading-relaxed max-w-sm mx-auto">
          {animalName}&apos;s story will inspire someone to open their home too.{' '}
          <span className="text-dusty-rose">🐾</span>
        </p>
        <p className="mt-4 text-[12px] text-stone/60">
          The Milaap team will review and publish it shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Photo upload */}
      <div>
        <label className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium block mb-2">
          A photo of {animalName} at home <span className="text-terracotta">*</span>
        </label>

        {photoPreview ? (
          <div className="relative rounded-xl overflow-hidden aspect-video bg-linen">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            {uploadState === 'compressing' && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <p className="text-sm text-stone">Compressing…</p>
              </div>
            )}
            {uploadState === 'uploading' && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <p className="text-sm text-stone">Uploading…</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); setUploadState('idle') }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-charcoal/60 text-white flex items-center justify-center text-xs hover:bg-charcoal transition-colors"
            >
              ✕
            </button>
            {compressedSize && (
              <span className="absolute bottom-2 left-2 text-[10px] bg-white/80 text-sage font-medium rounded-full px-2 py-0.5">
                {Math.round(compressedSize / 1024)}KB ✓
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-linen-dark rounded-xl py-10 flex flex-col items-center gap-2 text-stone hover:border-terracotta/40 transition-colors bg-linen"
          >
            <span className="text-3xl">📷</span>
            <span className="text-sm font-medium">Tap to add a photo</span>
            <span className="text-[11px]">JPG, PNG or WebP</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Story */}
      <div>
        <label htmlFor="story" className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium block mb-2">
          How has {animalName} changed your life? <span className="text-terracotta">*</span>
        </label>
        <textarea
          id="story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder={`Two sentences is perfect — just tell us how ${animalName} is doing at home.`}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="adopter_name" className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium block mb-2">
          Your first name <span className="text-terracotta">*</span>
        </label>
        <input
          id="adopter_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya"
          className={inputClass}
        />
      </div>

      {/* City */}
      <div>
        <label htmlFor="adopter_city" className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium block mb-2">
          Your city
        </label>
        <input
          id="adopter_city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Pokhara"
          className={inputClass}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-terracotta/8 border border-terracotta/20 rounded-xl">
          <p className="text-[12px] text-terracotta">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-terracotta text-white rounded-full py-4 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          `Share ${animalName}'s story →`
        )}
      </button>
    </form>
  )
}
