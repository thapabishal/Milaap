export default function AdminLoading() {
  return (
    <div className="px-5 md:px-8 py-6 max-w-3xl animate-pulse">
      {/* Page title */}
      <div className="mb-6 space-y-2">
        <div className="h-7 w-40 bg-linen-dark rounded-lg" />
        <div className="h-4 w-56 bg-linen-dark rounded-md" />
      </div>
      {/* 4 stat boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-linen-dark rounded-xl p-5 flex flex-col items-center gap-2">
            <div className="h-8 w-12 bg-linen-dark rounded-lg" />
            <div className="h-3 w-20 bg-linen-dark rounded-md" />
          </div>
        ))}
      </div>
      {/* List rows */}
      <div className="bg-white border border-linen-dark rounded-xl overflow-hidden space-y-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-linen-dark last:border-0">
            <div className="w-10 h-10 bg-linen-dark rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 bg-linen-dark rounded-md" />
              <div className="h-3 w-48 bg-linen-dark rounded-md" />
            </div>
            <div className="h-6 w-16 bg-linen-dark rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
