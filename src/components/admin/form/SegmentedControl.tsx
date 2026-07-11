'use client'

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  name?: string
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className="inline-flex bg-linen border border-linen-dark rounded-xl p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            value === opt.value
              ? 'bg-white text-charcoal shadow-sm border border-linen-dark'
              : 'text-stone hover:text-charcoal',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
