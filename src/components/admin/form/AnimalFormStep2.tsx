'use client'

import { useState } from 'react'
import type { AnimalDraft } from './types'
import FormField from './FormField'

interface Props {
  data: AnimalDraft
  onChange: (patch: Partial<AnimalDraft>) => void
}

const inputClass =
  'w-full text-sm text-charcoal bg-white border border-linen-dark rounded-xl px-4 py-2.5 focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-stone/40'

const textareaClass =
  'w-full text-sm text-charcoal bg-white border border-linen-dark rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-stone/40 resize-vertical leading-relaxed'

async function translateText(text: string): Promise<string> {
  const res = await fetch('/api/admin/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('Translation failed')
  const json = await res.json()
  return json.translated as string
}

function TranslateButton({
  sourceText,
  onResult,
  disabled,
}: {
  sourceText: string
  onResult: (t: string) => void
  disabled?: boolean
}) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (!sourceText.trim()) return
    setLoading(true)
    try {
      const result = await translateText(sourceText)
      onResult(result)
    } catch {
      // silent — volunteer can still type manually
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled || loading || !sourceText.trim()}
      className="text-[11px] text-terracotta font-medium hover:text-[#B05A3E] transition-colors disabled:opacity-40 whitespace-nowrap"
    >
      {loading ? 'Translating…' : 'Translate →'}
    </button>
  )
}

export default function AnimalFormStep2({ data, onChange }: Props) {
  const oneLinerLen = data.one_liner.length
  const wordCount = data.story_en.trim()
    ? data.story_en.trim().split(/\s+/).length
    : 0

  const species = data.species === 'cat' ? 'cat' : data.species === 'rabbit' ? 'rabbit' : 'dog'

  return (
    <div className="space-y-7">

      {/* One-liner EN */}
      <FormField
        label="The one-liner (English)"
        required
        htmlFor="one_liner"
        helper="Describe them as you'd describe a friend. Not their breed — their personality."
        extra={
          <span className={`text-[11px] tabular-nums ${oneLinerLen > 80 ? 'text-terracotta' : 'text-stone/60'}`}>
            {oneLinerLen}/80
          </span>
        }
      >
        <input
          id="one_liner"
          type="text"
          maxLength={90}
          value={data.one_liner}
          onChange={(e) => onChange({ one_liner: e.target.value })}
          placeholder="First to greet you every morning. Still waiting for someone to come home to."
          className={inputClass}
        />
        <p className="text-[10px] text-stone/60 italic">
          "The sentence that makes someone stop scrolling"
        </p>
      </FormField>

      {/* One-liner NE */}
      <FormField
        label="One-liner (Nepali)"
        htmlFor="one_liner_ne"
        helper="Auto-translated draft — please review and edit"
        extra={
          <TranslateButton
            sourceText={data.one_liner}
            onResult={(t) => onChange({ one_liner_ne: t })}
          />
        }
      >
        <input
          id="one_liner_ne"
          type="text"
          value={data.one_liner_ne}
          onChange={(e) => onChange({ one_liner_ne: e.target.value })}
          placeholder="नेपाली अनुवाद…"
          className={inputClass}
          lang="ne"
        />
      </FormField>

      {/* Story EN */}
      <FormField
        label={`${data.name || 'Animal'}'s full story (English)`}
        required
        htmlFor="story_en"
        helper="How did they arrive? What have they overcome? Who are they now? Min 80 words."
        extra={
          <span className={`text-[11px] tabular-nums font-medium ${wordCount >= 80 ? 'text-sage' : 'text-stone/60'}`}>
            {wordCount} words{wordCount >= 80 ? ' ✓' : ''}
          </span>
        }
      >
        <textarea
          id="story_en"
          value={data.story_en}
          onChange={(e) => onChange({ story_en: e.target.value })}
          placeholder={`Write ${data.name || 'their'} rescue and personality story here…`}
          rows={8}
          className={`${textareaClass} min-h-[200px]`}
        />
      </FormField>

      {/* Story NE */}
      <FormField
        label="Full story (Nepali)"
        htmlFor="story_ne"
        helper="Auto-translated draft — please review and edit"
        extra={
          <TranslateButton
            sourceText={data.story_en}
            onResult={(t) => onChange({ story_ne: t })}
          />
        }
      >
        <textarea
          id="story_ne"
          value={data.story_ne}
          onChange={(e) => onChange({ story_ne: e.target.value })}
          placeholder="नेपाली कथा…"
          rows={6}
          className={`${textareaClass} min-h-[140px]`}
          lang="ne"
        />
      </FormField>

      {/* Personality EN */}
      <FormField
        label="Personality paragraph"
        htmlFor="personality_en"
        helper="This appears as a pull-quote on the profile. Make it specific and human."
      >
        <textarea
          id="personality_en"
          value={data.personality_en}
          onChange={(e) => onChange({ personality_en: e.target.value })}
          placeholder={`${data.name || '[Name]'} is the kind of ${species} who remembers where everyone sits and always chooses the spot closest to you.`}
          rows={3}
          className={`${textareaClass} min-h-[90px]`}
        />
        <p className="text-[10px] text-stone/60 italic">
          Complete the prompt: &quot;{data.name || '[Name]'} is the kind of {species} who…&quot;
        </p>
      </FormField>

    </div>
  )
}
