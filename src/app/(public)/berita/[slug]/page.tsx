// src/app/(public)/berita/[slug]/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { news, newsCategories, users } from '@db/schema'
import { eq, and, desc, ne } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Eye,
  User,
  ChevronRight,
  ArrowLeft,
  Newspaper,
  Clock,
  Tag,
  TrendingUp,
} from 'lucide-react'
import { ShareButtons } from '../_components/share-buttons'
import { ReadingProgress } from '../_components/reading-progress'

interface Props {
  params: Promise<{ slug: string }>
}

function formatDate(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
function formatDateShort(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
function estimateReadTime(content: string) {
  return Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200))
}
async function incrementView(id: string) {
  db.execute(`UPDATE news SET view_count = view_count + 1 WHERE id = '${id}'`).catch(() => {})
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const [item] = await db
    .select({
      title: news.title,
      seoTitle: news.seoTitle,
      seoDescription: news.seoDescription,
      excerpt: news.excerpt,
      featuredImage: news.featuredImage,
    })
    .from(news)
    .where(eq(news.slug, slug))
  if (!item) return { title: 'Berita tidak ditemukan' }
  return {
    title: `${item.seoTitle || item.title} — BPBD Kaltim`,
    description: item.seoDescription || item.excerpt || '',
    openGraph: {
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.excerpt || '',
      images: item.featuredImage ? [item.featuredImage] : [],
    },
  }
}

export default async function BeritaDetailPage({ params }: Props) {
  noStore()
  const { slug } = await params

  const [item] = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      content: news.content,
      featuredImage: news.featuredImage,
      publishedAt: news.publishedAt,
      viewCount: news.viewCount,
      isFeatured: news.isFeatured,
      categoryId: news.categoryId,
      categoryName: newsCategories.name,
      categorySlug: newsCategories.slug,
      categoryColor: newsCategories.color,
      authorName: users.name,
    })
    .from(news)
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .leftJoin(users, eq(news.authorId, users.id))
    .where(and(eq(news.slug, slug), eq(news.status, 'published')))

  if (!item) notFound()
  incrementView(item.id)

  const [related, categories, latestNews] = await Promise.all([
    db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        featuredImage: news.featuredImage,
        publishedAt: news.publishedAt,
        categoryName: newsCategories.name,
        categoryColor: newsCategories.color,
      })
      .from(news)
      .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
      .where(
        and(
          eq(news.status, 'published'),
          ne(news.id, item.id),
          item.categoryId ? eq(news.categoryId, item.categoryId) : undefined
        )
      )
      .orderBy(desc(news.publishedAt))
      .limit(3),

    db
      .select({
        id: newsCategories.id,
        name: newsCategories.name,
        slug: newsCategories.slug,
        color: newsCategories.color,
      })
      .from(newsCategories)
      .orderBy(newsCategories.name),

    db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        publishedAt: news.publishedAt,
        viewCount: news.viewCount,
        categoryName: newsCategories.name,
        categoryColor: newsCategories.color,
      })
      .from(news)
      .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
      .where(and(eq(news.status, 'published'), ne(news.id, item.id)))
      .orderBy(desc(news.publishedAt))
      .limit(5),
  ])

  const readTime = estimateReadTime(item.content)
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/berita/${item.slug}`

  return (
    <div className="min-h-screen bg-slate-50">
      <ReadingProgress />

      {/* Hero header dengan gambar */}
      <div className="bg-navy-900 relative overflow-hidden">
        {item.featuredImage && (
          <>
            <Image
              src={item.featuredImage}
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="from-navy-900/60 via-navy-900/80 to-navy-900 absolute inset-0 bg-gradient-to-b" />
          </>
        )}
        <div className="container-content max-w-content relative z-10 mx-auto pt-6 pb-10">
          {/* Breadcrumb */}
          <div className="text-navy-400 mb-6 flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/berita" className="transition hover:text-white">
              Berita
            </Link>
            {item.categoryName && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link
                  href={`/berita?kategori=${item.categorySlug}`}
                  className="transition hover:text-white"
                >
                  {item.categoryName}
                </Link>
              </>
            )}
          </div>

          {/* Badge */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {item.categoryName && (
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold text-white uppercase"
                style={{ background: item.categoryColor ?? '#1b56a8' }}
              >
                {item.categoryName}
              </span>
            )}
            {item.isFeatured && (
              <Badge className="border-0 bg-orange-500 text-[11px] text-white">⭐ Unggulan</Badge>
            )}
          </div>

          {/* Judul besar */}
          <h1 className="mb-5 max-w-3xl text-2xl leading-snug font-bold text-white md:text-3xl lg:text-4xl">
            {item.title}
          </h1>

          {/* Meta row */}
          <div className="text-navy-300 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {item.authorName && (
              <span className="flex items-center gap-1.5">
                <div className="bg-navy-700 flex h-5 w-5 items-center justify-center rounded-full">
                  <User className="text-navy-300 h-3 w-3" />
                </div>
                {item.authorName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(item.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> {item.viewCount?.toLocaleString('id-ID')} dibaca
            </span>
            <span className="flex items-center gap-1.5 font-medium text-orange-400">
              <Clock className="h-3.5 w-3.5" /> {readTime} menit baca
            </span>
          </div>
        </div>
      </div>

      {/* Konten area */}
      <div className="container-content max-w-content mx-auto py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* ── Artikel ── */}
          <div className="space-y-0">
            {/* Featured Image (jika ada) di bawah hero */}
            {item.featuredImage && (
              <div className="relative -mt-16 mb-8 aspect-video w-full overflow-hidden rounded-lg shadow-xl ring-4 ring-white">
                <Image
                  src={item.featuredImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <article className="rounded-lg bg-white p-8 shadow-sm ring-1 ring-black/5">
              {/* Excerpt */}
              {item.excerpt && (
                <p className="text-navy-700 mb-8 rounded-lg border-l-[3px] border-orange-500 bg-orange-50 px-5 py-4 text-base leading-relaxed font-medium">
                  {item.excerpt}
                </p>
              )}

              {/* Konten */}
              <div
                className="prose prose-base prose-headings:text-navy-800 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:mb-4 prose-a:text-navy-600 prose-a:font-medium prose-a:underline prose-a:underline-offset-2 prose-img:rounded-lg prose-img:w-full prose-img:my-8 prose-img:shadow-md prose-blockquote:border-l-[3px] prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-navy-700 prose-blockquote:font-medium prose-strong:text-navy-800 prose-strong:font-semibold prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:mb-1.5 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-navy-700 prose-code:text-xs max-w-none"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />

              {/* Share */}
              <div className="mt-10 space-y-5 border-t border-slate-100 pt-8">
                <ShareButtons title={item.title} url={pageUrl} />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/berita">
                    <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Berita
                  </Link>
                </Button>
              </div>
            </article>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">
            {/* Info artikel */}
            <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
              <div className="bg-navy-800 px-5 py-3.5">
                <p className="text-navy-200 text-[11px] font-bold tracking-widest uppercase">
                  Info Artikel
                </p>
              </div>
              <div className="divide-y divide-slate-50 text-sm">
                {[
                  item.categoryName && {
                    label: 'Kategori',
                    value: (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                        style={{ background: item.categoryColor ?? '#1b56a8' }}
                      >
                        {item.categoryName}
                      </span>
                    ),
                  },
                  {
                    label: 'Tanggal',
                    value: (
                      <span className="text-xs font-medium">{formatDate(item.publishedAt)}</span>
                    ),
                  },
                  item.authorName && {
                    label: 'Penulis',
                    value: <span className="text-xs font-medium">{item.authorName}</span>,
                  },
                  {
                    label: 'Dibaca',
                    value: (
                      <span className="text-xs font-medium">
                        {item.viewCount?.toLocaleString('id-ID')}×
                      </span>
                    ),
                  },
                  {
                    label: 'Estimasi',
                    value: (
                      <span className="text-xs font-medium text-orange-600">{readTime} menit</span>
                    ),
                  },
                ]
                  .filter(Boolean)
                  .map((row: any, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-2.5">
                      <span className="text-muted-foreground text-xs">{row.label}</span>
                      {row.value}
                    </div>
                  ))}
              </div>
            </div>

            {/* Kategori */}
            {categories.length > 0 && (
              <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                <div className="bg-navy-800 flex items-center gap-2 px-5 py-3.5">
                  <Tag className="text-navy-300 h-3.5 w-3.5" />
                  <p className="text-navy-200 text-[11px] font-bold tracking-widest uppercase">
                    Topik
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 p-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/berita?kategori=${cat.slug}`}
                      className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-75"
                      style={{ background: cat.color ?? '#1b56a8' }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Berita terkait */}
            {related.length > 0 && (
              <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                <div className="bg-navy-800 px-5 py-3.5">
                  <p className="text-navy-200 text-[11px] font-bold tracking-widest uppercase">
                    Berita Terkait
                  </p>
                </div>
                <div className="divide-y divide-slate-50">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/berita/${r.slug}`}
                      className="group flex gap-3 p-4 transition hover:bg-slate-50"
                    >
                      <div className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {r.featuredImage ? (
                          <Image
                            src={r.featuredImage}
                            alt={r.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Newspaper className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {r.categoryName && (
                          <span
                            className="mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] leading-tight font-bold text-white"
                            style={{ background: r.categoryColor ?? '#1b56a8' }}
                          >
                            {r.categoryName}
                          </span>
                        )}
                        <p className="text-navy-800 group-hover:text-navy-600 line-clamp-2 text-xs leading-snug font-semibold transition">
                          {r.title}
                        </p>
                        <p className="text-muted-foreground mt-1 text-[11px]">
                          {formatDateShort(r.publishedAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Berita terbaru */}
            {latestNews.length > 0 && (
              <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                <div className="bg-navy-800 flex items-center gap-2 px-5 py-3.5">
                  <TrendingUp className="text-navy-300 h-3.5 w-3.5" />
                  <p className="text-navy-200 text-[11px] font-bold tracking-widest uppercase">
                    Terbaru
                  </p>
                </div>
                <div className="divide-y divide-slate-50">
                  {latestNews.map((r, idx) => (
                    <Link
                      key={r.id}
                      href={`/berita/${r.slug}`}
                      className="group flex items-start gap-3 p-4 transition hover:bg-slate-50"
                    >
                      <span className="bg-navy-50 text-navy-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-navy-800 group-hover:text-navy-600 line-clamp-2 text-xs leading-snug font-semibold transition">
                          {r.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-muted-foreground text-[11px]">
                            {formatDateShort(r.publishedAt)}
                          </span>
                          {r.categoryName && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                              style={{ background: r.categoryColor ?? '#1b56a8' }}
                            >
                              {r.categoryName}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-50 p-4">
                  <Link
                    href="/berita"
                    className="text-navy-600 hover:text-navy-800 flex items-center justify-center gap-1 text-xs font-semibold transition"
                  >
                    Semua Berita →
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
