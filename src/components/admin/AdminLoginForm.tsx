'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : authError.message
      )
      setLoading(false)
      return
    }

    // Redirect to originally intended page, or /admin
    const next = searchParams.get('next') ?? '/admin'
    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-[11px] uppercase tracking-[0.1em] text-stone font-medium"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full bg-linen border border-linen-dark rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-stone/40 focus:outline-none focus:ring-2 focus:ring-[#C46F52]/30 focus:border-[#C46F52]/60 transition-colors"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[11px] uppercase tracking-[0.1em] text-stone font-medium"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full bg-linen border border-linen-dark rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-stone/40 focus:outline-none focus:ring-2 focus:ring-[#C46F52]/30 focus:border-[#C46F52]/60 transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full bg-[#2D2926] text-[#F7F2EB] rounded-full py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#1A1612] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
        aria-busy={loading}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
