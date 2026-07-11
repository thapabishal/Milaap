import type { Metadata } from 'next'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export const metadata: Metadata = {
  title: 'Sign in | Milaap Admin',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-linen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <svg
            width="48"
            height="48"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <path d="M4 26 C8 18, 14 14, 28 6"  stroke="#C46F52" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M4 6 C10 14, 18 18, 28 26"  stroke="#2D2926" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3" fill="#C46F52" />
          </svg>
          <div className="text-center">
            <h1 className="font-satoshi font-bold text-2xl text-charcoal tracking-[-0.01em]">
              Milaap Admin
            </h1>
            <p className="mt-1 text-sm text-stone font-light">
              Sign in to your organisation account
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(45,41,38,0.06)] p-8">
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-stone/60">
          Managed by All Care Nepal ·{' '}
          <a
            href="https://allcarenepal.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone transition-colors"
          >
            allcarenepal.org
          </a>
        </p>
      </div>
    </div>
  )
}
