// src/app/admin/(dashboard)/gallery/_components/gallery-item-dialog.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaPicker } from '@/app/admin/(dashboard)/media/_components/media-picker'
import { createItemAction, updateItemAction } from '../_actions/gallery-actions'

const schema = z.object({
  type: z.enum(['photo', 'video']),
  title: z.string().min(1, 'Judul wajib diisi'),
  caption: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

// Ekstrak YouTube video ID
function getYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

function getYoutubeThumbnail(url: string | null | undefined): string | null {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  albumId: number
  albumType: string
  item?: any
  onSuccess: (item: any) => void
}

export function GalleryItemDialog({
  open,
  onOpenChange,
  albumId,
  albumType,
  item,
  onSuccess,
}: Props) {
  const isEdit = !!item
  const defaultType = albumType === 'video' ? 'video' : 'photo'
  const [autoThumb, setAutoThumb] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: item?.type ?? defaultType,
      title: item?.title ?? '',
      caption: item?.caption ?? '',
      thumbnailUrl: item?.thumbnailUrl ?? '',
      videoUrl: item?.videoUrl ?? '',
      isActive: item?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        type: item?.type ?? defaultType,
        title: item?.title ?? '',
        caption: item?.caption ?? '',
        thumbnailUrl: item?.thumbnailUrl ?? '',
        videoUrl: item?.videoUrl ?? '',
        isActive: item?.isActive ?? true,
      })
      setAutoThumb(getYoutubeThumbnail(item?.videoUrl))
    }
  }, [open, item, defaultType, form])

  const { isSubmitting } = form.formState
  const watchedType = form.watch('type')
  const watchedVideoUrl = form.watch('videoUrl')

  // Auto-preview thumbnail dari YouTube saat URL berubah
  useEffect(() => {
    setAutoThumb(getYoutubeThumbnail(watchedVideoUrl))
  }, [watchedVideoUrl])

  async function onSubmit(values: FormValues) {
    const payload = { ...values, albumId }
    const res = isEdit ? await updateItemAction(item.id, payload) : await createItemAction(payload)

    if (res.success) {
      toast.success(isEdit ? 'Item diperbarui' : 'Item ditambahkan')
      onSuccess({ ...payload, id: item?.id ?? Date.now() })
      onOpenChange(false)
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Item' : 'Tambah Item'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {albumType === 'mixed' && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="photo">📷 Foto</SelectItem>
                        <SelectItem value="video">🎬 Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Judul foto/video..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Keterangan singkat..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL Video dulu agar thumbnail auto muncul sebelum MediaPicker */}
            {watchedType === 'video' && (
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Video</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                    </FormControl>
                    <FormDescription>YouTube atau URL embed lainnya.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Thumbnail — untuk video tampilkan preview auto + opsi upload manual */}
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{watchedType === 'photo' ? 'Foto' : 'Thumbnail (Opsional)'}</FormLabel>

                  {/* Preview thumbnail — manual atau auto YouTube */}
                  {watchedType === 'video' && !field.value && autoThumb && (
                    <div className="space-y-2">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={autoThumb}
                          alt="Auto thumbnail YouTube"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        ✅ Thumbnail otomatis dari YouTube. Upload manual di bawah jika ingin
                        mengganti.
                      </p>
                    </div>
                  )}

                  <MediaPicker value={field.value} onChange={field.onChange} />
                  {watchedType === 'video' && (
                    <FormDescription>
                      Kosongkan untuk pakai thumbnail YouTube otomatis.
                    </FormDescription>
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
                    <FormDescription>Tampil di galeri publik</FormDescription>
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
