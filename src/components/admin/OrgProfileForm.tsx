'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressForUpload } from '@/lib/image-compress'

export interface OrgData {
  id: string
  name: string
  description: string | null
  description_ne: string | null
  city: string
  district: string | null
  whatsapp_number: string
  website_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  registration_number: string | null
  founded_year: number | null
  animals_rescued_count: number | null
  logo_url: string | null
  cover_url: string | null
}

interface Props {
  org: OrgData
  supabaseUrl: string
}

const inputClass = 'w-full text-sm text-charcoal bg-white border border-linen-dark rounded-xl px-4 py-2.5 focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-stone/40'
const textareaClass = `${inputClass} resize-vertical leading-relaxed min-h-[80px]`

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function OrgProfileForm({ org, supabaseUrl }: Props) {
  const [form, setForm] = useState({
    name:                  org.name,
    description:           org.description ?? '',
    description_ne:        org.description_ne ?? '',
    city:                  org.city,
    district:              org.district ?? '',
    whatsapp_number:       org.whatsapp_number,
    website_url:           org.website_url ?? '',
    facebook_url:          org.facebook_url ?? '',
    instagram_url:         org.instagram_url ?? '',
    registration_number:   org.registration_number ?? '',
    founded_year:          org.founded_year?.toString() ?? '',
    animals_rescued_count: org.animals_rescued_count?.toString() ?? '',
  })

  const [logoPreview,  setLogoPreview]  = useState<string | null>(
    org.logo_url ? `${supabaseUrl}/storage/v1/object/public/org-assets/${org.logo_url}` : null
  )
  const [coverPreview, setCoverPreview] = useState<string | null>(
    org.cover_url ? `${supabaseUrl}/storage/v1/object/public/org-assets/${org.cover_url}` : null
  )
  const [logoFile,  setLogoFile]  = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null)
  const logoRef  = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  function patch(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleImageFile(
    file: File,
    setPreview: (url: string) => void,
    setFile: (f: File) => void
  ) {
    setPreview(URL.createObjectURL(file))
    setFile(file)
  }

  async function uploadImage(file: File, path: string): Promise<string> {
    const compressed = await compressForUpload(file)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    const { error } = await supabase.storage
      .from('org-assets')
      .upload(path, compressed, { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(error.message)
    return path
  }

  async function handleSave() {
    setSaveState('saving')
    setErrorMsg(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any
      const ts = Date.now()

      let logo_url  = org.logo_url
      let cover_url = org.cover_url

      if (logoFile) {
        logo_url = await uploadImage(logoFile, `${org.id}/logo-${ts}.webp`)
      }
      if (coverFile) {
        cover_url = await uploadImage(coverFile, `${org.id}/cover-${ts}.webp`)
      }

      const { error } = await supabase
        .from('organizations')
        .update({
          name:                  form.name.trim(),
          description:           form.description.trim() || null,
          description_ne:        form.description_ne.trim() || null,
          city:                  form.city.trim(),
          district:              form.district.trim() || null,
          whatsapp_number:       form.whatsapp_number.trim(),
          website_url:           form.website_url.trim() || null,
          facebook_url:          form.facebook_url.trim() || null,
          instagram_url:         form.instagram_url.trim() || null,
          registration_number:   form.registration_number.trim() || null,
          founded_year:          form.founded_year ? parseInt(form.founded_year) : null,
          animals_rescued_count: form.animals_rescued_count ? parseInt(form.animals_rescued_count) : null,
          logo_url,
          cover_url,
        })
        .eq('id', org.id)

      if (error) throw new Error(error.message)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Save failed')
      setSaveState('error')
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* ── Identity ── */}
      <section className="bg-white border border-linen-dark rounded-2xl p-6 space-y-5 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <h2 className="font-satoshi font-semibold text-base text-charcoal">Identity</h2>

        <Field label="Organization name" required>
          <input type="text" value={form.name} onChange={(e) => patch('name', e.target.value)} className={inputClass} placeholder="All Care Nepal" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City" required>
            <input type="text" value={form.city} onChange={(e) => patch('city', e.target.value)} className={inputClass} placeholder="Butwal" />
          </Field>
          <Field label="District">
            <input type="text" value={form.district} onChange={(e) => patch('district', e.target.value)} className={inputClass} placeholder="Rupandehi" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Founded year">
            <input type="number" value={form.founded_year} onChange={(e) => patch('founded_year', e.target.value)} className={inputClass} placeholder="2020" min={1900} max={new Date().getFullYear()} />
          </Field>
          <Field label="Animals rescued (display count)">
            <input type="number" value={form.animals_rescued_count} onChange={(e) => patch('animals_rescued_count', e.target.value)} className={inputClass} placeholder="450" min={0} />
          </Field>
        </div>

        <Field label="Registration number" helper="Shown publicly as a trust signal">
          <input type="text" value={form.registration_number} onChange={(e) => patch('registration_number', e.target.value)} className={inputClass} placeholder="NGO-2021-XXXX" />
        </Field>
      </section>

      {/* ── Description ── */}
      <section className="bg-white border border-linen-dark rounded-2xl p-6 space-y-5 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <h2 className="font-satoshi font-semibold text-base text-charcoal">Description</h2>
        <Field label="Description (English)">
          <textarea value={form.description} onChange={(e) => patch('description', e.target.value)} className={textareaClass} placeholder="Tell adopters about your mission and what makes your shelter special." />
        </Field>
        <Field label="Description (Nepali)">
          <textarea value={form.description_ne} onChange={(e) => patch('description_ne', e.target.value)} className={textareaClass} placeholder="नेपाली विवरण…" lang="ne" />
        </Field>
      </section>

      {/* ── Contact & social ── */}
      <section className="bg-white border border-linen-dark rounded-2xl p-6 space-y-5 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <h2 className="font-satoshi font-semibold text-base text-charcoal">Contact & social</h2>

        <Field
          label="WhatsApp number"
          required
          helper="Digits only, no +977. Changing this affects ALL animal inquiry redirects."
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone select-none">+977</span>
            <input
              type="tel"
              value={form.whatsapp_number}
              onChange={(e) => patch('whatsapp_number', e.target.value)}
              className={`${inputClass} pl-14`}
              placeholder="98XXXXXXXX"
            />
          </div>
          {form.whatsapp_number !== org.whatsapp_number && (
            <p className="text-[11px] text-terracotta mt-1 flex items-center gap-1">
              <span>⚠</span> Changing this redirects all animal inquiry messages to the new number.
            </p>
          )}
        </Field>

        <Field label="Website URL">
          <input type="url" value={form.website_url} onChange={(e) => patch('website_url', e.target.value)} className={inputClass} placeholder="https://allcarenepal.org" />
        </Field>
        <Field label="Facebook URL">
          <input type="url" value={form.facebook_url} onChange={(e) => patch('facebook_url', e.target.value)} className={inputClass} placeholder="https://facebook.com/allcarenepal" />
        </Field>
        <Field label="Instagram URL">
          <input type="url" value={form.instagram_url} onChange={(e) => patch('instagram_url', e.target.value)} className={inputClass} placeholder="https://instagram.com/allcarenepal" />
        </Field>
      </section>

      {/* ── Media ── */}
      <section className="bg-white border border-linen-dark rounded-2xl p-6 space-y-5 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <h2 className="font-satoshi font-semibold text-base text-charcoal">Media</h2>

        <div className="grid grid-cols-2 gap-5">
          {/* Logo */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium mb-2">Logo</p>
            <div
              onClick={() => logoRef.current?.click()}
              className="aspect-square rounded-xl bg-linen border border-linen-dark flex items-center justify-center cursor-pointer hover:border-terracotta/40 transition-colors overflow-hidden"
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-stone/40 text-3xl">🏢</span>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setLogoPreview, setLogoFile); e.target.value = '' }} />
            <p className="text-[10px] text-stone mt-1.5 text-center">Click to change</p>
          </div>

          {/* Cover */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium mb-2">Cover photo</p>
            <div
              onClick={() => coverRef.current?.click()}
              className="aspect-square rounded-xl bg-linen border border-linen-dark flex items-center justify-center cursor-pointer hover:border-terracotta/40 transition-colors overflow-hidden"
            >
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <span className="text-stone/40 text-3xl">🖼</span>
              )}
            </div>
            <input ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setCoverPreview, setCoverFile); e.target.value = '' }} />
            <p className="text-[10px] text-stone mt-1.5 text-center">Click to change</p>
          </div>
        </div>
      </section>

      {/* Error */}
      {errorMsg && (
        <div className="px-4 py-3 bg-terracotta/8 border border-terracotta/20 rounded-xl">
          <p className="text-[12px] text-terracotta">{errorMsg}</p>
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="w-full bg-terracotta text-white rounded-full py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.2)] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {saveState === 'saving' && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {saveState === 'saved'  ? '✓ Saved!' :
         saveState === 'saving' ? 'Saving…'  :
         'Update organization profile'}
      </button>
    </div>
  )
}

// ── Field helper ──────────────────────────────────────────
function Field({
  label, required, helper, children,
}: {
  label: string; required?: boolean; helper?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium">
        {label}{required && <span className="text-terracotta ml-0.5">*</span>}
      </label>
      {children}
      {helper && <p className="text-[11px] text-stone/70">{helper}</p>}
    </div>
  )
}
