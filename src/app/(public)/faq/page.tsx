import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Frequently asked questions about animal adoption in Nepal | Milaap',
  description:
    'Everything you need to know about adopting a rescued animal in Nepal through Milaap — the process, cities, costs, and how to prepare your home.',
  openGraph: {
    title: 'FAQ — Animal adoption in Nepal | Milaap',
    description: 'Everything you need to know about adopting a rescued animal in Nepal through Milaap.',
    siteName: 'Milaap Nepal',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://milaap.dpdns.org/faq' },
}

// ── FAQ data (12 questions, AEO-optimised) ─────────────────
// Rule: first sentence of each answer = the direct answer Google will pull as a snippet.

const FAQS = [
  {
    q: 'How do I adopt an animal through Milaap?',
    a: 'You adopt through Milaap by finding an animal on the Discover page and tapping "Meet [Name]" to open WhatsApp directly with the rescue organization caring for them. The organization will guide you through their process — typically a short conversation, a home check, and an adoption agreement. Milaap connects you to the right organization; the adoption itself is a human conversation between you and the rescue team.',
  },
  {
    q: 'Is adopting through Milaap free?',
    a: 'Using Milaap to discover and contact organizations is completely free. Most rescue organizations charge a small adoption fee to cover vaccination, neutering, and medical care — this varies by organization and animal. The fee is disclosed by the organization during your WhatsApp conversation and is never charged by Milaap.',
  },
  {
    q: 'What happens after I message the organization?',
    a: 'The organization will respond via WhatsApp, usually within a day. They may ask a few questions about your living situation and experience with animals — this helps them match the right animal to the right home. If everything aligns, they\'ll arrange a meet-and-greet before finalizing the adoption.',
  },
  {
    q: 'Can I adopt an animal from another city?',
    a: 'Yes — many adopters travel or arrange transport for the right animal. Some organizations assist with transport within Nepal for a small fee. Mention your location in your first WhatsApp message and the organization will explain what is possible for that animal.',
  },
  {
    q: 'What does "reserved" mean on an animal\'s profile?',
    a: '"Reserved" means someone is in active conversation with the organization about adopting that animal, but the adoption is not yet finalized. You can still reach out — if the current conversation does not work out, the organization will contact you next. The status updates to "adopted" or returns to "available" accordingly.',
  },
  {
    q: 'What comes with an adoption through Milaap?',
    a: 'Every animal listed on Milaap has been cared for by a registered rescue organization, and most are vaccinated, dewormed, and neutered before adoption — check the animal\'s profile for their specific medical status. You will also receive guidance from the organization on settling your new companion in at home.',
  },
  {
    q: 'Can I foster instead of adopting permanently?',
    a: 'Yes — fostering is available through most organizations on Milaap and is a great option if you are not ready for a permanent commitment. Mention that you are interested in fostering when you first message the organization. Many actively look for foster families, especially for animals recovering from illness or who need a quieter environment than a shelter.',
  },
  {
    q: 'How do I know the organization is trustworthy?',
    a: 'Every organization on Milaap is verified by the Milaap team before being listed. Milaap is built and maintained by All Care Nepal, a registered animal welfare organization in Butwal. Each organization\'s profile shows their registration number, city, and contact information. You can also find them on Facebook and Instagram — links are on their organization page.',
  },
  {
    q: 'Which cities in Nepal can I adopt from?',
    a: 'You can currently adopt from organizations in Butwal and other cities across Nepal, with more being added as Milaap grows. The Discover page lets you filter by city — all available cities with animals are shown in the filter options. If no animals are listed near you, many adopters successfully travel or arrange transport for the right animal.',
  },
  {
    q: 'How long does the adoption process take?',
    a: 'The adoption process typically takes three to seven days from first WhatsApp message to bringing the animal home. This includes the initial conversation (usually one to two days), arranging and completing a meet-and-greet, and signing the adoption agreement. Some organizations may require a home visit, which can add a day or two. The timeline varies by organization.',
  },
  {
    q: 'What should I prepare before bringing an animal home?',
    a: 'Before bringing an animal home, prepare a safe, quiet space with bedding, food and water bowls, and any appropriate food recommended by the organization. For dogs, a collar, leash, and a secure outdoor area are important. For cats, a litter box and a room to settle in gradually works well. The rescue organization will give you specific advice during the adoption process based on the individual animal\'s needs and personality.',
  },
  {
    q: 'How can my organization join Milaap?',
    a: 'Your organization can join Milaap by contacting All Care Nepal directly via WhatsApp or email. Listing on Milaap is free for verified registered NGOs and rescue organizations in Nepal. Once verified, your animals will appear in the shared Discover feed alongside animals from other organizations. Reach us at allcarenepal.org or message us on WhatsApp at +977-9867-002-067.',
  },
] as const

// ── HowTo steps ────────────────────────────────────────────

const HOWTO_STEPS = [
  {
    name: 'Browse rescue animals',
    text: 'Visit the Discover page at milaap.dpdns.org/discover. Animals are sorted by longest waiting first. Read each animal\'s rescue story and personality description.',
  },
  {
    name: 'Tap "Meet [Name]"',
    text: 'When you find an animal you connect with, tap the "Meet [Name]" button. This opens WhatsApp with a pre-filled message to the rescue organization caring for that animal.',
  },
  {
    name: 'Have a conversation',
    text: 'The rescue organization will respond via WhatsApp. They\'ll ask a few questions about your home and experience. This is a human conversation — take your time.',
  },
  {
    name: 'Meet and complete the adoption',
    text: 'Arrange a meet-and-greet with the animal. If it\'s a good match, the organization will complete the adoption paperwork and hand over care to you.',
  },
] as const

// ── JSON-LD schemas ────────────────────────────────────────

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const howtoSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to adopt a rescue animal in Nepal through Milaap',
  description: 'A step-by-step guide to adopting a rescued animal through Milaap Nepal.',
  step: HOWTO_STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
}

// ── Page ───────────────────────────────────────────────────

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, howtoSchema]) }}
      />

      <main className="min-h-screen bg-linen">
        <div className="px-5 md:px-7 max-w-[680px] mx-auto pt-10 pb-20">

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

          {/* How it works */}
          <section aria-labelledby="howto-heading" className="mb-12">
            <h2 id="howto-heading" className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-4">
              How it works
            </h2>
            <ol className="flex flex-col gap-0">
              {HOWTO_STEPS.map((step, i) => (
                <li key={step.name} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {i + 1}
                    </div>
                    {i < HOWTO_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-linen-dark mt-1" aria-hidden="true" />
                    )}
                  </div>
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
            <h2 id="faq-heading" className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-4">
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
            <p className="text-sm text-stone font-light">Ready to meet someone special?</p>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center bg-terracotta text-white rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.04em] hover:bg-[#B05A3E] transition-colors shadow-[0_4px_20px_rgba(196,111,82,0.25)] mx-auto"
            >
              Browse animals →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group py-5">
      <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
        <dt className="text-sm font-semibold text-charcoal leading-snug">{question}</dt>
        <span className="shrink-0 mt-0.5 text-stone group-open:rotate-45 transition-transform duration-200" aria-hidden="true">
          +
        </span>
      </summary>
      <dd className="mt-3 text-sm text-stone font-light leading-relaxed pr-8">{answer}</dd>
    </details>
  )
}
