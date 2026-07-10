export default function Home() {
  return (
    <main className="min-h-screen bg-linen p-12 flex flex-col gap-10">

      {/* Font weights */}
      <section className="flex flex-col gap-3">
        <p className="font-satoshi font-light text-2xl text-charcoal">
          Satoshi Light (300) — Two stories. One journey.
        </p>
        <p className="font-satoshi font-normal text-2xl text-charcoal">
          Satoshi Regular (400) — Two stories. One journey.
        </p>
        <p className="font-satoshi font-medium text-2xl text-charcoal">
          Satoshi Medium (500) — Two stories. One journey.
        </p>
        <p className="font-satoshi font-bold text-2xl text-charcoal">
          Satoshi Bold (700) — Two stories. One journey.
        </p>
      </section>

      {/* Color swatches */}
      <section className="flex flex-wrap gap-3">
        <div className="w-16 h-16 rounded-card bg-terracotta" title="Terracotta" />
        <div className="w-16 h-16 rounded-card bg-dusty-rose" title="Dusty Rose" />
        <div className="w-16 h-16 rounded-card bg-sage" title="Sage" />
        <div className="w-16 h-16 rounded-card bg-charcoal" title="Charcoal" />
        <div className="w-16 h-16 rounded-card bg-stone" title="Stone" />
        <div className="w-16 h-16 rounded-card bg-linen-dark border border-linen-dark" title="Linen Dark" />
        <div className="w-16 h-16 rounded-card bg-status-available" title="Available" />
        <div className="w-16 h-16 rounded-card bg-status-reserved" title="Reserved" />
        <div className="w-16 h-16 rounded-card bg-status-fostered" title="Fostered" />
        <div className="w-16 h-16 rounded-card bg-status-medical" title="Medical" />
        <div className="w-16 h-16 rounded-card bg-status-adopted" title="Adopted" />
      </section>

      {/* UI components */}
      <section className="flex items-center gap-4 flex-wrap">
        {/* Primary button */}
        <button className="bg-terracotta text-white rounded-pill px-7 py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)]">
          Meet Luna →
        </button>

        {/* Ghost button */}
        <button className="bg-transparent text-stone border border-linen-dark rounded-pill px-6 py-3 text-sm tracking-[0.04em] hover:border-charcoal/20 transition-colors">
          Learn more
        </button>

        {/* Dusty-rose badge */}
        <span className="bg-dusty-rose/20 text-dusty-rose rounded-tag px-3 py-1 text-[10px] uppercase tracking-[0.1em] font-medium">
          Reserved
        </span>

        {/* Sage status dot */}
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] font-medium text-sage">
          <span className="w-2 h-2 rounded-full bg-sage" />
          Available
        </span>
      </section>

      {/* Waiting bar (signature component) */}
      <section className="max-w-xs">
        <p className="text-[11px] uppercase tracking-[0.08em] text-stone mb-2 font-medium">Waiting bar preview</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[2px] bg-linen-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all"
              style={{ width: '68%' }}
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.08em] text-dusty-rose whitespace-nowrap font-medium">
            47 days waiting
          </span>
        </div>
      </section>

      {/* Confirmation */}
      <p className="text-stone font-light italic text-sm">
        Design system loaded. All colors and fonts working.
      </p>
    </main>
  )
}
