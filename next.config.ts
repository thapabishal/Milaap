import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest:    'public',
  disable: process.env.NODE_ENV === 'development',
  // Precache the app shell; runtime caching handles dynamic content
  cacheOnFrontEndNav: true,
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
}

export default withPWA(nextConfig)
