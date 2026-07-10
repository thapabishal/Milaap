'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Animates the hero headline words in sequentially (fade + slide up).
 * Each word delays by 80ms; CTA fades in after all words settle (~800ms).
 */
export default function HeroHeadline() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(id)
  }, [])

  // Split headline into words, keeping the two halves separate for colour
  const line1Words = t('welcome.headline').split(' ')
  const line2 = t('welcome.headline_you')
  const allWords = [...line1Words, '__YOU__']

  return (
    <div>
      <h1 className="font-satoshi font-bold text-[48px] md:text-[64px] leading-[1.05] tracking-[-0.02em]">
        {/* Line 1 — charcoal words */}
        <span className="block">
          {line1Words.map((word, i) => (
            <Word
              key={`l1-${i}`}
              word={word}
              index={i}
              visible={visible}
              color="charcoal"
            />
          ))}
        </span>
        {/* Line 2 — "you." in terracotta italic */}
        <span className="block">
          <Word
            word={line2}
            index={line1Words.length}
            visible={visible}
            color="terracotta"
            italic
          />
        </span>
      </h1>

      {/* Subtext — fades in after headline (~800ms) */}
      <p
        className="mt-5 text-sm text-stone leading-relaxed max-w-xs transition-all duration-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transitionDelay: visible ? `${allWords.length * 80 + 200}ms` : '0ms',
        }}
      >
        {t('welcome.subtext')}
      </p>
    </div>
  )
}

interface WordProps {
  word: string
  index: number
  visible: boolean
  color: 'charcoal' | 'terracotta'
  italic?: boolean
}

function Word({ word, index, visible, color, italic }: WordProps) {
  const delay = visible ? `${index * 80}ms` : '0ms'
  return (
    <span
      className="inline-block mr-[0.25em] last:mr-0 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transitionDelay: delay,
        color: color === 'terracotta' ? '#C46F52' : '#2D2926',
        fontStyle: italic ? 'italic' : undefined,
      }}
    >
      {word}
    </span>
  )
}
