import type { Metadata } from 'next'
import { satoshi } from '@/lib/font'
import I18nProvider from '@/components/layout/I18nProvider'
import LangSync from '@/components/layout/LangSync'
import './globals.css'

export const metadata: Metadata = {
  title: 'Milaap Nepal',
  description: 'Connecting rescued animals with loving families in Nepal.',
  openGraph: {
    title:       'Milaap Nepal',
    description: 'Two stories. One journey. Find your next companion — rescued animals waiting for a home in Nepal.',
    images:      [{ url: '/api/share-image/default', width: 1200, height: 630 }],
    siteName:    'Milaap Nepal',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Milaap Nepal',
    description: 'Two stories. One journey.',
    images:      ['/api/share-image/default'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // lang="en" is the server default; LangSync updates it on the client
    // when the user switches language or a saved preference is detected.
    <html lang="en" className={`${satoshi.variable} h-full antialiased scroll-smooth`}>
      <head>
        {/* Preload Satoshi Regular + Bold for LCP/CLS improvement */}
        <link rel="preload" href="/fonts/satoshi/Satoshi-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/satoshi/Satoshi-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C46F52" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-linen text-charcoal">
        <I18nProvider>
          <LangSync />
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
