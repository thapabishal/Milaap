import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Uses service role key — bypasses RLS intentionally.
// Security boundary is the submission_token (UUID, non-guessable).
function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    reminder_id,
    animal_id,
    organization_id,
    adopter_name,
    adopter_city,
    story_en,
    photo_url,
    days_waited,
  } = body

  if (!reminder_id || !animal_id || !organization_id || !story_en || !photo_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any

  // Verify token is still valid and not already used
  const { data: reminder, error: reminderErr } = await supabase
    .from('followup_reminders')
    .select('id, happy_tail_id, token_expires_at')
    .eq('id', reminder_id)
    .maybeSingle()

  if (reminderErr || !reminder) {
    return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
  }
  if (new Date(reminder.token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link has expired' }, { status: 410 })
  }
  if (reminder.happy_tail_id) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
  }

  // Insert happy_tail
  const { data: happyTail, error: insertErr } = await supabase
    .from('happy_tails')
    .insert([{
      animal_id,
      organization_id,
      adopter_name:    adopter_name ?? 'Anonymous',
      adopter_city:    adopter_city ?? null,
      story_en,
      photo_url,
      days_waited:     days_waited ?? null,
      from_reminder_id: reminder_id,
      status:          'pending',
    }])
    .select('id')
    .single()

  if (insertErr) {
    console.error('Happy tail insert error:', insertErr.message)
    return NextResponse.json({ error: 'Failed to save story' }, { status: 500 })
  }

  // Link reminder → happy_tail
  await supabase
    .from('followup_reminders')
    .update({ happy_tail_id: happyTail.id })
    .eq('id', reminder_id)

  return NextResponse.json({ id: happyTail.id })
}
