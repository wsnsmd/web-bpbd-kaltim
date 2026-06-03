// src/app/admin/(dashboard)/navigation/_components/menu-location-panel.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MENU_LOCATIONS, type MenuLocation } from '@db/schema/navigation'
import {
  reorderMenuItemsAction,
  deleteMenuItemAction,
  toggleMenuItemAction,
} from '../_actions/navigation-actions'
import { MenuItemDialog } from './menu-item-dialog'

interface MenuItem {
  id: number
  location: string
  label: string
  url: string
  icon: string | null
  target: string | null
  order: number | null
  isActive: boolean | null
  parentId: number | null
}

interface Props {
  location: MenuLocation
  items: MenuItem[]
}

export function MenuLocationPanel({ location, items: initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createParentId, setCreateParentId] = useState<number | null>(null)

  // ── Pisahkan parent dan children ─────────────────────────
  const parentItems = items.filter((i) => !i.parentId)
  const getChildren = (parentId: number) => items.filter((i) => i.parentId === parentId)

  // ── Drag & Drop (parent items only) ─────────────────────
  function handleDragStart(id: number) {
    setDragging(id)
  }
  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault()
    setDragOver(id)
  }

  async function handleDrop(targetId: number) {
    if (dragging === null || dragging === targetId) {
      setDragging(null)
      setDragOver(null)
      return
    }
    const reordered = [...parentItems]
    const oldIndex = reordered.findIndex((i) => i.id === dragging)
    const newIndex = reordered.findIndex((i) => i.id === targetId)
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    // Gabungkan kembali dengan children
    const children = items.filter((i) => i.parentId)
    setItems([...reordered, ...children])
    setDragging(null)
    setDragOver(null)

    setSaving(true)
    const res = await reorderMenuItemsAction(
      location,
      reordered.map((i) => i.id)
    )
    setSaving(false)

    if (res.success) {
      toast.success('Urutan disimpan')
      router.refresh()
    } else {
      toast.error('Gagal menyimpan urutan')
      setItems(initialItems)
    }
  }

  // ── Toggle ───────────────────────────────────────────────
  async function handleToggle(id: number, current: boolean) {
    const res = await toggleMenuItemAction(id, !current)
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
      router.refresh()
    } else {
      toast.error('Gagal mengubah status')
    }
  }

  // ── Delete ───────────────────────────────────────────────
  async function handleDelete(id: number, label: string) {
    const hasChildren = items.some((i) => i.parentId === id)
    if (hasChildren) {
      toast.error('Hapus submenu terlebih dahulu sebelum menghapus parent')
      return
    }
    if (!confirm(`Hapus "${label}"?`)) return
    const res = await deleteMenuItemAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Item dihapus')
      router.refresh()
    } else {
      toast.error('Gagal menghapus')
    }
  }

  // ── Row renderer ─────────────────────────────────────────
  function renderItem(item: MenuItem, isChild = false) {
    const children = getChildren(item.id)
    const hasChildren = children.length > 0

    return (
      <div key={item.id}>
        <div
          draggable={!isChild}
          onDragStart={() => !isChild && handleDragStart(item.id)}
          onDragOver={(e) => !isChild && handleDragOver(e, item.id)}
          onDrop={() => !isChild && handleDrop(item.id)}
          onDragEnd={() => {
            setDragging(null)
            setDragOver(null)
          }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 transition-colors',
            isChild && 'border-l-2 border-slate-200 bg-slate-50 pl-12',
            !isChild && dragging === item.id && 'opacity-40',
            !isChild &&
              dragOver === item.id &&
              dragging !== item.id &&
              'bg-navy-50 border-navy-500 border-l-2',
            !item.isActive && 'opacity-50'
          )}
        >
          {/* Drag handle — hanya parent */}
          {!isChild ? (
            <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab active:cursor-grabbing" />
          ) : (
            <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          )}

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{item.label}</span>
              {hasChildren && (
                <Badge variant="outline" className="px-1 py-0 text-[10px]">
                  {children.length} submenu
                </Badge>
              )}
              {item.target === '_blank' && (
                <Badge variant="outline" className="px-1 py-0 text-[10px]">
                  Tab baru
                </Badge>
              )}
              {!item.isActive && (
                <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                  Nonaktif
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{item.url}</p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Tambah submenu — hanya untuk main_nav dan parent item */}
            {location === 'main_nav' && !isChild && (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Tambah Submenu"
                onClick={() => {
                  setCreateParentId(item.id)
                  setShowCreate(true)
                }}
                className="text-navy-500 hover:text-navy-700"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleToggle(item.id, item.isActive ?? true)}
              className={item.isActive ? 'text-green-600' : 'text-muted-foreground'}
            >
              {item.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
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
        </div>

        {/* Render children */}
        {children.length > 0 && (
          <div className="divide-y border-b">
            {children
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((child) => renderItem(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-navy-800 text-sm font-medium">{MENU_LOCATIONS[location]}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {parentItems.length} item · seret untuk mengubah urutan
            {location === 'main_nav' && ' · klik + pada item untuk menambah submenu'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
            </span>
          )}
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setCreateParentId(null)
              setShowCreate(true)
            }}
          >
            <Plus className="h-4 w-4" /> Tambah Item
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {parentItems.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              Belum ada item. Klik "Tambah Item" untuk mulai.
            </div>
          ) : (
            <div className="divide-y">
              {parentItems
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((item) => renderItem(item))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog tambah */}
      <MenuItemDialog
        open={showCreate}
        onOpenChange={(o) => {
          setShowCreate(o)
          if (!o) setCreateParentId(null)
        }}
        location={location}
        parentId={createParentId}
        parentItems={parentItems}
        onSuccess={(newItem) => {
          setItems((prev) => [...prev, newItem])
          router.refresh()
        }}
      />

      {/* Dialog edit */}
      {editItem && (
        <MenuItemDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          location={location}
          item={editItem}
          parentItems={parentItems.filter((p) => p.id !== editItem.id)}
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
