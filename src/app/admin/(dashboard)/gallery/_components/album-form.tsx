// src/app/admin/(dashboard)/gallery/_components/album-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { MediaPicker } from '@/app/admin/(dashboard)/media/_components/media-picker'

const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  type: z.enum(['photo', 'video', 'mixed']),
  isActive: z.boolean(),
})

export type AlbumFormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<AlbumFormValues>
  onSubmit: (v: AlbumFormValues) => Promise<void>
  submitLabel: string
}

export function AlbumForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      coverUrl: '',
      type: 'photo',
      isActive: true,
      ...defaultValues,
    },
  })

  const { isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Album</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Simulasi Evakuasi Banjir 2026" {...field} />
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
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat album..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Album</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="photo">📷 Foto</SelectItem>
                  <SelectItem value="video">🎬 Video</SelectItem>
                  <SelectItem value="mixed">🗂️ Campuran (Foto & Video)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Album</FormLabel>
              <MediaPicker value={field.value} onChange={field.onChange} />
              <FormDescription>Gambar cover yang tampil di daftar album.</FormDescription>
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
                <FormDescription>Album tampil di galeri publik</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
