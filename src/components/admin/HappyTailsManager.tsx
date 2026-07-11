'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import HappyTailShareGenerator from './HappyTailShareGenerator'

type HtStatus = 'pending' | 'approved' | 'rejected'

export interface HappyTailRow {
  id: string
  adopter_name: string
  adopter_city: string | null
  story_en: string
  photo_url: string
  shelter_photo_url: string | null
  days_waited: number | null
  created_at: string
  approved_at: string | null
  rejection_reason: string | null
  status: HtStatus
  animal: { id: string; name: string; slug: string; species: string }
  organization: { id: string; name: string }
}

interface Props {
  initialRows: HappyTailRow[]
  currentUserId: string
  supabaseUrl: string
}

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

function photoUrl(path: string, supabaseUrl: string) {
  return `${supabaseUrl}/storage/v1/object/public/animal-photos/${path}`
}

// ── Pending card ─────────────────────────────────────────
interface PendingCardProps {
  ht: HappyTailRow
  supabaseUrl: string
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

function PendingCard({ ht, supabaseUrl, onApprove, onReject }: PendingCardProps) {
  const [acting, setActing]   = useState(false)
  const [rejected, setRejected] = useState(false)
  const [reason, setReason]   = useState('')
  const [done, setDone]       = useState<'approved' | 'rejected' | null>(null)

  const shelterUrl = ht.shelter_photo_url ? photoUrl(ht.shelter_photo_url, supabaseUrl) : null
  const homeUrl    = photoUrl(ht.photo_url, supabaseUrl)

  async function handleApprove() {
    setActing(true)
    await onApprove(ht.id)
    setDone('approved')
    setActing(false)
  }

  async function handleReject() {
    if (!reason.trim()) return
    setActing(true)
    await onReject(ht.id, reason)
    setDone('rejected')
    setActing(false)
  }

  if (done === 'approved') {
    return (
      <div className="bg-sage/10 border border-sage/30 rounded-xl p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-sage">
          ✓ Published — {ht.animal.name}&apos;s story is now live.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/happy-tails"
            target="_blank"
            className="text-[12px] text-stone hover:text-charcoal transition-colors"
          >
            View on site →
          </Link>
          <HappyTailShareGenerator
            animalName={ht.animal.name}
            adopterName={ht.adopter_name}
            daysWaited={ht.days_waited}
            storyQuote={ht.story_en}
            shelterPhotoUrl={shelterUrl}
            homePhotoUrl={homeUrl}
            slug={ht.animal.slug}
          />
        </div>
      </div>
    )
  }

  if (done === 'rejected') {
    return (
      <div className="bg-linen border border-linen-dark rounded-xl p-4">
        <p className="text-[12px] text-stone">✗ Rejected — {ht.animal.name}</p>
      </div>
    )
  }

  return (
    <article className="bg-white border border-linen-dark rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
      {/* Before/after photos */}
      <div className="flex h-44 relative">
        <div className="w-1/2 bg-linen overflow-hidden flex-shrink-0">
          {shelterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shelterUrl} alt="Shelter" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone/20 text-4xl">🐾</div>
          )}
          <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.08em] font-medium bg-charcoal/60 text-white px-2 py-0.5 rounded-full">
            Shelter
          </span>
        </div>

        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center z-10">
          <div className="w-7 h-7 rounded-full bg-white border-2 border-linen-dark flex items-center justify-center text-xs shadow-sm">→</div>
        </div>

        <div className="w-1/2 bg-linen overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={homeUrl} alt="Home" className="w-full h-full object-cover" />
          <span className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.08em] font-medium bg-sage/80 text-white px-2 py-0.5 rounded-full">
            Home
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-satoshi font-bold text-base text-charcoal">{ht.animal.name}</h3>
          {ht.days_waited && (
            <span className="text-[10px] text-dusty-rose font-medium whitespace-nowrap mt-0.5">
              {ht.days_waited}d waited
            </span>
          )}
        </div>
        <p className="text-[12px] text-stone mb-3">
          {ht.adopter_name}
          {ht.adopter_city && ` · ${ht.adopter_city}`}
          {' · '}{daysAgo(ht.created_at)}
        </p>
        <p className="text-sm text-charcoal leading-relaxed mb-4 bg-linen rounded-lg p-3 border border-linen-dark">
          &ldquo;{ht.story_en}&rdquo;
        </p>

        {/* Actions */}
        {!rejected ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={acting}
              className="flex-1 bg-sage/15 text-sage border border-sage/30 rounded-full py-2 text-xs font-semibold tracking-[0.04em] hover:bg-sage/25 transition-colors disabled:opacity-50"
            >
              {acting ? '…' : '✓ Approve & Publish'}
            </button>
            <button
              type="button"
              onClick={() => setRejected(true)}
              disabled={acting}
              className="flex-1 bg-transparent text-stone border border-linen-dark rounded-full py-2 text-xs tracking-[0.04em] hover:border-terracotta/40 hover:text-terracotta transition-colors disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for rejection (visible to the volunteer team only)…"
              rows={2}
              className="w-full text-sm bg-linen border border-linen-dark rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-terracotta/40 placeholder:text-stone/40"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReject}
                disabled={acting || !reason.trim()}
                className="flex-1 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-full py-2 text-xs font-semibold tracking-[0.04em] hover:bg-terracotta/20 transition-colors disabled:opacity-40"
              >
                {acting ? '…' : 'Confirm reject'}
              </button>
              <button
                type="button"
                onClick={() => { setRejected(false); setReason('') }}
                className="flex-1 bg-transparent text-stone border border-linen-dark rounded-full py-2 text-xs hover:border-charcoal/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

// ── Main component ────────────────────────────────────────
export default function HappyTailsManager({ initialRows, currentUserId, supabaseUrl }: Props) {
  const [rows, setRows] = useState<HappyTailRow[]>(initialRows)
  const [rejectedOpen, setRejectedOpen] = useState(false)

  const pending  = rows.filter((r) => r.status === 'pending')
  const approved = rows.filter((r) => r.status === 'approved')
  const rejected = rows.filter((r) => r.status === 'rejected')

  async function handleApprove(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase
      .from('happy_tails')
      .update({
        status:      'approved',
        approved_by: currentUserId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)

    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'approved' as HtStatus, approved_at: new Date().toISOString() }
          : r
      )
    )
  }

  async function handleReject(id: string, reason: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase
      .from('happy_tails')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id)

    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'rejected' as HtStatus, rejection_reason: reason }
          : r
      )
    )
  }

  return (
    <div className="space-y-10">

      {/* ── Pending ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-satoshi font-semibold text-base text-charcoal">
            Pending approval
          </h2>
          {pending.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.08em] text-terracotta font-medium bg-terracotta/8 border border-terracotta/20 rounded-full px-2 py-0.5">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="bg-white border border-linen-dark rounded-xl p-8 text-center">
            <p className="text-sm text-stone">All caught up — no stories waiting for review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map((ht) => (
              <PendingCard
                key={ht.id}
                ht={ht}
                supabaseUrl={supabaseUrl}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Approved ── */}
      {approved.length > 0 && (
        <section>
          <h2 className="font-satoshi font-semibold text-base text-charcoal mb-4">
            Published stories
          </h2>
          <div className="bg-white border border-linen-dark rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
            {approved.map((ht, i) => {
              const shelterUrl = ht.shelter_photo_url ? photoUrl(ht.shelter_photo_url, supabaseUrl) : null
              const homeUrl = photoUrl(ht.photo_url, supabaseUrl)
              const approvedDate = ht.approved_at
                ? new Date(ht.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'

              return (
                <div
                  key={ht.id}
                  className={[
                    'flex items-center gap-3 px-4 py-3',
                    i < approved.length - 1 ? 'border-b border-linen-dark' : '',
                    'hover:bg-linen/40 transition-colors',
                  ].join(' ')}
                >
                  {/* Thumb */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-linen flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={homeUrl} alt={ht.animal.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal font-satoshi truncate">
                      {ht.animal.name}
                    </p>
                    <p className="text-[11px] text-stone">
                      {ht.adopter_city ?? ht.adopter_name} · {approvedDate}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                      href="/happy-tails"
                      target="_blank"
                      className="text-[11px] text-stone hover:text-charcoal transition-colors"
                    >
                      View →
                    </Link>
                    <HappyTailShareGenerator
                      animalName={ht.animal.name}
                      adopterName={ht.adopter_name}
                      daysWaited={ht.days_waited}
                      storyQuote={ht.story_en}
                      shelterPhotoUrl={shelterUrl}
                      homePhotoUrl={homeUrl}
                      slug={ht.animal.slug}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Rejected (collapsible) ── */}
      {rejected.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setRejectedOpen((v) => !v)}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-stone font-medium hover:text-charcoal transition-colors"
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform ${rejectedOpen ? 'rotate-180' : ''}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Rejected ({rejected.length})
          </button>

          {rejectedOpen && (
            <div className="mt-3 bg-white border border-linen-dark rounded-xl overflow-hidden">
              {rejected.map((ht, i) => (
                <div
                  key={ht.id}
                  className={[
                    'flex items-center gap-3 px-4 py-3',
                    i < rejected.length - 1 ? 'border-b border-linen-dark' : '',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal font-semibold">{ht.animal.name}</p>
                    <p className="text-[11px] text-stone truncate">
                      {ht.rejection_reason ?? 'No reason given'}
                    </p>
                  </div>
                  <span className="text-[10px] text-stone/50 uppercase tracking-[0.06em] flex-shrink-0">
                    Rejected
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
