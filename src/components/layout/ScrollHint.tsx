'use client'

import { useEffect, useState } from 'react'

/**
 * "↓ scroll" indicator fixed at the bottom of the viewport.
 * Disappears as soon as the user scrolls past 40px.
 * Animating line grows and fades via CSS keyframes.
 */
export default function ScrollHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 40) setVisible(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-1.5 pointer-events-none z-20"
      aria-hidden="true"
    >
      {/* Animated vertical line */}
      <div
        className="w-px bg-stone/30 origin-top"
        style={{ animation: 'scrollLineGrow 1.6s ease-in-out infinite' }}
      />
      {/* Label */}
      <span className="text-[10px] text-stone/50 tracking-[0.06em] select-none">
        ↓ scroll
      </span>
    </div>
  )
}
