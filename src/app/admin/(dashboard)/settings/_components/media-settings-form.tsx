// src/app/admin/(dashboard)/settings/_components/media-settings-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { saveSettingsAction } from '../_actions/settings-actions'

interface Props {
  settings: Record<string, string>
}

const ALL_TYPES = [
  { value: 'image/jpeg', label: 'JPG / JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/gif', label: 'GIF' },
]

export function MediaSettingsForm({ settings }: Props) {
  const form = useForm({
    defaultValues: {
      upload_max_size_mb: settings.upload_max_size_mb ?? '5',
      upload_allowed_types:
        settings.upload_allowed_types ?? 'image/jpeg,image/png,image/webp,image/gif',
      download_categories:
        settings.download_categories ?? 'Laporan,Regulasi,SOP,Panduan,Edukasi,Formulir,Lainnya',
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: Record<string, string>) {
    const res = await saveSettingsAction(values)
    if (res.success) toast.success('Pengaturan berhasil disimpan')
    else toast.error(res.error ?? 'Terjadi kesalahan')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-5">
        {/* Batas ukuran upload */}
        <FormField
          control={form.control}
          name="upload_max_size_mb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batas Ukuran Upload Gambar (MB)</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={50} className="w-32" {...field} />
              </FormControl>
              <FormDescription>
                Ukuran maksimal per file gambar. Saat ini: {field.value} MB. Dokumen (PDF, DOCX,
                dll) maksimal 20MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Format gambar yang diizinkan */}
        <FormField
          control={form.control}
          name="upload_allowed_types"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format Gambar yang Diizinkan</FormLabel>
              <div className="mt-2 space-y-2">
                {ALL_TYPES.map((type) => {
                  const checked = field.value.includes(type.value)
                  return (
                    <div
                      key={type.value}
                      className="border-border flex items-center justify-between rounded-lg border px-4 py-2.5"
                    >
                      <span className="text-sm font-medium">{type.label}</span>
                      <Switch
                        checked={checked}
                        onCheckedChange={(val) => {
                          const current = field.value.split(',').filter(Boolean)
                          const updated = val
                            ? [...current, type.value]
                            : current.filter((t) => t !== type.value)
                          field.onChange(updated.join(','))
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Kategori unduhan */}
        <FormField
          control={form.control}
          name="download_categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Unduhan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Laporan, Regulasi, SOP, Panduan, Edukasi, Formulir, Lainnya"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Pisahkan dengan koma. Contoh:{' '}
                <code className="bg-muted rounded px-1 text-xs">Laporan, Regulasi, SOP</code>.
                Perubahan langsung berlaku di form tambah dokumen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan
        </Button>
      </form>
    </Form>
  )
}
