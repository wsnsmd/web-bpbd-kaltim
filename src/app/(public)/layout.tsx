// src/app/(public)/layout.tsx
import Header from '@components/layout/header'
import Footer from '@components/layout/footer'
import { EmergencyTicker } from '@components/shared/emergency-ticker'
import { Phone } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <EmergencyTicker />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />

      {/* Floating Action Button — hanya mobile */}
      <Link
        href="tel:112"
        aria-label="Hubungi Call Center Darurat 112"
        className={cn(
          'fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all md:hidden',
          'bg-orange-500 hover:bg-orange-600',
          'animate-pulse shadow-[0_4px_16px_rgba(232,80,0,0.4)]'
        )}
      >
        <Phone className="h-6 w-6" />
      </Link>
    </>
  )
}
