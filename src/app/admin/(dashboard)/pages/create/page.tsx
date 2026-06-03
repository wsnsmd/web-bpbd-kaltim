// src/app/admin/(dashboard)/pages/create/page.tsx
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageForm } from '../_components/page-form'

export const metadata = { title: 'Tambah Halaman' }

export default function PageCreatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin/pages">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Tambah Halaman</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Buat halaman konten statis baru</p>
        </div>
      </div>
      <PageForm mode="create" />
    </div>
  )
}
