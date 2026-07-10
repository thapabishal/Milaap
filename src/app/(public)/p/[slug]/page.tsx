import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnimalPhotoGallery from '@/components/animal/AnimalPhotoGallery'
import AnimalStory from '@/components/animal/AnimalStory'
import AnimalTraits from '@/components/animal/AnimalTraits'
import AnimalPerks from '@/components/animal/AnimalPerks'
import AnimalPhotoGrid from '@/components/animal/AnimalPhotoGrid'
import AnimalCTA from '@/components/animal/AnimalCTA'
import AdoptedBanner from '@/components/animal/AdoptedBanner'
import AdoptedWaitingBar from '@/components/animal/AdoptedWaitingBar'
import ProfileViewTracker from '@/components/animal/ProfileViewTracker'
import Badge from '@/components/ui/Badge'
import WaitingBar from '@/components/ui/WaitingBar'

// ── Types ──────────────────────────────────────────────────

type AnimalStatus = 'available' | 'reserved' | 'fostered' | 'medical_hold' | 'adopted'
type AnimalSpecies = 'dog' | 'cat' | 'rabbit' | 'other'
type AnimalGender = 'male' | 'female' | 'unknown'

type Photo = { path: string; is_hero: boolean; caption?: string }

interface AnimalProfile {
  id: string
  name: string
  slug: string
  species: AnimalSpecies
  breed: string | null
  age_years: number | null
  age_months: number | null
  gender: AnimalGender
  one_liner: string
  story_en: string
  story_ne: string | null
  personality_en: string | null
  personality_ne: string | null
  good_with_kids: boolean | null
  good_with_dogs: boolean | null
  good_with_cats: boolean | null
  apartment_ok: boolean | null
  is_vaccinated: boolean
  is_neutered: boolean
  energy_level: 'low' | 'medium' | 'high' | null
  status: AnimalStatus
  intake_date: string
  adopted_date: string | null
  adopted_by_city: string | null
  whatsapp_tap_count: number
  photos: Photo[]
  organization_id: string
  organizations: {
    name: string
    slug: string
    city: string
    whatsapp_number: string
  } | null
}

// ── Helpers ────────────────────────────────────────────────

function daysWaiting(intakeDate: string): number {
  const intake = new Date(intakeDate)
  const today = new Date()
  return Math.max(
    0,
    Math.floor((today.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24))
  )
}

function formatAge(years: number | null, months: number | null): string {
  if (years && years >= 1) return `~${years}yr`
  if (months) return `~${months}mo`
  return 'Age unknown'
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')
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
  fostered:     'In foster care',
  medical_hold: 'Not currently available',
  adopted:      'Found their home',
}

// ── DB queries ─────────────────────────────────────────────

async function getAnimalBySlug(slug: string): Promise<AnimalProfile | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('animals')
    .select(`
      id, name, slug, species, breed,
      age_years, age_months, gender,
      one_liner, story_en, story_ne,
      personality_en, personality_ne,
      good_with_kids, good_with_dogs, good_with_cats,
      apartment_ok, is_vaccinated, is_neutered, energy_level,
      status, intake_date, adopted_date, adopted_by_city,
      whatsapp_tap_count, photos,
      organization_id,
      organizations ( name, slug, city, whatsapp_number )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('getAnimalBySlug error:', error.message)
    return null
  }
  return data as AnimalProfile | null
}

function daysWaitedAdopted(intakeDate: string, adoptedDate: string | null): number {
  const intake = new Date(intakeDate)
  const end = adoptedDate ? new Date(adoptedDate) : new Date()
  return Math.max(0, Math.floor((end.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24)))
}

async function getHappyTailId(animalId: string): Promise<string | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('happy_tails')
    .select('id')
    .eq('animal_id', animalId)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle()
  return (data as { id: string } | null)?.id ?? null
}

async function getMaxDaysWaiting(): Promise<number> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('animals')
    .select('intake_date')
    .eq('is_published', true)
    .neq('status', 'adopted')
    .order('intake_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) return 1
  return daysWaiting((data as { intake_date: string }).intake_date)
}

// ── Metadata ───────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const animal = await getAnimalBySlug(slug)
  if (!animal) return { title: 'Animal not found | Milaap Nepal' }

  const days = daysWaiting(animal.intake_date)
  const city = animal.organizations?.city ?? 'Nepal'
  const org = animal.organizations?.name ?? 'an organisation'

  return {
    title: `${animal.name} — ${animal.species} for adoption in ${city} | Milaap Nepal`,
    description: `${animal.one_liner} Available for adoption through ${org}.`,
    openGraph: {
      title: `${animal.name} — waiting ${days} days | Milaap`,
      description: animal.one_liner,
      images: [
        { url: `/api/share-image/${animal.slug}`, width: 1200, height: 630 },
      ],
      siteName: 'Milaap Nepal',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${animal.name} — waiting ${days} days | Milaap`,
      description: animal.one_liner,
      images: [`/api/share-image/${animal.slug}`],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://milaap.dpdns.org/p/${animal.slug}`,
    },
  }
}

// ── Page ───────────────────────────────────────────────────

export default async function AnimalProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [animal, maxDays] = await Promise.all([
    getAnimalBySlug(slug),
    getMaxDaysWaiting(),
  ])

  if (!animal) notFound()

  const isAdopted = animal.status === 'adopted'

  // For adopted: fetch happy tail; for active: skip
  const happyTailId = isAdopted ? await getHappyTailId(animal.id) : null

  const days = isAdopted
    ? daysWaitedAdopted(animal.intake_date, animal.adopted_date)
    : daysWaiting(animal.intake_date)
  const org = animal.organizations
  const ageStr = formatAge(animal.age_years, animal.age_months)
  const badgeVariant = STATUS_TO_BADGE[animal.status]
  const statusLabel = STATUS_LABEL[animal.status]

  return (
    <>
      {/* Analytics tracker — fire-and-forget, reads ?src= param */}
      <Suspense fallback={null}>
        <ProfileViewTracker
          animalId={animal.id}
          organizationId={animal.organization_id}
        />
      </Suspense>

      <article className="min-h-screen bg-linen">

        {/* ── Photo gallery ─────────────────────────────── */}
        <AnimalPhotoGallery
          photos={animal.photos}
          animalName={animal.name}
        />

        {/* ── Content area ──────────────────────────────── */}
        <div className="px-6 md:px-10 max-w-2xl mx-auto">

          {/* Status + org row */}
          <div className="flex items-center gap-2 mt-5">
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
            <span className="text-stone/40 text-xs" aria-hidden="true">·</span>
            {org ? (
              <Link
                href={`/org/${org.slug}`}
                className="text-[11px] text-stone hover:text-charcoal transition-colors"
              >
                {org.name}
                {org.city ? ` · ${org.city}` : ''}
              </Link>
            ) : null}
          </div>

          {/* Waiting bar — adopted shows different bar + label */}
          <div className="mt-4">
            {isAdopted ? (
              <AdoptedWaitingBar daysWaited={days} />
            ) : (
              <WaitingBar daysWaiting={days} maxDaysWaiting={maxDays} />
            )}
          </div>

          {/* Name */}
          <h1 className="font-satoshi font-bold text-[38px] leading-tight tracking-[-0.02em] text-charcoal mt-4">
            {animal.name}
          </h1>

          {/* Species · Age · Gender */}
          <p className="mt-1 text-xs text-stone tracking-[0.02em]">
            {capitalise(animal.species)}
            {' · '}
            {ageStr}
            {' · '}
            {capitalise(animal.gender)}
          </p>

          {/* One-liner */}
          <p className="mt-4 text-sm text-stone font-light italic leading-relaxed">
            "{animal.one_liner}"
          </p>

          {/* Adopted announcement banner — above story */}
          {isAdopted && (
            <div className="mt-6">
              <AdoptedBanner
                animalName={animal.name}
                adoptedDate={animal.adopted_date}
                adopterCity={animal.adopted_by_city}
                whatsappTapCount={animal.whatsapp_tap_count}
                happyTailId={happyTailId}
              />
            </div>
          )}

          {/* Story + personality */}
          <AnimalStory
            gender={animal.gender}
            story_en={animal.story_en}
            story_ne={animal.story_ne}
            personality_en={animal.personality_en}
            personality_ne={animal.personality_ne}
          />

          {/* Traits */}
          <AnimalTraits
            animalName={animal.name}
            good_with_kids={animal.good_with_kids}
            good_with_dogs={animal.good_with_dogs}
            good_with_cats={animal.good_with_cats}
            apartment_ok={animal.apartment_ok}
            is_vaccinated={animal.is_vaccinated}
            is_neutered={animal.is_neutered}
            energy_level={animal.energy_level}
          />

          {/* Perks */}
          <AnimalPerks animalName={animal.name} />

          {/* Extra photo grid */}
          <AnimalPhotoGrid
            photos={animal.photos}
            animalName={animal.name}
          />

          {/* CTA section — hidden for adopted animals */}
          {org && !isAdopted && (
            <AnimalCTA
              animalId={animal.id}
              animalName={animal.name}
              animalSlug={animal.slug}
              animalOneLiner={animal.one_liner}
              daysWaiting={days}
              orgName={org.name}
              orgWhatsapp={org.whatsapp_number}
              organizationId={animal.organization_id}
            />
          )}

          {/* Bottom padding — extra on mobile for sticky bar */}
          <div className="h-28 md:h-16" />
        </div>
      </article>

      {/* ── JSON-LD structured data ──────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            // Animal schema
            {
              '@context': 'https://schema.org',
              '@type': 'Animal',
              name: animal.name,
              description: animal.one_liner,
              url: `https://milaap.dpdns.org/p/${animal.slug}`,
              image: animal.photos.find((p) => p.is_hero)?.path
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${animal.photos.find((p) => p.is_hero)!.path}`
                : undefined,
              provider: org
                ? {
                    '@type': 'Organization',
                    name: org.name,
                    url: `https://milaap.dpdns.org/org/${org.slug}`,
                  }
                : undefined,
            },
            // BreadcrumbList schema
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://milaap.dpdns.org',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Discover',
                  item: 'https://milaap.dpdns.org/discover',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: animal.name,
                  item: `https://milaap.dpdns.org/p/${animal.slug}`,
                },
              ],
            },
          ]),
        }}
      />
    </>
  )
}
