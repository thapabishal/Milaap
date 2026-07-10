import type { ReactNode } from 'react'

type BadgeVariant =
  | 'available'
  | 'reserved'
  | 'fostered'
  | 'medical'
  | 'adopted'
  | 'default'

type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  available: 'bg-status-available/15 text-status-available',
  reserved:  'bg-status-reserved/15 text-status-reserved',
  fostered:  'bg-status-fostered/15 text-status-fostered',
  medical:   'bg-status-medical/15 text-status-medical',
  adopted:   'bg-status-adopted/15 text-status-adopted',
  default:   'bg-linen-dark text-stone',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[9px]',
  md: 'px-3 py-1 text-[10px]',
}

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-tag font-medium uppercase tracking-[0.1em]',
        variantClasses[variant],
        sizeClasses[size],
      ].join(' ')}
    >
      {variant === 'available' && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
