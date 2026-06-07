// src/app/admin/(dashboard)/news/_components/news-form.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Eye, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { TiptapEditor } from './tiptap-editor'
import { createNewsAction, updateNewsAction, type NewsFormValues } from '../_actions/news-actions'
import { MediaPicker } from '@/app/admin/(dashboard)/media/_components/media-picker'

const schema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan -'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Konten terlalu pendek'),
  // Fix 1: hapus validasi URL — value dari MediaPicker adalah path lokal (/uploads/...)
  featuredImage: z.string().optional(),
  categoryId: z.number().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  isFeatured: z.boolean(),
  // Fix 4: tambah publishedAt
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Category {
  id: number
  name: string
}

interface Props {
  mode: 'create' | 'edit'
  newsId?: string
  defaultValues?: Partial<FormValues>
  categories: Category[]
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function NewsForm({ mode, newsId, defaultValues, categories }: Props) {
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      status: 'draft',
      isFeatured: false,
      publishedAt: '',
      seoTitle: '',
      seoDescription: '',
      ...defaultValues,
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: FormValues, submitStatus?: 'draft' | 'published') {
    const data: NewsFormValues = {
      ...values,
      status: submitStatus ?? values.status,
      publishedAt: values.publishedAt || undefined,
    }

    const res =
      mode === 'create' ? await createNewsAction(data) : await updateNewsAction(newsId!, data)

    if (res.success) {
      toast.success(mode === 'create' ? 'Berita berhasil dibuat' : 'Berita berhasil diperbarui')
      router.push('/admin/news')
      router.refresh()
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* ── Kiri ── */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Berita</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan judul berita..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            if (mode === 'create') form.setValue('slug', slugify(e.target.value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="judul-berita-contoh" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL: /berita/{form.watch('slug') || 'slug-berita'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ringkasan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ringkasan singkat berita..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konten</FormLabel>
                      <FormControl>
                        <TiptapEditor value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">SEO (Opsional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Judul untuk mesin pencari..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Deskripsi untuk mesin pencari..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Kanan ── */}
          <div className="space-y-4">
            {/* Publikasi */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Publikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Dipublikasi</SelectItem>
                          <SelectItem value="archived">Diarsipkan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fix 4: Tanggal publish */}
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Publikasi</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        Kosongkan untuk menggunakan waktu sekarang saat dipublikasi.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit((v) => onSubmit(v, 'draft'))}
                  >
                    <Save className="h-4 w-4" />
                    Simpan Draft
                  </Button>
                  <Button
                    type="button"
                    variant="accent"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit((v) => onSubmit(v, 'published'))}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Publikasi
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Kategori */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Gambar utama */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Gambar Utama</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <MediaPicker value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Unggulan */}
            <Card>
              <CardContent className="pt-4">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3">
                      <div>
                        <FormLabel className="text-sm font-medium">Berita Unggulan</FormLabel>
                        <FormDescription>Tampilkan di bagian unggulan homepage</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
