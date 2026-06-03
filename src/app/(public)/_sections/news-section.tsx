// src/app/(public)/_sections/news-section.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getPublishedNews } from '@/lib/db/queries/news'
import { NewsCard } from '@/components/shared/news-card'
import { NewsGridSkeleton } from '@/components/shared/news-card-skeleton'
import { Button } from '@/components/ui/button'

async function NewsGrid() {
  const articles = await getPublishedNews(3)

  if (articles.length === 0) {
    return (
      <div className="text-muted-foreground py-16 text-center text-sm">
        Belum ada berita yang dipublikasikan.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {articles.map((article, i) => (
        <NewsCard
          key={article.id}
          title={article.title}
          slug={article.slug}
          excerpt={article.excerpt}
          featuredImage={article.featuredImage}
          categoryName={article.category?.name}
          categorySlug={article.category?.slug}
          authorName={article.author?.name}
          publishedAt={article.publishedAt}
          featured={i === 0}
        />
      ))}
    </div>
  )
}

export function NewsSectionWrapper() {
  return (
    <section className="bg-background border-border border-b py-16 lg:py-20">
      <div className="container-content mx-auto max-w-6xl px-6">
        {/* Header Section */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-orange-600 uppercase">
              <span className="h-0.5 w-4.5 rounded-full bg-orange-500" />
              Publikasi
            </div>
            <h2 className="text-foreground text-[clamp(1.35rem,2.5vw,1.875rem)] font-bold tracking-tight">
              Berita & Kegiatan BPBD Kaltim
            </h2>
          </div>

          {/* Menggunakan komponen Button dari shadcn */}
          <Button
            variant="link"
            asChild
            className="text-navy-600 hidden text-xs font-semibold hover:text-orange-600 sm:flex"
          >
            <Link href="/berita">
              Semua Berita <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Grid Berita dengan Suspense */}
        <Suspense fallback={<NewsGridSkeleton />}>
          <NewsGrid />
        </Suspense>
      </div>
    </section>
  )
}
