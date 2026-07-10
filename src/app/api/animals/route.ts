import { NextRequest, NextResponse } from 'next/server'
import { getDiscoveryFeed } from '@/lib/animals'
import type { AnimalSpecies, AnimalSize } from '@/lib/animals'

/**
 * GET /api/animals
 * Query params: species, size, city, kids, cats, apt, page, limit
 * Used by client-side infinite scroll — returns page 2+.
 * Page 1 is always server-rendered.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const species    = sp.get('species')  as AnimalSpecies | null
  const size       = sp.get('size')     as AnimalSize | null
  const city       = sp.get('city')     ?? undefined
  const goodWithKids = sp.get('kids')   === 'true'
  const goodWithCats = sp.get('cats')   === 'true'
  const apartmentOk  = sp.get('apt')    === 'true'
  const page       = Math.max(1, parseInt(sp.get('page') ?? '2', 10))
  const limit      = Math.min(24, parseInt(sp.get('limit') ?? '12', 10))

  try {
    const result = await getDiscoveryFeed({
      species:      species ?? undefined,
      size:         size ?? undefined,
      city,
      goodWithKids: goodWithKids || undefined,
      goodWithCats: goodWithCats || undefined,
      apartmentOk:  apartmentOk || undefined,
      page,
      limit,
    })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    console.error('GET /api/animals error:', err)
    return NextResponse.json({ error: 'Failed to fetch animals' }, { status: 500 })
  }
}
