export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-linen animate-pulse">
      {/* Photo area skeleton */}
      <div className="w-full h-[55svh] md:h-[60vh] bg-linen-dark" />

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-4">
        {/* Status badge */}
        <div className="h-5 w-20 bg-linen-dark rounded-full" />
        {/* Waiting bar */}
        <div className="h-[2px] w-full bg-linen-dark rounded-full" />
        {/* Name */}
        <div className="h-10 w-2/3 bg-linen-dark rounded-xl" />
        {/* Species line */}
        <div className="h-4 w-40 bg-linen-dark rounded-md" />
        {/* One-liner */}
        <div className="h-4 w-full bg-linen-dark rounded-md" />
        <div className="h-4 w-4/5 bg-linen-dark rounded-md" />
        {/* Story block */}
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full bg-linen-dark rounded-md" />
          <div className="h-4 w-full bg-linen-dark rounded-md" />
          <div className="h-4 w-3/4 bg-linen-dark rounded-md" />
          <div className="h-4 w-5/6 bg-linen-dark rounded-md" />
          <div className="h-4 w-full bg-linen-dark rounded-md" />
        </div>
        {/* Traits row */}
        <div className="flex gap-2 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-linen-dark rounded-xl" />
          ))}
        </div>
        {/* CTA */}
        <div className="h-14 w-full bg-linen-dark rounded-full mt-4" />
      </div>
    </div>
  )
}
