// src/app/admin/(dashboard)/navigation/_components/menu-item-dialog.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { createMenuItemAction, updateMenuItemAction } from '../_actions/navigation-actions'
import type { MenuLocation } from '@db/schema/navigation'

const schema = z.object({
  label: z.string().min(1, 'Label wajib diisi'),
  url: z.string().min(1, 'URL wajib diisi'),
  icon: z.string().optional(),
  target: z.enum(['_self', '_blank']),
  isActive: z.boolean(),
  parentId: z.number().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface MenuItem {
  id: number
  label: string
  url: string
  icon: string | null
  target: string | null
  isActive: boolean | null
  parentId?: number | null
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  location: MenuLocation
  item?: MenuItem
  parentId?: number | null // Pre-set parent saat klik tombol + pada item
  parentItems?: MenuItem[] // Daftar parent yang bisa dipilih
  onSuccess: (item: any) => void
}

export function MenuItemDialog({
  open,
  onOpenChange,
  location,
  item,
  parentId,
  parentItems = [],
  onSuccess,
}: Props) {
  const isEdit = !!item
  const isSubmenu = location === 'main_nav'

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: item?.label ?? '',
      url: item?.url ?? '#',
      icon: item?.icon ?? '',
      target: (item?.target as '_self' | '_blank') ?? '_self',
      isActive: item?.isActive ?? true,
      parentId: item?.parentId ?? parentId ?? null,
    },
  })

  // Reset form saat dialog dibuka ulang
  useEffect(() => {
    if (open) {
      form.reset({
        label: item?.label ?? '',
        url: item?.url ?? '#',
        icon: item?.icon ?? '',
        target: (item?.target as '_self' | '_blank') ?? '_self',
        isActive: item?.isActive ?? true,
        parentId: item?.parentId ?? parentId ?? null,
      })
    }
  }, [open, item, parentId, form])

  const { isSubmitting } = form.formState
  const watchedParentId = form.watch('parentId')

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      location,
      parentId: values.parentId ?? undefined,
    }

    const res = isEdit
      ? await updateMenuItemAction(item!.id, payload)
      : await createMenuItemAction(payload)

    if (res.success) {
      toast.success(isEdit ? 'Item diperbarui' : 'Item ditambahkan')
      onSuccess({ ...payload, id: item?.id ?? Date.now() })
      onOpenChange(false)
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  const selectedParent = parentItems.find((p) => p.id === watchedParentId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Item Menu' : parentId ? `Tambah Submenu` : 'Tambah Item Menu'}
          </DialogTitle>
          {parentId && selectedParent && (
            <p className="text-muted-foreground text-sm">
              Submenu dari:{' '}
              <span className="text-navy-700 font-medium">{selectedParent.label}</span>
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Parent selector — hanya main_nav */}
            {isSubmenu && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Item</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                      value={field.value == null ? 'none' : String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="font-medium">Menu Utama</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            tampil di navbar
                          </span>
                        </SelectItem>
                        {parentItems.length > 0 && (
                          <>
                            <Separator className="my-1" />
                            {parentItems.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                <span>Submenu dari: </span>
                                <span className="font-medium">{p.label}</span>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih "Menu Utama" untuk item level pertama, atau pilih parent untuk membuat
                      submenu dropdown.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Visi & Misi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/profil/visi-misi atau https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Gunakan <code className="bg-muted rounded px-1 text-xs">#</code> jika item hanya
                    sebagai header dropdown tanpa link.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {location === 'instansi_bar' && (
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Building2, Flame, Cloud" {...field} />
                    </FormControl>
                    <FormDescription>Nama icon dari Lucide React.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buka di</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_self">Tab yang sama</SelectItem>
                      <SelectItem value="_blank">Tab baru</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <FormLabel>Aktif</FormLabel>
                    <FormDescription>Item tampil di navigasi publik</FormDescription>
                  </div>
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
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
