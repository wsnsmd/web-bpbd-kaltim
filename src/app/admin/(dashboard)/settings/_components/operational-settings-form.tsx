// src/app/admin/(dashboard)/settings/_components/operational-settings-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Shield, CloudRain, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { saveSettingsAction } from '../_actions/settings-actions'

const schema = z.object({
  status_wilayah: z.enum(['aman', 'waspada', 'siaga', 'tanggap']),
  bmkg_adm4: z.string().min(1, 'Kode ADM4 wajib diisi'),
})

type FormValues = z.infer<typeof schema>

const STATUS_OPTIONS = [
  {
    value: 'aman',
    label: 'Kondisi Normal / Aman',
    desc: 'Tidak ada ancaman bencana signifikan',
    badgeBg: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  {
    value: 'waspada',
    label: 'Waspada',
    desc: 'Ada potensi ancaman, pantau perkembangan',
    badgeBg: 'bg-amber-100 text-amber-700', // Amber (yellow tone)
    dot: 'bg-amber-500',
  },
  {
    value: 'siaga',
    label: 'Siaga',
    desc: 'Ancaman nyata, persiapkan peralatan dan personel',
    badgeBg: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
  },
  {
    value: 'tanggap',
    label: 'Tanggap Darurat',
    desc: 'Bencana sedang terjadi, aktifkan posko darurat',
    badgeBg: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
]

interface Props {
  settings: Record<string, string>
}

export function OperationalSettingsForm({ settings }: Props) {
  const [previewCuaca, setPreviewCuaca] = useState<string | null>(null)
  const [loadingCuaca, setLoadingCuaca] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status_wilayah: (settings.status_wilayah as any) ?? 'aman',
      bmkg_adm4: settings.bmkg_adm4 ?? '64.72.09.1001',
    },
  })

  const { isSubmitting } = form.formState
  const currentStatus = form.watch('status_wilayah')
  const currentAdm4 = form.watch('bmkg_adm4')
  const statusOpt = STATUS_OPTIONS.find((s) => s.value === currentStatus) ?? STATUS_OPTIONS[0]

  async function onSubmit(values: FormValues) {
    const res = await saveSettingsAction(values)
    if (res.success) toast.success('Pengaturan operasional disimpan')
    else toast.error(res.error ?? 'Gagal menyimpan')
  }

  async function testBmkg() {
    if (!currentAdm4) return
    setLoadingCuaca(true)
    setPreviewCuaca(null)
    try {
      const res = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${currentAdm4}`)
      if (!res.ok) {
        setPreviewCuaca('❌ Kode ADM4 tidak ditemukan atau API tidak tersedia')
        return
      }
      const data = await res.json()
      const lokasi = data?.lokasi
      const cuacaList: any[][] = data?.data?.[0]?.cuaca ?? data?.cuaca ?? []
      const item = cuacaList?.[0]?.[0]

      if (!item) {
        setPreviewCuaca('❌ Data cuaca tidak tersedia untuk kode ini')
        return
      }

      const WEATHER_MAP: Record<number, string> = {
        0: 'Cerah',
        1: 'Cerah Berawan',
        2: 'Cerah Berawan',
        3: 'Berawan',
        4: 'Berawan Tebal',
        5: 'Udara Kabur',
        10: 'Asap',
        45: 'Kabut',
        60: 'Hujan Ringan',
        61: 'Hujan Sedang',
        63: 'Hujan Lebat',
        80: 'Hujan Lokal',
        95: 'Hujan Badai',
      }
      const cuacaDesc = WEATHER_MAP[item.weather] ?? item.weather_desc ?? 'Tidak diketahui'

      setPreviewCuaca(
        `✅ Berhasil!\n` +
          `📍 Lokasi: ${[lokasi?.desa, lokasi?.kecamatan, lokasi?.kota_kab].filter(Boolean).join(', ')}\n` +
          `🌤️ Cuaca: ${cuacaDesc}\n` +
          `🌡️ Suhu: ${item.t}°C  💧 Kelembapan: ${item.hu}%\n` +
          `💨 Angin: ${item.ws} km/jam dari ${item.wd}`
      )
    } catch {
      setPreviewCuaca('❌ Gagal terhubung ke API BMKG')
    } finally {
      setLoadingCuaca(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ── Status Wilayah ── */}
        <div className="mb-4 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Status Kondisi Wilayah</h3>
          </div>

          <FormField
            control={form.control}
            name="status_wilayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Saat Ini</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full max-w-sm">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{statusOpt.desc}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Preview status */}
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Preview di Status Bar
            </p>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${statusOpt.badgeBg}`}
            >
              <span className={`h-2 w-2 animate-pulse rounded-full ${statusOpt.dot}`} />
              {statusOpt.label}
            </div>
          </div>

          {/* Panduan penggunaan */}
          <div className="b-10 space-y-1 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
            <p className="font-semibold">Panduan penggunaan status:</p>
            {STATUS_OPTIONS.map((opt) => (
              <p key={opt.value}>
                <span className="font-bold">{opt.label}</span> — {opt.desc}
              </p>
            ))}
          </div>
        </div>

        <div className="border-t" />

        {/* ── BMKG ── */}
        <div className="mt-6 mb-4 space-y-4">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Konfigurasi Cuaca BMKG</h3>
          </div>

          <FormField
            control={form.control}
            name="bmkg_adm4"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Wilayah ADM4 (Kelurahan/Desa)</FormLabel>
                <div className="flex max-w-sm gap-2">
                  <FormControl>
                    <Input placeholder="64.72.09.1001" {...field} className="font-mono" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={testBmkg}
                    disabled={loadingCuaca}
                    className="shrink-0"
                  >
                    {loadingCuaca ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Test
                  </Button>
                </div>
                <FormDescription>
                  Kode ADM4 digunakan untuk mengambil prakiraan cuaca dari API BMKG. Format:{' '}
                  <code className="rounded bg-slate-100 px-1 text-xs">PP.KK.KEC.XXXXXX</code>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Preview hasil test */}
          {previewCuaca && (
            <div
              className={`rounded-xl border p-4 font-mono text-xs whitespace-pre-line ${
                previewCuaca.startsWith('✅')
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {previewCuaca}
            </div>
          )}
        </div>

        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Pengaturan Operasional
        </Button>
      </form>
    </Form>
  )
}
