'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type AnimalStatus = 'available' | 'reserved' | 'fostered' | 'medical_hold' | 'adopted'

const STATUS_OPTIONS: { value: AnimalStatus; label: string }[] = [
  { value: 'available',    label: 'Available' },
  { value: 'reserved',     label: 'Reserved' },
  { value: 'fostered',     label: 'Fostered' },
  { value: 'medical_hold', label: 'Medical Hold' },
  { value: 'adopted',      label: 'Adopted' },
]

const statusBadgeClasses: Record<AnimalStatus, string> = {
  available:    'bg-status-available/15 text-status-available',
  reserved:     'bg-status-reserved/15 text-status-reserved',
  fostered:     'bg-status-fostered/15 text-status-fostered',
  medical_hold: 'bg-status-medical/15 text-status-medical',
  adopted:      'bg-status-adopted/15 text-status-adopted',
}

const statusLabels: Record<AnimalStatus, string> = {
  available:    'Available',
  reserved:     'Reserved',
  fostered:     'Fostered',
  medical_hold: 'Medical Hold',
  adopted:      'Adopted',
}

interface AdoptionDetails {
  adopted_by_name: string
  adopted_by_city: string
  adopter_whatsapp: string
}

interface Props {
  animalId: string
  current: AnimalStatus
  onChanged: (id: string, newStatus: AnimalStatus, extra?: Partial<AdoptionDetails>) => void
}

export default function AnimalStatusDropdown({ animalId, current, onChanged }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<AnimalStatus | null>(null)
  const [adoptionForm, setAdoptionForm] = useState<AdoptionDetails>({
    adopted_by_name: '',
    adopted_by_city: '',
    adopter_whatsapp: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setPending(null)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function applyStatusChange(status: AnimalStatus, extra?: AdoptionDetails) {
    setSaving(true)
    setError(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any

    const patch: Record<string, unknown> = { status }
    if (extra) {
      if (extra.adopted_by_name) patch.adopted_by_name = extra.adopted_by_name
      if (extra.adopted_by_city) patch.adopted_by_city = extra.adopted_by_city
    }

    const { error: err } = await supabase
      .from('animals')
      .update(patch)
      .eq('id', animalId)

    if (err) {
      setError('Failed to update status.')
      setSaving(false)
      return
    }

    onChanged(animalId, status, extra)
    setOpen(false)
    setPending(null)
    setSaving(false)
  }

  function handleSelect(status: AnimalStatus) {
    if (status === current) { setOpen(false); return }
    if (status === 'adopted') {
      setPending('adopted')
      return
    }
    applyStatusChange(status)
  }

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Current badge — clickable */}
      <button
        onClick={() => { setOpen((v) => !v); setPending(null) }}
        className={[
          'inline-flex items-center gap-1 rounded-tag px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.1em] transition-opacity hover:opacity-80',
          statusBadgeClasses[current],
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current === 'available' && (
          <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse shrink-0" />
        )}
        {statusLabels[current]}
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="ml-0.5 shrink-0">
          <path d="M1.5 3L4 5.5 6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && !pending && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-linen-dark rounded-xl shadow-[0_4px_16px_rgba(45,41,38,0.12)] py-1 min-w-[140px]">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={[
                'w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-linen',
                opt.value === current ? 'font-semibold text-charcoal' : 'text-stone',
              ].join(' ')}
            >
              <span className={[
                'inline-block w-1.5 h-1.5 rounded-full',
                opt.value === 'available'    ? 'bg-status-available' :
                opt.value === 'reserved'     ? 'bg-status-reserved' :
                opt.value === 'fostered'     ? 'bg-status-fostered' :
                opt.value === 'medical_hold' ? 'bg-status-medical' :
                'bg-status-adopted',
              ].join(' ')} />
              {opt.label}
              {opt.value === current && (
                <svg className="ml-auto" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Adoption inline form */}
      {open && pending === 'adopted' && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-linen-dark rounded-xl shadow-[0_4px_16px_rgba(45,41,38,0.12)] p-4 w-72">
          <p className="text-xs font-semibold text-charcoal mb-3">Adoption details</p>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] uppercase tracking-[0.06em] text-stone font-medium block mb-1">
                Adopter name <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                value={adoptionForm.adopted_by_name}
                onChange={(e) => setAdoptionForm((f) => ({ ...f, adopted_by_name: e.target.value }))}
                placeholder="e.g. Ramesh Thapa"
                className="w-full text-sm bg-linen border border-linen-dark rounded-lg px-3 py-1.5 focus:outline-none focus:border-terracotta/40 text-charcoal placeholder:text-stone/50"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.06em] text-stone font-medium block mb-1">
                City
              </label>
              <input
                type="text"
                value={adoptionForm.adopted_by_city}
                onChange={(e) => setAdoptionForm((f) => ({ ...f, adopted_by_city: e.target.value }))}
                placeholder="e.g. Butwal"
                className="w-full text-sm bg-linen border border-linen-dark rounded-lg px-3 py-1.5 focus:outline-none focus:border-terracotta/40 text-charcoal placeholder:text-stone/50"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.06em] text-stone font-medium block mb-1">
                WhatsApp for follow-up
              </label>
              <input
                type="tel"
                value={adoptionForm.adopter_whatsapp}
                onChange={(e) => setAdoptionForm((f) => ({ ...f, adopter_whatsapp: e.target.value }))}
                placeholder="98XXXXXXXX"
                className="w-full text-sm bg-linen border border-linen-dark rounded-lg px-3 py-1.5 focus:outline-none focus:border-terracotta/40 text-charcoal placeholder:text-stone/50"
              />
            </div>
          </div>

          {error && <p className="mt-2 text-[11px] text-terracotta">{error}</p>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => applyStatusChange('adopted', adoptionForm)}
              disabled={saving || !adoptionForm.adopted_by_name.trim()}
              className="flex-1 bg-terracotta text-white rounded-full py-2 text-xs font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Mark adopted'}
            </button>
            <button
              onClick={() => { setPending(null); setOpen(false) }}
              className="flex-1 bg-transparent text-stone border border-linen-dark rounded-full py-2 text-xs tracking-[0.04em] hover:border-charcoal/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
