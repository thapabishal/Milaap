'use client'

import { useEffect, useRef } from 'react'

/**
 * Attaches a single IntersectionObserver to a container ref.
 * All direct children with `data-fade` attribute will fade in
 * (translateY 12px → 0, opacity 0 → 1) staggered by 80ms each.
 */
export function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('[data-fade]')
    )

    // Set initial hidden state
    sections.forEach((el, i) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(12px)'
      el.style.transition = `opacity 400ms ease, transform 400ms ease`
      el.style.transitionDelay = `${i * 80}ms`
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    sections.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}
