// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { news, downloads } from '@db/schema'
import { eq, desc } from 'drizzle-orm'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bpbd.kaltimprov.go.id'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static routes ────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    {
      url: `${BASE_URL}/peta-bencana`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/data-kejadian`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/statistik-bencana`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/peringatan-dini`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    { url: `${BASE_URL}/peta-hotspot`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/berita`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/unduhan`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
  ]

  // ── Berita published ─────────────────────────────────────────
  let newsRoutes: MetadataRoute.Sitemap = []
  try {
    const newsItems = await db
      .select({ slug: news.slug, updatedAt: news.updatedAt })
      .from(news)
      .where(eq(news.status, 'published'))
      .orderBy(desc(news.publishedAt))
      .limit(200)

    newsRoutes = newsItems.map((n) => ({
      url: `${BASE_URL}/berita/${n.slug}`,
      lastModified: n.updatedAt ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    /* DB mungkin belum ready saat build */
  }

  // ── Unduhan aktif ────────────────────────────────────────────
  let downloadRoutes: MetadataRoute.Sitemap = []
  try {
    const dlItems = await db
      .select({ id: downloads.id, updatedAt: downloads.updatedAt })
      .from(downloads)
      .where(eq(downloads.isActive, true))
      .limit(100)

    // Unduhan tidak punya halaman detail sendiri,
    // cukup include halaman unduhan utama sudah di static routes
    downloadRoutes = []
  } catch {
    /* skip */
  }

  return [...staticRoutes, ...newsRoutes, ...downloadRoutes]
}
