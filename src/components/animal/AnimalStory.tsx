'use client'

import { useTranslation } from 'react-i18next'

type Gender = 'male' | 'female' | 'unknown'

interface AnimalStoryProps {
  gender: Gender
  story_en: string
  story_ne: string | null
  personality_en: string | null
  personality_ne: string | null
}

const STORY_LABEL_KEY: Record<Gender, string> = {
  male:    'animal.storyLabel_male',
  female:  'animal.storyLabel_female',
  unknown: 'animal.storyLabel_unknown',
}

export default function AnimalStory({
  gender,
  story_en,
  story_ne,
  personality_en,
  personality_ne,
}: AnimalStoryProps) {
  const { t, i18n } = useTranslation()
  const isNepali = i18n.language?.startsWith('ne')

  // Personality: prefer ne if language is ne and ne is filled
  const personality = isNepali && personality_ne ? personality_ne : personality_en

  // Story: prefer ne if language is ne, fall back to en with note
  const storyText = isNepali && story_ne ? story_ne : story_en
  const showFallbackNote = isNepali && !story_ne

  return (
    <div className="mt-8 flex flex-col gap-6">

      {/* Personality quote */}
      {personality && (
        <blockquote
          className="border-l-2 border-dusty-rose pl-[14px] my-0"
          aria-label="Personality description"
        >
          <p className="text-[15px] font-satoshi font-light italic text-stone leading-[1.75]">
            {personality}
          </p>
        </blockquote>
      )}

      {/* Story section */}
      <section aria-labelledby="story-heading">
        <h2
          id="story-heading"
          className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium mb-3"
        >
          {t(STORY_LABEL_KEY[gender])}
        </h2>

        <p className="text-[14px] text-charcoal/85 leading-[1.75] whitespace-pre-line">
          {storyText}
        </p>

        {showFallbackNote && (
          <p className="mt-2 text-[11px] text-stone/60 italic">
            {t('animal.translationComing')}
          </p>
        )}
      </section>
    </div>
  )
}
