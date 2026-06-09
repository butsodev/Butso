import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import './globals.css'

// Body font — warm, friendly, highly legible on mobile
const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-body-var',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

// Display / heading font — has character, feels handcrafted not corporate
const fraunces = Fraunces({
  variable: '--font-heading-var',
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Butsó — Your Local Work Network',
  description: 'Butsó connects skilled workers and employers right here in Wukari, Taraba State. No CV needed. Just show up.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}