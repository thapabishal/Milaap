import type { Metadata } from 'next'
import { satoshi } from '@/lib/font'
import I18nProvider from '@/components/layout/I18nProvider'
import LangSync from '@/components/layout/LangSync'
import './globals.css'

export const metadata: Metadata = {
  title: 'Milaap Nepal',
  description: 'Connecting rescued animals with loving families in Nepal.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // lang="en" is the server default; LangSync updates it on the client
    // when the user switches language or a saved preference is detected.
    <html lang="en" className={`${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-linen text-charcoal">
        <I18nProvider>
          <LangSync />
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
