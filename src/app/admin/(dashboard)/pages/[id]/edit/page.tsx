// src/app/admin/(dashboard)/pages/[id]/edit/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { pages } from '@db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { PageForm } from '../../_components/page-form'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Edit Halaman' }

export default async function PageEditPage({ params }: Props) {
  const { id } = await params
  const [page] = await db.select().from(pages).where(eq(pages.id, id))
  if (!page) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin/pages">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Edit Halaman</h1>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">{page.title}</p>
        </div>
      </div>
      <PageForm
        mode="edit"
        pageId={id}
        defaultValues={{
          title: page.title,
          slug: page.slug,
          content: page.content,
          excerpt: page.excerpt ?? '',
          featuredImage: page.featuredImage ?? '',
          status: page.status ?? 'draft',
          template: page.template ?? 'default',
          showInNav: page.showInNav ?? false,
          navOrder: page.navOrder ?? '0',
          publishedAt: page.publishedAt
            ? new Date(page.publishedAt).toISOString().slice(0, 16)
            : '',
          seoTitle: page.seoTitle ?? '',
          seoDescription: page.seoDescription ?? '',
        }}
      />
    </div>
  )
}
