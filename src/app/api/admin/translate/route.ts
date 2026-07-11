import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function POST(req: NextRequest) {
  // Auth check — must be a logged-in volunteer/admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const text: string = body?.text ?? ''

  if (!text.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Translation unavailable' }, { status: 503 })
  }

  const prompt = `Translate the following English text to Nepali (Devanagari script). 
Return ONLY the translated text — no explanation, no quotes, no markdown.

Text: ${text}`

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Gemini request failed' }, { status: 502 })
  }

  const data = await res.json()
  const translated: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

  return NextResponse.json({ translated })
}
