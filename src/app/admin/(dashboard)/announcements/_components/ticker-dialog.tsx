// src/app/admin/(dashboard)/announcements/_components/ticker-dialog.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as LucideIcons from 'lucide-react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import type { TickerItem } from '../_actions/announcements-actions'
import { createTickerItemAction, updateTickerItemAction } from '../_actions/announcements-actions'

const schema = z.object({
  text: z.string().min(3, 'Teks minimal 3 karakter'),
  icon: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

// Preset icon cepat
const QUICK_ICONS = [
  { name: 'AlertTriangle', label: '⚠️ Peringatan' },
  { name: 'Bell', label: '🔔 Pengumuman' },
  { name: 'Info', label: 'ℹ️ Informasi' },
  { name: 'Megaphone', label: '📢 Siaran' },
  { name: 'CheckCircle', label: '✅ Selesai' },
  { name: 'XCircle', label: '❌ Batal' },
  { name: 'Flame', label: '🔥 Karhutla' },
  { name: 'Waves', label: '🌊 Banjir' },
  { name: 'CloudRain', label: '🌧️ Hujan' },
  { name: 'Wind', label: '💨 Angin' },
]

function IconPreview({ name }: { name?: string }) {
  if (!name)
    return <div className="h-7 w-7 rounded-lg border border-dashed border-slate-300 bg-slate-100" />
  const Icon = (LucideIcons as any)[name] ?? AlertTriangle
  return (
    <div className="bg-navy-100 flex h-7 w-7 items-center justify-center rounded-lg">
      <Icon className="text-navy-700 h-4 w-4" />
    </div>
  )
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  item?: TickerItem
  onSuccess: (item: any) => void
}

export function TickerDialog({ open, onOpenChange, item, onSuccess }: Props) {
  const isEdit = !!item

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: item?.text ?? '',
      icon: item?.icon ?? '',
      isActive: item?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        text: item?.text ?? '',
        icon: item?.icon ?? '',
        isActive: item?.isActive ?? true,
      })
    }
  }, [open, item])

  const { isSubmitting } = form.formState
  const watchedIcon = form.watch('icon')

  async function onSubmit(values: FormValues) {
    const res = isEdit
      ? await updateTickerItemAction(item.id, values)
      : await createTickerItemAction(values)

    if (res.success) {
      toast.success(isEdit ? 'Ticker diperbarui' : 'Ticker ditambahkan')
      onSuccess({ ...values, id: item?.id ?? crypto.randomUUID(), order: 0 })
      onOpenChange(false)
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Ticker' : 'Tambah Ticker'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Icon picker */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  {/* Quick select */}
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {QUICK_ICONS.map((qi) => {
                      const Icon = (LucideIcons as any)[qi.name] ?? AlertTriangle
                      const active = field.value === qi.name
                      return (
                        <button
                          key={qi.name}
                          type="button"
                          onClick={() => field.onChange(active ? '' : qi.name)}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                            active
                              ? 'border-navy-500 bg-navy-50 text-navy-700 font-medium'
                              : 'border-border text-muted-foreground hover:border-navy-300 bg-white'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {qi.label}
                        </button>
                      )
                    })}
                  </div>
                  {/* Manual input */}
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="Nama icon Lucide (opsional)..." {...field} />
                    </FormControl>
                    <IconPreview name={watchedIcon} />
                  </div>
                  <FormDescription className="text-[11px]">
                    Pilih dari preset atau ketik nama icon dari lucide.dev
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teks */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teks Ticker</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="BMKG: Waspadai potensi hujan lebat di Kutai Kartanegara..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  {/* Live preview */}
                  {field.value && (
                    <div className="bg-navy-800 flex items-center gap-2 rounded-lg px-3 py-2">
                      {watchedIcon &&
                        (() => {
                          const Icon = (LucideIcons as any)[watchedIcon]
                          return Icon ? (
                            <Icon className="h-3.5 w-3.5 shrink-0 text-orange-300" />
                          ) : null
                        })()}
                      <span className="text-navy-100 text-xs">{field.value}</span>
                    </div>
                  )}
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
                    <FormDescription>Tampil di ticker homepage</FormDescription>
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
