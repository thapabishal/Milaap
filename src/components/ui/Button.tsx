'use client'

import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'dark'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: Variant
  size?: Size
  className?: string
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  href?: string
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-terracotta text-white hover:bg-[#B05A3E] shadow-[0_4px_20px_rgba(196,111,82,0.25)] disabled:bg-terracotta/50',
  secondary:
    'bg-transparent text-stone border border-linen-dark hover:border-charcoal/20 disabled:opacity-50',
  dark:
    'bg-charcoal text-linen hover:bg-[#1A1612] disabled:bg-charcoal/50 flex items-center justify-center gap-2.5',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-7 py-3.5 text-sm',
  lg: 'px-8 py-4 text-base',
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  href,
  children,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-[0.04em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 disabled:cursor-not-allowed'

  const classes = [base, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ')

  const isDisabled = disabled || loading

  if (href && !isDisabled) {
    return (
      <a href={href} className={classes}>
        {loading && <Spinner />}
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
