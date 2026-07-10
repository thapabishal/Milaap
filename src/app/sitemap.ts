import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://milaap.dpdns.org'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // ── Animal profiles ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: animals } = await (supabase as any)
    .from('animals')
    .select('slug, status, updated_at')
    .eq('is_published', true)

  const animalEntries: MetadataRoute.Sitemap = ((animals ?? []) as {
    slug: string
    status: string
    updated_at: string
  }[]).map((a) => ({
    url:             `${BASE}/p/${a.slug}`,
    lastModified:    new Date(a.updated_at),
    changeFrequency: a.status === 'adopted' ? 'yearly' : 'weekly',
    priority:        a.status === 'adopted' ? 0.4 : 0.8,
  }))

  // ── Approved happy tails ─────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tails } = await (supabase as any)
    .from('happy_tails')
    .select('id, updated_at')
    .eq('status', 'approved')

  const tailEntries: MetadataRoute.Sitemap = ((tails ?? []) as {
    id: string
    updated_at: string
  }[]).map((t) => ({
    url:             `${BASE}/happy-tails/${t.id}`,
    lastModified:    new Date(t.updated_at),
    changeFrequency: 'yearly',
    priority:        0.5,
  }))

  // ── Available cities (for /discover?city= variants) ──────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orgs } = await (supabase as any)
    .from('organizations')
    .select('city')
    .eq('is_active', true)

  const cities: string[] = [
    ...new Set(
      ((orgs ?? []) as { city: string }[]).map((o) => o.city).filter(Boolean)
    ),
  ]

  const discoverCityEntries: MetadataRoute.Sitemap = cities.map((city) => ({
    url:             `${BASE}/discover?city=${encodeURIComponent(city)}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  // ── /discover?species= variants ──────────────────────────
  const SPECIES = ['dog', 'cat', 'rabbit', 'other'] as const
  const discoverSpeciesEntries: MetadataRoute.Sitemap = SPECIES.map((s) => ({
    url:             `${BASE}/discover?species=${s}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  // ── Static pages ─────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/discover`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/happy-tails`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/faq`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  return [
    ...staticPages,
    ...discoverSpeciesEntries,
    ...discoverCityEntries,
    ...animalEntries,
    ...tailEntries,
  ]
}
