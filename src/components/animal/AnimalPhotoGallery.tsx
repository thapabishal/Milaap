'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import MilaapLogo from '@/components/layout/MilaapLogo'

interface Photo {
  path: string
  is_hero: boolean
  caption?: string
}

interface AnimalPhotoGalleryProps {
  photos: Photo[]
  animalName: string
  orgName?: string
  species?: string
}

function photoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${path}`
}

const SWIPE_MIN_PX = 50

export default function AnimalPhotoGallery({
  photos,
  animalName,
  orgName,
  species,
}: AnimalPhotoGalleryProps) {
  // Sort: hero first
  const sorted = [...photos].sort((a, b) => (b.is_hero ? 1 : 0) - (a.is_hero ? 1 : 0))
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  // Swipe tracking
  const touchStartX = useRef<number | null>(null)

  function goTo(index: number) {
    if (index === current || fading) return
    setFading(true)
    setTimeout(() => {
      setCurrent(index)
      setFading(false)
    }, 150)
  }

  function prev() { goTo((current - 1 + sorted.length) % sorted.length) }
  function next() { goTo((current + 1) % sorted.length) }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) >= SWIPE_MIN_PX) {
      delta > 0 ? next() : prev()
    }
    touchStartX.current = null
  }

  // Build accessible alt text
  const altText = (photo: Photo, idx: number) => {
    const base = orgName && species
      ? `${animalName} — ${species} available for adoption at ${orgName}`
      : `${animalName} — photo ${idx + 1}`
    return photo.caption ?? base
  }

  // ── No photos placeholder ─────────────────────────────
  if (sorted.length === 0) {
    return (
      <div
        className="relative w-full h-[65vh] md:h-[55vh] bg-linen flex items-center justify-center"
        role="img"
        aria-label={`No photos of ${animalName} yet`}
      >
        <MilaapLogo variant="mark" className="opacity-20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-linen to-transparent" />
      </div>
    )
  }

  const active = sorted[current]

  return (
    <div
      className="relative w-full h-[65vh] md:h-[55vh] overflow-hidden bg-linen-dark select-none"
      role="img"
      aria-label={`Photos of ${animalName}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Photo */}
      <Image
        key={active.path}
        src={photoUrl(active.path)}
        alt={altText(active, current)}
        fill
        className={[
          'object-cover transition-opacity duration-300',
          fading ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        priority={current === 0}
        sizes="100vw"
        style={{ touchAction: 'pinch-zoom' }}
      />

      {/* Bottom gradient → linen */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-linen to-transparent pointer-events-none" />

      {/* Photo counter — top right */}
      {sorted.length > 1 && (
        <div
          className="absolute top-4 right-4 z-20 px-2 py-0.5 rounded-full bg-black/40 pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[10px] font-medium text-white tracking-[0.05em]">
            {current + 1} / {sorted.length}
          </span>
        </div>
      )}

      {/* Tap zones for prev / next */}
      {sorted.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            className="absolute left-0 top-0 w-1/3 h-full z-10"
            onClick={prev}
          />
          <button
            type="button"
            aria-label="Next photo"
            className="absolute right-0 top-0 w-1/3 h-full z-10"
            onClick={next}
          />
        </>
      )}

      {/* Dot indicators */}
      {sorted.length > 1 && (
        <div
          className="absolute bottom-5 inset-x-0 flex justify-center gap-1.5 z-20 pointer-events-none"
          role="tablist"
          aria-label="Photo navigation"
        >
          {sorted.map((_, i) => (
            <span
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Photo ${i + 1}`}
              className={[
                'block rounded-full transition-all duration-300',
                i === current
                  ? 'w-4 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/50',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
