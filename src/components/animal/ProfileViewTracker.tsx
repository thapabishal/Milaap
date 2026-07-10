'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

type ValidSource = 'qr' | 'direct' | 'social' | 'embed' | 'unknown'

const VALID_SOURCES = new Set<ValidSource>(['qr', 'direct', 'social', 'embed', 'unknown'])

function parseSource(raw: string | null): ValidSource {
  if (raw && VALID_SOURCES.has(raw as ValidSource)) return raw as ValidSource
  return raw ? 'unknown' : 'direct'
}

interface ProfileViewTrackerProps {
  animalId: string
  organizationId: string
}

export default function ProfileViewTracker({
  animalId,
  organizationId,
}: ProfileViewTrackerProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const source = parseSource(searchParams.get('src'))
    trackEvent('profile_view', animalId, organizationId, source)
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
