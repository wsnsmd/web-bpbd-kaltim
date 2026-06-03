// src/app/admin/(dashboard)/downloads/_components/download-dialog.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_DOWNLOAD_CATEGORIES } from '@db/schema/downloads'
import { FileUploadInput } from '@/components/ui/file-upload-input'
import { createDownloadAction, updateDownloadAction } from '../_actions/downloads-actions'

const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  fileUrl: z.string().min(1, 'File wajib diupload'),
  fileType: z.string(),
  fileSize: z.string().optional(),
  icon: z.string(),
  colorScheme: z.enum(['danger', 'caution', 'warning', 'safe', 'navy']),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

// Fix warna — pakai hex langsung bukan CSS variable agar Tailwind v4 bisa resolve
const COLOR_SCHEMES = [
  { value: 'danger', label: 'Merah', bg: '#fef0e6', text: '#6b2100' },
  { value: 'caution', label: 'Biru', bg: '#ebf3fd', text: '#0f2d5c' },
  { value: 'warning', label: 'Kuning', bg: '#fdf7e0', text: '#573a00' },
  { value: 'safe', label: 'Hijau', bg: '#f0fdf4', text: '#14532d' },
  { value: 'navy', label: 'Navy', bg: '#ebf3fd', text: '#0f2d5c' },
] as const

const FILE_TYPE_ICONS: Record<string, string> = {
  PDF: 'FileText',
  DOCX: 'FileType',
  DOC: 'FileType',
  XLSX: 'FileSpreadsheet',
  XLS: 'FileSpreadsheet',
  PPT: 'Presentation',
  PPTX: 'Presentation',
  ZIP: 'FileArchive',
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  item?: any
  onSuccess: (item: any) => void
  categories?: string[]
}

function IconPreview({ name, scheme }: { name: string; scheme: string }) {
  const Icon = (LucideIcons as any)[name] ?? LucideIcons.FileText
  const schemeObj = COLOR_SCHEMES.find((s) => s.value === scheme) ?? COLOR_SCHEMES[4]
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      style={{ background: schemeObj.bg }}
    >
      <Icon className="h-4 w-4" style={{ color: schemeObj.text }} />
    </div>
  )
}

export function DownloadDialog({ open, onOpenChange, item, onSuccess, categories }: Props) {
  const isEdit = !!item
  const catList = categories?.length ? categories : DEFAULT_DOWNLOAD_CATEGORIES

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item?.title ?? '',
      category: item?.category ?? catList[0],
      fileUrl: item?.fileUrl ?? '',
      fileType: item?.fileType ?? 'PDF',
      fileSize: item?.fileSize ?? '',
      icon: item?.icon ?? 'FileText',
      colorScheme: item?.colorScheme ?? 'navy',
      isActive: item?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: item?.title ?? '',
        category: item?.category ?? catList[0],
        fileUrl: item?.fileUrl ?? '',
        fileType: item?.fileType ?? 'PDF',
        fileSize: item?.fileSize ?? '',
        icon: item?.icon ?? 'FileText',
        colorScheme: item?.colorScheme ?? 'navy',
        isActive: item?.isActive ?? true,
      })
    }
  }, [open, item])

  const { isSubmitting } = form.formState
  const watchedIcon = form.watch('icon')
  const watchedScheme = form.watch('colorScheme')
  const watchedFileSize = form.watch('fileSize')

  async function onSubmit(values: FormValues) {
    const res = isEdit
      ? await updateDownloadAction(item.id, values)
      : await createDownloadAction(values)

    if (res.success) {
      toast.success(isEdit ? 'Dokumen diperbarui' : 'Dokumen ditambahkan')
      onSuccess({ ...values, id: item?.id ?? Date.now() })
      onOpenChange(false)
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Dokumen' : 'Tambah Dokumen'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Upload file */}
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Dokumen</FormLabel>
                  <FileUploadInput
                    value={field.value}
                    fileSize={watchedFileSize}
                    onChange={(url, size, type, name) => {
                      field.onChange(url)
                      form.setValue('fileSize', size)
                      form.setValue('fileType', type || 'PDF')
                      form.setValue('icon', FILE_TYPE_ICONS[type] ?? 'FileText')
                      if (!form.getValues('title') && name) {
                        form.setValue('title', name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
                      }
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Judul */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Dokumen</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Laporan Tahunan BPBD Kaltim 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori & Tipe File — grid 2 kolom */}
            <div className="grid grid-cols-2 gap-3">
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
                        {catList.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe File</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="text-muted-foreground bg-slate-50" />
                    </FormControl>
                    <FormDescription className="text-[11px]">Otomatis dari upload</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Icon & Warna — grid 2 kolom, icon punya preview inline */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="FileText, Book..." {...field} />
                      </FormControl>
                      <IconPreview name={watchedIcon} scheme={watchedScheme} />
                    </div>
                    <FormDescription className="text-[11px]">Auto dari tipe file</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorScheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COLOR_SCHEMES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <div className="flex items-center gap-2">
                              {/* Dot warna pakai inline style — tidak bergantung Tailwind dynamic */}
                              <span
                                className="h-3 w-3 rounded-full border border-black/10"
                                style={{ background: s.bg, outline: `2px solid ${s.text}20` }}
                              />
                              {s.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Aktif */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <FormLabel>Aktif</FormLabel>
                    <FormDescription>Tampil di homepage dan halaman unduhan</FormDescription>
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
