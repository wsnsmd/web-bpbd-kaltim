// src/app/admin/(dashboard)/media/_components/media-picker.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ImageIcon, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MediaGrid } from './media-grid'

interface MediaItem {
  id: number
  filename: string
  originalName: string
  url: string
  size: number
  width: number | null
  height: number | null
  mimeType: string
  createdAt: Date | null
}

interface Props {
  value?: string
  onChange: (url: string) => void
  // Props tambahan untuk controlled mode (dari TiptapEditor)
  open?: boolean
  onOpenChange?: (open: boolean) => void
  imageOnly?: boolean // filter hanya tampilkan gambar
}

export function MediaPicker({
  value,
  onChange,
  open: controlledOpen,
  onOpenChange,
  imageOnly,
}: Props) {
  const isControlled = controlledOpen !== undefined

  const [internalOpen, setInternalOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)

  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (v: boolean) => onOpenChange?.(v) : setInternalOpen

  async function fetchMedia() {
    setLoading(true)
    try {
      const res = await fetch('/api/media')
      const data = await res.json()
      let mediaItems = data.items ?? []
      // Filter hanya gambar jika imageOnly
      if (imageOnly) {
        mediaItems = mediaItems.filter((i: MediaItem) => i.mimeType.startsWith('image/'))
      }
      setItems(mediaItems)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchMedia()
  }, [open])

  function handleSelect(url: string) {
    onChange(url)
    setOpen(false)
  }

  const dialogContent = (
    <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-4xl">
      <DialogHeader className="flex-row items-center justify-between border-b px-6 py-4">
        <DialogTitle>{imageOnly ? 'Pilih Gambar' : 'Media Library'}</DialogTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={fetchMedia}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto p-6">
        <MediaGrid initialItems={items} mode="picker" onSelect={handleSelect} />
      </div>
    </DialogContent>
  )

  // ── Mode controlled (dari TiptapEditor) — tidak tampilkan preview/trigger ──
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    )
  }

  // ── Mode normal (featured image picker) ──
  return (
    <div className="space-y-2">
      {value ? (
        <div
          className="border-border relative w-full overflow-hidden rounded-lg border bg-slate-100"
          style={{ aspectRatio: '16/9' }}
        >
          <Image src={value} alt="Featured image" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="border-border flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed bg-slate-50">
          <div className="text-muted-foreground text-center">
            <ImageIcon className="mx-auto mb-1 h-8 w-8 opacity-40" />
            <p className="text-xs">Belum ada gambar dipilih</p>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full">
            <ImageIcon className="h-4 w-4" />
            {value ? 'Ganti Gambar' : 'Pilih Gambar'}
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    </div>
  )
}
