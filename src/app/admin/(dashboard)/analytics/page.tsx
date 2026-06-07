// src/app/admin/(dashboard)/analytics/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { db } from '@/lib/db'
import { pageViews } from '@db/schema'
import { desc, sql, count, gte, and, lt } from 'drizzle-orm'
import { AnalyticsClient } from './_components/analytics-client'

export const metadata = { title: 'Statistik Pengunjung — Admin' }

export default async function AnalyticsPage() {
  noStore()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const last7days = new Date(today.getTime() - 7 * 86400000)
  const last30days = new Date(today.getTime() - 30 * 86400000)

  const [
    totalViews,
    todayViews,
    yesterdayViews,
    last7Views,

    // Per hari 30 hari terakhir
    perHari,

    // Top pages
    topPages,

    // Per browser
    perBrowser,

    // Per OS
    perOS,

    // Per device
    perDevice,

    // Per country
    perCountry,

    // Per city
    perCity,

    // Top referrers
    topReferrers,

    // Unique sessions hari ini
    uniqueToday,
  ] = await Promise.all([
    // Total semua
    db.select({ total: count() }).from(pageViews),

    // Hari ini
    db.select({ total: count() }).from(pageViews).where(gte(pageViews.createdAt, today)),

    // Kemarin
    db
      .select({ total: count() })
      .from(pageViews)
      .where(and(gte(pageViews.createdAt, yesterday), lt(pageViews.createdAt, today))),

    // 7 hari terakhir
    db.select({ total: count() }).from(pageViews).where(gte(pageViews.createdAt, last7days)),

    // Per hari 30 hari terakhir
    db
      .select({
        date: sql<string>`DATE(${pageViews.createdAt})`,
        total: count(),
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, last30days))
      .groupBy(sql`DATE(${pageViews.createdAt})`)
      .orderBy(sql`DATE(${pageViews.createdAt})`),

    // Top 10 halaman
    db
      .select({
        path: pageViews.path,
        title: pageViews.title,
        total: count(),
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, last30days))
      .groupBy(pageViews.path, pageViews.title)
      .orderBy(desc(count()))
      .limit(10),

    // Per browser
    db
      .select({ browser: pageViews.browser, total: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, last30days))
      .groupBy(pageViews.browser)
      .orderBy(desc(count()))
      .limit(8),

    // Per OS
    db
      .select({ os: pageViews.os, total: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, last30days))
      .groupBy(pageViews.os)
      .orderBy(desc(count()))
      .limit(8),

    // Per device
    db
      .select({ device: pageViews.device, total: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, last30days))
      .groupBy(pageViews.device)
      .orderBy(desc(count())),

    // Per country
    db
      .select({ country: pageViews.country, total: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, last30days))
      .groupBy(pageViews.country)
      .orderBy(desc(count()))
      .limit(10),

    // Per city
    db
      .select({ city: pageViews.city, country: pageViews.country, total: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, last30days))
      .groupBy(pageViews.city, pageViews.country)
      .orderBy(desc(count()))
      .limit(10),

    // Top referrers
    db
      .select({ referrer: pageViews.referrer, total: count() })
      .from(pageViews)
      .where(
        and(
          gte(pageViews.createdAt, last30days),
          sql`${pageViews.referrer} IS NOT NULL AND ${pageViews.referrer} != ''`
        )
      )
      .groupBy(pageViews.referrer)
      .orderBy(desc(count()))
      .limit(10),

    // Unique sessions hari ini
    db
      .select({ total: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, today)),
  ])

  // Isi tanggal kosong di perHari (30 hari)
  const dateMap = new Map(perHari.map((d) => [d.date, Number(d.total)]))
  const perHariFilled = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(last30days.getTime() + i * 86400000)
    const key = d.toISOString().slice(0, 10)
    return { date: key, total: dateMap.get(key) ?? 0 }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Statistik Pengunjung</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Data kunjungan 30 hari terakhir · Diperbarui real-time
        </p>
      </div>

      <AnalyticsClient
        totalViews={totalViews[0]?.total ?? 0}
        todayViews={todayViews[0]?.total ?? 0}
        yesterdayViews={yesterdayViews[0]?.total ?? 0}
        last7Views={last7Views[0]?.total ?? 0}
        uniqueToday={Number(uniqueToday[0]?.total ?? 0)}
        perHari={perHariFilled}
        topPages={topPages.map((p) => ({
          path: p.path,
          title: p.title ?? p.path,
          total: Number(p.total),
        }))}
        perBrowser={perBrowser.map((b) => ({
          name: b.browser ?? 'Unknown',
          total: Number(b.total),
        }))}
        perOS={perOS.map((o) => ({ name: o.os ?? 'Unknown', total: Number(o.total) }))}
        perDevice={perDevice.map((d) => ({ name: d.device ?? 'desktop', total: Number(d.total) }))}
        perCountry={perCountry.map((c) => ({
          name: c.country ?? 'Unknown',
          total: Number(c.total),
        }))}
        perCity={perCity.map((c) => ({
          name: c.city ?? 'Unknown',
          country: c.country ?? '',
          total: Number(c.total),
        }))}
        topReferrers={topReferrers.map((r) => ({
          referrer: r.referrer ?? '',
          total: Number(r.total),
        }))}
      />
    </div>
  )
}
