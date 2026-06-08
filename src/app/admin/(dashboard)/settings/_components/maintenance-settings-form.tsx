// src/app/admin/(dashboard)/settings/_components/maintenance-settings-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertTriangle, ShieldOff, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
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
import { saveSettingsAction } from '../_actions/settings-actions'

const schema = z.object({
  maintenance_mode: z.enum(['true', 'false']),
  maintenance_title: z.string().min(1, 'Judul wajib diisi'),
  maintenance_message: z.string().min(1, 'Pesan wajib diisi'),
  maintenance_estimated: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  settings: Record<string, string>
}

export function MaintenanceSettingsForm({ settings }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      maintenance_mode: (settings.maintenance_mode as 'true' | 'false') ?? 'false',
      maintenance_title: settings.maintenance_title || 'Sedang Dalam Pemeliharaan',
      maintenance_message:
        settings.maintenance_message ||
        'Website sedang dalam proses pemeliharaan untuk meningkatkan layanan. Kami akan segera kembali.',
      maintenance_estimated: settings.maintenance_estimated || '',
    },
  })

  const { isSubmitting } = form.formState
  const isMaintenance = form.watch('maintenance_mode') === 'true'

  async function onSubmit(values: FormValues) {
    const res = await saveSettingsAction(values)
    if (res.success) {
      toast.success(
        values.maintenance_mode === 'true'
          ? '🔒 Mode maintenance diaktifkan'
          : '✅ Mode maintenance dinonaktifkan'
      )
    } else {
      toast.error(res.error ?? 'Gagal menyimpan')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Toggle utama */}
        <FormField
          control={form.control}
          name="maintenance_mode"
          render={({ field }) => (
            <FormItem
              className={`flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors ${
                isMaintenance ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isMaintenance ? 'bg-red-100' : 'bg-green-100'
                  }`}
                >
                  {isMaintenance ? (
                    <ShieldOff className="h-5 w-5 text-red-600" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <FormLabel className="text-sm font-bold">Mode Maintenance</FormLabel>
                  <FormDescription className="mt-0.5 text-xs">
                    {isMaintenance
                      ? '🔴 Website sedang dalam maintenance — pengunjung melihat halaman maintenance'
                      : '🟢 Website aktif — pengunjung dapat mengakses semua halaman'}
                  </FormDescription>
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === 'true'}
                  onCheckedChange={(v) => field.onChange(v ? 'true' : 'false')}
                  className={isMaintenance ? 'data-[state=checked]:bg-red-500' : ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Warning saat aktif */}
        {isMaintenance && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-sm text-amber-700">
              <p className="font-semibold">Mode maintenance aktif!</p>
              <p className="mt-0.5 text-xs">
                Seluruh halaman publik akan dialihkan ke halaman maintenance. Halaman admin{' '}
                <strong>(/admin)</strong> tetap dapat diakses.
              </p>
            </div>
          </div>
        )}

        {/* Judul halaman maintenance */}
        <FormField
          control={form.control}
          name="maintenance_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Halaman Maintenance</FormLabel>
              <FormControl>
                <Input placeholder="Sedang Dalam Pemeliharaan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pesan */}
        <FormField
          control={form.control}
          name="maintenance_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pesan untuk Pengunjung</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Website sedang dalam proses pemeliharaan..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimasi selesai */}
        <FormField
          control={form.control}
          name="maintenance_estimated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Estimasi Selesai <span className="font-normal text-slate-400">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Senin, 10 Juni 2026 pukul 08.00 WITA" {...field} />
              </FormControl>
              <FormDescription>Ditampilkan di halaman maintenance jika diisi.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Pengaturan Maintenance
        </Button>
      </form>
    </Form>
  )
}
