'use client'

import { useState, useRef, useCallback, useId } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressForUpload } from '@/lib/image-compress'
import type { PhotoEntry } from './types'

interface Props {
  orgId: string
  tempAnimalId: string
  photos: PhotoEntry[]
  onPhotosChange: Dispatch<SetStateAction<PhotoEntry[]>>
}

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_PHOTOS = 5

const TIPS = [
  'Natural light works best',
  'Animal should fill 60% of the frame',
  'Include at least one photo showing their face clearly',
  'Action shots show personality — include one if possible',
]

export default function AnimalFormStep5({ orgId, tempAnimalId, photos, onPhotosChange }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => ACCEPTED.includes(f.type))
    const slots = MAX_PHOTOS - photos.length
    if (slots <= 0) return
    const toProcess = arr.slice(0, slots)

    // Add placeholders immediately so the UI responds
    const placeholders: PhotoEntry[] = toProcess.map((f) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(f),
      path: null,
      compressedSize: null,
      uploading: true,
      error: null,
    }))
    const nextPhotos = [...photos, ...placeholders]
    onPhotosChange(nextPhotos)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any

    await Promise.all(
      toProcess.map(async (file, i) => {
        const placeholder = placeholders[i]
        try {
          const compressed = await compressForUpload(file)
          const timestamp = Date.now()
          const storagePath = `${orgId}/${tempAnimalId}/${timestamp}_${i}.webp`

          const { error } = await supabase.storage
            .from('animal-photos')
            .upload(storagePath, compressed, {
              contentType: 'image/webp',
              upsert: false,
            })

          if (error) throw new Error(error.message)

          onPhotosChange((prev: PhotoEntry[]) =>
            prev.map((p) =>
              p.id === placeholder.id
                ? { ...p, path: storagePath, compressedSize: compressed.size, uploading: false }
                : p
            )
          )
        } catch (err) {
          onPhotosChange((prev: PhotoEntry[]) =>
            prev.map((p) =>
              p.id === placeholder.id
                ? { ...p, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' }
                : p
            )
          )
        }
      })
    )
  }, [photos, orgId, tempAnimalId, onPhotosChange])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  function removePhoto(id: string) {
    onPhotosChange(photos.filter((p) => p.id !== id))
  }

  // ── Drag-to-reorder ──────────────────────────────────────
  function handleCardDragStart(e: React.DragEvent, idx: number) {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleCardDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(idx)
  }

  function handleCardDrop(e: React.DragEvent, dropIdx: number) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null); setDragOverIdx(null); return
    }
    const reordered = [...photos]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    onPhotosChange(reordered)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  function handleCardDragEnd() {
    setDragIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      {photos.length < MAX_PHOTOS && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={[
            'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
            dragOver
              ? 'border-terracotta bg-terracotta/5'
              : 'border-linen-dark bg-linen hover:border-terracotta/40',
          ].join(' ')}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-linen-dark flex items-center justify-center text-xl">
            📷
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-charcoal">
              Drop photos here or <span className="text-terracotta">browse</span>
            </p>
            <p className="text-[11px] text-stone mt-1">
              JPG, PNG, WebP · Max {MAX_PHOTOS} photos · {MAX_PHOTOS - photos.length} slots remaining
            </p>
          </div>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED.join(',')}
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="space-y-2">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              draggable={!photo.uploading}
              onDragStart={(e) => handleCardDragStart(e, idx)}
              onDragOver={(e) => handleCardDragOver(e, idx)}
              onDrop={(e) => handleCardDrop(e, idx)}
              onDragEnd={handleCardDragEnd}
              className={[
                'bg-white border rounded-xl flex items-center gap-3 p-3 transition-all',
                dragOverIdx === idx && dragIdx !== idx
                  ? 'border-terracotta shadow-[0_0_0_2px_rgba(196,111,82,0.2)]'
                  : 'border-linen-dark',
                dragIdx === idx ? 'opacity-50' : '',
                photo.uploading ? 'cursor-wait' : 'cursor-grab',
              ].join(' ')}
            >
              {/* Drag handle */}
              <div className="text-stone/40 flex-shrink-0 select-none text-base leading-none">⠿</div>

              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-linen flex-shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo.uploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {idx === 0 && (
                  <span className="text-[9px] uppercase tracking-[0.08em] font-medium text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                    Hero photo — shown on cards
                  </span>
                )}
                <p className="text-xs text-charcoal font-medium mt-0.5">Photo {idx + 1}</p>
                {photo.uploading && (
                  <p className="text-[11px] text-stone">Compressing & uploading…</p>
                )}
                {!photo.uploading && photo.path && photo.compressedSize && (
                  <p className="text-[11px] text-sage font-medium">
                    Compressed to {Math.round(photo.compressedSize / 1024)}KB ✓
                  </p>
                )}
                {photo.error && (
                  <p className="text-[11px] text-terracotta">{photo.error}</p>
                )}
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                disabled={photo.uploading}
                className="w-7 h-7 flex items-center justify-center rounded-full text-stone hover:bg-linen hover:text-terracotta transition-colors disabled:opacity-30 flex-shrink-0"
                aria-label="Remove photo"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tips (collapsible) */}
      <div className="border border-linen-dark rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setTipsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-linen/50 transition-colors"
        >
          <span className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium">
            📷 Photo tips
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`transition-transform text-stone ${tipsOpen ? 'rotate-180' : ''}`}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {tipsOpen && (
          <div className="px-4 pb-4 pt-0 space-y-2">
            {TIPS.map((tip) => (
              <p key={tip} className="text-[12px] text-stone flex items-start gap-2">
                <span className="text-terracotta mt-0.5">·</span>
                {tip}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
