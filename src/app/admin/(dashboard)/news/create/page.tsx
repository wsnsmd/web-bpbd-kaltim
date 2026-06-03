// src/app/admin/(dashboard)/news/create/page.tsx
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewsForm } from '../_components/news-form'
import { getCategoriesAction } from '../_actions/news-actions'

export const metadata = { title: 'Tambah Berita' }

export default async function NewsCreatePage() {
  const categories = await getCategoriesAction()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin/news">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Tambah Berita</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Buat artikel berita baru</p>
        </div>
      </div>

      <NewsForm mode="create" categories={categories} />
    </div>
  )
}
