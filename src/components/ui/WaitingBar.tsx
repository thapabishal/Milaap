interface WaitingBarProps {
  daysWaiting: number
  maxDaysWaiting: number
}

export default function WaitingBar({ daysWaiting, maxDaysWaiting }: WaitingBarProps) {
  const pct = maxDaysWaiting > 0
    ? Math.min((daysWaiting / maxDaysWaiting) * 100, 100)
    : 0

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex-1 h-[2px] bg-linen-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-terracotta rounded-full"
          style={{
            width: `${pct}%`,
            animation: 'waitingBarGrow 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 300ms both',
          }}
          role="progressbar"
          aria-valuenow={daysWaiting}
          aria-valuemin={0}
          aria-valuemax={maxDaysWaiting}
          aria-label={`Waiting ${daysWaiting} days`}
        />
      </div>
      <span className="text-[10px] uppercase tracking-[0.08em] text-dusty-rose whitespace-nowrap font-medium">
        {daysWaiting} days waiting
      </span>
    </div>
  )
}
