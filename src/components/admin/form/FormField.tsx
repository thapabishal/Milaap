import type { ReactNode } from 'react'

interface Props {
  label: string
  required?: boolean
  helper?: string
  children: ReactNode
  htmlFor?: string
  extra?: ReactNode   // right-aligned next to label (e.g. character counter)
}

export default function FormField({ label, required, helper, children, htmlFor, extra }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[11px] uppercase tracking-[0.08em] text-stone font-medium"
        >
          {label}
          {required && <span className="text-terracotta ml-0.5">*</span>}
        </label>
        {extra}
      </div>
      {children}
      {helper && (
        <p className="text-[11px] text-stone/70 leading-relaxed">{helper}</p>
      )}
    </div>
  )
}
