// src/app/(public)/[slug]/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { pages, users } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { ChevronRight, Calendar, User } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

function formatDate(date: Date | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const [page] = await db
    .select({
      title: pages.title,
      seoTitle: pages.seoTitle,
      seoDescription: pages.seoDescription,
      excerpt: pages.excerpt,
      featuredImage: pages.featuredImage,
    })
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.status, 'published')))

  if (!page) return { title: 'Halaman tidak ditemukan' }
  return {
    title: `${page.seoTitle || page.title}`,
    description: page.seoDescription || page.excerpt || '',
    openGraph: {
      title: page.seoTitle || page.title,
      images: page.featuredImage ? [page.featuredImage] : [],
    },
  }
}

export default async function StaticPage({ params }: Props) {
  noStore()
  const { slug } = await params

  // Cegah conflict dengan route lain
  const RESERVED = ['berita', 'galeri', 'unduhan', 'kontak', 'profil']
  if (RESERVED.includes(slug)) notFound()

  const [item] = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      content: pages.content,
      excerpt: pages.excerpt,
      featuredImage: pages.featuredImage,
      template: pages.template,
      publishedAt: pages.publishedAt,
      updatedAt: pages.updatedAt,
      authorName: users.name,
    })
    .from(pages)
    .leftJoin(users, eq(pages.authorId, users.id))
    .where(and(eq(pages.slug, slug), eq(pages.status, 'published')))

  if (!item) notFound()

  // ── Template: full width ──────────────────────────────────
  if (item.template === 'full') {
    return (
      <div className="min-h-screen bg-slate-50">
        {item.featuredImage && (
          <div className="relative h-64 w-full overflow-hidden md:h-80">
            <Image
              src={item.featuredImage}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60" />
            <div className="absolute right-0 bottom-0 left-0 p-8">
              <h1 className="text-3xl font-black text-white md:text-4xl">{item.title}</h1>
            </div>
          </div>
        )}
        <div className="container-content max-w-content mx-auto py-10">
          {!item.featuredImage && (
            <h1 className="text-navy-800 mb-6 text-3xl font-black">{item.title}</h1>
          )}
          <div
            className="prose prose-base prose-headings:text-navy-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-navy-600 prose-img:rounded-lg prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-strong:text-navy-800 max-w-none text-justify"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>
      </div>
    )
  }

  // ── Template: default & lainnya ───────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="container-content max-w-content relative z-10 mx-auto py-10">
          <div className="text-navy-400 mb-3 flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{item.title}</span>
          </div>
          <h1 className="text-2xl leading-snug font-black tracking-tight text-white md:text-3xl">
            {item.title}
          </h1>
          {(item.authorName || item.updatedAt) && (
            <div className="text-navy-400 mt-3 flex flex-wrap items-center gap-4 text-xs">
              {item.authorName && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {item.authorName}
                </span>
              )}
              {item.updatedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Diperbarui {formatDate(item.updatedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container-content max-w-content mx-auto py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          {/* Konten utama */}
          <article className="overflow-hidden rounded-lg bg-white ring-1 ring-black/6">
            {item.featuredImage && (
              <div className="relative aspect-3/1 w-full overflow-hidden">
                <Image
                  src={item.featuredImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </div>
            )}
            <div className="p-8">
              {item.excerpt && (
                <p className="text-navy-700 mb-6 rounded-r-xl border-l-[3px] border-orange-500 bg-orange-50 px-5 py-3 text-base leading-relaxed font-medium">
                  {item.excerpt}
                </p>
              )}
              <div
                className="prose prose-base prose-headings:text-navy-800 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:mb-4 prose-a:text-navy-600 prose-a:underline prose-a:underline-offset-2 prose-img:rounded-lg prose-img:w-full prose-img:my-6 prose-img:shadow-sm prose-blockquote:border-l-[3px] prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-navy-700 prose-strong:text-navy-800 prose-strong:font-semibold prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:mb-1.5 prose-table:text-sm prose-th:bg-navy-50 prose-th:text-navy-800 prose-td:border prose-td:border-slate-200 prose-th:border prose-th:border-slate-200 max-w-none text-justify"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-30">
            <div className="overflow-hidden rounded-lg bg-white ring-1 ring-black/6">
              <div className="bg-navy-800 px-5 py-3.5">
                <p className="text-navy-200 text-[11px] font-bold tracking-widest uppercase">
                  Info Halaman
                </p>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
                {item.publishedAt && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-muted-foreground text-xs">Dipublikasi</span>
                    <span className="text-xs font-medium">{formatDate(item.publishedAt)}</span>
                  </div>
                )}
                {item.updatedAt && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-muted-foreground text-xs">Diperbarui</span>
                    <span className="text-xs font-medium">{formatDate(item.updatedAt)}</span>
                  </div>
                )}
                {item.authorName && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-muted-foreground text-xs">Penulis</span>
                    <span className="text-xs font-medium">{item.authorName}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
