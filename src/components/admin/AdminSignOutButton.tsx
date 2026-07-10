'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-[11px] text-[#F7F2EB]/40 hover:text-[#F7F2EB]/70 transition-colors text-left tracking-[0.04em]"
    >
      Sign out
    </button>
  )
}
