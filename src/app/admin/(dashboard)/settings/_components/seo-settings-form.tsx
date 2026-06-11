// src/app/admin/(dashboard)/settings/_components/seo-settings-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { saveSettingsAction } from '../_actions/settings-actions'

interface Props {
  settings: Record<string, string>
}

export function SeoSettingsForm({ settings }: Props) {
  const form = useForm({
    defaultValues: {
      seo_title: settings.seo_title ?? '',
      seo_description: settings.seo_description ?? '',
      seo_keywords: settings.seo_keywords ?? '',
      google_analytics: settings.google_analytics ?? '',
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
        <FormField
          control={form.control}
          name="seo_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title Default</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Digunakan sebagai judul halaman jika halaman tidak memiliki judul khusus.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seo_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Description Default</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormDescription>
                Maks. 160 karakter. Saat ini: {field.value?.length ?? 0} karakter.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seo_keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input placeholder="BPBD, bencana, Kalimantan Timur" {...field} />
              </FormControl>
              <FormDescription>Pisahkan dengan koma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="google_analytics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Analytics ID</FormLabel>
              <FormControl>
                <Input placeholder="G-XXXXXXXXXX atau UA-XXXXXXXXX" {...field} />
              </FormControl>
              <FormDescription>Masukkan Measurement ID dari Google Analytics 4.</FormDescription>
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
