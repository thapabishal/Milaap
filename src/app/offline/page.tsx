'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function OfflinePage() {
  const [cachedNames, setCachedNames] = useState<string[]>([])
  const [checking, setChecking] = useState(false)
  const [online, setOnline] = useState(false)

  useEffect(() => {
    // Try to read last-viewed animal names from localStorage
    try {
      const stored = localStorage.getItem('milaap_recent_animals')
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        setCachedNames(parsed.slice(0, 5))
      }
    } catch {
      // ignore
    }
  }, [])

  async function checkConnection() {
    setChecking(true)
    try {
      const res = await fetch('/', { cache: 'no-store', method: 'HEAD' })
      if (res.ok) {
        setOnline(true)
        window.location.href = '/'
      }
    } catch {
      setOnline(false)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-linen flex flex-col items-center justify-center px-5 text-center">
      {/* Wifi off icon */}
      <div className="w-16 h-16 rounded-full bg-linen-dark flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M3 3l22 22" stroke="#8A8078" strokeWidth="2" strokeLinecap="round" />
          <path d="M7.5 10.5A12 12 0 0121 14M10.5 13.5A8 8 0 0118 16.5M14 19.5v.5" stroke="#8A8078" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="font-satoshi font-bold text-2xl text-charcoal mb-2">
        You&apos;re offline.
      </h1>
      <p className="text-sm text-stone leading-relaxed mb-6 max-w-xs">
        The animals are still waiting — reconnect to see them.
      </p>

      {/* Cached animal names */}
      {cachedNames.length > 0 && (
        <div className="bg-white border border-linen-dark rounded-xl p-4 mb-6 max-w-xs w-full">
          <p className="text-[10px] uppercase tracking-[0.08em] text-stone font-medium mb-2">
            Last viewed
          </p>
          <ul className="space-y-1">
            {cachedNames.map((name) => (
              <li key={name} className="text-sm text-charcoal font-semibold">{name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={checkConnection}
          disabled={checking}
          className="bg-terracotta text-white rounded-full py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {checking ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Checking…
            </>
          ) : online ? '✓ Back online — redirecting…' : 'Check connection'}
        </button>
        <Link
          href="/discover"
          className="bg-transparent text-stone border border-linen-dark rounded-full py-3 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors"
        >
          Try discover anyway →
        </Link>
      </div>
    </div>
  )
}
