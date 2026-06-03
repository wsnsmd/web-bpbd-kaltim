// src/app/admin/(dashboard)/gallery/_components/gallery-items-panel.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ImageIcon,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  reorderItemsAction,
  deleteItemAction,
  toggleGalleryItemAction,
} from '../_actions/gallery-actions'
import { GalleryItemDialog } from './gallery-item-dialog'

interface GalleryItem {
  id: number
  albumId: number
  type: 'photo' | 'video'
  title: string
  caption: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  order: number | null
  isActive: boolean | null
}

interface Props {
  albumId: number
  albumType: string
  initialItems: GalleryItem[]
}

export function GalleryItemsPanel({ albumId, albumType, initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState<GalleryItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function handleDrop(targetId: number) {
    if (dragging === null || dragging === targetId) {
      setDragging(null)
      setDragOver(null)
      return
    }
    const reordered = [...items]
    const [moved] = reordered.splice(
      reordered.findIndex((i) => i.id === dragging),
      1
    )
    reordered.splice(
      reordered.findIndex((i) => i.id === targetId),
      0,
      moved
    )
    setItems(reordered)
    setDragging(null)
    setDragOver(null)

    setSaving(true)
    const res = await reorderItemsAction(
      albumId,
      reordered.map((i) => i.id)
    )
    setSaving(false)
    if (res.success) {
      toast.success('Urutan disimpan')
      router.refresh()
    } else {
      toast.error('Gagal')
      setItems(initialItems)
    }
  }

  async function handleToggle(id: number, current: boolean) {
    const res = await toggleGalleryItemAction(id, !current)
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
    } else {
      toast.error('Gagal')
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Hapus "${title}"?`)) return
    const res = await deleteItemAction(id, albumId)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Item dihapus')
    } else {
      toast.error('Gagal')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} item · seret untuk mengubah urutan
        </p>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
            </span>
          )}
          <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Tambah Item
          </Button>
        </div>
      </div>

      {/* Grid preview */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {items
            .filter((i) => i.isActive && i.thumbnailUrl)
            .slice(0, 12)
            .map((item) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
              >
                <Image src={item.thumbnailUrl!} alt={item.title} fill className="object-cover" />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              Album masih kosong. Klik "Tambah Item" untuk mulai.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDragging(item.id)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(item.id)
                  }}
                  onDrop={() => handleDrop(item.id)}
                  onDragEnd={() => {
                    setDragging(null)
                    setDragOver(null)
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    dragging === item.id && 'opacity-40',
                    dragOver === item.id &&
                      dragging !== item.id &&
                      'bg-navy-50 border-navy-500 border-l-2',
                    !item.isActive && 'opacity-50'
                  )}
                >
                  <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab" />

                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {item.type === 'photo' ? (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        ) : (
                          <Play className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    )}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{item.title}</span>
                      <Badge variant="outline" className="shrink-0 px-1 py-0 text-[10px]">
                        {item.type === 'photo' ? 'Foto' : 'Video'}
                      </Badge>
                      {!item.isActive && (
                        <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                          Nonaktif
                        </Badge>
                      )}
                    </div>
                    {item.caption && (
                      <p className="text-muted-foreground truncate text-xs">{item.caption}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggle(item.id, item.isActive ?? true)}
                      className={item.isActive ? 'text-green-600' : 'text-muted-foreground'}
                    >
                      {item.isActive ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditItem(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id, item.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <GalleryItemDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        albumId={albumId}
        albumType={albumType}
        onSuccess={(item) => {
          setItems((prev) => [...prev, item])
          router.refresh()
        }}
      />
      {editItem && (
        <GalleryItemDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          albumId={albumId}
          albumType={albumType}
          item={editItem}
          onSuccess={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
            setEditItem(null)
          }}
        />
      )}
    </div>
  )
}
