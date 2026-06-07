// src/app/admin/(dashboard)/homepage/services/_components/service-dialog.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as LucideIcons from 'lucide-react'
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
import { createServiceAction, updateServiceAction } from '../_actions/services-actions'

const schema = z.object({
  label: z.string().min(1, 'Label wajib diisi'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon wajib diisi'),
  href: z.string().min(1, 'URL wajib diisi'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ServiceItem {
  id: number
  label: string
  description: string | null
  icon: string
  href: string
  isActive: boolean | null
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  item?: ServiceItem
  onSuccess: (item: any) => void
}

function IconPreview({ name }: { name: string }) {
  const Icon = (LucideIcons as any)[name]
  if (!Icon) return <span className="text-muted-foreground text-xs">Icon tidak ditemukan</span>
  return (
    <div className="bg-navy-100 flex h-10 w-10 items-center justify-center rounded-lg">
      <Icon className="text-navy-700 h-5 w-5" />
    </div>
  )
}

export function ServiceDialog({ open, onOpenChange, item, onSuccess }: Props) {
  const isEdit = !!item

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: item?.label ?? '',
      description: item?.description ?? '',
      icon: item?.icon ?? 'Circle',
      href: item?.href ?? '/',
      isActive: item?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        label: item?.label ?? '',
        description: item?.description ?? '',
        icon: item?.icon ?? 'Circle',
        href: item?.href ?? '/',
        isActive: item?.isActive ?? true,
      })
    }
  }, [open, item, form])

  const { isSubmitting } = form.formState
  const watchedIcon = form.watch('icon')

  async function onSubmit(values: FormValues) {
    const res = isEdit
      ? await updateServiceAction(item!.id, values)
      : await createServiceAction(values)

    if (res.success) {
      toast.success(isEdit ? 'Layanan diperbarui' : 'Layanan ditambahkan')
      onSuccess({ ...values, id: item?.id ?? Date.now() })
      onOpenChange(false)
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Publikasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Berita & Pengumuman" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/berita" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon Lucide</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input placeholder="Contoh: Newspaper, BookOpen" {...field} />
                    </FormControl>
                    <IconPreview name={watchedIcon} />
                  </div>
                  <FormDescription>
                    Nama icon dari{' '}
                    <a
                      href="https://lucide.dev/icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-600 underline"
                    >
                      lucide.dev/icons
                    </a>
                  </FormDescription>
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
                    <FormDescription>Tampil di homepage</FormDescription>
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
