// src/app/admin/(dashboard)/downloads/_components/downloads-panel.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GripVertical, Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DOWNLOAD_COLOR_SCHEMES } from '@db/schema/downloads'
import {
  reorderDownloadsAction,
  deleteDownloadAction,
  toggleDownloadAction,
} from '../_actions/downloads-actions'
import { DownloadDialog } from './download-dialog'

interface DownloadItem {
  id: number
  title: string
  category: string
  fileUrl: string
  fileType: string | null
  fileSize: string | null
  icon: string | null
  colorScheme: string | null
  order: number | null
  isActive: boolean | null
}

// ── Fix 3: tambah prop categories ─────────────────────────────
interface Props {
  initialItems: DownloadItem[]
  categories?: string[]
}

function DynamicIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (LucideIcons as any)[name ?? 'FileText'] ?? LucideIcons.FileText
  return <Icon className={className} />
}

export function DownloadsPanel({ initialItems, categories }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState<DownloadItem | null>(null)
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
    const res = await reorderDownloadsAction(reordered.map((i) => i.id))
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
    const res = await toggleDownloadAction(id, !current)
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
    } else {
      toast.error('Gagal')
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Hapus "${title}"?`)) return
    const res = await deleteDownloadAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Dokumen dihapus')
    } else {
      toast.error('Gagal')
    }
  }

  const getScheme = (val: string | null) =>
    DOWNLOAD_COLOR_SCHEMES.find((s) => s.value === val) ?? DOWNLOAD_COLOR_SCHEMES[4]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} dokumen · seret untuk mengubah urutan
        </p>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
            </span>
          )}
          <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Tambah Dokumen
          </Button>
        </div>
      </div>

      {/* Preview grid */}
      {items.filter((i) => i.isActive).length > 0 && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-slate-50 p-4 sm:grid-cols-4">
          {items
            .filter((i) => i.isActive)
            .slice(0, 4)
            .map((item) => {
              const scheme = getScheme(item.colorScheme)
              return (
                <div key={item.id} className="rounded-lg border bg-white p-3">
                  <div
                    className={cn(
                      'mb-2 flex h-9 w-9 items-center justify-center rounded-lg',
                      scheme.bg
                    )}
                  >
                    <DynamicIcon name={item.icon} className={cn('h-4 w-4', scheme.text)} />
                  </div>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase">
                    {item.category}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold">{item.title}</p>
                </div>
              )
            })}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              Belum ada dokumen.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => {
                const scheme = getScheme(item.colorScheme)
                return (
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

                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        scheme.bg
                      )}
                    >
                      <DynamicIcon name={item.icon} className={cn('h-4 w-4', scheme.text)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 px-1 py-0 text-[10px]">
                          {item.category}
                        </Badge>
                        <span className="truncate text-sm font-medium">{item.title}</span>
                        {!item.isActive && (
                          <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[10px]">
                            Nonaktif
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {item.fileType} · {item.fileSize ?? '—'}
                      </p>
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
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Fix 3: teruskan categories ke dialog ── */}
      <DownloadDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        categories={categories}
        onSuccess={(item) => {
          setItems((prev) => [...prev, item])
          router.refresh()
        }}
      />
      {editItem && (
        <DownloadDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          item={editItem}
          categories={categories}
          onSuccess={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
            setEditItem(null)
          }}
        />
      )}
    </div>
  )
}
