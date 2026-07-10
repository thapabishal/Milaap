import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dir  = join(root, 'public', 'icons')

if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

function makeSvg(size) {
  const pad  = Math.round(size * 0.22)
  const cx   = size / 2
  const cy   = size / 2
  const r    = Math.round(size * 0.09)
  const sw   = Math.round(size * 0.055)
  const rx   = Math.round(size * 0.2)
  const scale = (size - 2 * pad) / 32
  const p = (x, y) => `${pad + x * scale},${pad + y * scale}`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#C46F52"/>
  <path d="M${p(4,26)} C${p(8,18)},${p(14,14)},${p(28,6)}" stroke="white" stroke-width="${sw}" stroke-linecap="round" fill="none"/>
  <path d="M${p(4,6)} C${p(10,14)},${p(18,18)},${p(28,26)}" stroke="white" stroke-width="${sw}" stroke-linecap="round" fill="none"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
</svg>`
}

async function gen(size, filename) {
  const svg = Buffer.from(makeSvg(size))
  await sharp(svg).resize(size, size).png().toFile(join(dir, filename))
  console.log(`✓ ${filename}`)
}

await gen(192, 'icon-192.png')
await gen(512, 'icon-512.png')
console.log('PWA icons generated.')
