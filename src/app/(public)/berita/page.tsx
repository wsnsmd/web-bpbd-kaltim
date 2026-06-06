// src/app/(public)/berita/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { news, newsCategories } from '@db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Eye, ChevronRight, Newspaper } from 'lucide-react'
import { CategoryFilter } from './_components/category-filter'

export const metadata = {
  title: 'Berita & Kegiatan — BPBD Kaltim',
  description: 'Informasi terkini seputar kebencanaan dan kegiatan BPBD Provinsi Kalimantan Timur.',
}

const PER_PAGE = 9

interface Props {
  searchParams: Promise<{ kategori?: string; hal?: string }>
}

function formatDate(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function BeritaPage({ searchParams }: Props) {
  noStore()
  const { kategori, hal } = await searchParams
  const page = Math.max(1, Number(hal) || 1)
  const offset = (page - 1) * PER_PAGE

  // Ambil semua kategori untuk filter
  const categories = await db.select().from(newsCategories).orderBy(newsCategories.name)

  // Filter by kategori
  const activeCategory = kategori ? categories.find((c) => c.slug === kategori) : null

  const baseWhere = and(
    eq(news.status, 'published'),
    activeCategory ? eq(news.categoryId, activeCategory.id) : undefined
  )

  // Total untuk pagination
  const [{ total }] = await db.select({ total: count() }).from(news).where(baseWhere)

  const totalPages = Math.ceil(total / PER_PAGE)

  // Ambil berita
  const items = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      featuredImage: news.featuredImage,
      publishedAt: news.publishedAt,
      viewCount: news.viewCount,
      isFeatured: news.isFeatured,
      categoryName: newsCategories.name,
      categorySlug: newsCategories.slug,
      categoryColor: newsCategories.color,
    })
    .from(news)
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(baseWhere)
    .orderBy(desc(news.publishedAt))
    .limit(PER_PAGE)
    .offset(offset)

  const featured = page === 1 && !kategori ? items.find((i) => i.isFeatured) : null
  const regular = featured ? items.filter((i) => i.id !== featured.id) : items

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <div className="bg-navy-800 py-12">
        <div className="container-content max-w-content mx-auto">
          <div className="text-navy-300 mb-3 flex items-center gap-2 text-sm">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Berita & Kegiatan</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Berita & Kegiatan</h1>
          <p className="text-navy-300 mt-1 text-sm">
            Informasi terkini seputar kebencanaan dan kegiatan BPBD Kaltim
          </p>
        </div>
      </div>

      <div className="container-content max-w-content mx-auto py-12">
        {/* Filter Kategori */}
        <CategoryFilter categories={categories} activeSlug={kategori} />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Newspaper className="h-12 w-12 text-slate-300" />
            <p className="text-muted-foreground text-sm">
              {activeCategory
                ? `Belum ada berita kategori "${activeCategory.name}".`
                : 'Belum ada berita.'}
            </p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <Link href={`/berita/${featured.slug}`} className="group mb-8 block">
                <div className="border-border bg-card grid overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg md:grid-cols-2">
                  <div className="relative aspect-video bg-slate-100 md:aspect-auto">
                    {featured.featuredImage ? (
                      <Image
                        src={featured.featuredImage}
                        alt={featured.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Newspaper className="h-16 w-16 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="border-0 bg-orange-500 text-white">Unggulan</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-8">
                    {featured.categoryName && (
                      <span
                        className="mb-2 text-[11px] font-bold tracking-widest uppercase"
                        style={{ color: featured.categoryColor ?? '#1b56a8' }}
                      >
                        {featured.categoryName}
                      </span>
                    )}
                    <h2 className="text-navy-800 group-hover:text-navy-600 mb-3 line-clamp-3 text-xl font-bold transition">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(featured.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {featured.viewCount?.toLocaleString('id-ID')} dibaca
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid berita */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regular.map((item) => (
                <Link key={item.id} href={`/berita/${item.slug}`} className="group block">
                  <article className="border-border bg-card h-full overflow-hidden rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Newspaper className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                      {item.categoryName && (
                        <div className="absolute top-3 left-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white uppercase"
                            style={{ background: item.categoryColor ?? '#1b56a8' }}
                          >
                            {item.categoryName}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-navy-800 group-hover:text-navy-600 mb-2 line-clamp-2 text-[15px] leading-snug font-bold transition">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="text-muted-foreground border-border mt-auto flex items-center justify-between border-t pt-3 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.viewCount?.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/berita?${kategori ? `kategori=${kategori}&` : ''}hal=${page - 1}`}
                    >
                      ← Sebelumnya
                    </Link>
                  </Button>
                )}
                <span className="text-muted-foreground px-4 text-sm">
                  Halaman {page} dari {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/berita?${kategori ? `kategori=${kategori}&` : ''}hal=${page + 1}`}
                    >
                      Berikutnya →
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
