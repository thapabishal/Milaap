import { createClient } from '@/lib/supabase/server'

// ── Types ──────────────────────────────────────────────────

export type AnimalSpecies = 'dog' | 'cat' | 'rabbit' | 'other'
export type AnimalStatus = 'available' | 'reserved' | 'fostered' | 'medical_hold' | 'adopted'
export type AnimalGender = 'male' | 'female' | 'unknown'

export interface AnimalPhoto {
  path: string
  is_hero: boolean
  caption?: string
}

export interface AnimalSummary {
  id: string
  name: string
  slug: string
  species: AnimalSpecies
  breed: string | null
  age_years: number | null
  age_months: number | null
  gender: AnimalGender
  one_liner: string
  good_with_kids: boolean | null
  apartment_ok: boolean | null
  is_vaccinated: boolean
  is_neutered: boolean
  energy_level: 'low' | 'medium' | 'high' | null
  status: AnimalStatus
  intake_date: string
  photos: AnimalPhoto[]
  organization_id: string
  days_waiting: number
  organizations: {
    name: string
    slug: string
    city: string
    whatsapp_number: string
  } | null
}

export interface DiscoveryFeedResult {
  animals: AnimalSummary[]
  maxDaysWaiting: number
  totalCount: number
}

export interface DiscoveryFeedOptions {
  species?: AnimalSpecies
  city?: string
  page?: number
  limit?: number
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

const ACTIVE_STATUSES: AnimalStatus[] = ['available', 'reserved', 'fostered']

// ── getDiscoveryFeed ───────────────────────────────────────

/**
 * Returns paginated animals for the discovery feed.
 * Sort: intake_date ASC (longest waiting first — moral decision, never change).
 * Excludes adopted and medical_hold animals.
 * Also returns maxDaysWaiting across all active animals for WaitingBar %.
 */
export async function getDiscoveryFeed(
  options: DiscoveryFeedOptions = {}
): Promise<DiscoveryFeedResult> {
  const { species, city, page = 1, limit = 12 } = options
  const supabase = await createClient()

  // ── Max days waiting (for WaitingBar percentage) ──────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maxQuery = (supabase as any)
    .from('animals')
    .select('intake_date')
    .eq('is_published', true)
    .in('status', ACTIVE_STATUSES)
    .order('intake_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  // ── Main feed query ───────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feedQuery = (supabase as any)
    .from('animals')
    .select(
      `id, name, slug, species, breed,
       age_years, age_months, gender,
       one_liner, good_with_kids, apartment_ok,
       is_vaccinated, is_neutered, energy_level,
       status, intake_date, photos,
       organization_id,
       organizations ( name, slug, city, whatsapp_number )`,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .in('status', ACTIVE_STATUSES)
    .order('intake_date', { ascending: true })
    .range((page - 1) * limit, page * limit - 1)

  if (species) feedQuery = feedQuery.eq('species', species)
  if (city)    feedQuery = feedQuery.eq('organizations.city', city)

  // Run both queries in parallel
  const [maxResult, feedResult] = await Promise.all([maxQuery, feedQuery])

  if (feedResult.error) {
    console.error('getDiscoveryFeed error:', feedResult.error.message)
    return { animals: [], maxDaysWaiting: 1, totalCount: 0 }
  }

  const rawMaxDate = (maxResult.data as { intake_date: string } | null)?.intake_date
  const maxDaysWaiting = rawMaxDate ? daysWaiting(rawMaxDate) : 1

  // Attach computed days_waiting to each animal
  const animals: AnimalSummary[] = ((feedResult.data as AnimalSummary[]) ?? []).map(
    (a) => ({ ...a, days_waiting: daysWaiting(a.intake_date) })
  )

  return {
    animals,
    maxDaysWaiting,
    totalCount: (feedResult.count as number) ?? 0,
  }
}

// ── getAnimalCard ──────────────────────────────────────────

/**
 * Fetch a single animal summary by slug (for SSR of a pre-rendered card).
 */
export async function getAnimalBySlug(slug: string): Promise<AnimalSummary | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('animals')
    .select(
      `id, name, slug, species, breed,
       age_years, age_months, gender,
       one_liner, good_with_kids, apartment_ok,
       is_vaccinated, is_neutered, energy_level,
       status, intake_date, photos,
       organization_id,
       organizations ( name, slug, city, whatsapp_number )`
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('getAnimalBySlug error:', error.message)
    return null
  }
  if (!data) return null

  const animal = data as AnimalSummary
  return { ...animal, days_waiting: daysWaiting(animal.intake_date) }
}
