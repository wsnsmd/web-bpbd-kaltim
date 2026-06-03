// src/app/(public)/_sections/disaster-stats-section.tsx
import Link from 'next/link'
import { Flame, Waves, Mountain, Wind, Home, MoreHorizontal, BarChart2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATS = [
  {
    icon: Flame,
    iconBg: 'bg-[var(--color-orange-500)]/15',
    iconColor: 'text-[var(--color-orange-300)]',
    count: 18,
    label: 'Karhutla',
    bar: 'bg-[var(--color-orange-400)]',
    pct: 38,
  },
  {
    icon: Waves,
    iconBg: 'bg-[var(--color-navy-400)]/15',
    iconColor: 'text-[var(--color-navy-300)]',
    count: 14,
    label: 'Banjir',
    bar: 'bg-[var(--color-navy-400)]',
    pct: 30,
  },
  {
    icon: Mountain,
    iconBg: 'bg-[var(--color-gold-400)]/15',
    iconColor: 'text-[var(--color-gold-300)]',
    count: 7,
    label: 'Longsor',
    bar: 'bg-[var(--color-gold-400)]',
    pct: 15,
  },
  {
    icon: Wind,
    iconBg: 'bg-[var(--color-safe)]/15',
    iconColor: 'text-[#86efac]',
    count: 5,
    label: 'Puting Beliung',
    bar: 'bg-[var(--color-safe)]',
    pct: 11,
  },
  {
    icon: Home,
    iconBg: 'bg-[var(--color-slate-400)]/15',
    iconColor: 'text-[var(--color-slate-300)]',
    count: 2,
    label: 'Abrasi',
    bar: 'bg-[var(--color-slate-400)]',
    pct: 4,
  },
  {
    icon: MoreHorizontal,
    iconBg: 'bg-[var(--color-slate-500)]/15',
    iconColor: 'text-[var(--color-slate-400)]',
    count: 1,
    label: 'Lainnya',
    bar: 'bg-[var(--color-slate-500)]',
    pct: 2,
  },
]

export function DisasterStatsSection() {
  return (
    <section className="bg-navy-800 py-20">
      <div className="container-content max-w-content mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="text-gold-300 mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <span className="bg-gold-400 h-0.5 w-5 rounded-full" />
            Data Kebencanaan
          </div>
          <h2 className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold tracking-tight text-white">
            Statistik Jenis Bencana Tahun 2026
          </h2>
          <p className="text-navy-400 mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Kejadian bencana yang terlaporkan dan ditangani BPBD Provinsi Kalimantan Timur.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((item) => (
            <Card
              key={item.label}
              className="flex flex-col items-center justify-center gap-0 rounded-xl border-white/5 bg-white/3 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/6"
            >
              <div
                className={cn(
                  'mb-4 flex h-12 w-12 items-center justify-center rounded-xl',
                  item.iconBg
                )}
              >
                <item.icon className={cn('h-5 w-5', item.iconColor)} />
              </div>
              <p className="text-3xl font-bold tracking-tight text-white">{item.count}</p>
              <p className="text-navy-400 mt-1 text-[10px] font-bold tracking-widest uppercase">
                {item.label}
              </p>

              {/* Progress Bar */}
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn('h-full rounded-full', item.bar)}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="bg-orange-500 shadow-[0_4px_20px_rgba(232,80,0,0.3)] hover:bg-orange-600"
          >
            <Link href="/informasi/statistik">
              <BarChart2 className="mr-2 h-4 w-4" />
              Lihat Data Statistik Lengkap
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
