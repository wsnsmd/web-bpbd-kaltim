// src/app/admin/(dashboard)/hero/_components/hero-settings-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { MediaPicker } from '@/app/admin/(dashboard)/media/_components/media-picker'
import { saveHeroSettingsAction } from '../_actions/hero-actions'

const schema = z.object({
  hero_title: z.string().min(1, 'Judul wajib diisi'),
  hero_subtitle: z.string().optional(),
  hero_description: z.string().optional(),
  hero_badge: z.string().optional(),
  hero_cta_primary_label: z.string().optional(),
  hero_cta_primary_href: z.string().optional(),
  hero_cta_secondary_label: z.string().optional(),
  hero_cta_secondary_href: z.string().optional(),
  hero_bg_image: z.string().optional(),
  hero_status_text: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  settings: FormValues
}

export function HeroSettingsForm({ settings }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: settings,
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: FormValues) {
    const res = await saveHeroSettingsAction(values)
    if (res.success) toast.success('Hero section diperbarui')
    else toast.error(res.error ?? 'Terjadi kesalahan')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Background */}
        <div className="space-y-4 rounded-xl border p-5">
          <h3 className="text-navy-800 text-sm font-semibold">Background</h3>
          <FormField
            control={form.control}
            name="hero_bg_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto Background</FormLabel>
                <MediaPicker value={field.value} onChange={field.onChange} />
                <FormDescription>
                  Rekomendasi ukuran minimal 1920×1080px. Gambar akan diberi overlay gelap otomatis.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Teks */}
        <div className="space-y-4 rounded-xl border p-5">
          <h3 className="text-navy-800 text-sm font-semibold">Teks Hero</h3>

          <FormField
            control={form.control}
            name="hero_badge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge / Kicker</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Portal Resmi — Pemerintah Provinsi Kalimantan Timur"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Teks kecil di atas judul utama.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hero_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Utama</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="Penanggulangan Bencana&#10;Kalimantan Timur"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Gunakan Enter untuk baris baru. Baris kedua tampil dengan warna emas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hero_subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Tanggap, Tangguh, Cepat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hero_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Pusat koordinasi, informasi, dan layanan kebencanaan..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hero_status_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teks Status</FormLabel>
                <FormControl>
                  <Input placeholder="Kondisi Wilayah: Normal & Aman" {...field} />
                </FormControl>
                <FormDescription>Tampil di widget status kecil di hero.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* CTA */}
        <div className="space-y-4 rounded-xl border p-5">
          <h3 className="text-navy-800 text-sm font-semibold">Tombol CTA</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hero_cta_primary_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tombol Utama — Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Layanan Publik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hero_cta_primary_href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tombol Utama — Link</FormLabel>
                  <FormControl>
                    <Input placeholder="#layanan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hero_cta_secondary_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tombol Kedua — Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Peta Bencana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hero_cta_secondary_href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tombol Kedua — Link</FormLabel>
                  <FormControl>
                    <Input placeholder="#peta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Form>
  )
}
