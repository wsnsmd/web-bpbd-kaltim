// ─────────────────────────────────────────────────────────────
// src/app/admin/(dashboard)/gallery/_components/album-delete-button.tsx
// ─────────────────────────────────────────────────────────────
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { deleteAlbumAction } from '../_actions/gallery-actions'

interface Props {
  id: number
  title: string
}

export function AlbumDeleteButton({ id, title }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await deleteAlbumAction(id)
    setLoading(false)
    if (res.success) {
      toast.success('Album dihapus')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Gagal menghapus')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Album</DialogTitle>
          <DialogDescription>
            Album <span className="text-foreground font-semibold">"{title}"</span> beserta seluruh
            isinya akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Hapus Album
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
