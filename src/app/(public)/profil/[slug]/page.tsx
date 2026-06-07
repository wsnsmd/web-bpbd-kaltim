// src/app/(public)/profil/[slug]/page.tsx
// Render halaman statis dari CMS untuk semua profil kecuali struktur-organisasi
import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { db } from '@/lib/db'
import { pages, users } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { Calendar, User } from 'lucide-react'

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
    })
    .from(pages)
    .where(eq(pages.slug, `profil/${slug}`))

  if (!page) return { title: 'Halaman tidak ditemukan' }
  return {
    title: `${page.seoTitle || page.title} — BPBD Kaltim`,
    description: page.seoDescription || '',
  }
}

export default async function ProfilSlugPage({ params }: Props) {
  noStore()
  const { slug } = await params

  const [item] = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      content: pages.content,
      excerpt: pages.excerpt,
      featuredImage: pages.featuredImage,
      publishedAt: pages.publishedAt,
      updatedAt: pages.updatedAt,
      authorName: users.name,
    })
    .from(pages)
    .leftJoin(users, eq(pages.authorId, users.id))
    .where(and(eq(pages.slug, `profil/${slug}`), eq(pages.status, 'published')))

  if (!item) notFound()

  return (
    <article className="overflow-hidden rounded-lg bg-white ring-1 ring-black/6">
      {/* Featured image */}
      {item.featuredImage && (
        <div className="relative aspect-3/1 w-full overflow-hidden">
          <Image src={item.featuredImage} alt={item.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="p-8">
        {/* Judul */}
        <h2 className="text-navy-800 mb-3 text-2xl font-black tracking-tight">{item.title}</h2>

        {/* Meta */}
        <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-6 text-xs">
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

        {/* Excerpt */}
        {item.excerpt && (
          <p className="text-navy-700 mb-6 rounded-r-xl border-l-[3px] border-orange-500 bg-orange-50 px-5 py-3 text-base leading-relaxed font-medium">
            {item.excerpt}
          </p>
        )}

        {/* Konten HTML dari Tiptap */}
        <div
          className="prose prose-base prose-headings:text-navy-800 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:mb-4 prose-a:text-navy-600 prose-a:underline prose-a:underline-offset-2 prose-img:rounded-xl prose-img:w-full prose-img:my-6 prose-img:shadow-sm prose-blockquote:border-l-[3px] prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-navy-700 prose-strong:text-navy-800 prose-strong:font-semibold prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:mb-1.5 prose-table:text-sm prose-th:bg-navy-50 prose-th:text-navy-800 prose-td:border prose-td:border-slate-200 prose-th:border prose-th:border-slate-200 max-w-none text-justify"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      </div>
    </article>
  )
}
