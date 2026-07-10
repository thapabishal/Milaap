import type { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
  onClick?: () => void
}

export default function Card({ className = '', children, onClick }: CardProps) {
  const base =
    'bg-white border border-linen-dark rounded-xl overflow-hidden ' +
    'shadow-[0_1px_3px_rgba(45,41,38,0.06)] ' +
    'hover:shadow-[0_4px_16px_rgba(45,41,38,0.08)] ' +
    'transition-shadow'

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={[base, 'cursor-pointer', className].join(' ')}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={[base, className].join(' ')}>
      {children}
    </div>
  )
}
