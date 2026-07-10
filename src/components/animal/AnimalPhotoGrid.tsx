'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

interface Photo {
  path: string
  is_hero: boolean
  caption?: string
}

interface AnimalPhotoGridProps {
  photos: Photo[]
  animalName: string
}

function photoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${path}`
}

export default function AnimalPhotoGrid({ photos, animalName }: AnimalPhotoGridProps) {
  const { t } = useTranslation()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Non-hero photos only; need at least 2 for the grid (3+ total means 2+ non-hero)
  const gridPhotos = photos.filter((p) => !p.is_hero)
  if (gridPhotos.length < 2) return null

  // Close lightbox on Escape
  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  return (
    <>
      <section className="mt-8" aria-labelledby="photo-grid-heading">
        <h2
          id="photo-grid-heading"
          className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-3"
        >
          {t('animal.morePhotos')}
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {gridPhotos.map((photo, i) => (
            <button
              key={photo.path}
              type="button"
              className="relative aspect-square rounded-md overflow-hidden bg-linen-dark focus-visible:ring-2 focus-visible:ring-terracotta/50"
              onClick={() => setLightboxIndex(i)}
              aria-label={`View photo ${i + 2} of ${animalName}`}
            >
              <Image
                src={photoUrl(photo.path)}
                alt={photo.caption ?? `${animalName} photo ${i + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 400px"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${lightboxIndex + 2} of ${animalName}`}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-5 right-5 text-linen/70 hover:text-linen text-2xl leading-none p-2"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close photo"
          >
            ✕
          </button>

          {/* Image — stop propagation so clicking image doesn't close */}
          <div
            className="relative w-full max-w-lg mx-6 aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photoUrl(gridPhotos[lightboxIndex].path)}
              alt={gridPhotos[lightboxIndex].caption ?? `${animalName} photo ${lightboxIndex + 2}`}
              fill
              className="object-contain rounded-md"
              sizes="(max-width: 768px) 90vw, 512px"
            />
          </div>

          {/* Caption */}
          {gridPhotos[lightboxIndex].caption && (
            <p className="absolute bottom-6 inset-x-0 text-center text-xs text-linen/50 px-6">
              {gridPhotos[lightboxIndex].caption}
            </p>
          )}
        </div>
      )}
    </>
  )
}
