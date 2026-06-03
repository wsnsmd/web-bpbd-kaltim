// src/app/admin/(dashboard)/gallery/_components/album-edit-button.tsx
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
import { AlbumForm } from './album-form'
import { updateAlbumAction } from '../_actions/gallery-actions'

interface Props {
  album: {
    id: number
    title: string
    description: string | null
    coverUrl: string | null
    type: string | null
    isActive: boolean | null
  }
}

export function AlbumEditButton({ album }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSubmit(values: any) {
    const res = await updateAlbumAction(album.id, values)
    if (res.success) {
      toast.success('Album diperbarui')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5" /> Edit Album
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Album</DialogTitle>
        </DialogHeader>
        <AlbumForm
          defaultValues={{
            title: album.title,
            description: album.description ?? '',
            coverUrl: album.coverUrl ?? '',
            type: (album.type as any) ?? 'photo',
            isActive: album.isActive ?? true,
          }}
          onSubmit={handleSubmit}
          submitLabel="Simpan"
        />
      </DialogContent>
    </Dialog>
  )
}
