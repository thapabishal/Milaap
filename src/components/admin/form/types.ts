export interface PhotoEntry {
  id: string
  previewUrl: string
  path: string | null         // Supabase storage path — null while uploading
  compressedSize: number | null
  uploading: boolean
  error: string | null
}

export interface AnimalDraft {
  // Step 1
  name: string
  species: 'dog' | 'cat' | 'rabbit' | 'other'
  breed: string
  gender: 'male' | 'female' | 'unknown'
  age_years: number | null
  age_months: number | null
  size: 'small' | 'medium' | 'large' | 'xlarge'
  intake_date: string           // ISO date string YYYY-MM-DD
  color: string

  // Step 2
  one_liner: string
  one_liner_ne: string
  story_en: string
  story_ne: string
  personality_en: string

  // Step 3 — compatibility
  good_with_kids: boolean | null
  good_with_dogs: boolean | null
  good_with_cats: boolean | null
  apartment_ok: boolean | null
  needs_garden: boolean | null
  energy_level: 'low' | 'medium' | 'high' | null

  // Step 4 — medical
  is_vaccinated: boolean
  is_neutered: boolean
  is_microchipped: boolean
  medical_notes: string
}

export const EMPTY_DRAFT: AnimalDraft = {
  name: '',
  species: 'dog',
  breed: '',
  gender: 'unknown',
  age_years: null,
  age_months: null,
  size: 'medium',
  intake_date: '',
  color: '',
  one_liner: '',
  one_liner_ne: '',
  story_en: '',
  story_ne: '',
  personality_en: '',
  good_with_kids: null,
  good_with_dogs: null,
  good_with_cats: null,
  apartment_ok: null,
  needs_garden: null,
  energy_level: 'medium',
  is_vaccinated: false,
  is_neutered: false,
  is_microchipped: false,
  medical_notes: '',
}

// Step validation — returns first missing required field label or null
export function validateStep(step: number, draft: AnimalDraft): string | null {
  if (step === 1) {
    if (!draft.name.trim())      return 'Name is required'
    if (!draft.intake_date)      return 'Intake date is required'
  }
  if (step === 2) {
    if (!draft.one_liner.trim()) return 'One-liner is required'
    if (!draft.story_en.trim())  return 'Full story is required'
    const words = draft.story_en.trim().split(/\s+/).length
    if (words < 80)              return `Story needs at least 80 words (currently ${words})`
  }
  return null
}
