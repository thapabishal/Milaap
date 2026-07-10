import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// ── Colors (exact hex from CLAUDE.md §6) ──────────────────
const C = {
  linen:      '#F7F2EB',
  terracotta: '#C46F52',
  dustyRose:  '#D7A79A',
  charcoal:   '#2D2926',
  stone:      '#8A8078',
  linenDark:  '#E8DDD0',
  white:      '#FFFFFF',
}

// ── Supabase service-role client (edge-safe) ───────────────
function getSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ── Helpers ────────────────────────────────────────────────
function photoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${path}`
}

function daysWaiting(intakeDate: string): number {
  const intake = new Date(intakeDate)
  const today  = new Date()
  return Math.max(0, Math.floor((today.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24)))
}

// ── Milaap logo mark (inline SVG paths for satori) ────────
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M4 26 C8 18, 14 14, 28 6"  stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 6 C10 14, 18 18, 28 26" stroke={C.charcoal}   strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3" fill={C.terracotta} />
    </svg>
  )
}

// ── GET handler ────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // ── Fetch Satoshi Bold font (from public directory) ──────
  // Edge runtime can fetch from the same origin
  const fontUrl  = new URL('/fonts/satoshi/Satoshi-Bold.woff2', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milaap.dpdns.org')
  let fontData: ArrayBuffer | null = null
  try {
    const fontRes = await fetch(fontUrl.toString())
    if (fontRes.ok) fontData = await fontRes.arrayBuffer()
  } catch { /* font load failed — fall back to system font */ }

  // ── Fetch animal data ─────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any

  // 'default' slug → homepage OG, no DB query
  if (slug === 'default') {
    return defaultOG(fontData)
  }

  const { data: animal, error } = await supabase
    .from('animals')
    .select('name, slug, one_liner, intake_date, photos, organizations(name, city)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  // ── Not found → default OG ───────────────────────────────
  if (error || !animal) {
    return defaultOG(fontData)
  }

  const days    = daysWaiting(animal.intake_date)
  const org     = animal.organizations
  const orgName = org?.name ?? ''
  const city    = org?.city ?? ''
  const label   = `${orgName}${city ? ` · ${city}` : ''}`

  // Waiting bar percentage — approximate with 730 days (2yr) as max if no DB query
  const pct     = Math.min((days / 730) * 100, 100)

  // Truncate one-liner to ~80 chars so it fits
  const oneLiner = animal.one_liner.length > 85
    ? animal.one_liner.slice(0, 82) + '…'
    : animal.one_liner

  // Truncate name to ~20 chars
  const name = animal.name.length > 20 ? animal.name.slice(0, 18) + '…' : animal.name

  // Hero photo
  const photos: { path: string; is_hero: boolean }[] = animal.photos ?? []
  const hero = photos.find((p) => p.is_hero) ?? photos[0] ?? null
  const heroUrl = hero ? photoUrl(hero.path) : null

  const options = fontData
    ? { fonts: [{ name: 'Satoshi', data: fontData, weight: 700 as const, style: 'normal' as const }] }
    : {}

  return new ImageResponse(
    (
      <div
        style={{
          display:    'flex',
          width:      '1200px',
          height:     '630px',
          background: C.linen,
          fontFamily: fontData ? 'Satoshi, sans-serif' : 'sans-serif',
        }}
      >
        {/* ── LEFT HALF — content ─────────────────────── */}
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            justifyContent:'space-between',
            width:         '600px',
            height:        '630px',
            padding:       '48px 52px',
            background:    C.linen,
          }}
        >
          {/* Top: logo + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* SVG logo mark */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 26 C8 18, 14 14, 28 6"  stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M4 6 C10 14, 18 18, 28 26" stroke={C.charcoal}   strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="3" fill={C.terracotta} />
            </svg>
            <span style={{ fontSize: '18px', fontWeight: 700, color: C.charcoal, letterSpacing: '-0.01em' }}>
              Milaap Nepal
            </span>
          </div>

          {/* Middle: name + waiting + one-liner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Animal name */}
            <div
              style={{
                fontSize:      '56px',
                fontWeight:    700,
                color:         C.charcoal,
                lineHeight:    '1.1',
                letterSpacing: '-0.02em',
              }}
            >
              {name}
            </div>

            {/* Waiting bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  width:        '460px',
                  height:       '3px',
                  background:   C.linenDark,
                  borderRadius: '9999px',
                  overflow:     'hidden',
                }}
              >
                <div
                  style={{
                    width:        `${pct}%`,
                    height:       '100%',
                    background:   C.terracotta,
                    borderRadius: '9999px',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize:      '11px',
                  color:         C.dustyRose,
                  fontWeight:    500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {days} days waiting
              </span>
            </div>

            {/* One-liner */}
            <div
              style={{
                fontSize:   '16px',
                color:      C.stone,
                fontStyle:  'italic',
                lineHeight: '1.6',
                fontWeight: 300,
              }}
            >
              &ldquo;{oneLiner}&rdquo;
            </div>
          </div>

          {/* Bottom: org + city */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: C.stone, fontWeight: 400 }}>
              {label}
            </span>
          </div>
        </div>

        {/* ── RIGHT HALF — photo ──────────────────────── */}
        <div
          style={{
            position:   'relative',
            width:      '600px',
            height:     '630px',
            background: heroUrl ? 'transparent' : C.linenDark,
            overflow:   'hidden',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroUrl}
              alt={name}
              width={600}
              height={630}
              style={{ objectFit: 'cover', width: '600px', height: '630px' }}
            />
          ) : (
            // No photo placeholder — logo mark centred
            <svg width="80" height="80" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.15 }}>
              <path d="M4 26 C8 18, 14 14, 28 6"  stroke={C.charcoal} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M4 6 C10 14, 18 18, 28 26" stroke={C.charcoal} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="3" fill={C.charcoal} />
            </svg>
          )}

          {/* Left-edge gradient — linen → transparent */}
          <div
            style={{
              position:   'absolute',
              top:        0,
              left:       0,
              width:      '120px',
              height:     '100%',
              background: `linear-gradient(to right, ${C.linen}, transparent)`,
            }}
          />
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
      ...options,
    }
  )
}

// ── Default OG — shown when animal not found ──────────────
function defaultOG(fontData: ArrayBuffer | null) {
  const options = fontData
    ? { fonts: [{ name: 'Satoshi', data: fontData, weight: 700 as const, style: 'normal' as const }] }
    : {}

  return new ImageResponse(
    (
      <div
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          width:          '1200px',
          height:         '630px',
          background:     C.linen,
          fontFamily:     fontData ? 'Satoshi, sans-serif' : 'sans-serif',
          gap:            '24px',
        }}
      >
        {/* Logo mark */}
        <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
          <path d="M4 26 C8 18, 14 14, 28 6"  stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M4 6 C10 14, 18 18, 28 26" stroke={C.charcoal}   strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3" fill={C.terracotta} />
        </svg>

        <div
          style={{
            fontSize:      '52px',
            fontWeight:    700,
            color:         C.charcoal,
            letterSpacing: '-0.02em',
            lineHeight:    '1',
          }}
        >
          Milaap Nepal
        </div>

        <div
          style={{
            fontSize:   '22px',
            color:      C.stone,
            fontStyle:  'italic',
            fontWeight: 300,
          }}
        >
          Two stories. One journey.
        </div>

        <div
          style={{
            marginTop:  '8px',
            fontSize:   '14px',
            color:      C.dustyRose,
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          milaap.dpdns.org
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
      ...options,
    }
  )
}
