// src/app/admin/(dashboard)/incidents/_components/incidents-panel.tsx
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { deleteIncidentAction, togglePublishAction } from '../_actions/incidents-actions'
import { IncidentDialog } from './incident-dialog'
import { TimelineDialog } from './timeline-dialog'

interface IncidentItem {
  id: number
  title: string
  disasterTypeId: number | null
  disasterTypeName: string | null
  disasterTypeIcon: string | null
  disasterTypeColor: string | null
  source: string | null
  occurredDate: string | null
  occurredTime: string | null
  regencyId: string | null
  regencyName: string | null
  districtId: string | null
  villageName: string | null
  addressDetail: string | null
  description: string | null
  currentEffort: string | null
  latitude: string | null
  longitude: string | null
  status: string
  currentCondition: string | null
  isPublished: boolean | null
  createdAt: Date | null
}

interface DisasterType {
  id: number
  name: string
  category: string
  icon: string | null
  color: string | null
}
interface Region {
  id: string
  name: string
}

interface Props {
  initialItems: IncidentItem[]
  disasterTypes: DisasterType[]
  kabkotas: Region[]
  causes: { id: number; name: string }[]
}

const STATUS_CONFIG = {
  aktif: {
    label: 'Aktif',
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500 animate-pulse',
  },
  ditangani: {
    label: 'Ditangani',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  selesai: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function IncidentsPanel({ initialItems, disasterTypes, kabkotas, causes }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [editItem, setEditItem] = useState<IncidentItem | null>(null)
  const [timelineItem, setTimelineItem] = useState<IncidentItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Filter
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterRegency, setFilterRegency] = useState('all')

  // Paging
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Filtered items
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (search) {
          const q = search.toLowerCase()
          if (
            !item.title.toLowerCase().includes(q) &&
            !item.regencyName?.toLowerCase().includes(q) &&
            !item.villageName?.toLowerCase().includes(q)
          )
            return false
        }
        if (filterStatus !== 'all' && item.status !== filterStatus) return false
        if (filterType !== 'all' && item.disasterTypeId?.toString() !== filterType) return false
        if (filterRegency !== 'all' && item.regencyId !== filterRegency) return false
        return true
      }),
    [items, search, filterStatus, filterType, filterRegency]
  )

  // Reset ke halaman 1 saat filter berubah
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function resetFilter() {
    setSearch('')
    setFilterStatus('all')
    setFilterType('all')
    setFilterRegency('all')
    setPage(1)
  }

  function handleFilterChange(fn: () => void) {
    fn()
    setPage(1)
  }

  // Stats
  const stats = {
    total: items.length,
    aktif: items.filter((i) => i.status === 'aktif').length,
    ditangani: items.filter((i) => i.status === 'ditangani').length,
    selesai: items.filter((i) => i.status === 'selesai').length,
  }

  const hasFilter =
    search || filterStatus !== 'all' || filterType !== 'all' || filterRegency !== 'all'

  async function handleToggle(id: number, current: boolean) {
    const res = await togglePublishAction(id, !current)
    if (res.success)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isPublished: !current } : i)))
    else toast.error('Gagal mengubah status')
  }

  async function handleDelete(id: number, title: string) {
    if (
      !confirm(
        `Hapus kejadian "${title}"?\n\nData korban, kerugian, dan timeline terkait juga akan dihapus.`
      )
    )
      return
    const res = await deleteIncidentAction(id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Kejadian dihapus')
    } else toast.error('Gagal menghapus')
  }

  // Pagination helpers
  function PageBtn({
    p,
    label,
    disabled,
  }: {
    p: number
    label?: React.ReactNode
    disabled?: boolean
  }) {
    const isActive = p === safePage
    return (
      <button
        onClick={() => setPage(p)}
        disabled={disabled || isActive}
        className={cn(
          'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition',
          isActive
            ? 'bg-navy-800 text-white'
            : 'text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
        )}
      >
        {label ?? p}
      </button>
    )
  }

  function paginationPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (safePage <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (safePage >= totalPages - 3)
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages]
  }

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-navy-800', bg: 'bg-navy-50' },
          { label: 'Aktif', value: stats.aktif, color: 'text-red-700', bg: 'bg-red-50' },
          {
            label: 'Ditangani',
            value: stats.ditangani,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
          },
          { label: 'Selesai', value: stats.selesai, color: 'text-green-700', bg: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Cari judul, lokasi..."
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
            className="h-9 pl-8"
          />
        </div>

        <Select
          value={filterStatus}
          onValueChange={(v) => handleFilterChange(() => setFilterStatus(v))}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="aktif">🔴 Aktif</SelectItem>
            <SelectItem value="ditangani">🟡 Ditangani</SelectItem>
            <SelectItem value="selesai">🟢 Selesai</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterType}
          onValueChange={(v) => handleFilterChange(() => setFilterType(v))}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            {disasterTypes.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.icon} {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterRegency}
          onValueChange={(v) => handleFilterChange(() => setFilterRegency(v))}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="Kab/Kota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kab/Kota</SelectItem>
            {kabkotas.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-9"
            onClick={resetFilter}
          >
            <X className="h-3.5 w-3.5" /> Reset
          </Button>
        )}

        <div className="ml-auto">
          <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Tambah Kejadian
          </Button>
        </div>
      </div>

      {/* Info hasil filter + page size */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {hasFilter ? (
            <>
              Menampilkan <strong>{filtered.length}</strong> dari {items.length} kejadian
            </>
          ) : (
            <>{items.length} kejadian terdaftar</>
          )}
          {filtered.length > 0 && (
            <span className="ml-1 text-slate-400">
              · Hal {safePage} / {totalPages}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Tampilkan</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-500">per hal</span>
        </div>
      </div>

      {/* Tabel */}
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
                <Filter className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-muted-foreground text-sm">
                {hasFilter
                  ? 'Tidak ada kejadian yang cocok dengan filter.'
                  : 'Belum ada data kejadian bencana.'}
              </p>
              {!hasFilter && (
                <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="h-3.5 w-3.5" /> Tambah Kejadian Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="py-3 pr-3 pl-5 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Kejadian
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Lokasi
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Waktu
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Publik
                    </th>
                    <th className="py-3 pr-5 pl-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginated.map((item) => {
                    const statusCfg =
                      STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ??
                      STATUS_CONFIG.aktif
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          'transition-colors hover:bg-slate-50',
                          !item.isPublished && 'opacity-50'
                        )}
                      >
                        <td className="py-3.5 pr-3 pl-5">
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                              style={{ background: `${item.disasterTypeColor ?? '#6b7592'}15` }}
                            >
                              {item.disasterTypeIcon ?? '⚠️'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-navy-800 line-clamp-1 font-semibold">
                                {item.title}
                              </p>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {item.disasterTypeName ?? '—'}
                                {item.source && (
                                  <span className="ml-2 text-slate-400">· {item.source}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="text-muted-foreground flex items-start gap-1.5 text-xs">
                            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                            <div>
                              <p className="font-medium text-slate-700">
                                {item.regencyName ?? '—'}
                              </p>
                              {(item.districtId || item.villageName) && (
                                <p className="text-slate-400">
                                  {[item.districtId, item.villageName].filter(Boolean).join(', ')}
                                </p>
                              )}
                              {item.latitude && item.longitude && (
                                <p className="font-mono text-[10px] text-slate-400">
                                  {parseFloat(item.latitude as any).toFixed(4)},{' '}
                                  {parseFloat(item.longitude as any).toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <Clock className="h-3 w-3 shrink-0" />
                            <div>
                              <p>{formatDate(item.occurredDate)}</p>
                              {item.occurredTime && (
                                <p className="text-slate-400">
                                  {item.occurredTime.slice(0, 5)} WITA
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${statusCfg.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                            <span className={`text-[11px] font-bold ${statusCfg.text}`}>
                              {statusCfg.label}
                            </span>
                          </div>
                          {item.currentCondition && (
                            <p className="text-muted-foreground mt-1 text-[10px]">
                              {item.currentCondition}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(item.id, item.isPublished ?? true)}
                            className={
                              item.isPublished ? 'text-green-600' : 'text-muted-foreground'
                            }
                            title={item.isPublished ? 'Tampil di publik' : 'Tersembunyi'}
                          >
                            {item.isPublished ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </td>
                        <td className="py-3.5 pr-5 pl-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-navy-600 h-8 gap-1.5 text-xs"
                              onClick={() => setTimelineItem(item)}
                            >
                              📋 Timeline
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setEditItem(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id, item.title)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filtered.length)} dari {filtered.length} data
          </p>
          <div className="flex items-center gap-1">
            <PageBtn
              p={1}
              label={<ChevronsLeft className="h-3.5 w-3.5" />}
              disabled={safePage === 1}
            />
            <PageBtn
              p={safePage - 1}
              label={<ChevronLeft className="h-3.5 w-3.5" />}
              disabled={safePage === 1}
            />

            {paginationPages().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">
                  …
                </span>
              ) : (
                <PageBtn key={p} p={p as number} />
              )
            )}

            <PageBtn
              p={safePage + 1}
              label={<ChevronRight className="h-3.5 w-3.5" />}
              disabled={safePage === totalPages}
            />
            <PageBtn
              p={totalPages}
              label={<ChevronsRight className="h-3.5 w-3.5" />}
              disabled={safePage === totalPages}
            />
          </div>
        </div>
      )}

      {/* Dialogs */}
      <IncidentDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        disasterTypes={disasterTypes}
        kabkotas={kabkotas}
        causes={causes}
        onSuccess={(item) => {
          setItems((prev) => [item, ...prev])
          router.refresh()
        }}
      />

      {editItem && (
        <IncidentDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          item={{
            ...editItem,
            occurredDate: editItem.occurredDate
              ? new Date(editItem.occurredDate).toISOString().slice(0, 10)
              : '',
          }}
          disasterTypes={disasterTypes}
          kabkotas={kabkotas}
          causes={causes}
          onSuccess={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
            setEditItem(null)
            router.refresh()
          }}
        />
      )}

      {timelineItem && (
        <TimelineDialog
          open={!!timelineItem}
          onOpenChange={(o) => !o && setTimelineItem(null)}
          incident={timelineItem}
        />
      )}
    </div>
  )
}
