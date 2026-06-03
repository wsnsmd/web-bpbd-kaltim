// src/app/admin/(dashboard)/news/[id]/edit/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { news } from '@db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { NewsForm } from '../../_components/news-form'
import { getCategoriesAction } from '../../_actions/news-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Edit Berita' }

export default async function NewsEditPage({ params }: PageProps) {
  const { id } = await params
  const categories = await getCategoriesAction()

  const [article] = await db.select().from(news).where(eq(news.id, id))
  if (!article) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin/news">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Edit Berita</h1>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">{article.title}</p>
        </div>
      </div>

      <NewsForm
        mode="edit"
        newsId={id}
        categories={categories}
        defaultValues={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? '',
          content: article.content,
          featuredImage: article.featuredImage ?? '',
          categoryId: article.categoryId ?? undefined,
          status: article.status ?? 'draft',
          isFeatured: article.isFeatured ?? false,
          seoTitle: article.seoTitle ?? '',
          seoDescription: article.seoDescription ?? '',
        }}
      />
    </div>
  )
}
