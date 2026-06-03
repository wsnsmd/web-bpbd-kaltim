// src/app/admin/(dashboard)/settings/_components/contact-settings-form.tsx
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
import { Separator } from '@/components/ui/separator'
import { saveSettingsAction } from '../_actions/settings-actions'

interface Props {
  settings: Record<string, string>
}

export function ContactSettingsForm({ settings }: Props) {
  const form = useForm({
    defaultValues: {
      contact_address: settings.contact_address ?? '',
      contact_phone: settings.contact_phone ?? '',
      contact_emergency: settings.contact_emergency ?? '112',
      contact_email: settings.contact_email ?? '',
      contact_whatsapp: settings.contact_whatsapp ?? '',
      office_hours: settings.office_hours ?? '',
      social_facebook: settings.social_facebook ?? '',
      social_instagram: settings.social_instagram ?? '',
      social_youtube: settings.social_youtube ?? '',
      social_twitter: settings.social_twitter ?? '',
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
          name="contact_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Kantor</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telepon Kantor</FormLabel>
                <FormControl>
                  <Input placeholder="(0541) XXX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_emergency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Darurat</FormLabel>
                <FormControl>
                  <Input placeholder="112" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="628XXXXXXXXXX" {...field} />
                </FormControl>
                <FormDescription>Format: 628xxx (tanpa +)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="office_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jam Operasional</FormLabel>
              <FormControl>
                <Input placeholder="Senin – Jumat, 08.00 – 16.30 WITA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <p className="text-sm font-medium">Media Sosial</p>

        {[
          { name: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
          {
            name: 'social_instagram',
            label: 'Instagram',
            placeholder: 'https://instagram.com/...',
          },
          { name: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
          { name: 'social_twitter', label: 'X (Twitter)', placeholder: 'https://x.com/...' },
        ].map((item) => (
          <FormField
            key={item.name}
            control={form.control}
            name={item.name as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.label}</FormLabel>
                <FormControl>
                  <Input placeholder={item.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="flex justify-end">
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  )
}
