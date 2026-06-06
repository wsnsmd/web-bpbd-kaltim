// src/app/admin/(dashboard)/settings/_components/contact-settings-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, MapPin } from 'lucide-react'
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
      // ── Mapbox ──
      mapbox_token: settings.mapbox_token ?? '',
      map_latitude: settings.map_latitude ?? '-0.5022',
      map_longitude: settings.map_longitude ?? '117.1364',
      map_zoom: settings.map_zoom ?? '15',
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: Record<string, string>) {
    const res = await saveSettingsAction(values)
    if (res.success) toast.success('Pengaturan disimpan')
    else toast.error(res.error ?? 'Terjadi kesalahan')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-5">
        {/* Kontak */}
        <FormField
          control={form.control}
          name="contact_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Kantor</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
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
                <FormLabel>Telepon</FormLabel>
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
                <FormLabel>Call Center Darurat</FormLabel>
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
                  <Input placeholder="pusdalops@..." {...field} />
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
                <FormLabel>WhatsApp (format: 628xxx)</FormLabel>
                <FormControl>
                  <Input placeholder="628123456789" {...field} />
                </FormControl>
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

        {/* Sosial media */}
        <p className="text-navy-800 text-sm font-semibold">Media Sosial</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'social_facebook', label: 'Facebook URL' },
            { name: 'social_instagram', label: 'Instagram URL' },
            { name: 'social_youtube', label: 'YouTube URL' },
            { name: 'social_twitter', label: 'X / Twitter URL' },
          ].map(({ name, label }) => (
            <FormField
              key={name}
              control={form.control}
              name={name as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Separator />

        {/* Mapbox */}
        <div className="space-y-4 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <MapPin className="text-navy-600 h-4 w-4" />
            <p className="text-navy-800 text-sm font-semibold">Pengaturan Peta (Mapbox)</p>
          </div>

          <FormField
            control={form.control}
            name="mapbox_token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mapbox Access Token</FormLabel>
                <FormControl>
                  <Input placeholder="pk.eyJ1Ijoixxxxxxxx..." {...field} />
                </FormControl>
                <FormDescription>
                  Daftar gratis di{' '}
                  <a
                    href="https://mapbox.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy-600 hover:text-navy-800 underline"
                  >
                    mapbox.com
                  </a>{' '}
                  · Free tier: 50.000 map loads/bulan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="map_latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input placeholder="-0.5022" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="map_longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input placeholder="117.1364" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="map_zoom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zoom (1–20)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormDescription>
            Untuk mencari koordinat: buka{' '}
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-600 hover:text-navy-800 underline"
            >
              Google Maps
            </a>
            , klik lokasi kantor, salin koordinat dari URL atau klik kanan → "What's here?".
          </FormDescription>
        </div>

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
