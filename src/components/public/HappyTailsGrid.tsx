'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

export interface HappyTail {
  id: string
  adopter_name: string
  adopter_city: string | null
  story_en: string
  photo_url: string            // "at home" photo path
  shelter_photo_url: string | null
  days_waited: number | null
  approved_at: string
  animal: {
    name: string
    species: string
    intake_date: string
    adopted_date: string | null
  }
  organization: {
    name: string
    city: string
  }
}

type Filter = 'all' | 'dogs' | 'cats' | 'long' | 'recent'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',    label: 'All stories' },
  { value: 'dogs',   label: '🐕 Dogs' },
  { value: 'cats',   label: '🐈 Cats' },
  { value: 'long',   label: '⏳ Long waiters (150+ days)' },
  { value: 'recent', label: '🆕 Last 30 days' },
]

function formatAdoptedDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function storyExcerpt(story: string, maxLen = 150): string {
  if (story.length <= maxLen) return story
  return story.slice(0, maxLen).trimEnd() + '…'
}

interface CardProps {
  ht: HappyTail
  supabaseUrl: string
}

function StoryCard({ ht, supabaseUrl }: CardProps) {
  const homeUrl    = `${supabaseUrl}/storage/v1/object/public/animal-photos/${ht.photo_url}`
  const shelterUrl = ht.shelter_photo_url
    ? `${supabaseUrl}/storage/v1/object/public/animal-photos/${ht.shelter_photo_url}`
    : null

  const adoptedDate = formatAdoptedDate(ht.animal.adopted_date ?? ht.approved_at)

  function handleShare() {
    const text = `${ht.animal.name} found their forever home! 🐾\n\nmilaap.dpdns.org`
    if (navigator.share) {
      navigator.share({ title: `${ht.animal.name}'s story`, text, url: 'https://milaap.dpdns.org/happy-tails' }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${text}\n\nhttps://milaap.dpdns.org/happy-tails`).catch(() => {})
    }
  }

  return (
    <article className="bg-white border border-linen-dark rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)] hover:shadow-[0_4px_16px_rgba(45,41,38,0.08)] transition-shadow">
      {/* Before/After photos */}
      <div className="flex gap-0 h-44 relative">
        {/* Shelter photo (before) */}
        <div className="w-1/2 bg-linen overflow-hidden flex-shrink-0">
          {shelterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shelterUrl} alt={`${ht.animal.name} at shelter`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone/20 text-4xl">🐾</div>
          )}
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.08em] font-medium bg-charcoal/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            Shelter
          </span>
        </div>

        {/* Arrow */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center z-10">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-linen-dark flex items-center justify-center text-sm shadow-sm">
            →
          </div>
        </div>

        {/* Home photo (after) */}
        <div className="w-1/2 bg-linen overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={homeUrl} alt={`${ht.animal.name} at home`} className="w-full h-full object-cover" />
          <span className="absolute top-3 right-3 text-[9px] uppercase tracking-[0.08em] font-medium bg-sage/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            Home
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Animal name + wait */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-satoshi font-bold text-lg text-charcoal leading-tight">
            {ht.animal.name}
          </h3>
          {ht.days_waited && ht.days_waited > 0 && (
            <span className="text-[10px] uppercase tracking-[0.06em] text-dusty-rose font-medium whitespace-nowrap mt-0.5">
              {ht.days_waited} days waited
            </span>
          )}
        </div>

        {/* Story quote */}
        <p className="text-sm text-stone leading-relaxed italic mb-4">
          &ldquo;{storyExcerpt(ht.story_en)}&rdquo;
        </p>

        {/* Adopter + date */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold text-charcoal">
              {ht.adopter_name}
              {ht.adopter_city && (
                <span className="font-normal text-stone"> · {ht.adopter_city}</span>
              )}
            </p>
            <p className="text-[11px] text-stone">{adoptedDate} · {ht.organization.name}</p>
          </div>
          <button
            onClick={handleShare}
            className="flex-shrink-0 text-[11px] text-stone hover:text-terracotta transition-colors font-medium"
            title="Share this story"
          >
            Share ↗
          </button>
        </div>
      </div>
    </article>
  )
}

interface Props {
  happyTails: HappyTail[]
  supabaseUrl: string
}

export default function HappyTailsGrid({ happyTails, supabaseUrl }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const now = Date.now()

  const filtered = useMemo(() => {
    return happyTails.filter((ht) => {
      if (filter === 'dogs')   return ht.animal.species === 'dog'
      if (filter === 'cats')   return ht.animal.species === 'cat'
      if (filter === 'long')   return (ht.days_waited ?? 0) > 150
      if (filter === 'recent') {
        const days = (now - new Date(ht.approved_at).getTime()) / 86400000
        return days <= 30
      }
      return true
    })
  }, [happyTails, filter, now])

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={[
              'px-4 py-2 rounded-full text-sm transition-colors border',
              filter === f.value
                ? 'bg-charcoal text-linen border-charcoal'
                : 'bg-white text-stone border-linen-dark hover:border-charcoal/20',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone text-sm">No stories match this filter yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ht) => (
            <StoryCard key={ht.id} ht={ht} supabaseUrl={supabaseUrl} />
          ))}
        </div>
      )}
    </div>
  )
}
