'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import {
  COLORS, fetchImageBitmap, drawImageCover, drawMilaapLogo,
  drawRoundedRect, triggerDownload, canvasToBlob, wrapText,
} from '@/lib/canvas-share'

interface Props {
  animalName: string
  animalSlug: string
  orgName: string
  heroPhotoUrl: string | null
}

export default function QRGeneratorClient({ animalName, animalSlug, orgName, heroPhotoUrl }: Props) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)

  const profileUrl = `https://milaap.dpdns.org/p/${animalSlug}?src=qr`

  // Render QR on mount
  useEffect(() => {
    if (!qrCanvasRef.current) return
    QRCode.toCanvas(qrCanvasRef.current, profileUrl, {
      width: 280,
      margin: 2,
      color: {
        dark:  COLORS.terracotta,
        light: COLORS.linen,
      },
    }).then(() => setReady(true)).catch(console.error)
  }, [profileUrl])

  // ── Download QR PNG ──────────────────────────────────────
  async function downloadQRPng() {
    if (!qrCanvasRef.current) return
    const blob = await canvasToBlob(qrCanvasRef.current)
    triggerDownload(blob, `milaap-${animalSlug}-qr.png`)
  }

  // ── Download QR SVG ──────────────────────────────────────
  async function downloadQRSvg() {
    const svg = await QRCode.toString(profileUrl, {
      type: 'svg',
      margin: 2,
      color: { dark: COLORS.terracotta, light: COLORS.linen },
    })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    triggerDownload(blob, `milaap-${animalSlug}-qr.svg`)
  }

  // ── Download A4 Poster ───────────────────────────────────
  async function downloadPoster() {
    setGenerating(true)
    try {
      // A4 at 150dpi ≈ 1240×1754px (good quality, manageable size)
      const W = 1240
      const H = 1754

      const canvas = document.createElement('canvas')
      canvas.width  = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!

      // Background
      ctx.fillStyle = COLORS.linen
      ctx.fillRect(0, 0, W, H)

      // ── Photo area (top 50%) ──────────────────────────
      const photoH = Math.round(H * 0.50)
      if (heroPhotoUrl) {
        try {
          const img = await fetchImageBitmap(heroPhotoUrl)
          ctx.save()
          ctx.beginPath()
          // Photo fills top, rounded bottom corners
          ctx.rect(0, 0, W, photoH)
          ctx.clip()
          drawImageCover(ctx, img, 0, 0, W, photoH)
          ctx.restore()

          // Gradient fade photo → linen
          const grad = ctx.createLinearGradient(0, photoH - 120, 0, photoH + 40)
          grad.addColorStop(0, 'rgba(247,242,235,0)')
          grad.addColorStop(1, COLORS.linen)
          ctx.fillStyle = grad
          ctx.fillRect(0, photoH - 120, W, 160)
        } catch {
          // Photo failed — draw placeholder
          ctx.fillStyle = COLORS.dustyRose + '30'
          ctx.fillRect(0, 0, W, photoH)
        }
      }

      // ── Bottom content area ───────────────────────────
      const contentY = photoH + 40

      // Animal name
      ctx.fillStyle = COLORS.charcoal
      ctx.font = `bold 96px sans-serif`
      ctx.fillText(animalName, 80, contentY + 80)

      // "Scan to meet" line
      ctx.fillStyle = COLORS.terracotta
      ctx.font = `bold 44px sans-serif`
      ctx.fillText(`Scan to meet ${animalName}`, 80, contentY + 160)

      // QR code (bottom-right quadrant)
      const qrSize = 320
      const qrX = W - qrSize - 80
      const qrY = contentY + 40

      // QR white background card
      ctx.fillStyle = COLORS.white
      drawRoundedRect(ctx, qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 20)
      ctx.fill()

      // Render QR onto poster
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, profileUrl, {
        width: qrSize,
        margin: 1,
        color: { dark: COLORS.terracotta, light: COLORS.white },
      })
      ctx.drawImage(qrCanvas, qrX, qrY)

      // ── Bottom bar ────────────────────────────────────
      const barH = 100
      const barY = H - barH
      ctx.fillStyle = COLORS.charcoal
      ctx.fillRect(0, barY, W, barH)

      // Logo mark
      drawMilaapLogo(ctx, 60, barY + 22, 56, COLORS.terracotta, COLORS.linen)

      // Org name
      ctx.fillStyle = COLORS.linen
      ctx.font = `500 32px sans-serif`
      ctx.fillText(orgName || 'Milaap Nepal', 140, barY + 58)

      // URL
      ctx.fillStyle = COLORS.stone
      ctx.font = `28px sans-serif`
      ctx.fillText('milaap.dpdns.org', W - 340, barY + 58)

      const blob = await canvasToBlob(canvas)
      triggerDownload(blob, `milaap-${animalSlug}-poster.png`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* QR preview card */}
      <div className="bg-white border border-linen-dark rounded-2xl p-8 flex flex-col items-center gap-4 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <canvas
          ref={qrCanvasRef}
          className="rounded-xl"
          style={{ width: 280, height: 280 }}
        />
        <p className="text-[11px] text-stone text-center max-w-xs">
          Links to <span className="font-medium text-charcoal">{profileUrl}</span>
        </p>
      </div>

      {/* Download buttons */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Download QR</p>
        <div className="flex gap-2">
          <button
            onClick={downloadQRPng}
            disabled={!ready}
            className="flex-1 bg-terracotta text-white rounded-full py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors disabled:opacity-40"
          >
            Download QR (PNG)
          </button>
          <button
            onClick={downloadQRSvg}
            disabled={!ready}
            className="flex-1 bg-transparent text-charcoal border border-linen-dark rounded-full py-2.5 text-sm font-medium tracking-[0.04em] hover:border-charcoal/20 transition-colors disabled:opacity-40"
          >
            Download QR (SVG)
          </button>
        </div>
      </div>

      {/* Poster */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium">Print poster (A4)</p>
        <div className="bg-linen border border-linen-dark rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-charcoal font-satoshi">A4 Adoption Poster</p>
            <p className="text-[11px] text-stone mt-0.5">
              Animal photo + name + QR code · Ready to print at 150dpi
            </p>
          </div>
          <button
            onClick={downloadPoster}
            disabled={generating || !ready}
            className="flex-shrink-0 bg-charcoal text-linen rounded-full px-5 py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#1A1612] transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-linen border-t-transparent rounded-full animate-spin" />
                Generating…
              </>
            ) : 'Download Poster'}
          </button>
        </div>
      </div>

      {/* Usage tips */}
      <div className="bg-linen border border-linen-dark rounded-xl p-4 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium mb-2">Usage tips</p>
        {[
          'Print and place the poster in your shelter reception area',
          'Add the QR PNG to Instagram/Facebook posts for easy profile access',
          'QR traffic is tracked as "qr" source in your analytics dashboard',
          'The SVG is scalable — use it on banners or large prints',
        ].map((tip) => (
          <p key={tip} className="text-[12px] text-stone flex items-start gap-2">
            <span className="text-terracotta mt-0.5 shrink-0">·</span>
            {tip}
          </p>
        ))}
      </div>
    </div>
  )
}
