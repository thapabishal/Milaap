import Image from 'next/image'

interface MilaapLogoProps {
  /** 'full' shows mark + wordmark, 'mark' shows mark only */
  variant?: 'full' | 'mark'
  /** 'color' for linen/terracotta backgrounds, 'white' for dark backgrounds */
  theme?: 'color' | 'white'
  className?: string
  /** Size of the mark in px (default 32) */
  size?: number
}

/**
 * Milaap logo.
 * Uses the pre-built SVG assets from /public/logo/.
 * 'full'  → logo-full.svg (mark + "Milaap" wordmark)
 * 'mark'  → logo-mark.svg (mark only)
 * theme 'white' → white variants for charcoal/dark backgrounds
 */
export default function MilaapLogo({
  variant = 'full',
  theme = 'color',
  className = '',
  size = 32,
}: MilaapLogoProps) {
  if (variant === 'full') {
    const src = theme === 'white' ? '/logo/logo-full-white.svg' : '/logo/logo-full.svg'
    return (
      <Image
        src={src}
        alt="Milaap Nepal"
        width={120}
        height={size}
        className={className}
        priority
      />
    )
  }

  const src = theme === 'white' ? '/logo/logo-mark-white.svg' : '/logo/logo-mark.svg'
  return (
    <Image
      src={src}
      alt="Milaap"
      width={size}
      height={size}
      className={className}
    />
  )
}
