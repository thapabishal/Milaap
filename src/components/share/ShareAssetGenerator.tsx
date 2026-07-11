'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import {
  COLORS, fetchImageBitmap, drawImageCover, drawMilaapLogo,
  triggerDownload, canvasToBlob, wrapText,
} from '@/lib/canvas-share'

interface Props {
  animalName: string
  animalSlug: string
  animalId: string
  organizationId: string
  orgName: string
  orgInstagram?: string | null
  daysWaiting: number
  oneLiner: string
  heroPhotoUrl: string | null
}

// ── Story 1080×1920 ───────────────────────────────────────
async function renderStory(props: Props): Promise<Blob> {
  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = COLORS.linen
  ctx.fillRect(0, 0, W, H)

  // Photo — top 60%
  const photoH = Math.round(H * 0.60)
  if (props.heroPhotoUrl) {
    try {
      const img = await fetchImageBitmap(props.heroPhotoUrl)
      ctx.save()
      ctx.rect(0, 0, W, photoH)
      ctx.clip()
      drawImageCover(ctx, img, 0, 0, W, photoH)
      ctx.restore()
    } catch { /* no photo — linen bg is fine */ }
  }

  // Gradient overlay photo → linen (middle 10% ≈ rows photoH*0.9 → photoH+60)
  const gradStart = Math.round(photoH * 0.88)
  const gradEnd   = photoH + 80
  const grad = ctx.createLinearGradient(0, gradStart, 0, gradEnd)
  grad.addColorStop(0, 'rgba(247,242,235,0)')
  grad.addColorStop(1, COLORS.linen)
  ctx.fillStyle = grad
  ctx.fillRect(0, gradStart, W, gradEnd - gradStart + 20)

  // ── Bottom 40% text area ─────────────────────────────
  let y = photoH + 56

  // Milaap logo + "Milaap Nepal" — top-left
  drawMilaapLogo(ctx, 60, y, 36, COLORS.terracotta, COLORS.charcoal)
  ctx.fillStyle = COLORS.charcoal
  ctx.font = `600 28px sans-serif`
  ctx.fillText('Milaap Nepal', 108, y + 24)

  // Org Instagram — top-right
  if (props.orgInstagram) {
    const handle = props.orgInstagram.replace('https://instagram.com/', '@')
    ctx.fillStyle = COLORS.stone
    ctx.font = `400 26px sans-serif`
    ctx.textAlign = 'right'
    ctx.fillText(handle, W - 60, y + 24)
    ctx.textAlign = 'left'
  }

  y += 80

  // Animal name
  ctx.fillStyle = COLORS.charcoal
  ctx.font = `bold 80px sans-serif`
  ctx.fillText(props.animalName, 60, y)
  y += 96

  // Waiting bar (drawn as thin rect)
  const barW = W - 120
  const barH2 = 4
  const fillW = Math.min(barW, Math.round(barW * Math.min(props.daysWaiting / 365, 1)))
  ctx.fillStyle = COLORS.linen + 'CC'
  ctx.fillRect(60, y, barW, barH2)
  ctx.fillStyle = COLORS.terracotta
  ctx.fillRect(60, y, fillW, barH2)
  y += 28

  // Days waiting
  ctx.fillStyle = COLORS.dustyRose
  ctx.font = `500 28px sans-serif`
  ctx.fillText(`${props.daysWaiting} days waiting`, 60, y)
  y += 52

  // One-liner (italic, wrapped)
  ctx.fillStyle = COLORS.stone
  ctx.font = `italic 32px sans-serif`
  const lines = wrapText(ctx, props.oneLiner, W - 120)
  for (const line of lines) {
    ctx.fillText(line, 60, y)
    y += 44
  }

  // URL at bottom
  ctx.fillStyle = COLORS.stone + 'AA'
  ctx.font = `400 24px sans-serif`
  ctx.fillText(`milaap.dpdns.org/p/${props.animalSlug}`, 60, H - 80)

  return canvasToBlob(canvas)
}

// ── Post 1080×1080 ────────────────────────────────────────
async function renderPost(props: Props): Promise<Blob> {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = COLORS.linen
  ctx.fillRect(0, 0, W, H)

  // Right half: animal photo
  if (props.heroPhotoUrl) {
    try {
      const img = await fetchImageBitmap(props.heroPhotoUrl)
      ctx.save()
      ctx.rect(W / 2, 0, W / 2, H)
      ctx.clip()
      drawImageCover(ctx, img, W / 2, 0, W / 2, H)
      ctx.restore()

      // Left-edge gradient on photo → linen
      const grad = ctx.createLinearGradient(W / 2, 0, W / 2 + 120, 0)
      grad.addColorStop(0, COLORS.linen)
      grad.addColorStop(1, 'rgba(247,242,235,0)')
      ctx.fillStyle = grad
      ctx.fillRect(W / 2, 0, 120, H)
    } catch { /* skip photo */ }
  }

  // Left half text
  let y = 100

  // Milaap logo + name
  drawMilaapLogo(ctx, 60, y, 32, COLORS.terracotta, COLORS.charcoal)
  ctx.fillStyle = COLORS.charcoal
  ctx.font = `600 26px sans-serif`
  ctx.fillText('Milaap Nepal', 104, y + 22)
  y += 80

  // Animal name
  ctx.fillStyle = COLORS.charcoal
  ctx.font = `bold 72px sans-serif`
  const nameLines = wrapText(ctx, props.animalName, W / 2 - 100)
  for (const line of nameLines) {
    ctx.fillText(line, 60, y)
    y += 84
  }
  y += 8

  // Waiting bar
  const barW = W / 2 - 120
  const fillW = Math.min(barW, Math.round(barW * Math.min(props.daysWaiting / 365, 1)))
  ctx.fillStyle = COLORS.linen + 'CC'
  ctx.fillRect(60, y, barW, 4)
  ctx.fillStyle = COLORS.terracotta
  ctx.fillRect(60, y, fillW, 4)
  y += 28

  ctx.fillStyle = COLORS.dustyRose
  ctx.font = `500 26px sans-serif`
  ctx.fillText(`${props.daysWaiting} days waiting`, 60, y)
  y += 52

  // One-liner
  ctx.fillStyle = COLORS.stone
  ctx.font = `italic 28px sans-serif`
  const lines = wrapText(ctx, props.oneLiner, W / 2 - 100)
  for (const line of lines.slice(0, 3)) {
    ctx.fillText(line, 60, y)
    y += 40
  }

  // Terracotta strip at bottom
  const stripH = 80
  ctx.fillStyle = COLORS.terracotta
  ctx.fillRect(0, H - stripH, W, stripH)
  ctx.fillStyle = COLORS.white
  ctx.font = `bold 28px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('Two stories. One journey.', W / 4, H - stripH + 50)
  ctx.textAlign = 'left'

  // URL
  ctx.fillStyle = COLORS.white + 'CC'
  ctx.font = `400 22px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`milaap.dpdns.org/p/${props.animalSlug}`, W / 4, H - stripH + 74)
  ctx.textAlign = 'left'

  return canvasToBlob(canvas)
}

// ── Component ─────────────────────────────────────────────
export default function ShareAssetGenerator(props: Props) {
  const [storyState, setStoryState] = useState<'idle' | 'loading'>('idle')
  const [postState,  setPostState]  = useState<'idle' | 'loading'>('idle')

  async function handleStory() {
    setStoryState('loading')
    try {
      const blob = await renderStory(props)
      triggerDownload(blob, `milaap-${props.animalSlug}-story.png`)
      trackEvent('share_tap', props.animalId, props.organizationId, 'social')
    } finally {
      setStoryState('idle')
    }
  }

  async function handlePost() {
    setPostState('loading')
    try {
      const blob = await renderPost(props)
      triggerDownload(blob, `milaap-${props.animalSlug}-post.png`)
      trackEvent('share_tap', props.animalId, props.organizationId, 'social')
    } finally {
      setPostState('idle')
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Instagram Story */}
      <button
        type="button"
        disabled={storyState === 'loading'}
        onClick={handleStory}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left hover:bg-linen-dark active:bg-linen-dark transition-colors disabled:opacity-60"
      >
        <span className="text-xl w-7 text-center shrink-0">📖</span>
        <span className="flex flex-col">
          <span className="text-sm font-medium text-charcoal">
            {storyState === 'loading' ? 'Generating story…' : 'Instagram Story (1080×1920)'}
          </span>
          <span className="text-[10px] text-stone mt-0.5">
            {storyState === 'loading'
              ? 'Fetching photo and drawing canvas…'
              : 'Portrait format · Ready to post'}
          </span>
        </span>
        {storyState === 'loading' && (
          <span className="ml-auto w-4 h-4 border-2 border-stone border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </button>

      {/* Instagram Post */}
      <button
        type="button"
        disabled={postState === 'loading'}
        onClick={handlePost}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left hover:bg-linen-dark active:bg-linen-dark transition-colors disabled:opacity-60"
      >
        <span className="text-xl w-7 text-center shrink-0">🖼</span>
        <span className="flex flex-col">
          <span className="text-sm font-medium text-charcoal">
            {postState === 'loading' ? 'Generating post…' : 'Instagram Post (1080×1080)'}
          </span>
          <span className="text-[10px] text-stone mt-0.5">
            {postState === 'loading'
              ? 'Fetching photo and drawing canvas…'
              : 'Square format · Ready to post'}
          </span>
        </span>
        {postState === 'loading' && (
          <span className="ml-auto w-4 h-4 border-2 border-stone border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </button>
    </div>
  )
}
