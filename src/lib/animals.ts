import { createClient } from '@/lib/supabase/server'

// ── Types ──────────────────────────────────────────────────

export type AnimalSpecies = 'dog' | 'cat' | 'rabbit' | 'other'
export type AnimalStatus  = 'available' | 'reserved' | 'fostered' | 'medical_hold' | 'adopted'
export type AnimalGender  = 'male' | 'female' | 'unknown'
export type AnimalSize    = 'small' | 'medium' | 'large' | 'xlarge'

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
  size: AnimalSize | null
  one_liner: string
  good_with_kids: boolean | null
  good_with_cats: boolean | null
  apartment_ok: boolean | null
  is_vaccinated: boolean
  is_neutered: boolean
  energy_level: 'low' | 'medium' | 'high' | null
  status: AnimalStatus
  intake_date: string
  photos: AnimalPhoto[]
  organization_id: string
  is_featured: boolean
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
  size?: AnimalSize
  city?: string
  goodWithKids?: boolean
  goodWithCats?: boolean
  apartmentOk?: boolean
  page?: number
  limit?: number
}

// ── Helpers ────────────────────────────────────────────────

export function daysWaiting(intakeDate: string): number {
  const intake = new Date(intakeDate)
  const today  = new Date()
  return Math.max(
    0,
    Math.floor((today.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24))
  )
}

const ACTIVE_STATUSES: AnimalStatus[] = ['available', 'reserved', 'fostered']

const ANIMAL_SELECT = `
  id, name, slug, species, breed,
  age_years, age_months, gender, size,
  one_liner, good_with_kids, good_with_cats, apartment_ok,
  is_vaccinated, is_neutered, energy_level,
  status, intake_date, photos,
  organization_id, is_featured,
  organizations!inner ( name, slug, city, whatsapp_number, verification_status )
`

// ── injectFeatured ─────────────────────────────────────────

/**
 * Injects featured animals at every 5th position (4, 9, 14…).
 * Featured animals are fetched separately and positioned editorially.
 * If a featured animal is already in the base feed at its natural position,
 * it won't be duplicated.
 */
export function injectFeatured(
  base: AnimalSummary[],
  featured: AnimalSummary[]
): AnimalSummary[] {
  if (featured.length === 0) return base

  const result: AnimalSummary[] = []
  const baseIds = new Set(base.map((a) => a.id))
  let featuredIdx = 0

  for (let i = 0; i < base.length; i++) {
    result.push(base[i])
    // After every 4th item (index 3, 8, 13…) inject a featured animal
    if ((i + 1) % 5 === 0 && featuredIdx < featured.length) {
      const candidate = featured[featuredIdx]
      featuredIdx++
      // Don't duplicate if already in the base feed
      if (!baseIds.has(candidate.id)) {
        result.push(candidate)
      }
    }
  }

  return result
}

// ── getDiscoveryFeed ───────────────────────────────────────

/**
 * Returns paginated animals for the discovery feed.
 * Sort: intake_date ASC (longest waiting first — moral decision, never change).
 * Excludes adopted and medical_hold animals.
 * Returns maxDaysWaiting for WaitingBar %, totalCount for pagination.
 */
export async function getDiscoveryFeed(
  options: DiscoveryFeedOptions = {}
): Promise<DiscoveryFeedResult> {
  const {
    species, size, city,
    goodWithKids, goodWithCats, apartmentOk,
    page = 1, limit = 12,
  } = options

  const supabase = await createClient()

  // ── Max days waiting ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maxQuery = (supabase as any)
    .from('animals')
    .select('intake_date, organizations!inner(verification_status)')
    .eq('is_published', true)
    .in('status', ACTIVE_STATUSES)
    .neq('organizations.verification_status', 'suspended')
    .order('intake_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  // ── Featured animals (for editorial injection) ────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredQuery = (supabase as any)
    .from('animals')
    .select(ANIMAL_SELECT)
    .eq('is_published', true)
    .eq('is_featured', true)
    .in('status', ACTIVE_STATUSES)
    .neq('organizations.verification_status', 'suspended')
    .order('intake_date', { ascending: true })
    .limit(10)

  // ── Main feed query ───────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feedQuery = (supabase as any)
    .from('animals')
    .select(ANIMAL_SELECT, { count: 'exact' })
    .eq('is_published', true)
    .in('status', ACTIVE_STATUSES)
    .neq('organizations.verification_status', 'suspended')
    .order('intake_date', { ascending: true })
    .range((page - 1) * limit, page * limit - 1)

  if (species)      feedQuery = feedQuery.eq('species', species)
  if (size)         feedQuery = feedQuery.eq('size', size)
  if (goodWithKids) feedQuery = feedQuery.eq('good_with_kids', true)
  if (goodWithCats) feedQuery = feedQuery.eq('good_with_cats', true)
  if (apartmentOk)  feedQuery = feedQuery.eq('apartment_ok', true)
  // city filter: filter on joined organizations.city
  if (city)         feedQuery = feedQuery.eq('organizations.city', city)

  const [maxResult, feedResult, featuredResult] = await Promise.all([
    maxQuery,
    feedQuery,
    featuredQuery,
  ])

  if (feedResult.error) {
    console.error('getDiscoveryFeed error:', feedResult.error.message)
    return { animals: [], maxDaysWaiting: 1, totalCount: 0 }
  }

  const rawMaxDate   = (maxResult.data as { intake_date: string } | null)?.intake_date
  const maxDaysWaiting = rawMaxDate ? daysWaiting(rawMaxDate) : 1

  const attachDays = (a: AnimalSummary): AnimalSummary =>
    ({ ...a, days_waiting: daysWaiting(a.intake_date) })

  const baseAnimals     = ((feedResult.data as AnimalSummary[]) ?? []).map(attachDays)
  const featuredAnimals = ((featuredResult.data as AnimalSummary[]) ?? []).map(attachDays)

  // Inject featured at every 5th position (only on page 1 to avoid duplication)
  const animals = page === 1
    ? injectFeatured(baseAnimals, featuredAnimals)
    : baseAnimals

  return {
    animals,
    maxDaysWaiting,
    totalCount: (feedResult.count as number) ?? 0,
  }
}

// ── getAvailableCities ─────────────────────────────────────

/**
 * Returns distinct cities from active organizations that have published animals.
 * Used to populate the city dropdown in the filter sheet.
 */
export async function getAvailableCities(): Promise<string[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('organizations')
    .select('city')
    .eq('is_active', true)
    .order('city', { ascending: true })

  if (error || !data) return []
  const cities = (data as { city: string }[]).map((o) => o.city)
  return [...new Set(cities)]
}

// ── getAnimalBySlug ────────────────────────────────────────

export async function getAnimalBySlug(slug: string): Promise<AnimalSummary | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('animals')
    .select(ANIMAL_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('getAnimalBySlug error:', error.message)
    return null
  }
  if (!data) return null

  const animal = data as AnimalSummary
  return attachDays(animal)
}

function attachDays(a: AnimalSummary): AnimalSummary {
  return { ...a, days_waiting: daysWaiting(a.intake_date) }
}
