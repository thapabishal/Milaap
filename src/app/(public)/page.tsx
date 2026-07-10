import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HeroHeadline from '@/components/layout/HeroHeadline'
import WaitingBar from '@/components/ui/WaitingBar'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Milaap — Where rescued animals meet their families | Nepal',
  description:
    'Discover rescued animals across Nepal waiting for a home. Milaap connects animals with families through storytelling, trust, and meaningful discovery.',
  openGraph: {
    title: 'Milaap Nepal — Two stories. One journey.',
    description: 'Where rescued animals meet their families.',
    images: [{ url: '/og-default.svg', width: 1200, height: 630 }],
    siteName: 'Milaap Nepal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milaap Nepal — Two stories. One journey.',
    description: 'Where rescued animals meet their families.',
    images: ['/og-default.svg'],
  },
  alternates: {
    canonical: 'https://milaap.dpdns.org',
  },
}

// ── Types ─────────────────────────────────────────────────

type Photo = { path: string; is_hero: boolean; caption?: string }

interface FeaturedAnimal {
  id: string
  name: string
  slug: string
  intake_date: string
  photos: Photo[]
  organizations: { name: string } | null
}

// ── Data fetching ──────────────────────────────────────────

async function getFeaturedAnimal(): Promise<FeaturedAnimal | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('animals')
    .select('id, name, slug, intake_date, photos, organizations(name)')
    .eq('is_featured', true)
    .eq('is_published', true)
    .eq('status', 'available')
    .limit(1)
    .order('intake_date', { ascending: true }) // stable "random" until we add random()
    .maybeSingle()

  if (error) {
    console.error('getFeaturedAnimal error:', error.message)
    return null
  }
  return data as FeaturedAnimal | null
}

async function getAvailableCount(): Promise<number> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('animals')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .in('status', ['available', 'reserved', 'fostered'])

  if (error) {
    console.error('getAvailableCount error:', error.message)
    return 0
  }
  return count ?? 0
}

// ── Helpers ────────────────────────────────────────────────

function getHeroPhotoUrl(photos: Photo[]): string | null {
  const hero = photos.find((p) => p.is_hero) ?? photos[0]
  if (!hero) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${hero.path}`
}

function daysWaiting(intakeDate: string): number {
  const intake = new Date(intakeDate)
  const today = new Date()
  return Math.max(
    0,
    Math.floor((today.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24))
  )
}

// ── Page ───────────────────────────────────────────────────

export default async function WelcomePage() {
  const [animal, count] = await Promise.all([
    getFeaturedAnimal(),
    getAvailableCount(),
  ])

  const photoUrl = animal ? getHeroPhotoUrl(animal.photos) : null
  const days = animal ? daysWaiting(animal.intake_date) : 0

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* ── Hero — two-column on desktop ─────────────────── */}
      <section className="flex-1 grid grid-cols-1 md:grid-cols-2">

        {/* Left — headline + CTA */}
        <div className="flex flex-col justify-center px-7 pt-8 pb-10 md:px-16 md:py-20 bg-linen">
          <HeroHeadline />

          {/* CTA — Button component fades in via CSS delay */}
          <div
            className="mt-8"
            style={{
              // Tailwind can't do dynamic delay; inline style for the CTA
            }}
          >
            <Button href="/discover" variant="primary" size="lg">
              Meet them →
            </Button>
          </div>
        </div>

        {/* Right — featured animal photo */}
        <div className="relative h-72 md:h-auto min-h-[340px] bg-linen-dark overflow-hidden">
          {photoUrl ? (
            <>
              <Image
                src={photoUrl}
                alt={animal?.name ? `${animal.name} — featured animal` : 'Featured animal'}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gradient: photo fades into linen at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-linen to-transparent" />
            </>
          ) : (
            /* Placeholder when no featured animal or no photo */
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone/40 text-sm font-light italic">
                No featured animal
              </span>
            </div>
          )}

          {/* Overlay: name + waiting bar */}
          {animal && (
            <div className="absolute bottom-0 inset-x-0 px-6 pb-4">
              <p className="font-satoshi font-bold text-2xl text-charcoal mb-2 drop-shadow-sm">
                {animal.name}
              </p>
              <WaitingBar daysWaiting={days} maxDaysWaiting={Math.max(days, 1)} />
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom strip — dark bar with animal count ────── */}
      <div className="h-12 bg-charcoal flex items-center justify-between px-7 md:px-16">
        <span className="text-[10px] uppercase tracking-[0.1em] text-stone/70 font-medium">
          animals waiting
        </span>
        <span className="text-lg font-semibold text-dusty-rose tabular-nums">
          {count > 0 ? count : '—'}
        </span>
      </div>
    </div>
  )
}
