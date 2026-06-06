// src/app/admin/(dashboard)/incidents/_components/incident-dialog.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createIncidentAction, updateIncidentAction } from '../_actions/incidents-actions'
import { LocationSelect } from './location-select'

// Types dari server — di-pass sebagai props
interface DisasterType {
  id: number
  name: string
  category: string
  icon: string | null
}
interface DisasterCause {
  id: number
  name: string
}
interface Region {
  id: string
  name: string
}

const victimSchema = z.object({
  impactType: z.enum(['meninggal', 'hilang', 'luka_sakit', 'menderita', 'mengungsi']),
  ageGroup: z.enum(['anak', 'dewasa', 'lansia', 'tidak_diketahui']),
  countMale: z.number(),
  countFemale: z.number(),
  notes: z.string().optional(),
})

const damageSchema = z.object({
  assetName: z.string().min(1, 'Nama aset wajib diisi'),
  heavyDamage: z.number(),
  moderateDamage: z.number(),
  lightDamage: z.number(),
  estimatedLoss: z.number(),
  notes: z.string().optional(),
})

const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  disasterTypeId: z.number().min(1, 'Jenis bencana wajib dipilih'),
  causeId: z.number().optional(),
  causeDetail: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  occurredDate: z.string().min(1, 'Tanggal kejadian wajib diisi'),
  occurredTime: z.string().optional(),
  regencyId: z.string().min(1, 'Kab/Kota wajib dipilih'),
  districtId: z.string().optional(),
  villageId: z.string().optional(),
  villageName: z.string().optional(),
  addressDetail: z.string().optional(),
  latitude: z.string().min(1, 'Latitude wajib diisi'),
  longitude: z.string().min(1, 'Longitude wajib diisi'),
  status: z.enum(['aktif', 'ditangani', 'selesai']),
  currentCondition: z.string().optional(),
  currentEffort: z.string().optional(),
  isPublished: z.boolean(),
  victims: z.array(victimSchema),
  damages: z.array(damageSchema),
})

type FormValues = z.infer<typeof schema>

function NumInput({ field, className }: { field: any; className?: string }) {
  return (
    <Input
      type="number"
      min={0}
      className={`h-8 text-center text-sm ${className}`}
      {...field}
      onChange={(e) => field.onChange(Number(e.target.value))}
    />
  )
}

const IMPACT_TYPES = [
  { value: 'meninggal', label: 'Meninggal', color: 'bg-red-100 text-red-700' },
  { value: 'hilang', label: 'Hilang', color: 'bg-orange-100 text-orange-700' },
  { value: 'luka_sakit', label: 'Luka/Sakit', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'menderita', label: 'Menderita', color: 'bg-blue-100 text-blue-700' },
  { value: 'mengungsi', label: 'Mengungsi', color: 'bg-purple-100 text-purple-700' },
] as const

const AGE_GROUPS = [
  { value: 'anak', label: 'Anak' },
  { value: 'dewasa', label: 'Dewasa' },
  { value: 'lansia', label: 'Lansia' },
  { value: 'tidak_diketahui', label: 'Tidak Diketahui' },
] as const

const ASSET_TYPES = [
  'Rumah',
  'Sekolah',
  'Jembatan',
  'Jalan',
  'Fasilitas Umum',
  'Lahan/Sawah',
  'Lainnya',
]

const CONDITIONS = [
  'Sudah Padam',
  'Sudah Surut',
  'Dalam Pencarian',
  'Sudah Diketemukan',
  'Tidak Ada Laporan Kerusakan',
  'Tidak Ada Korban Jiwa',
  'Masih Berlangsung',
  'Dalam Penanganan',
]

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  item?: any
  onSuccess: (item: any) => void
  disasterTypes: DisasterType[]
  causes: DisasterCause[]
  kabkotas: Region[]
}

export function IncidentDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
  disasterTypes,
  causes,
  kabkotas,
}: Props) {
  const isEdit = !!item
  const [tab, setTab] = useState('utama')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      disasterTypeId: undefined,
      causeId: undefined,
      causeDetail: '',
      description: '',
      source: '',
      occurredDate: new Date().toISOString().slice(0, 10),
      occurredTime: '',
      regencyId: '',
      districtId: '',
      villageName: '',
      addressDetail: '',
      latitude: '',
      longitude: '',
      status: 'aktif',
      currentCondition: '',
      currentEffort: '',
      isPublished: true,
      victims: [],
      damages: [],
    },
  })

  const {
    fields: victimFields,
    append: appendVictim,
    remove: removeVictim,
  } = useFieldArray({
    control: form.control,
    name: 'victims',
  })
  const {
    fields: damageFields,
    append: appendDamage,
    remove: removeDamage,
  } = useFieldArray({
    control: form.control,
    name: 'damages',
  })

  useEffect(() => {
    if (open && item) {
      form.reset({
        title: item.title ?? '',
        disasterTypeId: item.disasterTypeId,
        causeId: item.causeId,
        causeDetail: item.causeDetail ?? '',
        description: item.description ?? '',
        source: item.source ?? '',
        occurredDate: item.occurredDate ?? new Date().toISOString().slice(0, 10),
        occurredTime: item.occurredTime ?? '',
        regencyId: item.regencyId ?? '',
        districtId: item.districtId ?? '',
        villageName: item.villageName ?? '',
        addressDetail: item.addressDetail ?? '',
        latitude: item.latitude ?? '',
        longitude: item.longitude ?? '',
        status: item.status ?? 'aktif',
        currentCondition: item.currentCondition ?? '',
        currentEffort: item.currentEffort ?? '',
        isPublished: item.isPublished ?? true,
        victims: item.victims ?? [],
        damages: item.damages ?? [],
      })
    } else if (open) {
      form.reset()
    }
    setTab('utama')
  }, [open, item])

  const { isSubmitting } = form.formState

  // Hitung total korban realtime
  const victims = form.watch('victims')
  const totalDead = victims
    .filter((v) => v.impactType === 'meninggal')
    .reduce((s, v) => s + (v.countMale || 0) + (v.countFemale || 0), 0)
  const totalMissing = victims
    .filter((v) => v.impactType === 'hilang')
    .reduce((s, v) => s + (v.countMale || 0) + (v.countFemale || 0), 0)
  const totalInjured = victims
    .filter((v) => v.impactType === 'luka_sakit')
    .reduce((s, v) => s + (v.countMale || 0) + (v.countFemale || 0), 0)

  async function onSubmit(values: FormValues) {
    try {
      const res = isEdit
        ? await updateIncidentAction(item.id, values)
        : await createIncidentAction(values)

      if (res?.success) {
        toast.success(isEdit ? 'Kejadian diperbarui' : 'Kejadian ditambahkan')
        onSuccess({ ...values, id: item?.id ?? Date.now() })
        onOpenChange(false)
      } else {
        toast.error(res?.error ?? 'Terjadi kesalahan pada server')
      }
    } catch (error) {
      console.error('Submission Error:', error)
      toast.error('Gagal mengirim data, periksa koneksi atau konsol')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? 'Edit Kejadian Bencana' : 'Tambah Kejadian Bencana'}</DialogTitle>
          {/* Summary korban realtime */}
          {(totalDead > 0 || totalMissing > 0 || totalInjured > 0) && (
            <div className="mt-2 flex gap-2">
              {totalDead > 0 && (
                <Badge className="border-0 bg-red-100 text-red-700">💀 MD: {totalDead}</Badge>
              )}
              {totalMissing > 0 && (
                <Badge className="border-0 bg-orange-100 text-orange-700">
                  🔍 Hilang: {totalMissing}
                </Badge>
              )}
              {totalInjured > 0 && (
                <Badge className="border-0 bg-yellow-100 text-yellow-700">
                  🩹 Luka: {totalInjured}
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (err) => console.log('Form Errors:', err))}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="mx-6 mt-4 h-auto w-fit shrink-0 gap-1">
                <TabsTrigger value="utama" className="text-xs">
                  📋 Utama
                </TabsTrigger>
                <TabsTrigger value="lokasi" className="text-xs">
                  📍 Lokasi
                </TabsTrigger>
                <TabsTrigger value="korban" className="text-xs">
                  👥 Korban {victims.length > 0 && `(${victims.length})`}
                </TabsTrigger>
                <TabsTrigger value="material" className="text-xs">
                  🏚️ Material {damageFields.length > 0 && `(${damageFields.length})`}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* ── Tab Utama ── */}
                <TabsContent value="utama" className="mt-0 space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul / Nama Kejadian</FormLabel>
                        <FormControl>
                          <Input placeholder="Kebakaran Pemukiman Loa Ipuh Tenggarong" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="disasterTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Bencana</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(Number(v))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>🌿 Alam</SelectLabel>
                                {disasterTypes
                                  .filter((t) => t.category === 'alam')
                                  .map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                      {t.icon} {t.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>🏭 Non Alam</SelectLabel>
                                {disasterTypes
                                  .filter((t) => t.category === 'non_alam')
                                  .map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                      {t.icon} {t.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="causeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Penyebab</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(Number(v))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih penyebab..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {causes.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="occurredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Kejadian</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="occurredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sumber Laporan</FormLabel>
                        <FormControl>
                          <Input placeholder="BPBD Kab. Kukar / BMKG / Disdamkar..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kronologis / Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Uraian kronologis kejadian..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Penanganan</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aktif">🔴 Aktif</SelectItem>
                              <SelectItem value="ditangani">🟡 Ditangani</SelectItem>
                              <SelectItem value="selesai">🟢 Selesai</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kondisi Mutakhir</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kondisi..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONDITIONS.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currentEffort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upaya Penanganan</FormLabel>
                        <FormControl>
                          <Input placeholder="Melakukan Asesmen dan Pendataan..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-xl border p-4">
                        <div>
                          <FormLabel>Tampilkan di Peta Publik</FormLabel>
                          <FormDescription>Data muncul di halaman Pusdalops</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* ── Tab Lokasi ── */}
                <TabsContent value="lokasi" className="mt-0 space-y-4">
                  <LocationSelect
                    kabkotas={kabkotas}
                    kabkotaId={form.watch('regencyId') ?? ''}
                    kecamatanId={form.watch('districtId') ?? ''}
                    villageName={form.watch('villageName') ?? ''}
                    onKabkotaChange={(v) => {
                      form.setValue('regencyId', v)
                      form.setValue('districtId', '')
                      form.setValue('villageName', '')
                    }}
                    onKecamatanChange={(v) => {
                      form.setValue('districtId', v)
                    }}
                    onVillageNameChange={(v) => form.setValue('villageName', v)}
                  />

                  {form.formState.errors.regencyId && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.regencyId.message}
                    </p>
                  )}

                  <FormField
                    control={form.control}
                    name="addressDetail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Rinci (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Jl. / RT / RW..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />
                  <p className="text-navy-700 text-xs font-semibold">
                    Koordinat GPS (wajib untuk peta)
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="latitude"
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
                      name="longitude"
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
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Cara cari koordinat: buka Google Maps → klik lokasi → klik kanan → "What's
                    here?"
                  </p>
                </TabsContent>

                {/* ── Tab Korban ── */}
                <TabsContent value="korban" className="mt-0 space-y-3">
                  {victimFields.map((field, index) => (
                    <div key={field.id} className="relative space-y-3 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            IMPACT_TYPES.find(
                              (t) => t.value === form.watch(`victims.${index}.impactType`)
                            )?.color ?? ''
                          }
                        >
                          {IMPACT_TYPES.find(
                            (t) => t.value === form.watch(`victims.${index}.impactType`)
                          )?.label ?? 'Korban'}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => removeVictim(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`victims.${index}.impactType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Kategori Dampak</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {IMPACT_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                      {t.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`victims.${index}.ageGroup`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Kelompok Usia</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {AGE_GROUPS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                      {t.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`victims.${index}.countMale`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Laki-laki</FormLabel>
                              <NumInput field={field} />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`victims.${index}.countFemale`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Perempuan</FormLabel>
                              <NumInput field={field} />
                            </FormItem>
                          )}
                        />
                        <div>
                          <p className="mb-1.5 text-xs font-medium">Total</p>
                          <div className="text-navy-800 flex h-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold">
                            {(form.watch(`victims.${index}.countMale`) || 0) +
                              (form.watch(`victims.${index}.countFemale`) || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      appendVictim({
                        impactType: 'meninggal',
                        ageGroup: 'dewasa',
                        countMale: 0,
                        countFemale: 0,
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Data Korban
                  </Button>

                  {victims.length === 0 && (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      Belum ada data korban. Klik tombol di atas untuk menambah.
                    </p>
                  )}
                </TabsContent>

                {/* ── Tab Kerugian Material ── */}
                <TabsContent value="material" className="mt-0 space-y-3">
                  {damageFields.map((field, index) => (
                    <div key={field.id} className="space-y-3 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-navy-800 text-sm font-semibold">
                          {form.watch(`damages.${index}.assetName`) || 'Aset Baru'}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => removeDamage(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`damages.${index}.assetName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nama Aset</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Pilih aset..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ASSET_TYPES.map((a) => (
                                    <SelectItem key={a} value={a}>
                                      {a}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`damages.${index}.estimatedLoss`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Taksiran Kerugian (Rp)</FormLabel>
                              <NumInput field={field} />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { name: `damages.${index}.heavyDamage` as const, label: 'Rusak Berat' },
                          {
                            name: `damages.${index}.moderateDamage` as const,
                            label: 'Rusak Sedang',
                          },
                          { name: `damages.${index}.lightDamage` as const, label: 'Rusak Ringan' },
                        ].map(({ name, label }) => (
                          <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">{label}</FormLabel>
                                <NumInput field={field} />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      appendDamage({
                        assetName: 'Rumah',
                        heavyDamage: 0,
                        moderateDamage: 0,
                        lightDamage: 0,
                        estimatedLoss: 0,
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Kerugian Material
                  </Button>

                  {damageFields.length === 0 && (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      Belum ada data kerugian material.
                    </p>
                  )}
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex shrink-0 justify-end gap-2 border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Simpan Perubahan' : 'Tambah Kejadian'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
