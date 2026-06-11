// src/app/admin/(dashboard)/settings/_components/general-settings-form.tsx
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
import { MediaPicker } from '@/app/admin/(dashboard)/media/_components/media-picker'
import { saveSettingsAction } from '../_actions/settings-actions'

interface Props {
  settings: Record<string, string>
}

export function GeneralSettingsForm({ settings }: Props) {
  const form = useForm({
    defaultValues: {
      site_name: settings.site_name ?? '',
      site_tagline: settings.site_tagline ?? '',
      site_description: settings.site_description ?? '',
      site_logo: settings.site_logo ?? '',
      site_favicon: settings.site_favicon ?? '',
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
          name="site_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Situs</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Tampil di browser tab, header, dan footer.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site_tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input placeholder="Tanggap, Tangguh, Cepat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Situs</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormDescription>Tampil di footer kolom brand.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site_logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Situs</FormLabel>
              <MediaPicker value={field.value} onChange={field.onChange} />
              <FormDescription>
                Tampil di header. Rekomendasi: PNG transparan, min 200px.
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
