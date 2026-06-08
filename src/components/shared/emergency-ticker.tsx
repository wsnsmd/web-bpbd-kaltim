// src/components/shared/emergency-ticker.tsx
import { unstable_noStore as noStore } from 'next/cache'
import * as LucideIcons from 'lucide-react'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { inArray } from 'drizzle-orm'

interface TickerItem {
  id: string
  text: string
  icon?: string
  isActive: boolean
  order: number
}

interface GempaItem {
  Tanggal: string
  Jam: string
  Magnitude: string
  Kedalaman: string
  Wilayah: string
  Potensi: string
}

function TickerIcon({ name }: { name?: string }) {
  if (!name) return null
  const Icon = (LucideIcons as Record<string, unknown>)[name] as
    | React.ComponentType<{ className?: string }>
    | undefined
  if (!Icon) return null
  return <Icon className="h-4 w-4 shrink-0 text-orange-400" />
}

// Fetch gempa terkini dari BMKG — cache 10 menit
async function fetchGempa(): Promise<GempaItem[]> {
  try {
    const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', {
      next: { revalidate: 600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const gempaList: GempaItem[] = data?.Infogempa?.gempa ?? []
    // Ambil 5 gempa terbaru dengan magnitudo ≥ 5.0
    return gempaList.filter((g) => parseFloat(g.Magnitude) >= 5.0).slice(0, 5)
  } catch {
    return []
  }
}

function formatGempaTicker(g: GempaItem): string {
  const mag = parseFloat(g.Magnitude)
  const tsunami =
    g.Potensi.toLowerCase().includes('berpotensi tsunami') &&
    !g.Potensi.toLowerCase().includes('tidak berpotensi')
  const prefix = tsunami ? '⚠️ PERINGATAN TSUNAMI' : mag >= 6.0 ? '🔴 Gempa Kuat' : '🟡 Gempa'
  return `${prefix} M${g.Magnitude} — ${g.Wilayah} (${g.Tanggal}, ${g.Jam.replace(' WIB', '')} WIB) · Kedalaman ${g.Kedalaman}`
}

export async function EmergencyTicker() {
  noStore()

  const [rows, gempaList] = await Promise.all([
    db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, ['ticker_items', 'ticker_speed'])),
    fetchGempa(),
  ])

  const itemsRow = rows.find((r) => r.key === 'ticker_items')
  const speedRow = rows.find((r) => r.key === 'ticker_speed')
  const speed = speedRow?.value ? Number(speedRow.value) : 40

  // Item dari DB (manual)
  const manualItems: TickerItem[] = (() => {
    if (!itemsRow?.value) return []
    try {
      return JSON.parse(itemsRow.value)
        .filter((i: TickerItem) => i.isActive !== false)
        .sort((a: TickerItem, b: TickerItem) => (a.order ?? 0) - (b.order ?? 0))
    } catch {
      return []
    }
  })()

  // Item dari BMKG gempa
  const gempaItems: TickerItem[] = gempaList.map((g, i) => ({
    id: `gempa-${i}`,
    text: formatGempaTicker(g),
    icon: parseFloat(g.Magnitude) >= 6.0 ? 'AlertTriangle' : 'Activity',
    isActive: true,
    order: 1000 + i, // gempa di belakang item manual
  }))

  const allItems = [...manualItems, ...gempaItems]
  if (allItems.length === 0) return null

  // Duplikat untuk animasi seamless
  const tickerItems = [...allItems, ...allItems]

  return (
    <div className="bg-navy-800 sticky top-16 z-30 w-full overflow-hidden border-b-2 border-orange-500">
      <div className="flex items-stretch">
        {/* Label INFO */}
        <div className="z-10 flex shrink-0 items-center gap-2 bg-orange-500 px-4 py-2 text-[11px] font-bold tracking-widest text-white uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Info
        </div>

        {/* Ticker scroll */}
        <div className="flex-1 overflow-hidden py-2">
          <div
            className="animate-ticker inline-flex whitespace-nowrap"
            style={{ animationDuration: `${speed}s` }}
          >
            {tickerItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-8">
                <TickerIcon name={item.icon} />
                <span className="text-navy-100 text-[13px] font-medium">{item.text}</span>
                {/* Separator dot */}
                <span className="mx-2 h-1 w-1 rounded-full bg-white/20" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
