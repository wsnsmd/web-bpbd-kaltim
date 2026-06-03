// src/app/admin/(dashboard)/news/_components/news-delete-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { deleteNewsAction } from '../_actions/news-actions'

interface Props {
  id: string
  title: string
}

export function NewsDeleteButton({ id, title }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await deleteNewsAction(id)
    setLoading(false)

    if (res.success) {
      toast.success('Berita berhasil dihapus')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Gagal menghapus berita')
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
          <DialogTitle>Hapus Berita</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Berita{' '}
            <span className="text-foreground font-semibold">"{title}"</span> akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
