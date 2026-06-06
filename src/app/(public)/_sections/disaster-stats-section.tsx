// src/app/(public)/_sections/disaster-stats-section.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { incidents, disasterTypes } from '@db/schema'
import { eq, desc, count, gte, and } from 'drizzle-orm'

export async function DisasterStatsSection() {
  noStore()

  const currentYear = new Date().getFullYear()

  // Query per jenis bencana tahun berjalan
  const perJenis = await db
    .select({
      name: disasterTypes.name,
      icon: disasterTypes.icon,
      color: disasterTypes.color,
      total: count(incidents.id),
    })
    .from(incidents)
    .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
    .where(
      and(
        eq(incidents.isPublished, true),
        gte(incidents.occurredDate, new Date(`${currentYear}-01-01`))
      )
    )
    .groupBy(incidents.disasterTypeId, disasterTypes.name, disasterTypes.icon, disasterTypes.color)
    .orderBy(desc(count(incidents.id)))
    .limit(6)

  const totalKejadian = perJenis.reduce((s, j) => s + Number(j.total), 0)
  const maxCount = Number(perJenis[0]?.total ?? 1)

  return (
    <section className="bg-navy-800 py-20">
      <div className="container-content mx-auto max-w-(--width-content)">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-gold-300 mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <span className="bg-gold-400 h-0.5 w-5 rounded-full" />
            Data Kebencanaan
          </div>
          <h2 className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold tracking-tight text-white">
            Statistik Jenis Bencana Tahun {currentYear}
          </h2>
          <p className="text-navy-400 mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Kejadian bencana yang terlaporkan dan ditangani BPBD Provinsi Kalimantan Timur.
          </p>
        </div>

        {/* Stats Grid */}
        {perJenis.length === 0 ? (
          <p className="text-navy-400 py-8 text-center text-sm">Belum ada data kejadian bencana.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {perJenis.map((item) => {
              const total = Number(item.total)
              const pct = Math.round((total / maxCount) * 100)
              const color = item.color ?? '#6b7592'

              return (
                <Card
                  key={item.name}
                  className="flex flex-col items-center justify-center gap-0 rounded-xl border-white/5 bg-white/3 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/6"
                >
                  {/* Emoji icon */}
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ background: `${color}25` }}
                  >
                    {item.icon ?? '⚠️'}
                  </div>

                  {/* Angka */}
                  <p className="text-3xl font-bold tracking-tight text-white">{total}</p>

                  {/* Label */}
                  <p className="text-navy-400 mt-1 text-center text-[10px] leading-tight font-bold tracking-widest uppercase">
                    {item.name ?? 'Lainnya'}
                  </p>

                  {/* Persentase */}
                  {totalKejadian > 0 && (
                    <p className="mt-0.5 text-[10px] text-white/40">
                      {((total / totalKejadian) * 100).toFixed(0)}%
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Total & CTA */}
        <div className="mt-10 flex flex-col items-center gap-4">
          {totalKejadian > 0 && (
            <p className="text-navy-400 text-sm">
              Total <span className="font-bold text-white">{totalKejadian}</span> kejadian tercatat
              tahun {currentYear}
            </p>
          )}
          <Button
            asChild
            size="lg"
            className="bg-orange-500 shadow-[0_4px_20px_rgba(232,80,0,0.3)] hover:bg-orange-600"
          >
            <Link href="/statistik-bencana">
              <BarChart2 className="mr-2 h-4 w-4" />
              Lihat Data Statistik Lengkap
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
