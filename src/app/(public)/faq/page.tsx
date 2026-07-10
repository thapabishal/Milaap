import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Frequently asked questions about animal adoption in Nepal | Milaap',
  description: 'Everything you need to know about adopting a rescued animal in Nepal through Milaap.',
  openGraph: {
    title: 'FAQ — Animal adoption in Nepal | Milaap',
    description: 'Everything you need to know about adopting a rescued animal in Nepal through Milaap.',
    siteName: 'Milaap Nepal',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://milaap.dpdns.org/faq' },
}

// ── FAQ data ───────────────────────────────────────────────

const FAQS = [
  {
    q: 'How do I adopt an animal through Milaap?',
    a: `Find an animal you connect with on the Discover page, then tap "Meet [Name]" to open a WhatsApp conversation directly with the rescue organization caring for them. From there, the organization will guide you through their adoption process — which typically includes a short conversation, a home check, and an adoption agreement. Milaap's job ends when WhatsApp opens; everything after is a human conversation.`,
  },
  {
    q: 'Is adopting through Milaap free?',
    a: `Using Milaap is completely free. Most rescue organizations charge a small adoption fee to cover vaccination, neutering, and medical care costs — this varies by organization and animal. The fee is always disclosed by the organization during your WhatsApp conversation, never charged by Milaap.`,
  },
  {
    q: 'What happens after I message the organization?',
    a: `The organization will respond via WhatsApp, usually within a day. They may ask a few questions about your living situation and experience with animals — this helps them match the right animal to the right home. If everything aligns, they'll arrange a meet-and-greet before finalizing the adoption.`,
  },
  {
    q: 'Can I adopt an animal from another city?',
    a: `Yes, many adopters travel or arrange transport for the right animal. Some organizations can assist with transport within Nepal for a small fee. Mention your location in your first WhatsApp message — the organization will let you know what's possible.`,
  },
  {
    q: 'What does "reserved" mean on an animal\'s profile?',
    a: `"Reserved" means someone is in active conversation with the organization about adopting that animal, but the adoption is not yet finalized. You can still reach out — if the current conversation doesn't work out, the organization will contact you. The animal's status will update to "adopted" or return to "available" accordingly.`,
  },
  {
    q: 'What comes with an adoption through Milaap?',
    a: `Every animal listed on Milaap has been cared for by a registered rescue organization. Most animals are vaccinated, dewormed, and neutered before adoption — check the animal's profile for their specific medical status. You'll also receive guidance from the organization on settling your new companion in at home.`,
  },
  {
    q: 'Can I foster instead of adopting permanently?',
    a: `Yes. Fostering is a great option if you're not ready for a permanent commitment but want to give an animal a temporary home. Mention that you're interested in fostering when you message the organization — many actively look for foster families, especially for animals recovering from illness or who need a quieter environment than a shelter.`,
  },
  {
    q: 'How do I know the organization is trustworthy?',
    a: `Every organization on Milaap is verified by the Milaap team before being listed. Milaap is built and maintained by All Care Nepal, a registered animal welfare organization in Butwal. Each organization's profile shows their registration details, city, and contact information. You can also find them on Facebook and Instagram — links are on their org page.`,
  },
] as const

// ── HowTo steps ────────────────────────────────────────────

const HOWTO_STEPS = [
  {
    name:  'Browse rescue animals',
    text:  'Visit the Discover page at milaap.dpdns.org/discover. Animals are sorted by longest waiting first. Read each animal\'s rescue story and personality description.',
  },
  {
    name:  'Tap "Meet [Name]"',
    text:  'When you find an animal you connect with, tap the "Meet [Name]" button. This opens WhatsApp with a pre-filled message to the rescue organization caring for that animal.',
  },
  {
    name:  'Have a conversation',
    text:  'The rescue organization will respond via WhatsApp. They\'ll ask a few questions about your home and experience. This is a human conversation — take your time.',
  },
  {
    name:  'Meet and complete the adoption',
    text:  'Arrange a meet-and-greet with the animal. If it\'s a good match, the organization will complete the adoption paperwork and hand over care to you.',
  },
] as const

// ── JSON-LD schemas ────────────────────────────────────────

const faqSchema = {
  '@context':  'https://schema.org',
  '@type':     'FAQPage',
  mainEntity:  FAQS.map(({ q, a }) => ({
    '@type':        'Question',
    name:           q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const howtoSchema = {
  '@context':  'https://schema.org',
  '@type':     'HowTo',
  name:        'How to adopt a rescue animal in Nepal through Milaap',
  description: 'A step-by-step guide to adopting a rescued animal through Milaap Nepal.',
  step:        HOWTO_STEPS.map((s, i) => ({
    '@type':   'HowToStep',
    position:  i + 1,
    name:      s.name,
    text:      s.text,
  })),
}

// ── Page ───────────────────────────────────────────────────

export default function FaqPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, howtoSchema]) }}
      />

      <main className="min-h-screen bg-linen">
        <div className="px-5 md:px-7 max-w-[680px] mx-auto pt-10 pb-20">

          {/* Header */}
          <header className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-2">
              Questions &amp; answers
            </p>
            <h1 className="font-satoshi font-bold text-[32px] leading-tight tracking-[-0.02em] text-charcoal">
              Everything you need to know
            </h1>
            <p className="mt-3 text-sm text-stone font-light leading-relaxed">
              About adopting a rescued animal in Nepal through Milaap.
            </p>
          </header>

          {/* How the process works — HowTo section */}
          <section aria-labelledby="howto-heading" className="mb-12">
            <h2
              id="howto-heading"
              className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-4"
            >
              How it works
            </h2>
            <ol className="flex flex-col gap-0">
              {HOWTO_STEPS.map((step, i) => (
                <li key={step.name} className="flex gap-4 pb-6 last:pb-0">
                  {/* Step number + connector line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#C46F52] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {i + 1}
                    </div>
                    {i < HOWTO_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-linen-dark mt-1" aria-hidden="true" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pt-0.5 pb-2">
                    <p className="text-sm font-semibold text-charcoal">{step.name}</p>
                    <p className="mt-1 text-sm text-stone font-light leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ accordion */}
          <section aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-4"
            >
              Frequently asked
            </h2>

            <dl className="flex flex-col divide-y divide-linen-dark">
              {FAQS.map(({ q, a }) => (
                <FaqItem key={q} question={q} answer={a} />
              ))}
            </dl>
          </section>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-linen-dark text-center flex flex-col gap-3">
            <p className="text-sm text-stone font-light">
              Ready to meet someone special?
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center bg-[#C46F52] text-white rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)] mx-auto"
            >
              Browse animals →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

// ── FaqItem — simple expand/collapse ──────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  // Native <details> — no JS, no state, accessible by default
  return (
    <details className="group py-5">
      <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
        <dt className="text-sm font-semibold text-charcoal leading-snug">{question}</dt>
        <span
          className="shrink-0 mt-0.5 text-stone group-open:rotate-45 transition-transform duration-200"
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <dd className="mt-3 text-sm text-stone font-light leading-relaxed pr-8">
        {answer}
      </dd>
    </details>
  )
}
