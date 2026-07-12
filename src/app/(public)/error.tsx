'use client'

import { useRouter } from 'next/navigation'

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  function handleRetry() {
    reset()
    router.refresh()
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-3xl mb-4">🐾</p>
      <h1 className="font-satoshi font-bold text-xl text-charcoal mb-2">
        Something went wrong on our end.
      </h1>
      <p className="text-sm text-stone mb-8 max-w-xs">
        Try again in a moment — the animals will still be here.
      </p>
      <button
        onClick={handleRetry}
        className="bg-terracotta text-white rounded-full px-7 py-3 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.2)]"
      >
        Try again
      </button>
    </div>
  )
}
