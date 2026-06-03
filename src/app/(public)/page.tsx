// src/app/(public)/page.tsx
import { HeroSection } from './_sections/hero-section'
import { StatusBar } from './_sections/status-bar'
import { InstansiBar } from './_sections/instansi-bar'
import { KpiSection } from './_sections/kpi-section'
import { LayananSection } from './_sections/layanan-section'
import { NewsSectionWrapper } from './_sections/news-section'
import { MapSection } from './_sections/map-section'
import { EdukasiSection } from './_sections/edukasi-section'
import { GaleriSectionWrapper } from './_sections/galeri-section-wrapper'
import { DisasterStatsSection } from './_sections/disaster-stats-section'
import { DownloadSection } from './_sections/download-section'
import { EmergencyContactsSection } from './_sections/emergency-contacts-section'
import { FaqSection } from './_sections/faq-section'

// export const revalidate = 0
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatusBar />
      <InstansiBar />
      <KpiSection />
      <LayananSection />
      <NewsSectionWrapper />
      <MapSection />
      <EdukasiSection />
      <GaleriSectionWrapper />
      <DisasterStatsSection />
      <DownloadSection />
      <EmergencyContactsSection />
      <FaqSection />
    </>
  )
}
