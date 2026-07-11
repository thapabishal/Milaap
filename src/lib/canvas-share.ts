// Canvas share asset generation — client-side only, never stored
// All assets are generated on the fly and downloaded directly.

// ─── Brand tokens ──────────────────────────────────────────
export const COLORS = {
  linen:      '#F7F2EB',
  terracotta: '#C46F52',
  dustyRose:  '#D7A79A',
  sage:       '#8A9B82',
  charcoal:   '#2D2926',
  stone:      '#8A8078',
  white:      '#FFFFFF',
}

// ─── fetchImageBitmap ──────────────────────────────────────
// Fetches a remote image as an ImageBitmap for use in drawImage.
// Needed because CORS headers must be set on Supabase Storage.
export async function fetchImageBitmap(url: string): Promise<ImageBitmap> {
  const res = await fetch(url, { mode: 'cors' })
  const blob = await res.blob()
  return createImageBitmap(blob)
}

// ─── drawImageCover ───────────────────────────────────────
// Draws an image in object-cover mode into a canvas rect.
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  x: number, y: number, w: number, h: number
) {
  const scale = Math.max(w / img.width, h / img.height)
  const sw = w / scale
  const sh = h / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

// ─── drawMilaapLogo ──────────────────────────────────────
// Draws the Milaap logo mark (two crossing curves + dot) at given position.
export function drawMilaapLogo(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  color1 = COLORS.terracotta,
  color2 = COLORS.charcoal
) {
  const scale = size / 32
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'

  // First curve (terracotta)
  ctx.beginPath()
  ctx.moveTo(4, 26)
  ctx.bezierCurveTo(8, 18, 14, 14, 28, 6)
  ctx.strokeStyle = color1
  ctx.stroke()

  // Second curve (charcoal)
  ctx.beginPath()
  ctx.moveTo(4, 6)
  ctx.bezierCurveTo(10, 14, 18, 18, 28, 26)
  ctx.strokeStyle = color2
  ctx.stroke()

  // Centre dot (terracotta)
  ctx.beginPath()
  ctx.arc(16, 16, 3, 0, Math.PI * 2)
  ctx.fillStyle = color1
  ctx.fill()

  ctx.restore()
}

// ─── drawRoundedRect ─────────────────────────────────────
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// ─── triggerDownload ──────────────────────────────────────
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── canvasToBlob ────────────────────────────────────────
export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, type)
  })
}

// ─── wrapText ────────────────────────────────────────────
// Wraps text to fit within maxWidth, returns lines array.
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
