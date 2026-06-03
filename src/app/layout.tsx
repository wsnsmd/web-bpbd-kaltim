// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, Noto_Sans, Playfair_Display } from 'next/font/google'
import { Providers } from '@components/providers'
import './globals.css'
import { cn } from '@/lib/utils'

const playfairDisplayHeading = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' })

const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' })

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
    template: '%s | BPBD Kaltim',
  },
  description:
    'Portal resmi Badan Penanggulangan Bencana Daerah Provinsi Kalimantan Timur. Pusat koordinasi, informasi, dan layanan kebencanaan wilayah Benua Etam.',
  keywords: ['BPBD', 'Kalimantan Timur', 'Kaltim', 'bencana', 'penanggulangan bencana'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    siteName: 'BPBD Provinsi Kalimantan Timur',
    locale: 'id_ID',
    type: 'website',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
