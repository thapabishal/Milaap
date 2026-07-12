import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
      {/* Simple dog SVG mascot */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
        className="mb-6 opacity-60"
      >
        {/* Body */}
        <ellipse cx="40" cy="50" rx="22" ry="18" fill="#D7A79A" />
        {/* Head */}
        <circle cx="40" cy="28" r="14" fill="#D7A79A" />
        {/* Ears */}
        <ellipse cx="28" cy="20" rx="6" ry="9" fill="#C46F52" transform="rotate(-15 28 20)" />
        <ellipse cx="52" cy="20" rx="6" ry="9" fill="#C46F52" transform="rotate(15 52 20)" />
        {/* Eyes */}
        <circle cx="35" cy="26" r="2.5" fill="#2D2926" />
        <circle cx="45" cy="26" r="2.5" fill="#2D2926" />
        {/* Nose */}
        <ellipse cx="40" cy="33" rx="3" ry="2" fill="#2D2926" />
        {/* Tail */}
        <path d="M62 46 Q72 38 68 30" stroke="#C46F52" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Legs */}
        <rect x="25" y="62" width="7" height="12" rx="3.5" fill="#C46F52" />
        <rect x="36" y="64" width="7" height="12" rx="3.5" fill="#C46F52" />
        <rect x="47" y="64" width="7" height="12" rx="3.5" fill="#C46F52" />
      </svg>

      <h1 className="font-satoshi font-bold text-2xl text-charcoal mb-2">
        This page got lost on the way home.
      </h1>
      <p className="text-sm text-stone leading-relaxed mb-8 max-w-xs">
        It may have been moved or never existed. But there are animals still waiting to be found.
      </p>

      <Link
        href="/discover"
        className="inline-flex items-center gap-2 bg-terracotta text-white rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)]"
      >
        → Back to discover
      </Link>
    </div>
  )
}
