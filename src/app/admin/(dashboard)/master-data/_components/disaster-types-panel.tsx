// src/app/admin/(dashboard)/master-data/_components/disaster-types-panel.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  createDisasterTypeAction,
  updateDisasterTypeAction,
  deleteDisasterTypeAction,
  toggleDisasterTypeAction,
} from '../_actions/master-data-actions'

interface DisasterType {
  id: number
  name: string
  category: string
  icon: string | null
  color: string | null
  isActive: boolean | null
  sortOrder: number | null
}

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  category: z.enum(['alam', 'non_alam']),
  icon: z.string().max(10),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Format: #rrggbb'),
  sortOrder: z.number(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

function TypeDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  item?: DisasterType | null
  onSuccess: (item: any) => void
}) {
  const isEdit = !!item
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name ?? '',
      category: (item?.category as any) ?? 'alam',
      icon: item?.icon ?? '⚠️',
      color: item?.color ?? '#6b7592',
      sortOrder: item?.sortOrder ?? 0,
      isActive: item?.isActive ?? true,
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: FormValues) {
    const res = isEdit
      ? await updateDisasterTypeAction(item!.id, values)
      : await createDisasterTypeAction(values)
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
          <DialogTitle>{isEdit ? 'Edit Jenis Bencana' : 'Tambah Jenis Bencana'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Banjir" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="alam">🌿 Alam</SelectItem>
                      <SelectItem value="non_alam">🏭 Non Alam</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Emoji)</FormLabel>
                    <FormControl>
                      <Input placeholder="🌊" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna (Hex)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="#2e72c9" {...field} />
                      </FormControl>
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border p-0.5"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urutan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="mt-5 flex items-center justify-between gap-2 rounded-lg border p-3">
                    <FormLabel className="text-sm">Aktif</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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

export function DisasterTypesPanel({ initialItems }: { initialItems: DisasterType[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [editItem, setEditItem] = useState<DisasterType | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function handleToggle(id: number, current: boolean) {
    const res = await toggleDisasterTypeAction(id, !current)
    if (res.success)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)))
    else toast.error('Gagal')
  }

  async function handleDelete(id: number, name: string) {
    if (
      !confirm(
        `Hapus "${name}"? Data kejadian yang menggunakan jenis ini akan kehilangan referensi.`
      )
    )
      return
    const res = await deleteDisasterTypeAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Dihapus')
    } else toast.error('Gagal menghapus')
  }

  const alamItems = items
    .filter((i) => i.category === 'alam')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const nonAlamItems = items
    .filter((i) => i.category === 'non_alam')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  function renderItem(item: DisasterType) {
    return (
      <div
        key={item.id}
        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${!item.isActive ? 'opacity-50' : ''}`}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: `${item.color ?? '#6b7592'}20` }}
        >
          {item.icon ?? '⚠️'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-navy-800 text-sm font-medium">{item.name}</span>
            {!item.isActive && (
              <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                Nonaktif
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {item.category === 'alam' ? '🌿 Alam' : '🏭 Non Alam'}
            </span>
            <span className="text-muted-foreground text-xs">· Urutan: {item.sortOrder}</span>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              ·{' '}
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: item.color ?? '#6b7592' }}
              />
              {item.color}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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
            onClick={() => handleDelete(item.id, item.name)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{items.length} jenis bencana terdaftar</p>
        <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Tambah Jenis
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl p-0">
          <div className="border-b bg-green-50 px-5 py-3">
            <p className="text-sm font-semibold text-green-800">🌿 Alam ({alamItems.length})</p>
          </div>
          <CardContent className="p-0">
            {alamItems.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">Belum ada data</p>
            ) : (
              <div className="divide-y">{alamItems.map(renderItem)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl p-0">
          <div className="border-b bg-slate-50 px-5 py-3">
            <p className="text-sm font-semibold text-slate-700">
              🏭 Non Alam ({nonAlamItems.length})
            </p>
          </div>
          <CardContent className="p-0">
            {nonAlamItems.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">Belum ada data</p>
            ) : (
              <div className="divide-y">{nonAlamItems.map(renderItem)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <TypeDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={(item) => {
          setItems((prev) => [...prev, item])
          router.refresh()
        }}
      />
      {editItem && (
        <TypeDialog
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
