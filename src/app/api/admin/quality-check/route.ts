import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAnimalProfileQuality } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  try {
    const result = await checkAnimalProfileQuality({
      name:          body.name ?? '',
      one_liner:     body.one_liner ?? '',
      story_en:      body.story_en ?? '',
      personality_en: body.personality_en ?? '',
      one_liner_ne:  body.one_liner_ne ?? '',
      photos:        body.photos ?? [],
    })
    return NextResponse.json(result)
  } catch (e) {
    console.error('Quality check error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Quality check failed' },
      { status: 500 }
    )
  }
}
