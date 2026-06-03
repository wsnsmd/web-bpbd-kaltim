// src/app/admin/(dashboard)/news/categories/_components/category-create-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
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
import { createCategoryAction } from '../_actions/category-actions'

export function CategoryCreateButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSubmit(values: any) {
    const res = await createCategoryAction(values)
    if (res.success) {
      toast.success('Kategori berhasil dibuat')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Kategori</DialogTitle>
        </DialogHeader>
        <CategoryForm onSubmit={handleSubmit} submitLabel="Buat Kategori" />
      </DialogContent>
    </Dialog>
  )
}
