// src/app/admin/(dashboard)/gallery/_components/album-create-button.tsx
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
import { AlbumForm } from './album-form'
import { createAlbumAction } from '../_actions/gallery-actions'

export function AlbumCreateButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSubmit(values: any) {
    const res = await createAlbumAction(values)
    if (res.success) {
      toast.success('Album berhasil dibuat')
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
          <Plus className="h-4 w-4" /> Buat Album
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Album Baru</DialogTitle>
        </DialogHeader>
        <AlbumForm onSubmit={handleSubmit} submitLabel="Buat Album" />
      </DialogContent>
    </Dialog>
  )
}
