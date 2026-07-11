import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import QRGeneratorClient from './QRGeneratorClient'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getAnimal(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  const { data: animal, error } = await supabase
    .from('animals')
    .select('id, name, slug, photos, organization_id, organizations(name, instagram_url)')
    .eq('id', id)
    .eq('organization_id', profile?.organization_id)
    .maybeSingle()

  if (error || !animal) notFound()
  return animal
}

export default async function QRPage({ params }: PageProps) {
  const { id } = await params
  const animal = await getAnimal(id)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  type Photo = { path: string; is_hero: boolean }
  const photos = Array.isArray(animal.photos) ? (animal.photos as Photo[]) : []
  const heroPhoto = photos.find((p) => p.is_hero) ?? photos[0]
  const heroUrl = heroPhoto
    ? `${supabaseUrl}/storage/v1/object/public/animal-photos/${heroPhoto.path}`
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgName: string = (animal.organizations as any)?.name ?? ''

  return (
    <div className="px-5 md:px-8 py-6 max-w-2xl">
      <div className="flex items-center gap-2 text-[12px] text-stone mb-6">
        <Link href="/admin/animals" className="hover:text-charcoal transition-colors">Animals</Link>
        <span>/</span>
        <Link href={`/admin/animals/${id}`} className="hover:text-charcoal transition-colors">{animal.name}</Link>
        <span>/</span>
        <span className="text-charcoal font-medium">QR Code</span>
      </div>

      <div className="mb-6">
        <h1 className="font-satoshi font-bold text-2xl text-charcoal leading-tight">
          QR Code — {animal.name}
        </h1>
        <p className="text-[13px] text-stone mt-0.5">
          Download for print, posters, or digital sharing.
        </p>
      </div>

      <QRGeneratorClient
        animalName={animal.name}
        animalSlug={animal.slug}
        orgName={orgName}
        heroPhotoUrl={heroUrl}
      />
    </div>
  )
}
