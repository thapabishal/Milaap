'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type VerificationStatus = 'pending' | 'verified' | 'suspended'

export interface OrgRow {
  id: string
  name: string
  slug: string
  city: string
  verification_status: VerificationStatus
  animal_count: number
  created_at: string
}

interface Props {
  initialOrgs: OrgRow[]
}

const STATUS_STYLES: Record<VerificationStatus, string> = {
  verified:  'bg-sage/15 text-sage border-sage/30',
  pending:   'bg-dusty-rose/15 text-dusty-rose border-dusty-rose/30',
  suspended: 'bg-terracotta/10 text-terracotta border-terracotta/20',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Add Org Modal ─────────────────────────────────────────
interface AddOrgModalProps {
  onClose: () => void
  onCreated: (org: OrgRow) => void
}

function AddOrgModal({ onClose, onCreated }: AddOrgModalProps) {
  const [form, setForm] = useState({
    name: '', slug: '', city: '', whatsapp_number: '',
    website_url: '', registration_number: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null)

  function patch(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.slug.trim() || !form.city.trim() || !form.whatsapp_number.trim()) {
      setError('Name, slug, city and WhatsApp number are required.'); return
    }
    setSaving(true); setError(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    const { data, error: err } = await supabase
      .from('organizations')
      .insert([{
        name:                form.name.trim(),
        slug:                form.slug.trim(),
        city:                form.city.trim(),
        whatsapp_number:     form.whatsapp_number.trim(),
        website_url:         form.website_url.trim() || null,
        registration_number: form.registration_number.trim() || null,
        verification_status: 'pending',
        is_active:           true,
      }])
      .select('id, name, slug, city, verification_status, created_at')
      .single()

    if (err) { setError(err.message); setSaving(false); return }

    setCreated({ id: data.id, name: data.name })
    onCreated({ ...data, animal_count: 0 })
    setSaving(false)
  }

  const inputClass = 'w-full text-sm text-charcoal bg-linen border border-linen-dark rounded-xl px-3 py-2.5 focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-stone/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px]" />
      <div className="relative z-10 bg-white rounded-2xl shadow-[0_8px_40px_rgba(45,41,38,0.18)] w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-linen-dark">
          <h2 className="font-satoshi font-bold text-base text-charcoal">Add organization</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-stone hover:bg-linen transition-colors">✕</button>
        </div>

        {!created ? (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium block mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => { patch('name', e.target.value); if (!form.slug) patch('slug', autoSlug(e.target.value)) }} placeholder="Paws Kathmandu" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium block mb-1">Slug *</label>
                <input type="text" value={form.slug} onChange={(e) => patch('slug', e.target.value)} placeholder="paws-kathmandu" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium block mb-1">City *</label>
                <input type="text" value={form.city} onChange={(e) => patch('city', e.target.value)} placeholder="Kathmandu" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium block mb-1">WhatsApp number * (digits only, no +977)</label>
                <input type="tel" value={form.whatsapp_number} onChange={(e) => patch('whatsapp_number', e.target.value)} placeholder="98XXXXXXXX" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium block mb-1">Website URL</label>
                <input type="url" value={form.website_url} onChange={(e) => patch('website_url', e.target.value)} placeholder="https://…" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium block mb-1">Registration number</label>
                <input type="text" value={form.registration_number} onChange={(e) => patch('registration_number', e.target.value)} placeholder="NGO-XXXX" className={inputClass} />
              </div>
            </div>
            {error && <p className="text-[12px] text-terracotta">{error}</p>}
            <button onClick={handleSubmit} disabled={saving}
              className="w-full bg-terracotta text-white rounded-full py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors disabled:opacity-60">
              {saving ? 'Creating…' : 'Create organization'}
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="bg-sage/10 border border-sage/25 rounded-xl p-4">
              <p className="text-sm font-semibold text-sage mb-1">✓ Organization created</p>
              <p className="text-xs text-charcoal font-mono break-all">{created.id}</p>
            </div>
            <div className="bg-linen border border-linen-dark rounded-xl p-4 space-y-2">
              <p className="text-[11px] font-semibold text-charcoal uppercase tracking-[0.06em]">Next steps to onboard a volunteer:</p>
              <ol className="text-[12px] text-stone space-y-1.5 list-decimal list-inside">
                <li>Go to <span className="font-medium text-charcoal">Supabase Dashboard → Auth → Users → Add user</span></li>
                <li>Enter their email + temporary password</li>
                <li>Copy the new user&apos;s UID, then run this SQL:</li>
              </ol>
              <pre className="text-[11px] bg-charcoal text-linen rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
{`insert into users (id, organization_id, full_name, role)
values (
  'PASTE-USER-UID-HERE',
  '${created.id}',
  'Volunteer Name',
  'volunteer'
);`}
              </pre>
            </div>
            <button onClick={onClose}
              className="w-full bg-charcoal text-linen rounded-full py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#1A1612] transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function PlatformManager({ initialOrgs }: Props) {
  const [orgs, setOrgs] = useState<OrgRow[]>(initialOrgs)
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState<{ id: string; name: string; action: 'verify' | 'suspend' | 'pending' } | null>(null)
  const [toggling, setToggling] = useState(false)

  const filtered = orgs.filter((o) => statusFilter === 'all' || o.verification_status === statusFilter)

  async function applyToggle() {
    if (!confirmToggle) return
    setToggling(true)
    const newStatus: VerificationStatus =
      confirmToggle.action === 'verify' ? 'verified' :
      confirmToggle.action === 'suspend' ? 'suspended' : 'pending'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    const { error } = await supabase
      .from('organizations')
      .update({ verification_status: newStatus })
      .eq('id', confirmToggle.id)

    if (!error) {
      setOrgs((prev) => prev.map((o) =>
        o.id === confirmToggle.id ? { ...o, verification_status: newStatus } : o
      ))
    }
    setConfirmToggle(null)
    setToggling(false)
  }

  return (
    <>
      {showAdd && (
        <AddOrgModal
          onClose={() => setShowAdd(false)}
          onCreated={(org) => {
            setOrgs((prev) => [org, ...prev])
            setShowAdd(false)
          }}
        />
      )}

      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmToggle(null) }}>
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px]" />
          <div className="relative z-10 bg-white rounded-2xl p-6 shadow-[0_8px_40px_rgba(45,41,38,0.18)] max-w-sm w-full space-y-4">
            <h3 className="font-satoshi font-bold text-base text-charcoal">
              {confirmToggle.action === 'verify' && `Verify ${confirmToggle.name}?`}
              {confirmToggle.action === 'suspend' && `Suspend ${confirmToggle.name}?`}
              {confirmToggle.action === 'pending' && `Reset ${confirmToggle.name} to pending?`}
            </h3>
            <p className="text-sm text-stone">
              {confirmToggle.action === 'verify' && 'This org will show the Verified badge publicly. Their animals appear in the discovery feed.'}
              {confirmToggle.action === 'suspend' && 'All animals from this org will be hidden from the public discovery feed immediately.'}
              {confirmToggle.action === 'pending' && 'The org will lose its Verified badge and be set to pending review.'}
            </p>
            <div className="flex gap-2">
              <button onClick={applyToggle} disabled={toggling}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold tracking-[0.04em] transition-colors disabled:opacity-50 ${confirmToggle.action === 'suspend' ? 'bg-terracotta text-white hover:bg-[#B05A3E]' : 'bg-sage text-white hover:bg-[#7A8B72]'}`}>
                {toggling ? '…' : 'Confirm'}
              </button>
              <button onClick={() => setConfirmToggle(null)}
                className="flex-1 bg-transparent text-stone border border-linen-dark rounded-full py-2.5 text-sm hover:border-charcoal/20 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header controls */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'verified', 'pending', 'suspended'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={['px-3 py-1.5 rounded-full text-xs tracking-[0.04em] border transition-colors capitalize',
                statusFilter === s ? 'bg-charcoal text-linen border-charcoal' : 'bg-white text-stone border-linen-dark hover:border-charcoal/20'].join(' ')}>
              {s === 'all' ? 'All orgs' : s}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-terracotta text-white rounded-full px-5 py-2 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.2)] flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add organization
        </button>
      </div>

      {/* Org table */}
      <div className="bg-white border border-linen-dark rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone">No organizations match this filter.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-linen-dark">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Organization</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium hidden sm:table-cell">Animals</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-stone font-medium hidden sm:table-cell">Added</th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((org, i) => (
                <tr key={org.id}
                  className={['transition-colors hover:bg-linen/40', i < filtered.length - 1 ? 'border-b border-linen-dark' : ''].join(' ')}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-charcoal font-satoshi">{org.name}</p>
                    <p className="text-[11px] text-stone">{org.city} · {org.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[org.verification_status]}`}>
                      {org.verification_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone tabular-nums hidden sm:table-cell">{org.animal_count}</td>
                  <td className="px-4 py-3 text-stone text-[12px] hidden sm:table-cell">{formatDate(org.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      {org.verification_status !== 'verified' && (
                        <button
                          onClick={() => setConfirmToggle({ id: org.id, name: org.name, action: 'verify' })}
                          className="text-[11px] text-sage hover:text-[#7A8B72] font-medium transition-colors whitespace-nowrap">
                          ✓ Verify
                        </button>
                      )}
                      {org.verification_status !== 'suspended' && (
                        <button
                          onClick={() => setConfirmToggle({ id: org.id, name: org.name, action: 'suspend' })}
                          className="text-[11px] text-terracotta hover:text-[#B05A3E] font-medium transition-colors whitespace-nowrap">
                          Suspend
                        </button>
                      )}
                      {org.verification_status === 'suspended' && (
                        <button
                          onClick={() => setConfirmToggle({ id: org.id, name: org.name, action: 'pending' })}
                          className="text-[11px] text-stone hover:text-charcoal font-medium transition-colors whitespace-nowrap">
                          Unsuspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
