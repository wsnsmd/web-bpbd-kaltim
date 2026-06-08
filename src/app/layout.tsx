// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { AnalyticsProvider } from '@/components/analytics-provider'
import { PageProgress } from '@/components/page-progress'
import { Providers } from '@components/providers'
import './globals.css'
import { cn } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bpbd.kaltimprov.go.id'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BPBD Provinsi Kalimantan Timur',
    template: '%s - BPBD Provinsi Kalimantan Timur',
  },
  description:
    'Portal resmi Badan Penanggulangan Bencana Daerah Provinsi Kalimantan Timur. Pusat koordinasi, informasi, dan layanan kebencanaan wilayah Benua Etam.',
  keywords: [
    'BPBD',
    'Kalimantan Timur',
    'Kaltim',
    'bencana',
    'penanggulangan bencana',
    'pusdalops',
  ],
  authors: [{ name: 'BPBD Provinsi Kalimantan Timur' }],
  creator: 'BPBD Provinsi Kalimantan Timur',
  publisher: 'Pemerintah Provinsi Kalimantan Timur',
  metadataBase: new URL(BASE_URL),

  // ── Favicon & Icons ──────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },

  // ── PWA Manifest ─────────────────────────────────────────────
  manifest: '/site.webmanifest',

  // ── Open Graph (media sosial preview) ────────────────────────
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: BASE_URL,
    siteName: 'BPBD Provinsi Kalimantan Timur',
    title: 'BPBD Provinsi Kalimantan Timur',
    description: 'Portal resmi penanggulangan bencana Provinsi Kalimantan Timur.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BPBD Kaltim' }],
  },

  // ── Twitter Card ─────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'BPBD Provinsi Kalimantan Timur',
    description: 'Portal resmi penanggulangan bencana Provinsi Kalimantan Timur.',
    images: ['/og-image.png'],
  },

  // ── Misc ─────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={cn(dmSerif.variable, dmSans.variable, 'light')}
      suppressHydrationWarning
    >
      <body className={`${dmSans.variable} ${dmSerif.variable} antialiased`}>
        <PageProgress />
        <Providers>
          {children}
          <AnalyticsProvider />
        </Providers>
      </body>
    </html>
  )
}
