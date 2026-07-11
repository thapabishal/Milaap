const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export interface QualityCheck {
  id: string
  label: string
  passed: boolean
  severity: 'error' | 'warning'
  message: string | null
}

export interface QualityResult {
  checks: QualityCheck[]
  score: number
  publish_blocked: boolean
  summary: string
}

interface AnimalDraft {
  name: string
  one_liner: string
  story_en?: string
  personality_en?: string
  one_liner_ne?: string
  photos?: { path: string }[]
}

export async function checkAnimalProfileQuality(
  animal: AnimalDraft
): Promise<QualityResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const prompt = `You are a content reviewer for Milaap, a Nepal animal adoption platform.
Review this animal profile and return ONLY valid JSON — no markdown, no explanation.

Profile:
Name: ${animal.name}
One-liner: ${animal.one_liner}
Story (${animal.story_en?.split(' ').length || 0} words): ${animal.story_en}
Personality: ${animal.personality_en || 'not filled'}
Photo count: ${animal.photos?.length || 0}
Nepali one-liner: ${animal.one_liner_ne ? 'filled' : 'empty'}

Return this exact JSON structure:
{
  "checks": [
    { "id": "one_liner_emotional", "label": "One-liner describes personality not specs", "passed": boolean, "severity": "error"|"warning", "message": "suggestion if failed or null" },
    { "id": "story_length", "label": "Story is at least 80 words", "passed": boolean, "severity": "error", "message": "..." },
    { "id": "story_has_rescue", "label": "Story mentions how animal arrived or was found", "passed": boolean, "severity": "warning", "message": "..." },
    { "id": "story_present_focus", "label": "Story describes who the animal is NOW, not only their past", "passed": boolean, "severity": "warning", "message": "..." },
    { "id": "no_generic_language", "label": "Avoids generic words: friendly, playful, good dog, sweet", "passed": boolean, "severity": "warning", "message": "..." },
    { "id": "min_photos", "label": "Has at least 2 photos", "passed": boolean, "severity": "error", "message": "..." },
    { "id": "nepali_filled", "label": "Nepali one-liner is filled", "passed": boolean, "severity": "warning", "message": "Consider reviewing the auto-translated version" }
  ],
  "score": 0-100,
  "publish_blocked": boolean,
  "summary": "One sentence assessment"
}`

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 800 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)

  const data = await res.json()
  const text: string = data.candidates[0].content.parts[0].text
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as QualityResult
}
