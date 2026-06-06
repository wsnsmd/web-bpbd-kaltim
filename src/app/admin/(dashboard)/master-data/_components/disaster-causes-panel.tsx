// src/app/admin/(dashboard)/master-data/_components/disaster-causes-panel.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface DisasterCause {
  id: number
  name: string
  isActive: boolean | null
}

const causeSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  isActive: z.boolean(),
})

function CauseDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  item?: DisasterCause | null
  onSuccess: (item: any) => void
}) {
  const isEdit = !!item
  const form = useForm({
    resolver: zodResolver(causeSchema),
    defaultValues: { name: item?.name ?? '', isActive: item?.isActive ?? true },
  })
  const { isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof causeSchema>) {
    const res = isEdit
      ? await (
          await import('../_actions/master-data-actions')
        ).updateDisasterCauseAction(item!.id, values)
      : await (await import('../_actions/master-data-actions')).createDisasterCauseAction(values)
    if (res.success) {
      toast.success(isEdit ? 'Diperbarui' : 'Ditambahkan')
      onSuccess({ ...values, id: item?.id ?? Date.now() })
      onOpenChange(false)
    } else {
      toast.error(res.error ?? 'Gagal')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Penyebab' : 'Tambah Penyebab'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Penyebab</FormLabel>
                  <FormControl>
                    <Input placeholder="Konsleting Listrik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <FormLabel>Aktif</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isEdit ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function DisasterCausesPanel({ initialItems }: { initialItems: DisasterCause[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [editItem, setEditItem] = useState<DisasterCause | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Hapus penyebab "${name}"?`)) return
    const { deleteDisasterCauseAction } = await import('../_actions/master-data-actions')
    const res = await deleteDisasterCauseAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Dihapus')
    } else toast.error('Gagal')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{items.length} penyebab terdaftar</p>
        <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Tambah Penyebab
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl p-0">
        <CardContent className="p-0">
          {items.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Belum ada penyebab terdaftar.
            </p>
          ) : (
            <ul className="divide-y">
              {items
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-slate-50 ${!item.isActive ? 'opacity-50' : ''}`}
                  >
                    <span className="text-navy-800 flex-1 text-sm">{item.name}</span>
                    {!item.isActive && (
                      <Badge variant="secondary" className="text-[10px]">
                        Nonaktif
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditItem(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id, item.name)}
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

      <CauseDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={(item) => {
          setItems((prev) => [...prev, item])
          router.refresh()
        }}
      />
      {editItem && (
        <CauseDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
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
