'use client'

import { useState } from 'react'
import {
  COLORS, fetchImageBitmap, drawImageCover, drawMilaapLogo,
  triggerDownload, canvasToBlob, wrapText,
} from '@/lib/canvas-share'

interface Props {
  animalName: string
  adopterName: string
  daysWaited: number | null
  storyQuote: string           // first ~120 chars of story
  shelterPhotoUrl: string | null
  homePhotoUrl: string
  slug: string                 // used for filename
}

// 1080×1080 before/after canvas for Happy Tails
async function renderHappyTailPost(props: Props): Promise<Blob> {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = COLORS.linen
  ctx.fillRect(0, 0, W, H)

  // ── Top 55%: split before/after photos ──────────────────
  const photoH = Math.round(H * 0.55)
  const halfW  = W / 2

  // Shelter photo (left)
  if (props.shelterPhotoUrl) {
    try {
      const img = await fetchImageBitmap(props.shelterPhotoUrl)
      ctx.save()
      ctx.rect(0, 0, halfW - 2, photoH)
      ctx.clip()
      drawImageCover(ctx, img, 0, 0, halfW - 2, photoH)
      ctx.restore()

      // "Before" label
      ctx.fillStyle = 'rgba(45,41,38,0.55)'
      ctx.fillRect(20, 20, 100, 32)
      ctx.fillStyle = COLORS.white
      ctx.font = `600 18px sans-serif`
      ctx.fillText('SHELTER', 28, 42)
    } catch { /* skip */ }
  } else {
    ctx.fillStyle = COLORS.dustyRose + '30'
    ctx.fillRect(0, 0, halfW - 2, photoH)
    ctx.fillStyle = COLORS.stone
    ctx.font = `400 24px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('Shelter photo', halfW / 2, photoH / 2)
    ctx.textAlign = 'left'
  }

  // Home photo (right)
  try {
    const img = await fetchImageBitmap(props.homePhotoUrl)
    ctx.save()
    ctx.rect(halfW + 2, 0, halfW - 2, photoH)
    ctx.clip()
    drawImageCover(ctx, img, halfW + 2, 0, halfW - 2, photoH)
    ctx.restore()

    // "After" label
    ctx.fillStyle = COLORS.sage + 'CC'
    ctx.fillRect(halfW + 20, 20, 88, 32)
    ctx.fillStyle = COLORS.white
    ctx.font = `600 18px sans-serif`
    ctx.fillText('HOME', halfW + 28, 42)
  } catch { /* skip */ }

  // Divider arrow between photos
  ctx.fillStyle = COLORS.white
  ctx.beginPath()
  ctx.arc(halfW, photoH / 2, 32, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.charcoal
  ctx.font = `bold 28px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('→', halfW, photoH / 2 + 10)
  ctx.textAlign = 'left'

  // Gradient photo → linen
  const gradY = photoH - 60
  const grad  = ctx.createLinearGradient(0, gradY, 0, photoH + 20)
  grad.addColorStop(0, 'rgba(247,242,235,0)')
  grad.addColorStop(1, COLORS.linen)
  ctx.fillStyle = grad
  ctx.fillRect(0, gradY, W, photoH - gradY + 20)

  // ── Bottom 45%: text content ─────────────────────────────
  let y = photoH + 40

  // Milaap logo
  drawMilaapLogo(ctx, 60, y, 28, COLORS.terracotta, COLORS.charcoal)
  ctx.fillStyle = COLORS.stone
  ctx.font = `400 22px sans-serif`
  ctx.fillText('Milaap Nepal · Happy Tails', 100, y + 19)
  y += 60

  // Animal name
  ctx.fillStyle = COLORS.charcoal
  ctx.font = `bold 64px sans-serif`
  const nameLines = wrapText(ctx, props.animalName, W - 120)
  for (const line of nameLines) {
    ctx.fillText(line, 60, y)
    y += 72
  }

  // Days waited badge
  if (props.daysWaited && props.daysWaited > 0) {
    ctx.fillStyle = COLORS.dustyRose
    ctx.font = `500 24px sans-serif`
    ctx.fillText(`Waited ${props.daysWaited} days — now home.`, 60, y)
    y += 40
  }

  // Quote
  y += 8
  const quote = props.storyQuote.length > 120
    ? props.storyQuote.slice(0, 120).trimEnd() + '…'
    : props.storyQuote
  ctx.fillStyle = COLORS.stone
  ctx.font = `italic 26px sans-serif`
  const qLines = wrapText(ctx, `"${quote}"`, W - 120)
  for (const line of qLines.slice(0, 3)) {
    ctx.fillText(line, 60, y)
    y += 36
  }

  // Adopter
  y += 8
  ctx.fillStyle = COLORS.charcoal
  ctx.font = `500 22px sans-serif`
  ctx.fillText(`— ${props.adopterName}`, 60, y)

  // Bottom terracotta strip
  ctx.fillStyle = COLORS.terracotta
  ctx.fillRect(0, H - 64, W, 64)
  ctx.fillStyle = COLORS.white
  ctx.font = `bold 24px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('Two stories. One journey. · milaap.dpdns.org', W / 2, H - 22)
  ctx.textAlign = 'left'

  return canvasToBlob(canvas)
}

export default function HappyTailShareGenerator(props: Props) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    try {
      const blob = await renderHappyTailPost(props)
      triggerDownload(blob, `milaap-happy-tail-${props.slug}.png`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-2 text-[12px] text-terracotta hover:text-[#B05A3E] transition-colors font-medium disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="w-3 h-3 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          Generating…
        </>
      ) : (
        '↓ Share asset'
      )}
    </button>
  )
}
