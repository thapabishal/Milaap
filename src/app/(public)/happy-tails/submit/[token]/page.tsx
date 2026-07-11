import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SubmitHappyTailForm from '@/components/public/SubmitHappyTailForm'

export const metadata: Metadata = {
  title: 'Share Your Story | Milaap Nepal',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
}

type ValidationResult =
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'already_submitted'; animalName: string }
  | { status: 'valid'; reminder: {
      id: string
      animal_id: string
      organization_id: string
      adopter_name: string
      animal: { name: string; intake_date: string; adopted_date: string | null }
    }
  }

async function validateToken(token: string): Promise<ValidationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data: reminder, error } = await supabase
    .from('followup_reminders')
    .select(`
      id, animal_id, organization_id, adopter_name,
      token_expires_at, happy_tail_id,
      animals ( name, intake_date, adopted_date )
    `)
    .eq('submission_token', token)
    .maybeSingle()

  if (error || !reminder) return { status: 'invalid' }

  if (new Date(reminder.token_expires_at) < new Date()) return { status: 'expired' }

  if (reminder.happy_tail_id) {
    return {
      status: 'already_submitted',
      animalName: reminder.animals?.name ?? 'your animal',
    }
  }

  return {
    status: 'valid',
    reminder: {
      id:              reminder.id,
      animal_id:       reminder.animal_id,
      organization_id: reminder.organization_id,
      adopter_name:    reminder.adopter_name,
      animal: {
        name:         reminder.animals?.name ?? 'your animal',
        intake_date:  reminder.animals?.intake_date ?? '',
        adopted_date: reminder.animals?.adopted_date ?? null,
      },
    },
  }
}

function TokenStatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linen flex items-center justify-center px-5 py-16">
      <div className="max-w-sm w-full bg-white border border-linen-dark rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
        {children}
      </div>
    </div>
  )
}

export default async function SubmitHappyTailPage({ params }: PageProps) {
  const { token } = await params
  const result = await validateToken(token)
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (result.status === 'invalid') {
    return (
      <TokenStatusCard>
        <p className="text-3xl mb-4">🔗</p>
        <h1 className="font-satoshi font-bold text-xl text-charcoal mb-2">Link not found</h1>
        <p className="text-sm text-stone leading-relaxed">
          This link is not valid. It may have been entered incorrectly.
        </p>
      </TokenStatusCard>
    )
  }

  if (result.status === 'expired') {
    return (
      <TokenStatusCard>
        <p className="text-3xl mb-4">⏰</p>
        <h1 className="font-satoshi font-bold text-xl text-charcoal mb-2">This link has expired</h1>
        <p className="text-sm text-stone leading-relaxed">
          The submission window for this link has closed. Please contact your shelter if you&apos;d still like to share a story.
        </p>
      </TokenStatusCard>
    )
  }

  if (result.status === 'already_submitted') {
    return (
      <TokenStatusCard>
        <p className="text-3xl mb-4">🐾</p>
        <h1 className="font-satoshi font-bold text-xl text-charcoal mb-2">Already submitted!</h1>
        <p className="text-sm text-stone leading-relaxed">
          Thank you — {result.animalName}&apos;s story is already submitted and waiting for review.
        </p>
      </TokenStatusCard>
    )
  }

  const { reminder } = result
  const animalName = reminder.animal.name

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-lg mx-auto px-5 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-dusty-rose/15 flex items-center justify-center mx-auto mb-4 text-2xl">
            🐾
          </div>
          <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight mb-2">
            {animalName} found their home with you.
          </h1>
          <p className="text-sm text-stone leading-relaxed">
            How are they doing? Share a moment.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-linen-dark rounded-2xl p-6 shadow-[0_1px_3px_rgba(45,41,38,0.06)]">
          <SubmitHappyTailForm
            reminder={reminder}
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
          />
        </div>

        <p className="text-center text-[11px] text-stone/50 mt-6">
          Milaap · Your story helps other animals get adopted faster.
        </p>
      </div>
    </div>
  )
}
