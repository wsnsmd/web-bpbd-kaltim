// src/app/(public)/search/page.tsx
import { db } from '@/lib/db'
import { incidents, news, newsCategories, downloads, regions } from '@db/schema'
import { eq, like, desc, and, or, count } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { SearchClient } from './_components/search-client'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Pencarian',
  description: 'Cari informasi kejadian bencana, berita, dan unduhan di BPBD Kalimantan Timur.',
}

interface Props {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>
}

const PAGE_SIZE = 10

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', type = 'all', page = '1' } = await searchParams
  const query = q.trim()
  const pageNum = Math.max(1, parseInt(page))
  const offset = (pageNum - 1) * PAGE_SIZE

  if (!query || query.length < 2) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SearchHeader query={query} />
        <div className="container-content mx-auto max-w-(--width-content) px-4 py-20 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-slate-200" />
          <p className="font-medium text-slate-500">Masukkan kata kunci untuk mencari</p>
          <p className="mt-1 text-sm text-slate-400">Minimal 2 karakter</p>
        </div>
      </div>
    )
  }

  const regencyAlias = alias(regions, 'regency_r')

  // Query serentak berdasarkan tab aktif
  const [incidentRows, newsRows, downloadRows, incidentCount, newsCount, downloadCount] =
    await Promise.all([
      // Incidents
      type === 'all' || type === 'incident'
        ? db
            .select({
              id: incidents.id,
              title: incidents.title,
              description: incidents.description,
              regencyName: regencyAlias.name,
              occurredDate: incidents.occurredDate,
              status: incidents.status,
            })
            .from(incidents)
            .leftJoin(regencyAlias, eq(incidents.regencyId, regencyAlias.id))
            .where(
              and(
                eq(incidents.isPublished, true),
                or(
                  like(incidents.title, `%${query}%`),
                  like(incidents.description, `%${query}%`),
                  like(incidents.villageName, `%${query}%`)
                )
              )
            )
            .orderBy(desc(incidents.occurredDate))
            .limit(type === 'all' ? 3 : PAGE_SIZE)
            .offset(type === 'all' ? 0 : offset)
        : Promise.resolve([]),

      // News
      type === 'all' || type === 'news'
        ? db
            .select({
              id: news.id,
              title: news.title,
              slug: news.slug,
              excerpt: news.excerpt,
              publishedAt: news.publishedAt,
              categoryName: newsCategories.name,
              featuredImage: news.featuredImage,
            })
            .from(news)
            .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
            .where(
              and(
                eq(news.status, 'published'),
                or(like(news.title, `%${query}%`), like(news.excerpt, `%${query}%`))
              )
            )
            .orderBy(desc(news.publishedAt))
            .limit(type === 'all' ? 3 : PAGE_SIZE)
            .offset(type === 'all' ? 0 : offset)
        : Promise.resolve([]),

      // Downloads
      type === 'all' || type === 'download'
        ? db
            .select({
              id: downloads.id,
              title: downloads.title,
              category: downloads.category,
              fileType: downloads.fileType,
              fileUrl: downloads.fileUrl,
              fileSize: downloads.fileSize,
            })
            .from(downloads)
            .where(
              and(
                eq(downloads.isActive, true),
                or(like(downloads.title, `%${query}%`), like(downloads.category, `%${query}%`))
              )
            )
            .limit(type === 'all' ? 3 : PAGE_SIZE)
            .offset(type === 'all' ? 0 : offset)
        : Promise.resolve([]),

      // Counts
      db
        .select({ total: count() })
        .from(incidents)
        .where(
          and(
            eq(incidents.isPublished, true),
            or(
              like(incidents.title, `%${query}%`),
              like(incidents.description, `%${query}%`),
              like(incidents.villageName, `%${query}%`)
            )
          )
        ),
      db
        .select({ total: count() })
        .from(news)
        .where(
          and(
            eq(news.status, 'published'),
            or(like(news.title, `%${query}%`), like(news.excerpt, `%${query}%`))
          )
        ),
      db
        .select({ total: count() })
        .from(downloads)
        .where(
          and(
            eq(downloads.isActive, true),
            or(like(downloads.title, `%${query}%`), like(downloads.category, `%${query}%`))
          )
        ),
    ])

  const totals = {
    incident: Number(incidentCount[0]?.total ?? 0),
    news: Number(newsCount[0]?.total ?? 0),
    download: Number(downloadCount[0]?.total ?? 0),
  }
  const grandTotal = totals.incident + totals.news + totals.download

  const serialized = {
    incidents: incidentRows.map((r) => ({
      ...r,
      status: r.status ?? 'selesai',
      occurredDate: r.occurredDate ? new Date(r.occurredDate).toISOString().slice(0, 10) : null,
    })),
    news: newsRows.map((r) => ({
      ...r,
      publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString().slice(0, 10) : null,
    })),
    downloads: downloadRows,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SearchHeader query={query} />
      <div className="container-content mx-auto max-w-(--width-content) px-4 py-8">
        <SearchClient
          query={query}
          activeType={type}
          pageNum={pageNum}
          pageSize={PAGE_SIZE}
          results={serialized}
          totals={totals}
          grandTotal={grandTotal}
        />
      </div>
    </div>
  )
}

function SearchHeader({ query }: { query: string }) {
  return (
    <div className="bg-navy-900 px-4 py-8">
      <div className="container-content mx-auto max-w-(--width-content)">
        <div className="text-navy-400 mb-3 flex items-center gap-2 text-xs">
          <Link href="/" className="transition hover:text-white">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-white">Pencarian</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
          {query ? (
            <>
              Hasil pencarian untuk &ldquo;<span className="text-orange-400">{query}</span>&rdquo;
            </>
          ) : (
            'Pencarian'
          )}
        </h1>
      </div>
    </div>
  )
}
