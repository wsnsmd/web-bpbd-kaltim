// src/app/(public)/_sections/kpi-section.tsx
import { cn } from '@/lib/utils'
import { Activity, MapPin, Wallet, Timer } from 'lucide-react'

const PILL_CLASSES = {
  good: 'bg-[var(--safe-light)] text-[var(--safe-dark)] ring-1 ring-[var(--safe-dark)]/20',
  warn: 'bg-[var(--warning-light)] text-[var(--warning-dark)] ring-1 ring-[var(--warning-dark)]/20',
  info: 'bg-[var(--caution-light)] text-[var(--caution-dark)] ring-1 ring-[var(--caution-dark)]/20',
}

function KpiCard({
  tag,
  value,
  desc,
  pill,
  icon: Icon,
  accentColorClass,
  iconBgClass,
}: {
  tag: string
  value: string
  desc: string
  pill?: { text: string; variant: keyof typeof PILL_CLASSES }
  icon: React.ElementType
  accentColorClass: string
  iconBgClass: string
}) {
  return (
    <div
      className={cn(
        // Desain dasar: padding lebih kecil (p-5), sudut lebih melengkung (rounded-2xl)
        'group bg-card border-border relative flex flex-col overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ease-out',
        // Efek Hover: Terangkat, bayangan membesar, border mengikuti warna aksen
        'hover:-translate-y-1 hover:shadow-md',
        accentColorClass // class border hover yang dikirim via props
      )}
    >
      {/* Efek Glow Tipis di latar belakang saat di-hover */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-current opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-5" />

      {/* Header Card: Tag & Ikon */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-muted-foreground mt-1 line-clamp-1 text-[10px] font-bold tracking-wider uppercase">
          {tag}
        </p>
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            iconBgClass
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Konten Utama */}
      <div className="mt-auto">
        <p className="text-foreground mb-2 text-3xl font-bold tracking-tight">{value}</p>

        <div className="flex flex-wrap items-center gap-2">
          {pill && (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase',
                PILL_CLASSES[pill.variant]
              )}
            >
              {pill.text}
            </span>
          )}
          <span className="text-muted-foreground text-[11px] leading-tight font-medium">
            {desc}
          </span>
        </div>
      </div>
    </div>
  )
}

export function KpiSection() {
  return (
    <section className="bg-background border-border border-b py-16 lg:py-20">
      <div className="container-content max-w-content mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-(--orange-600) uppercase">
            <span className="h-0.5 w-5 shrink-0 rounded-full bg-(--orange-500)" />
            Transparansi & Kinerja
          </div>
          <h2 className="text-foreground text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold tracking-tight">
            Data Kinerja BPBD Provinsi Kaltim
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Indikator kinerja utama yang kami perbarui secara berkala sebagai bentuk akuntabilitas
            pelayanan masyarakat.
          </p>
        </div>

        {/* KPI Grid - Diubah menjadi gap-5 agar jarak antar card lebih lega */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          <KpiCard
            tag="Indeks Ketangguhan"
            value="3.82"
            desc="Dari skala 5.00"
            pill={{ text: 'Baik', variant: 'good' }}
            icon={Activity}
            accentColorClass="hover:border-[var(--navy-400)] text-[var(--navy-600)]"
            iconBgClass="bg-[var(--navy-50)] text-[var(--navy-600)]"
          />
          <KpiCard
            tag="Destana Terbentuk"
            value="90"
            desc="Dari 130 desa"
            pill={{ text: '69%', variant: 'warn' }}
            icon={MapPin}
            accentColorClass="hover:border-[var(--orange-400)] text-[var(--orange-600)]"
            iconBgClass="bg-[var(--orange-50)] text-[var(--orange-600)]"
          />
          <KpiCard
            tag="Dana Siap Pakai"
            value="14,3M"
            desc="Rupiah (Tersedia)"
            pill={{ text: 'Ready', variant: 'info' }}
            icon={Wallet}
            accentColorClass="hover:border-[var(--gold-400)] text-[var(--gold-600)]"
            iconBgClass="bg-[var(--gold-50)] text-[var(--gold-600)]"
          />
          <KpiCard
            tag="Waktu Respons"
            value="27 m"
            desc="Rata-rata respons"
            pill={{ text: 'Target', variant: 'good' }}
            icon={Timer}
            accentColorClass="hover:border-[var(--safe)] text-[var(--safe-dark)]"
            iconBgClass="bg-[var(--safe-light)] text-[var(--safe-dark)]"
          />
        </div>
      </div>
    </section>
  )
}
