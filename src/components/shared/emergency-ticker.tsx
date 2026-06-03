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

function TickerIcon({ name }: { name?: string }) {
  if (!name) return null
  const Icon = (LucideIcons as any)[name]
  if (!Icon) return null
  return <Icon className="h-4 w-4 shrink-0 text-orange-400" />
}

export async function EmergencyTicker() {
  noStore()

  const rows = await db
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, ['ticker_items', 'ticker_speed']))

  const itemsRow = rows.find((r) => r.key === 'ticker_items')
  const speedRow = rows.find((r) => r.key === 'ticker_speed')
  const speed = speedRow?.value ? Number(speedRow.value) : 40

  const items: TickerItem[] = (() => {
    if (!itemsRow?.value) return []
    try {
      return JSON.parse(itemsRow.value)
        .filter((i: TickerItem) => i.isActive !== false)
        .sort((a: TickerItem, b: TickerItem) => (a.order ?? 0) - (b.order ?? 0))
    } catch {
      return []
    }
  })()

  if (items.length === 0) return null

  const tickerItems = [...items, ...items]

  return (
    <div className="bg-navy-800 sticky top-16 z-30 w-full overflow-hidden border-b-2 border-orange-500">
      <div className="flex items-stretch">
        <div className="z-10 flex shrink-0 items-center gap-2 bg-orange-500 px-4 py-2 text-[11px] font-bold tracking-widest text-white uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Info
        </div>
        <div className="flex-1 overflow-hidden py-2">
          {/* Gunakan inline style untuk duration dinamis */}
          <div
            className="animate-ticker inline-flex whitespace-nowrap"
            style={{ animationDuration: `${speed}s` }}
          >
            {tickerItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-8">
                <TickerIcon name={item.icon} />
                <span className="text-navy-100 text-[13px] font-medium">{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
