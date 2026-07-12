import AnimalCardSkeleton from '@/components/animal/AnimalCardSkeleton'

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-linen">
      <div className="px-5 md:px-7 max-w-[680px] mx-auto pt-8 pb-4">
        {/* Header skeleton */}
        <div className="mb-6 flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-48 bg-linen-dark rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-linen-dark rounded-md animate-pulse" />
          </div>
          <div className="h-9 w-20 bg-linen-dark rounded-full animate-pulse" />
        </div>
        {/* 6 skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimalCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
