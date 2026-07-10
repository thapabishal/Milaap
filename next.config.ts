import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'
import path from 'path'

const withPWA = withPWAInit({
  dest:    'public',
  // Always disable in dev — service workers break hot reload
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav:           true,
  aggressiveFrontEndNavCaching: true,
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  turbopack: {
    // Fix "multiple lockfiles / workspace root" warning.
    // Explicitly point Turbopack at this project's directory so it doesn't
    // walk up to C:\Users\Bishal\Downloads\package-lock.json.
    root: path.resolve(__dirname),
  },
}

export default withPWA(nextConfig)
