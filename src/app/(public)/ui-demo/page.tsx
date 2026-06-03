// src/app/(public)/ui-demo/page.tsx
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { StatCard } from '@components/shared/stat-card'
import { StatusBadge } from '@components/shared/status-badge'
import { SectionHeader } from '@components/shared/section-header'
import { NewsCard } from '@components/shared/news-card'
import { Shield, Users, Flame, Clock } from 'lucide-react'

export default function UiDemoPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
      {/* Buttons */}
      <section>
        <h2 className="text-navy-800 mb-6 text-lg font-bold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default (Navy)</Button>
          <Button variant="accent">Accent (Orange)</Button>
          <Button variant="emergency">🚨 Darurat 112</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="gold">Gold</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-navy-800 mb-6 text-lg font-bold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="kegiatan">Kegiatan</Badge>
          <Badge variant="mitigasi">Mitigasi</Badge>
          <Badge variant="informasi">Informasi</Badge>
          <Badge variant="darurat">Darurat</Badge>
          <Badge variant="edukasi">Edukasi</Badge>
          <Badge variant="safe">Aman</Badge>
          <Badge variant="caution">Siaga</Badge>
          <Badge variant="warning">Waspada</Badge>
          <Badge variant="danger">Awas</Badge>
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="text-navy-800 mb-6 text-lg font-bold">Status Level Bencana</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge level="safe" />
          <StatusBadge level="caution" />
          <StatusBadge level="warning" />
          <StatusBadge level="danger" />
        </div>
      </section>

      {/* Stat Cards */}
      <section>
        <h2 className="text-navy-800 mb-6 text-lg font-bold">Stat Cards</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Indeks Ketangguhan"
            value="3.82"
            description="Dari skala 5.00"
            icon={Shield}
            accentColor="navy"
            pill={{ text: 'Baik', variant: 'good' }}
          />
          <StatCard
            label="Destana Terbentuk"
            value="90"
            description="Dari target 130 desa"
            icon={Users}
            accentColor="orange"
            pill={{ text: '69%', variant: 'warn' }}
          />
          <StatCard
            label="Kejadian 2026"
            value="47"
            description="Total kejadian bencana"
            icon={Flame}
            accentColor="gold"
          />
          <StatCard
            label="Respons Time"
            value="27 mnt"
            description="Rata-rata respons"
            icon={Clock}
            accentColor="green"
            pill={{ text: 'On target', variant: 'good' }}
          />
        </div>
      </section>

      {/* Section Header */}
      <section>
        <h2 className="text-navy-800 mb-6 text-lg font-bold">Section Headers</h2>
        <SectionHeader
          kicker="Publikasi"
          title="Berita & Kegiatan BPBD Kaltim"
          description="Informasi terkini seputar kebencanaan dan kegiatan BPBD Provinsi Kalimantan Timur."
        />
      </section>

      {/* News Cards */}
      <section>
        <h2 className="text-navy-800 mb-6 text-lg font-bold">News Cards</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <NewsCard
            title="BPBD Kaltim Gelar Koordinasi Expo Ketangguhan Bencana Regional 2026"
            slug="koordinasi-expo-ketangguhan-2026"
            excerpt="Rapat koordinasi dipimpin langsung oleh Kepala Pelaksana untuk memantapkan kesiapan logistik dan skenario simulasi."
            categoryName="Kegiatan"
            categorySlug="kegiatan"
            authorName="Admin BPBD"
            publishedAt={new Date('2026-05-26')}
            featured
          />
          <NewsCard
            title="Penyuluhan Destana di 12 Desa Kutai Kartanegara"
            slug="destana-kutai-kartanegara"
            categoryName="Mitigasi"
            categorySlug="mitigasi"
            authorName="Pusdalops"
            publishedAt={new Date('2026-05-24')}
          />
          <NewsCard
            title="Peningkatan Dashboard Logistik SIBEKAL Terintegrasi"
            slug="dashboard-sibekal-update"
            categoryName="Informasi"
            categorySlug="informasi"
            authorName="IT Support"
            publishedAt={new Date('2026-05-20')}
          />
        </div>
      </section>
    </div>
  )
}
