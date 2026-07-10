'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { AnimalSummary } from '@/lib/animals'
import Badge from '@/components/ui/Badge'
import WaitingBar from '@/components/ui/WaitingBar'
import { buildWhatsAppURL } from '@/lib/whatsapp'
import { trackEvent } from '@/lib/analytics'
import ShareSheet from '@/components/share/ShareSheet'

// ── Types ──────────────────────────────────────────────────

type AnimalStatus = AnimalSummary['status']

interface AnimalCardProps {
  animal: AnimalSummary
  maxDaysWaiting: number
  /** Show "↑ Next animal" hint below CTA — only on the first card */
  showScrollHint?: boolean
  /** Mobile scroll-snap mode: photo takes 55svh, card fills the snap slot */
  snapMode?: boolean
}

// ── Helpers ────────────────────────────────────────────────

function photoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${path}`
}

function formatAge(years: number | null, months: number | null): string {
  if (years && years >= 1) return `~${years}yr`
  if (months) return `~${months}mo`
  return 'Unknown age'
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const STATUS_TO_BADGE: Record<AnimalStatus, 'available' | 'reserved' | 'fostered' | 'medical' | 'adopted'> = {
  available:    'available',
  reserved:     'reserved',
  fostered:     'fostered',
  medical_hold: 'medical',
  adopted:      'adopted',
}

const STATUS_LABEL: Record<AnimalStatus, string> = {
  available:    'Available',
  reserved:     'Reserved',
  fostered:     'In foster',
  medical_hold: 'Medical hold',
  adopted:      'Adopted',
}

// ── Tag helpers ────────────────────────────────────────────

interface Tag { label: string }

function buildTags(animal: AnimalSummary): Tag[] {
  const tags: Tag[] = []

  // 1. Species + age (always first)
  const age = formatAge(animal.age_years, animal.age_months)
  tags.push({ label: `${capitalise(animal.species)} · ${age}` })

  // 2. Good with kids
  if (animal.good_with_kids === true) tags.push({ label: 'Kids ✓' })

  // 3. Apartment ok
  if (animal.apartment_ok === true) tags.push({ label: 'Apartment ✓' })

  // 4. Vaccinated
  if (animal.is_vaccinated) tags.push({ label: 'Vaccinated' })

  return tags.slice(0, 4)
}

// ── Component ──────────────────────────────────────────────

export default function AnimalCard({
  animal,
  maxDaysWaiting,
  showScrollHint = false,
  snapMode = false,
}: AnimalCardProps) {
  const { t, i18n } = useTranslation()
  const [shareOpen, setShareOpen] = useState(false)
  const [liked, setLiked]         = useState(false)

  const heroPhoto = animal.photos.find((p) => p.is_hero) ?? animal.photos[0] ?? null
  const org       = animal.organizations
  const tags      = buildTags(animal)

  function handleWhatsApp(e: React.MouseEvent) {
    e.preventDefault()
    const lang = i18n.language?.startsWith('ne') ? 'ne' : 'en'
    const url = buildWhatsAppURL(
      org?.whatsapp_number ?? '',
      animal.name,
      animal.slug,
      org?.name ?? '',
      lang
    )
    trackEvent('whatsapp_tap', animal.id, animal.organization_id)
    window.open(url, '_blank')
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    setShareOpen(true)
  }

  function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    setLiked((v) => !v)
  }

  const profileHref = `/p/${animal.slug}`
  const altText = org
    ? `${animal.name} — ${animal.species} available for adoption at ${org.name}`
    : `${animal.name} — ${animal.species} available for adoption`

  return (
    <>
      <article
        className={[
          'bg-white overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]',
          snapMode
            ? 'rounded-[20px] flex flex-col h-full hover:shadow-[0_4px_16px_rgba(45,41,38,0.08)] transition-shadow'
            : 'rounded-[20px] hover:shadow-[0_4px_16px_rgba(45,41,38,0.08)] transition-shadow',
        ].join(' ')}
        aria-label={`${animal.name}, ${capitalise(animal.species)}, waiting ${animal.days_waiting} days`}
      >
        {/* ── Photo area ──────────────────────────────── */}
        <Link
          href={profileHref}
          className={[
            'block relative bg-linen-dark shrink-0',
            snapMode ? 'h-[55svh]' : 'h-[240px]',
          ].join(' ')}
          tabIndex={-1}
          aria-hidden="true"
        >

          {heroPhoto ? (
            <Image
              src={photoUrl(heroPhoto.path)}
              alt={altText}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              priority={false}
            />
          ) : (
            // Placeholder when no photo
            <div className="w-full h-full flex items-center justify-center bg-linen-dark">
              <span className="text-4xl opacity-30" aria-hidden="true">
                {animal.species === 'cat' ? '🐱' : animal.species === 'rabbit' ? '🐰' : '🐾'}
              </span>
            </div>
          )}

          {/* Status badge — top-left */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={STATUS_TO_BADGE[animal.status]} size="sm">
              {STATUS_LABEL[animal.status]}
            </Badge>
          </div>

          {/* Org badge — top-right */}
          {org && (
            <div
              className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/40"
              aria-label={`${org.name}${org.city ? `, ${org.city}` : ''}`}
            >
              <span className="text-[10px] text-white font-medium leading-none tracking-[0.02em]">
                {org.name}
                {org.city ? ` · ${org.city}` : ''}
              </span>
            </div>
          )}
        </Link>

        {/* ── Waiting bar — immediately below photo ───── */}
        <div className="px-4 pt-3">
          <WaitingBar daysWaiting={animal.days_waiting} maxDaysWaiting={maxDaysWaiting} />
        </div>

        {/* ── Content ─────────────────────────────────── */}
        <div className={['px-4 pb-4 flex flex-col gap-2', snapMode ? 'overflow-y-auto flex-1' : ''].join(' ')}>

          {/* Name */}
          <Link href={profileHref} className="group">
            <h2 className="font-satoshi font-bold text-[32px] leading-tight tracking-[-0.02em] text-charcoal line-clamp-1 group-hover:text-terracotta transition-colors">
              {animal.name}
            </h2>
          </Link>

          {/* One-liner */}
          <p className="text-sm text-stone font-light italic leading-relaxed line-clamp-2">
            &ldquo;{animal.one_liner}&rdquo;
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5 mt-0.5" aria-label="Animal attributes">
            {tags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-linen-dark text-[10px] text-stone font-medium tracking-[0.02em]"
              >
                {tag.label}
              </span>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-2 mt-2">
            {/* Primary — Meet [Name] → */}
            <button
              type="button"
              onClick={handleWhatsApp}
              aria-label={`Message ${org?.name ?? 'organisation'} about ${animal.name} on WhatsApp`}
              className="flex-1 bg-[#C46F52] text-white rounded-full px-4 py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(196,111,82,0.25)]"
            >
              Meet {animal.name} →
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              aria-label={liked ? `Remove ${animal.name} from saved` : `Save ${animal.name}`}
              aria-pressed={liked}
              className="w-10 h-10 rounded-full border border-linen-dark flex items-center justify-center text-base hover:border-dusty-rose transition-colors shrink-0"
            >
              <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              aria-label={`Share ${animal.name}'s profile`}
              className="w-10 h-10 rounded-full border border-linen-dark flex items-center justify-center text-base hover:border-stone transition-colors shrink-0"
            >
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          {/* Scroll hint — first card only */}
          {showScrollHint && (
            <p className="text-[10px] text-stone text-center mt-1 select-none" aria-hidden="true">
              ↑ Next animal
            </p>
          )}
        </div>
      </article>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        animalName={animal.name}
        animalSlug={animal.slug}
        animalId={animal.id}
        organizationId={animal.organization_id}
        daysWaiting={animal.days_waiting}
        oneLiner={animal.one_liner}
      />
    </>
  )
}
