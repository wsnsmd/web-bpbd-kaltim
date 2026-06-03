// src/app/admin/(dashboard)/news/categories/_components/category-edit-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CategoryForm } from './category-form'
import { updateCategoryAction } from '../_actions/category-actions'

interface Props {
  category: {
    id: number
    name: string
    slug: string
    color: string | null
    description: string | null
  }
}

export function CategoryEditButton({ category }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSubmit(values: any) {
    const res = await updateCategoryAction(category.id, values)
    if (res.success) {
      toast.success('Kategori berhasil diperbarui')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
        </DialogHeader>
        <CategoryForm
          defaultValues={{
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            color: category.color ?? '#1b56a8',
          }}
          onSubmit={handleSubmit}
          submitLabel="Simpan Perubahan"
        />
      </DialogContent>
    </Dialog>
  )
}
