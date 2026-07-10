interface MilaapLogoProps {
  /** 'full' shows mark + wordmark, 'mark' shows only the SVG icon */
  variant?: 'full' | 'mark'
  className?: string
}

/**
 * Milaap logo.
 * SVG mark: two crossing paths — left in terracotta, right in charcoal.
 * The crossing/meeting point dot is terracotta.
 * Wordmark: "Milaap" in Satoshi Bold.
 */
export default function MilaapLogo({
  variant = 'full',
  className = '',
}: MilaapLogoProps) {
  return (
    <div className={['flex items-center gap-2', className].join(' ')}>
      {/* SVG mark: two arcing paths crossing at a terracotta dot */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left path — terracotta — arcs from bottom-left to top-right */}
        <path
          d="M4 26 C8 18, 14 14, 28 6"
          stroke="#C46F52"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Right path — charcoal — arcs from top-left to bottom-right */}
        <path
          d="M4 6 C10 14, 18 18, 28 26"
          stroke="#2D2926"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Crossing/meeting point dot — terracotta */}
        <circle cx="16" cy="16" r="3" fill="#C46F52" />
      </svg>

      {/* Wordmark */}
      {variant === 'full' && (
        <span className="font-satoshi font-bold text-xl text-charcoal tracking-[-0.01em] leading-none">
          Milaap
        </span>
      )}
    </div>
  )
}
