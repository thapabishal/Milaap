'use client'

import { useRouter } from 'next/navigation'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: Props) {
  const router = useRouter()

  function handleRetry() {
    reset()
    router.refresh()
  }

  return (
    <div className="px-5 md:px-8 py-10 max-w-lg">
      <div className="bg-white border border-linen-dark rounded-2xl p-6 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        <h1 className="font-satoshi font-bold text-xl text-charcoal mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-stone mb-4">
          Please refresh or contact the platform team if the problem persists.
        </p>

        {/* Error details for debugging */}
        <details className="mb-5">
          <summary className="text-[11px] uppercase tracking-[0.06em] text-stone font-medium cursor-pointer hover:text-charcoal transition-colors">
            Error details
          </summary>
          <pre className="mt-2 text-[11px] bg-linen border border-linen-dark rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-all text-terracotta leading-relaxed">
            {error.message}
            {error.digest ? `\n\nDigest: ${error.digest}` : ''}
          </pre>
        </details>

        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            className="flex-1 bg-terracotta text-white rounded-full py-2.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="flex-1 bg-transparent text-stone border border-linen-dark rounded-full py-2.5 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
