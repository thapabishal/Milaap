import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

/**
 * Skeleton placeholder that matches AnimalCard's layout exactly.
 * Used in the discovery feed loading state.
 */
export default function AnimalCardSkeleton() {
  return (
    <div
      className="bg-white rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(45,41,38,0.06)]"
      aria-hidden="true"
      role="presentation"
    >
      {/* Photo area */}
      <LoadingSkeleton className="w-full h-[240px] rounded-none" />

      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
        {/* Waiting bar */}
        <LoadingSkeleton className="h-[2px] w-full rounded-full" />

        {/* Name */}
        <LoadingSkeleton className="h-8 w-2/3 rounded-lg" />

        {/* One-liner */}
        <div className="flex flex-col gap-1.5">
          <LoadingSkeleton className="h-3.5 w-full rounded-md" />
          <LoadingSkeleton className="h-3.5 w-4/5 rounded-md" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <LoadingSkeleton className="h-6 w-20 rounded-full" />
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
          <LoadingSkeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* CTA row */}
        <div className="flex gap-2 mt-1">
          <LoadingSkeleton className="flex-1 h-10 rounded-full" />
          <LoadingSkeleton className="w-10 h-10 rounded-full" />
          <LoadingSkeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}
