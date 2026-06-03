// src/app/admin/(dashboard)/homepage/services/_components/services-panel.tsx
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
import {
  reorderServicesAction,
  deleteServiceAction,
  toggleServiceAction,
} from '../_actions/services-actions'
import { ServiceDialog } from './service-dialog'

interface ServiceItem {
  id: number
  label: string
  description: string | null
  icon: string
  href: string
  order: number | null
  isActive: boolean | null
}

interface Props {
  initialItems: ServiceItem[]
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name]
  if (!Icon) return <LucideIcons.Circle className={className} />
  return <Icon className={className} />
}

export function ServicesPanel({ initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState<ServiceItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function handleDrop(targetId: number) {
    if (dragging === null || dragging === targetId) {
      setDragging(null)
      setDragOver(null)
      return
    }
    const reordered = [...items]
    const oldIdx = reordered.findIndex((i) => i.id === dragging)
    const newIdx = reordered.findIndex((i) => i.id === targetId)
    const [moved] = reordered.splice(oldIdx, 1)
    reordered.splice(newIdx, 0, moved)
    setItems(reordered)
    setDragging(null)
    setDragOver(null)

    setSaving(true)
    const res = await reorderServicesAction(reordered.map((i) => i.id))
    setSaving(false)
    if (res.success) {
      toast.success('Urutan disimpan')
      router.refresh()
    } else {
      toast.error('Gagal menyimpan urutan')
      setItems(initialItems)
    }
  }

  async function handleToggle(id: number, current: boolean) {
    const res = await toggleServiceAction(id, !current)
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
      router.refresh()
    } else {
      toast.error('Gagal mengubah status')
    }
  }

  async function handleDelete(id: number, label: string) {
    if (!confirm(`Hapus layanan "${label}"?`)) return
    const res = await deleteServiceAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Layanan dihapus')
      router.refresh()
    } else {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} layanan · seret untuk mengubah urutan
        </p>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
            </span>
          )}
          <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Tambah Layanan
          </Button>
        </div>
      </div>

      {/* Preview grid */}
      <div className="bg-navy-800 grid grid-cols-3 gap-3 rounded-xl p-4 sm:grid-cols-6">
        {items
          .filter((i) => i.isActive)
          .map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 rounded-xl bg-white/10 p-3 text-center"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <DynamicIcon name={item.icon} className="text-gold-300 h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-white">{item.label}</p>
            </div>
          ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              Belum ada layanan.
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

                  {/* Icon preview */}
                  <div className="bg-navy-100 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <DynamicIcon name={item.icon} className="text-navy-700 h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      {!item.isActive && (
                        <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                          Nonaktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.description} · {item.href}
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
                      onClick={() => handleDelete(item.id, item.label)}
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

      <ServiceDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={(newItem) => {
          setItems((prev) => [...prev, newItem])
          router.refresh()
        }}
      />
      {editItem && (
        <ServiceDialog
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
