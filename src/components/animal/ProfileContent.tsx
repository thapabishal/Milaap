'use client'

import { useFadeIn } from '@/hooks/useFadeIn'

interface ProfileContentProps {
  children: React.ReactNode
}

/**
 * Thin wrapper that applies staggered fade-in to all
 * child sections marked with `data-fade`.
 */
export default function ProfileContent({ children }: ProfileContentProps) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className="px-5 md:px-7 max-w-[680px] mx-auto">
      {children}
    </div>
  )
}
