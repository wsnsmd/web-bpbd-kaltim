// src/app/admin/(dashboard)/faq/_components/faq-panel.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GripVertical, Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { FaqItem } from '../_actions/faq-actions'
import { reorderFaqsAction, deleteFaqAction, toggleFaqAction } from '../_actions/faq-actions'
import { FaqDialog } from './faq-dialog'

interface Props {
  initialItems: FaqItem[]
}

export function FaqPanel({ initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState<FaqItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function handleDrop(targetId: string) {
    if (!dragging || dragging === targetId) {
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
    const res = await reorderFaqsAction(reordered.map((i) => i.id))
    setSaving(false)
    if (res.success) {
      toast.success('Urutan disimpan')
      router.refresh()
    } else {
      toast.error('Gagal')
      setItems(initialItems)
    }
  }

  async function handleToggle(id: string, current: boolean) {
    const res = await toggleFaqAction(id, !current)
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
    } else {
      toast.error('Gagal')
    }
  }

  async function handleDelete(id: string, q: string) {
    if (!confirm(`Hapus FAQ "${q.slice(0, 40)}..."?`)) return
    const res = await deleteFaqAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('FAQ dihapus')
    } else {
      toast.error('Gagal')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} FAQ · seret untuk mengubah urutan
        </p>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
            </span>
          )}
          <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Tambah FAQ
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">Belum ada FAQ.</div>
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
                    'flex items-start gap-3 px-4 py-3 transition-colors',
                    dragging === item.id && 'opacity-40',
                    dragOver === item.id &&
                      dragging !== item.id &&
                      'bg-navy-50 border-navy-500 border-l-2',
                    !item.isActive && 'opacity-50'
                  )}
                >
                  <GripVertical className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0 cursor-grab" />

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <p className="text-navy-800 line-clamp-1 text-sm font-medium">{item.q}</p>
                      {!item.isActive && (
                        <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[10px]">
                          Nonaktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-xs">{item.a}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggle(item.id, item.isActive)}
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
                      onClick={() => handleDelete(item.id, item.q)}
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

      <FaqDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={(item) => {
          setItems((prev) => [...prev, item])
          router.refresh()
        }}
      />
      {editItem && (
        <FaqDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          item={editItem}
          onSuccess={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
            setEditItem(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
