// src/app/admin/(dashboard)/pages/_components/page-form.tsx
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
import { Separator } from '@/components/ui/separator'
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
import { TiptapEditor } from '@/app/admin/(dashboard)/news/_components/tiptap-editor'
import { MediaPicker } from '@/app/admin/(dashboard)/media/_components/media-picker'
import { createPageAction, updatePageAction, type PageFormValues } from '../_actions/page-actions'
import { PAGE_TEMPLATES } from '@db/schema/pages'

const schema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9/-]+$/, 'Slug hanya huruf kecil, angka, - dan /'),
  content: z.string().min(1, 'Konten tidak boleh kosong'),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  template: z.string(),
  showInNav: z.boolean(),
  navOrder: z.string().optional(),
  parentId: z.string().optional(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  mode: 'create' | 'edit'
  pageId?: string
  defaultValues?: Partial<FormValues>
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s/-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function PageForm({ mode, pageId, defaultValues }: Props) {
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      status: 'draft',
      template: 'default',
      showInNav: false,
      navOrder: '0',
      publishedAt: '',
      seoTitle: '',
      seoDescription: '',
      ...defaultValues,
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: FormValues, submitStatus?: 'draft' | 'published') {
    const data: PageFormValues = {
      ...values,
      status: submitStatus ?? values.status,
    }

    const res =
      mode === 'create' ? await createPageAction(data) : await updatePageAction(pageId!, data)

    if (res.success) {
      toast.success(mode === 'create' ? 'Halaman berhasil dibuat' : 'Halaman berhasil diperbarui')
      router.push('/admin/pages')
      router.refresh()
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── Kiri: Konten ── */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Halaman</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Tentang Kami"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            if (mode === 'create') {
                              form.setValue('slug', slugify(e.target.value))
                            }
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
                      <FormLabel>Slug / URL</FormLabel>
                      <FormControl>
                        <Input placeholder="tentang-kami" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL: /{form.watch('slug') || 'slug-halaman'}
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
                      <FormLabel>Ringkasan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Deskripsi singkat halaman ini..."
                          rows={2}
                          {...field}
                        />
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
                        <Input {...field} />
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
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Kanan: Settings ── */}
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

                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Publikasi</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value ?? ''} />
                      </FormControl>
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
                    <Save className="h-4 w-4" /> Draft
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

            {/* Template */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Template</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="template"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAGE_TEMPLATES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
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

            {/* Navigasi */}
            <Card>
              <CardContent className="space-y-3 pt-4">
                <FormField
                  control={form.control}
                  name="showInNav"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3">
                      <div>
                        <FormLabel className="text-sm font-medium">Tampilkan di Navigasi</FormLabel>
                        <FormDescription>Tambahkan ke menu navigasi publik</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('showInNav') && (
                  <FormField
                    control={form.control}
                    name="navOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urutan di Nav</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} className="w-24" {...field} />
                        </FormControl>
                        <FormDescription>Semakin kecil = semakin kiri</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
