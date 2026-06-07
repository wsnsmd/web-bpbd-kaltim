// src/app/admin/(dashboard)/incidents/_components/timeline-dialog.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getTimelineAction, addTimelineAction } from '../_actions/timeline-actions'

interface Incident {
  id: number
  title: string
  status: string
}

interface TimelineEntry {
  id: number
  eventType: string
  title: string
  description: string | null
  statusBefore: string | null
  statusAfter: string | null
  loggedAt: Date | string
  creatorName?: string | null
}

const EVENT_TYPES = [
  { value: 'laporan_awal', label: 'Laporan Awal', icon: '📋', color: 'bg-blue-100 text-blue-700' },
  { value: 'verifikasi', label: 'Verifikasi', icon: '✅', color: 'bg-teal-100 text-teal-700' },
  { value: 'pengerahan', label: 'Pengerahan', icon: '🚒', color: 'bg-orange-100 text-orange-700' },
  {
    value: 'penanganan',
    label: 'Update Penanganan',
    icon: '⚙️',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    value: 'kondisi_update',
    label: 'Update Kondisi',
    icon: '📊',
    color: 'bg-purple-100 text-purple-700',
  },
  { value: 'korban_update', label: 'Update Korban', icon: '👥', color: 'bg-red-100 text-red-700' },
  {
    value: 'selesai',
    label: 'Dinyatakan Selesai',
    icon: '🏁',
    color: 'bg-green-100 text-green-700',
  },
  { value: 'catatan', label: 'Catatan', icon: '📝', color: 'bg-slate-100 text-slate-700' },
]

const schema = z.object({
  eventType: z.string().min(1),
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  statusAfter: z.enum(['aktif', 'ditangani', 'selesai']).optional(),
  loggedAt: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  incident: Incident
}

export function TimelineDialog({ open, onOpenChange, incident }: Props) {
  const [timelines, setTimelines] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventType: 'catatan',
      title: '',
      description: '',
      statusAfter: undefined,
      loggedAt: new Date().toISOString().slice(0, 16),
    },
  })

  const loadTimelines = useCallback(async () => {
    setLoading(true)
    const data = await getTimelineAction(incident.id)
    setTimelines(data as TimelineEntry[])
    setLoading(false)
  }, [incident.id])

  useEffect(() => {
    if (open) {
      loadTimelines()
      setShowForm(false)
      form.reset({
        eventType: 'catatan',
        title: '',
        description: '',
        loggedAt: new Date().toISOString().slice(0, 16),
      })
    }
  }, [open, form, loadTimelines])

  const { isSubmitting } = form.formState

  async function onSubmit(values: FormValues) {
    const res = await addTimelineAction(incident.id, incident.status, values)
    if (res.success) {
      toast.success('Timeline ditambahkan')
      form.reset({
        eventType: 'catatan',
        title: '',
        description: '',
        loggedAt: new Date().toISOString().slice(0, 16),
      })
      setShowForm(false)
      loadTimelines()
    } else {
      toast.error(res.error ?? 'Gagal')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle className="line-clamp-1 text-base">Timeline: {incident.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Form tambah entry */}
          <div className="border-b bg-slate-50 px-6 py-4">
            {!showForm ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Catatan Timeline
              </Button>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tipe Event</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EVENT_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.icon} {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="loggedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Waktu</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" className="h-8 text-xs" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Ringkasan</FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 text-xs"
                            placeholder="Contoh: Tim BPBD tiba di lokasi"
                            {...field}
                          />
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
                        <FormLabel className="text-xs">Detail (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={2}
                            className="text-xs"
                            placeholder="Narasi detail..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statusAfter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Ubah Status (Opsional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Tidak ubah status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aktif">🔴 Aktif</SelectItem>
                            <SelectItem value="ditangani">🟡 Ditangani</SelectItem>
                            <SelectItem value="selesai">🟢 Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForm(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" variant="accent" size="sm" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Simpan
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>

          {/* Timeline list */}
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : timelines.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Belum ada catatan timeline. Tambahkan catatan pertama di atas.
              </p>
            ) : (
              <div className="relative">
                {/* Garis vertical */}
                <div className="absolute top-0 bottom-0 left-4.75 w-0.5 bg-slate-200" />

                <div className="space-y-5">
                  {timelines.map((entry) => {
                    const eventCfg =
                      EVENT_TYPES.find((t) => t.value === entry.eventType) ?? EVENT_TYPES[7]
                    return (
                      <div key={entry.id} className="relative flex gap-4">
                        {/* Dot */}
                        <div
                          className={cn(
                            'z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ring-2 ring-white',
                            eventCfg.color
                          )}
                        >
                          {eventCfg.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1.5 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-navy-800 text-sm font-semibold">{entry.title}</p>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                    eventCfg.color
                                  )}
                                >
                                  {eventCfg.label}
                                </span>
                                {entry.statusBefore &&
                                  entry.statusAfter &&
                                  entry.statusBefore !== entry.statusAfter && (
                                    <span className="text-muted-foreground text-[10px]">
                                      {entry.statusBefore} → {entry.statusAfter}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-muted-foreground text-[11px]">
                                {formatDateTime(entry.loggedAt)}
                              </p>
                              {entry.creatorName && (
                                <p className="text-[10px] text-slate-400">{entry.creatorName}</p>
                              )}
                            </div>
                          </div>
                          {entry.description && (
                            <p className="mt-1.5 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
