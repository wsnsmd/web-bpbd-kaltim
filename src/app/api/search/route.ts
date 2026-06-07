// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { incidents, news, newsCategories, downloads, regions } from '@db/schema'
import { eq, like, desc, and, or } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '5'), 10)

  if (q.length < 2) return NextResponse.json([])

  try {
    const regencyAlias = alias(regions, 'regency_r')

    const [incidentResults, newsResults, downloadResults] = await Promise.all([
      // Incidents
      db
        .select({
          id: incidents.id,
          title: incidents.title,
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
              like(incidents.title, `%${q}%`),
              like(incidents.description, `%${q}%`),
              like(incidents.villageName, `%${q}%`)
            )
          )
        )
        .orderBy(desc(incidents.occurredDate))
        .limit(limit),

      // News
      db
        .select({
          id: news.id,
          title: news.title,
          slug: news.slug,
          excerpt: news.excerpt,
          publishedAt: news.publishedAt,
          categoryName: newsCategories.name,
        })
        .from(news)
        .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
        .where(
          and(
            eq(news.status, 'published'),
            or(like(news.title, `%${q}%`), like(news.excerpt, `%${q}%`))
          )
        )
        .orderBy(desc(news.publishedAt))
        .limit(limit),

      // Downloads
      db
        .select({
          id: downloads.id,
          title: downloads.title,
          category: downloads.category,
          fileType: downloads.fileType,
          fileUrl: downloads.fileUrl,
        })
        .from(downloads)
        .where(
          and(
            eq(downloads.isActive, true),
            or(like(downloads.title, `%${q}%`), like(downloads.category, `%${q}%`))
          )
        )
        .limit(limit),
    ])

    return NextResponse.json(
      {
        incidents: incidentResults.map((r) => ({
          ...r,
          occurredDate: r.occurredDate ? new Date(r.occurredDate).toISOString().slice(0, 10) : null,
        })),
        news: newsResults.map((r) => ({
          ...r,
          publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString().slice(0, 10) : null,
        })),
        downloads: downloadResults,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    console.error('Search error:', e)
    return NextResponse.json({ incidents: [], news: [], downloads: [] }, { status: 500 })
  }
}
