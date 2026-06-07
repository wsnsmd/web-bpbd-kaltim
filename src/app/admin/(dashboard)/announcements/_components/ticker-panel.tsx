// src/app/admin/(dashboard)/announcements/_components/ticker-panel.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GripVertical, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Gauge } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { TickerItem } from '../_actions/announcements-actions'
import {
  reorderTickerItemsAction,
  deleteTickerItemAction,
  toggleTickerItemAction,
  saveTickerSpeedAction,
} from '../_actions/announcements-actions'
import { TickerDialog } from './ticker-dialog'

interface Props {
  initialItems: TickerItem[]
  initialSpeed: number // detik, default 40
}

const SPEED_LABELS: Record<number, string> = {
  15: 'Sangat Cepat',
  25: 'Cepat',
  40: 'Normal',
  60: 'Lambat',
  90: 'Sangat Lambat',
}

function getSpeedLabel(val: number) {
  const key = [15, 25, 40, 60, 90].reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  )
  return SPEED_LABELS[key] ?? `${val}s`
}

function DynamicIcon({ name }: { name?: string }) {
  if (!name) return null
  const Icon = (LucideIcons as any)[name]
  if (!Icon) return null
  return <Icon className="h-4 w-4 shrink-0 text-orange-400" />
}

export function TickerPanel({ initialItems, initialSpeed }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [speed, setSpeed] = useState(initialSpeed)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingSpeed, setSavingSpeed] = useState(false)
  const [editItem, setEditItem] = useState<TickerItem | null>(null)
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
    const res = await reorderTickerItemsAction(reordered.map((i) => i.id))
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
    const res = await toggleTickerItemAction(id, !current)
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
    } else {
      toast.error('Gagal')
    }
  }

  async function handleDelete(id: string, text: string) {
    if (!confirm(`Hapus ticker "${text.slice(0, 40)}..."?`)) return
    const res = await deleteTickerItemAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Ticker dihapus')
    } else {
      toast.error('Gagal')
    }
  }

  async function handleSaveSpeed() {
    setSavingSpeed(true)
    const res = await saveTickerSpeedAction(speed)
    setSavingSpeed(false)
    if (res.success) {
      toast.success('Kecepatan disimpan')
      router.refresh()
    } else {
      toast.error('Gagal menyimpan kecepatan')
    }
  }

  const activeItems = items.filter((i) => i.isActive)

  return (
    <div className="space-y-4">
      {/* Preview ticker */}
      {activeItems.length > 0 && (
        <Card className="w-full overflow-hidden p-0">
          <div
            className="bg-navy-800 overflow-hidden border-2 border-orange-500"
            style={{ '--ticker-duration': `${speed}s` } as React.CSSProperties}
          >
            <div className="flex items-stretch">
              <div className="flex shrink-0 items-center gap-2 bg-orange-500 px-4 py-2 text-[11px] font-bold tracking-widest text-white uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Info
              </div>
              <div className="relative w-0 flex-1 overflow-hidden py-2">
                {/* Gunakan inline style untuk duration dinamis */}
                <div
                  className="animate-ticker inline-flex whitespace-nowrap"
                  style={{ animationDuration: `${speed}s` }}
                >
                  {activeItems.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-8">
                      <DynamicIcon name={item.icon} />
                      <span className="text-navy-100 text-[13px] font-medium">{item.text}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Speed control */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Gauge className="text-navy-600 h-4 w-4" />
            Kecepatan Scroll
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground w-16 shrink-0 text-xs">Cepat</span>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              className="flex-1"
            />
            <span className="text-muted-foreground w-16 shrink-0 text-right text-xs">Lambat</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-navy-700 text-sm font-medium">
              {getSpeedLabel(speed)}
              <span className="text-muted-foreground ml-1 text-xs">({speed}s per putaran)</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveSpeed}
              disabled={savingSpeed || speed === initialSpeed}
            >
              {savingSpeed && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Simpan Kecepatan
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} item · {activeItems.length} aktif · seret untuk mengubah urutan
        </p>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
            </span>
          )}
          <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Tambah Ticker
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">Belum ada ticker.</div>
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
                  {item.icon && (
                    <div className="bg-navy-100 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                      <DynamicIcon name={item.icon} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.text}</p>
                  </div>

                  {!item.isActive && (
                    <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[10px]">
                      Nonaktif
                    </Badge>
                  )}

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
                      onClick={() => handleDelete(item.id, item.text)}
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

      <TickerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={(item) => {
          setItems((prev) => [...prev, item])
          router.refresh()
        }}
      />
      {editItem && (
        <TickerDialog
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
