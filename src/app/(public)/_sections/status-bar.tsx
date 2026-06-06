// src/app/(public)/_sections/status-bar.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { Shield, CloudRain, ClipboardList } from 'lucide-react'
import { db } from '@/lib/db'
import { incidents, siteSettings } from '@db/schema'
import { eq, and, gte, sql, count } from 'drizzle-orm'

// ── Mapping kode weather BMKG → teks Indonesia ───────────────
const WEATHER_MAP: Record<number, string> = {
  0: 'Cerah',
  1: 'Cerah Berawan',
  2: 'Cerah Berawan',
  3: 'Berawan',
  4: 'Berawan Tebal',
  5: 'Udara Kabur',
  10: 'Asap',
  45: 'Kabut',
  60: 'Hujan Ringan',
  61: 'Hujan Sedang',
  63: 'Hujan Lebat',
  80: 'Hujan Lokal',
  95: 'Hujan Badai',
  97: 'Hujan Badai',
}

function getWeatherDesc(weather: number, desc: string): string {
  return WEATHER_MAP[weather] ?? desc ?? 'Tidak tersedia'
}

// ── Fetch cuaca dari API BMKG ─────────────────────────────────
async function fetchBmkgWeather(adm4: string): Promise<{
  desc: string
  suhu: number | null
  lokasi: string
} | null> {
  try {
    const res = await fetch(
      `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`,
      { next: { revalidate: 3600 } } // cache 1 jam
    )
    if (!res.ok) return null
    const data = await res.json()

    const lokasi = data?.lokasi
    const cuacaList: any[][] = data?.data?.[0]?.cuaca ?? data?.cuaca ?? []

    // Ambil jam prakiraan yang paling dekat dengan waktu sekarang
    const now = Date.now()
    let closest: any = null
    let minDiff = Infinity

    for (const group of cuacaList) {
      for (const item of group) {
        const itemTime = new Date(item.local_datetime ?? item.datetime ?? '').getTime()
        if (!isNaN(itemTime)) {
          const diff = Math.abs(now - itemTime)
          if (diff < minDiff) {
            minDiff = diff
            closest = item
          }
        }
      }
    }

    if (!closest) return null

    return {
      desc: getWeatherDesc(closest.weather, closest.weather_desc),
      suhu: closest.t ?? null,
      lokasi: [lokasi?.desa, lokasi?.kecamatan].filter(Boolean).join(', ') || 'Samarinda',
    }
  } catch {
    return null
  }
}

// ── Status config ─────────────────────────────────────────────
const STATUS_WILAYAH_CONFIG = {
  aman: {
    label: 'Kondisi Normal / Aman',
    dot: 'bg-(--safe)',
    textColor: 'text-(--safe-text)',
    iconBg: 'bg-(--safe-light)',
    iconColor: 'text-(--safe-dark)',
  },
  waspada: {
    label: 'Waspada',
    dot: 'bg-(--warning)',
    textColor: 'text-(--warning-text)',
    iconBg: 'bg-(--warning-light)',
    iconColor: 'text-(--warning-dark)',
  },
  siaga: {
    label: 'Siaga',
    dot: 'bg-(--caution)',
    textColor: 'text-(--caution-text)',
    iconBg: 'bg-(--caution-light)',
    iconColor: 'text-(--caution-dark)',
  },
  tanggap: {
    label: 'Tanggap Darurat',
    dot: 'bg-(--danger)',
    textColor: 'text-(--danger-text)',
    iconBg: 'bg-(--danger-light)',
    iconColor: 'text-(--danger-dark)',
  },
}

export async function StatusBar() {
  noStore()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [settings, todayCount] = await Promise.all([
    db
      .select()
      .from(siteSettings)
      .then((rows) => Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))),

    db
      .select({ total: count(incidents.id) })
      .from(incidents)
      .where(and(eq(incidents.isPublished, true), gte(incidents.occurredDate, today))),
  ])

  const statusKey = (settings.status_wilayah ?? 'aman') as keyof typeof STATUS_WILAYAH_CONFIG
  const statusCfg = STATUS_WILAYAH_CONFIG[statusKey] ?? STATUS_WILAYAH_CONFIG.aman
  const bmkgAdm4 = settings.bmkg_adm4 ?? '64.72.09.1001'
  const jumlahHariIni = Number(todayCount[0]?.total ?? 0)

  // Fetch cuaca (dengan revalidate — tidak block render jika lambat)
  const cuaca = await fetchBmkgWeather(bmkgAdm4)

  return (
    <section className="relative z-10 -mt-7 px-6 pb-10">
      <div className="bg-card border-border mx-auto max-w-6xl overflow-hidden rounded-2xl border shadow-[0_6px_40px_rgba(11,32,64,.1)]">
        <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Status Wilayah — dari DB settings */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${statusCfg.iconBg}`}
            >
              <Shield className={`h-5 w-5 ${statusCfg.iconColor}`} />
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Status Wilayah
              </p>
              <p
                className={`flex items-center gap-1.5 text-[13px] font-semibold ${statusCfg.textColor}`}
              >
                <span
                  className={`animate-pulse-slow h-1.5 w-1.5 shrink-0 rounded-full ${statusCfg.dot}`}
                />
                {statusCfg.label}
              </p>
            </div>
          </div>

          {/* Info Cuaca BMKG — dari API */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--warning-light)">
              <CloudRain className="h-5 w-5 text-(--warning-dark)" />
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Info Cuaca BMKG
              </p>
              {cuaca ? (
                <>
                  <p className="text-foreground text-[13px] font-semibold">
                    {cuaca.desc}
                    {cuaca.suhu && (
                      <span className="text-muted-foreground ml-1 font-normal">{cuaca.suhu}°C</span>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[10px]">
                    📍 {cuaca.lokasi} · Sumber: BMKG
                  </p>
                </>
              ) : (
                <p className="text-foreground text-[13px] font-semibold">Data tidak tersedia</p>
              )}
            </div>
          </div>

          {/* Laporan Hari Ini — dari DB */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                jumlahHariIni > 0 ? 'bg-(--danger-light)' : 'bg-(--navy-50)'
              }`}
            >
              <ClipboardList
                className={`h-5 w-5 ${
                  jumlahHariIni > 0 ? 'text-(--danger-dark)' : 'text-(--navy-600)'
                }`}
              />
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Laporan Hari Ini
              </p>
              <p
                className={`text-[13px] font-semibold ${
                  jumlahHariIni > 0 ? 'text-(--danger-text)' : 'text-foreground'
                }`}
              >
                {jumlahHariIni === 0
                  ? '0 Kejadian Bencana Terlaporkan'
                  : `${jumlahHariIni} Kejadian Bencana Hari Ini`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
