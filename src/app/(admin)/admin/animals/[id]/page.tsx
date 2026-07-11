import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnimalFormShell from '@/components/admin/form/AnimalFormShell'
import type { AnimalDraft } from '@/components/admin/form/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getAnimalForEdit(id: string): Promise<{ draft: Partial<AnimalDraft>; orgId: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.organization_id) redirect('/admin/login')
  const orgId: string = profile.organization_id

  const { data: animal, error } = await supabase
    .from('animals')
    .select(`
      id, name, species, breed, gender, age_years, age_months,
      size, intake_date, color,
      one_liner, one_liner_ne, story_en, story_ne, personality_en,
      good_with_kids, good_with_dogs, good_with_cats,
      apartment_ok, needs_garden, energy_level,
      is_vaccinated, is_neutered, is_microchipped,
      organization_id
    `)
    .eq('id', id)
    .eq('organization_id', orgId)   // RLS + explicit check
    .maybeSingle()

  if (error || !animal) notFound()

  const draft: Partial<AnimalDraft> = {
    name:          animal.name,
    species:       animal.species,
    breed:         animal.breed ?? '',
    gender:        animal.gender,
    age_years:     animal.age_years ?? null,
    age_months:    animal.age_months ?? null,
    size:          animal.size ?? 'medium',
    intake_date:   animal.intake_date ?? '',
    color:         animal.color ?? '',
    one_liner:     animal.one_liner ?? '',
    one_liner_ne:  animal.one_liner_ne ?? '',
    story_en:      animal.story_en ?? '',
    story_ne:      animal.story_ne ?? '',
    personality_en: animal.personality_en ?? '',
    good_with_kids: animal.good_with_kids ?? null,
    good_with_dogs: animal.good_with_dogs ?? null,
    good_with_cats: animal.good_with_cats ?? null,
    apartment_ok:  animal.apartment_ok ?? null,
    needs_garden:  animal.needs_garden ?? null,
    energy_level:  animal.energy_level ?? 'medium',
    is_vaccinated:  animal.is_vaccinated ?? false,
    is_neutered:    animal.is_neutered ?? false,
    is_microchipped: animal.is_microchipped ?? false,
  }

  return { draft, orgId }
}

export default async function AdminEditAnimalPage({ params }: PageProps) {
  const { id } = await params
  const { draft, orgId } = await getAnimalForEdit(id)

  return (
    <div className="px-5 md:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-stone mb-6">
        <Link href="/admin/animals" className="hover:text-charcoal transition-colors">
          Animals
        </Link>
        <span>/</span>
        <span className="text-charcoal font-medium">Edit</span>
      </div>

      <div className="mb-6">
        <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
          Edit {draft.name ?? 'animal'}
        </h1>
        <p className="text-[13px] text-stone mt-0.5">
          Changes save to draft — publish from the Review step when ready.
        </p>
      </div>

      <AnimalFormShell orgId={orgId} animalId={id} initialData={draft} />
    </div>
  )
}
