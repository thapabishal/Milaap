'use client'

import { useState } from 'react'
import type { AnimalDraft, PhotoEntry } from './types'
import type { QualityResult, QualityCheck } from '@/lib/gemini'

interface Props {
  draft: AnimalDraft
  photos: PhotoEntry[]
  onSaveDraft: () => Promise<void>
  onPublish: () => Promise<void>
  saving: boolean
}

function CheckRow({ check }: { check: QualityCheck }) {
  const icon = check.passed
    ? <span className="text-sage font-bold">✓</span>
    : check.severity === 'error'
    ? <span className="text-terracotta font-bold">✗</span>
    : <span className="text-dusty-rose font-bold">⚠</span>

  return (
    <div className={[
      'flex items-start gap-3 py-2.5 border-b border-linen-dark last:border-0',
    ].join(' ')}>
      <span className="text-sm mt-0.5 w-4 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={[
          'text-sm font-medium',
          check.passed ? 'text-charcoal' :
          check.severity === 'error' ? 'text-terracotta' : 'text-charcoal',
        ].join(' ')}>
          {check.label}
        </p>
        {!check.passed && check.message && (
          <p className="text-[11px] text-stone mt-0.5">{check.message}</p>
        )}
      </div>
    </div>
  )
}

export default function AnimalFormStep6({ draft, photos, onSaveDraft, onPublish, saving }: Props) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<QualityResult | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)

  const wordCount = draft.story_en.trim()
    ? draft.story_en.trim().split(/\s+/).length
    : 0

  const uploadedPhotos = photos.filter((p) => p.path)

  async function runQualityCheck() {
    setChecking(true)
    setCheckError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          one_liner: draft.one_liner,
          story_en: draft.story_en,
          personality_en: draft.personality_en,
          one_liner_ne: draft.one_liner_ne,
          photos: uploadedPhotos,
        }),
      })
      if (!res.ok) throw new Error('Quality check failed — try again')
      const data = await res.json()
      setResult(data as QualityResult)
    } catch (e) {
      setCheckError(e instanceof Error ? e.message : 'Quality check failed')
    } finally {
      setChecking(false)
    }
  }

  const canPublish = result !== null && !result.publish_blocked

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-linen border border-linen-dark rounded-xl p-4 space-y-2 text-sm">
        <p className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium mb-3">Profile summary</p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <span className="text-stone">Name</span>
          <span className="text-charcoal font-medium">{draft.name || '—'}</span>

          <span className="text-stone">Species</span>
          <span className="text-charcoal capitalize">{draft.species} · {draft.gender}</span>

          <span className="text-stone">Intake date</span>
          <span className="text-charcoal">{draft.intake_date || '—'}</span>

          <span className="text-stone">One-liner</span>
          <span className="text-charcoal truncate">{draft.one_liner || '—'}</span>

          <span className="text-stone">Story</span>
          <span className={wordCount >= 80 ? 'text-sage font-medium' : 'text-terracotta'}>
            {wordCount} words {wordCount >= 80 ? '✓' : '— needs 80+'}
          </span>

          <span className="text-stone">Photos</span>
          <span className={uploadedPhotos.length >= 2 ? 'text-sage font-medium' : 'text-terracotta'}>
            {uploadedPhotos.length} uploaded {uploadedPhotos.length >= 2 ? '✓' : '— needs 2+'}
          </span>

          <span className="text-stone">Nepali one-liner</span>
          <span className={draft.one_liner_ne ? 'text-sage' : 'text-stone'}>
            {draft.one_liner_ne ? 'Filled ✓' : 'Empty'}
          </span>

          <span className="text-stone">Vaccinated</span>
          <span className="text-charcoal">{draft.is_vaccinated ? 'Yes' : 'No'}</span>

          <span className="text-stone">Neutered</span>
          <span className="text-charcoal">{draft.is_neutered ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {/* Quality check button */}
      {!result && (
        <button
          type="button"
          onClick={runQualityCheck}
          disabled={checking}
          className="w-full bg-terracotta text-white rounded-full py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.2)] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {checking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Checking your profile…
            </>
          ) : (
            '✦ Run quality check'
          )}
        </button>
      )}

      {checkError && (
        <p className="text-[12px] text-terracotta text-center">{checkError}</p>
      )}

      {/* Quality results */}
      {result && (
        <div className="bg-white border border-linen-dark rounded-xl overflow-hidden">
          {/* Score header */}
          <div className={[
            'px-4 py-3 flex items-center justify-between border-b border-linen-dark',
            result.publish_blocked ? 'bg-terracotta/5' : 'bg-sage/5',
          ].join(' ')}>
            <div>
              <p className="text-sm font-semibold text-charcoal">Quality check result</p>
              <p className="text-[11px] text-stone">{result.summary}</p>
            </div>
            <div className="text-right">
              <p className={[
                'text-2xl font-bold font-satoshi',
                result.score >= 80 ? 'text-sage' :
                result.score >= 60 ? 'text-dusty-rose' : 'text-terracotta',
              ].join(' ')}>
                {result.score}
              </p>
              <p className="text-[10px] text-stone uppercase tracking-[0.06em]">Score</p>
            </div>
          </div>

          {/* Check list */}
          <div className="px-4">
            {result.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>

          {/* Re-check link */}
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={runQualityCheck}
              disabled={checking}
              className="text-[11px] text-stone hover:text-charcoal transition-colors"
            >
              Run check again →
            </button>
          </div>
        </div>
      )}

      {/* Publish blocked message */}
      {result?.publish_blocked && (
        <div className="px-4 py-3 bg-terracotta/8 border border-terracotta/20 rounded-xl">
          <p className="text-[12px] text-terracotta font-medium">
            Fix the errors above before publishing. You can still save as draft.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Publish — only active after check passes */}
        <button
          type="button"
          onClick={onPublish}
          disabled={!canPublish || saving}
          className="w-full bg-terracotta text-white rounded-full py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Publishing…' : `Publish ${draft.name} →`}
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="w-full bg-transparent text-stone border border-linen-dark rounded-full py-3 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save as draft'}
        </button>
      </div>

      <p className="text-[11px] text-stone/60 text-center">
        Draft = private, not visible to adopters. Publish = live immediately.
      </p>
    </div>
  )
}
