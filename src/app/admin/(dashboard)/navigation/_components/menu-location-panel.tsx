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
  reorderSubmenuItemsAction,
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
  const [draggingChild, setDraggingChild] = useState<number | null>(null)
  const [dragOverChild, setDragOverChild] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createParentId, setCreateParentId] = useState<number | null>(null)

  const parentItems = items.filter((i) => !i.parentId)
  const getChildren = (parentId: number) =>
    items.filter((i) => i.parentId === parentId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  // ── Drag parent ──────────────────────────────────────────
  async function handleParentDrop(targetId: number) {
    if (dragging === null || dragging === targetId) {
      setDragging(null)
      setDragOver(null)
      return
    }
    const reordered = [...parentItems]
    const [moved] = reordered.splice(
      reordered.findIndex((i) => i.id === dragging),
      1
    )
    reordered.splice(
      reordered.findIndex((i) => i.id === targetId),
      0,
      moved
    )

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
      toast.error('Gagal')
      setItems(initialItems)
    }
  }

  // ── Drag submenu — pakai ref snapshot ────────────────────
  async function handleChildDrop(parentId: number, targetChildId: number, sourceChildId: number) {
    if (sourceChildId === targetChildId) {
      setDraggingChild(null)
      setDragOverChild(null)
      return
    }

    // Ambil siblings langsung dari items state saat ini
    const siblings = items
      .filter((i) => i.parentId === parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const dragIdx = siblings.findIndex((i) => i.id === sourceChildId)
    const targetIdx = siblings.findIndex((i) => i.id === targetChildId)

    if (dragIdx === -1 || targetIdx === -1) {
      setDraggingChild(null)
      setDragOverChild(null)
      return
    }

    // Reorder array
    const reordered = [...siblings]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(targetIdx, 0, moved)

    // Update order field
    const reorderedWithOrder = reordered.map((item, idx) => ({ ...item, order: idx + 1 }))

    // Update state — ganti siblings, pertahankan item lain
    const otherItems = items.filter((i) => i.parentId !== parentId)
    setItems([...otherItems, ...reorderedWithOrder])
    setDraggingChild(null)
    setDragOverChild(null)

    // Simpan ke DB
    setSaving(true)
    const res = await reorderSubmenuItemsAction(reorderedWithOrder.map((i) => i.id))
    setSaving(false)
    if (res.success) toast.success('Urutan submenu disimpan')
    else {
      toast.error('Gagal')
      setItems(initialItems)
    }
  }

  // ── Toggle ───────────────────────────────────────────────
  async function handleToggle(id: number, current: boolean) {
    const res = await toggleMenuItemAction(id, !current)
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
    } else {
      toast.error('Gagal')
    }
  }

  // ── Delete ───────────────────────────────────────────────
  async function handleDelete(id: number, label: string) {
    if (items.some((i) => i.parentId === id)) {
      toast.error('Hapus submenu terlebih dahulu')
      return
    }
    if (!confirm(`Hapus "${label}"?`)) return
    const res = await deleteMenuItemAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Item dihapus')
    } else {
      toast.error('Gagal')
    }
  }

  // ── Render parent + children ─────────────────────────────
  function renderParent(item: MenuItem) {
    const children = getChildren(item.id)
    const hasChildren = children.length > 0

    return (
      <div key={item.id}>
        {/* Parent row */}
        <div
          draggable
          onDragStart={() => setDragging(item.id)}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(item.id)
          }}
          onDrop={() => handleParentDrop(item.id)}
          onDragEnd={() => {
            setDragging(null)
            setDragOver(null)
          }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 transition-colors',
            dragging === item.id && 'opacity-40',
            dragOver === item.id && dragging !== item.id && 'bg-navy-50 border-navy-500 border-l-2',
            !item.isActive && 'opacity-50'
          )}
        >
          <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab" />
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
          <div className="flex shrink-0 items-center gap-1">
            {location === 'main_nav' && (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Tambah Submenu"
                className="text-navy-500 hover:text-navy-700"
                onClick={() => {
                  setCreateParentId(item.id)
                  setShowCreate(true)
                }}
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

        {/* Children rows — drag independen dari parent */}
        {hasChildren && (
          <div className="divide-y border-b bg-slate-50/60">
            {children.map((child) => (
              <div
                key={child.id}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation()
                  setDraggingChild(child.id)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (dragOverChild !== child.id) setDragOverChild(child.id)
                }}
                onDrop={(e) => {
                  e.stopPropagation()
                  // Kirim sourceChildId eksplisit — bukan dari state yang mungkin stale
                  const src = draggingChild
                  if (src !== null) handleChildDrop(item.id, child.id, src)
                }}
                onDragEnd={(e) => {
                  e.stopPropagation()
                  setDraggingChild(null)
                  setDragOverChild(null)
                }}
                className={cn(
                  'flex items-center gap-3 py-2.5 pr-4 pl-10 transition-colors',
                  draggingChild === child.id && 'opacity-40',
                  dragOverChild === child.id &&
                    draggingChild !== child.id &&
                    'border-l-2 border-orange-400 bg-orange-50',
                  !child.isActive && 'opacity-50'
                )}
              >
                <GripVertical className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-grab" />
                <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-medium">{child.label}</span>
                    {!child.isActive && (
                      <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                        Nonaktif
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate text-[11px]">{child.url}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggle(child.id, child.isActive ?? true)}
                    className={child.isActive ? 'text-green-600' : 'text-muted-foreground'}
                  >
                    {child.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditItem(child)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(child.id, child.label)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
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
            {parentItems.length} item · seret ☰ untuk mengubah urutan
            {location === 'main_nav' && ' · submenu juga bisa diurutkan'}
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
                .map((item) => renderParent(item))}
            </div>
          )}
        </CardContent>
      </Card>

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
        }}
      />
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
          }}
        />
      )}
    </div>
  )
}
