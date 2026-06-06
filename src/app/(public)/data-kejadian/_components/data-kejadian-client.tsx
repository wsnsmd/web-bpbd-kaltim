// src/app/(public)/data-kejadian/_components/data-kejadian-client.tsx
'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Search,
  X,
  Filter,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  Users,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Victim {
  id: number
  incidentId: number
  impactType: string
  countMale: number | null
  countFemale: number | null
  countTotal: number | null
}
interface Damage {
  id: number
  incidentId: number
  assetName: string
  heavyDamage: number | null
  moderateDamage: number | null
  lightDamage: number | null
  estimatedLoss: string | null
}
interface Incident {
  id: number
  title: string
  description: string | null
  typeName: string
  typeIcon: string
  typeColor: string
  typeId: number | null
  source: string | null
  occurredDate: string | null
  occurredTime: string | null
  regencyId: string | null
  regencyName: string | null
  districtName: string | null
  villageName: string | null
  status: string
  currentCondition: string | null
  currentEffort: string | null
  updatedAt: string | null
  victims: Victim[]
  damages: Damage[]
}

interface Props {
  incidents: Incident[]
  kabkotas: { id: string; name: string }[]
  jenisOptions: { id: number; name: string; icon: string | null }[]
}

const STATUS = {
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

const IMPACT_LABEL: Record<string, string> = {
  meninggal: 'Meninggal',
  hilang: 'Hilang',
  luka_sakit: 'Luka/Sakit',
  menderita: 'Menderita',
  mengungsi: 'Mengungsi',
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function fmtDate(d: string | null) {
  if (!d) return '—'
  const dt = new Date(d)
  return `${dt.getDate()} ${BULAN[dt.getMonth()]} ${dt.getFullYear()}`
}
function fmtNum(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}
function fmtRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} Jt`
  return `Rp ${fmtNum(n)}`
}
function victimSum(victims: Victim[], type: string) {
  return victims
    .filter((v) => v.impactType === type)
    .reduce((s, v) => s + (v.countTotal ?? (v.countMale ?? 0) + (v.countFemale ?? 0)), 0)
}

const PAGE_SIZE = 15

export function DataKejadianClient({ incidents, kabkotas, jenisOptions }: Props) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterJenis, setFilterJenis] = useState('all')
  const [filterRegency, setFilterRegency] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Incident | null>(null)

  const years = useMemo(() => {
    const ys = new Set(
      incidents.map((i) => i.occurredDate?.slice(0, 4)).filter(Boolean) as string[]
    )
    return [...ys].sort((a, b) => b.localeCompare(a))
  }, [incidents])

  const filtered = useMemo(
    () =>
      incidents.filter((i) => {
        if (search) {
          const q = search.toLowerCase()
          if (
            !i.title.toLowerCase().includes(q) &&
            !i.regencyName?.toLowerCase().includes(q) &&
            !i.villageName?.toLowerCase().includes(q)
          )
            return false
        }
        if (filterStatus !== 'all' && i.status !== filterStatus) return false
        if (filterJenis !== 'all' && String(i.typeId) !== filterJenis) return false
        if (filterRegency !== 'all' && i.regencyId !== filterRegency) return false
        if (filterYear !== 'all' && i.occurredDate?.slice(0, 4) !== filterYear) return false
        return true
      }),
    [incidents, search, filterStatus, filterJenis, filterRegency, filterYear]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const hasFilter =
    search ||
    filterStatus !== 'all' ||
    filterJenis !== 'all' ||
    filterRegency !== 'all' ||
    filterYear !== 'all'

  function resetFilter() {
    setSearch('')
    setFilterStatus('all')
    setFilterJenis('all')
    setFilterRegency('all')
    setFilterYear('all')
    setPage(1)
  }
  function changeFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  // Export CSV
  function exportCSV() {
    const headers = [
      'No',
      'Judul',
      'Jenis',
      'Tgl Kejadian',
      'Kab/Kota',
      'Kecamatan',
      'Kelurahan',
      'Status',
      'Meninggal',
      'Hilang',
      'Luka/Sakit',
      'Menderita',
      'Mengungsi',
      'Sumber',
    ]
    const rows = filtered.map((i, idx) => [
      idx + 1,
      i.title,
      i.typeName,
      fmtDate(i.occurredDate),
      i.regencyName ?? '',
      i.districtName ?? '',
      i.villageName ?? '',
      STATUS[i.status as keyof typeof STATUS]?.label ?? i.status,
      victimSum(i.victims, 'meninggal'),
      victimSum(i.victims, 'hilang'),
      victimSum(i.victims, 'luka_sakit'),
      victimSum(i.victims, 'menderita'),
      victimSum(i.victims, 'mengungsi'),
      i.source ?? '',
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-kejadian-bencana-kaltim.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Pagination pages
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
          { label: 'Total', val: incidents.length, color: 'text-navy-800', bg: 'bg-white' },
          {
            label: 'Aktif',
            val: incidents.filter((i) => i.status === 'aktif').length,
            color: 'text-red-700',
            bg: 'bg-red-50',
          },
          {
            label: 'Ditangani',
            val: incidents.filter((i) => i.status === 'ditangani').length,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
          },
          {
            label: 'Selesai',
            val: incidents.filter((i) => i.status === 'selesai').length,
            color: 'text-green-700',
            bg: 'bg-green-50',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border border-slate-100 px-4 py-3 shadow-sm ${s.bg}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{fmtNum(s.val)}</p>
            <p className="mt-0.5 text-xs text-slate-400">{s.label} Kejadian</p>
          </div>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, lokasi..."
              value={search}
              onChange={(e) => changeFilter(() => setSearch(e.target.value))}
              className="focus:ring-navy-300 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-8 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Filters */}
          {[
            {
              val: filterStatus,
              set: setFilterStatus,
              opts: [
                { v: 'all', l: 'Semua Status' },
                { v: 'aktif', l: '🔴 Aktif' },
                { v: 'ditangani', l: '🟡 Ditangani' },
                { v: 'selesai', l: '🟢 Selesai' },
              ],
              w: 'w-36',
            },
            {
              val: filterYear,
              set: setFilterYear,
              opts: [{ v: 'all', l: 'Semua Tahun' }, ...years.map((y) => ({ v: y, l: y }))],
              w: 'w-32',
            },
            {
              val: filterJenis,
              set: setFilterJenis,
              opts: [
                { v: 'all', l: 'Semua Jenis' },
                ...jenisOptions.map((j) => ({ v: String(j.id), l: `${j.icon ?? '⚠️'} ${j.name}` })),
              ],
              w: 'w-40',
            },
            {
              val: filterRegency,
              set: setFilterRegency,
              opts: [
                { v: 'all', l: 'Semua Kab/Kota' },
                ...kabkotas.map((k) => ({ v: k.id, l: k.name })),
              ],
              w: 'w-48',
            },
          ].map(({ val, set, opts, w }, i) => (
            <select
              key={i}
              value={val}
              onChange={(e) => changeFilter(() => set(e.target.value))}
              className={`${w} focus:ring-navy-300 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:outline-none`}
            >
              {opts.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          ))}

          {hasFilter && (
            <button
              onClick={resetFilter}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" /> Reset
            </button>
          )}

          <button
            onClick={exportCSV}
            className="bg-navy-700 hover:bg-navy-800 ml-auto flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Menampilkan <strong className="text-slate-600">{filtered.length}</strong> dari{' '}
          {incidents.length} kejadian
          {hasFilter && ' (difilter)'}
          {filtered.length > PAGE_SIZE && ` · Halaman ${safePage}/${totalPages}`}
        </p>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Filter className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">Tidak ada kejadian yang cocok dengan filter.</p>
            <button onClick={resetFilter} className="text-navy-600 text-xs underline">
              Reset filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  <th className="px-4 py-3 text-left">Kejadian</th>
                  <th className="px-3 py-3 text-left">Lokasi</th>
                  <th className="px-3 py-3 text-left">Tanggal</th>
                  <th className="px-3 py-3 text-left">Korban</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((item) => {
                  const st = STATUS[item.status as keyof typeof STATUS] ?? STATUS.selesai
                  const totalKorban = item.victims.reduce((s, v) => s + (v.countTotal ?? 0), 0)
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                            style={{ background: `${item.typeColor}15` }}
                          >
                            {item.typeIcon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-navy-800 line-clamp-1 font-semibold">{item.title}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{item.typeName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs font-medium text-slate-700">
                          {item.regencyName ?? '—'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {[item.districtName, item.villageName].filter(Boolean).join(', ') || '—'}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs text-slate-700">{fmtDate(item.occurredDate)}</p>
                        {item.occurredTime && (
                          <p className="text-[11px] text-slate-400">
                            {item.occurredTime.slice(0, 5)} WITA
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        {totalKorban > 0 ? (
                          <div className="space-y-0.5 text-xs">
                            {victimSum(item.victims, 'meninggal') > 0 && (
                              <p className="font-semibold text-red-600">
                                💀 {victimSum(item.victims, 'meninggal')} meninggal
                              </p>
                            )}
                            {victimSum(item.victims, 'mengungsi') > 0 && (
                              <p className="text-blue-600">
                                🏠 {fmtNum(victimSum(item.victims, 'mengungsi'))} mengungsi
                              </p>
                            )}
                            {victimSum(item.victims, 'luka_sakit') > 0 && (
                              <p className="text-amber-600">
                                🩹 {victimSum(item.victims, 'luka_sakit')} luka
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300">—</p>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${st.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          <span className={`text-[11px] font-bold ${st.text}`}>{st.label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <button
                          onClick={() => setSelected(item)}
                          className="bg-navy-50 text-navy-700 hover:bg-navy-100 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition"
                        >
                          <Eye className="h-3 w-3" /> Detail
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} dari{' '}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            {[
              { p: 1, icon: <ChevronsLeft className="h-3.5 w-3.5" />, dis: safePage === 1 },
              {
                p: safePage - 1,
                icon: <ChevronLeft className="h-3.5 w-3.5" />,
                dis: safePage === 1,
              },
            ].map(({ p, icon, dis }, i) => (
              <button
                key={i}
                onClick={() => setPage(p)}
                disabled={dis}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {icon}
              </button>
            ))}
            {paginationPages().map((p, i) =>
              p === '...' ? (
                <span key={`d${i}`} className="px-1 text-xs text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition',
                    p === safePage ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {p}
                </button>
              )
            )}
            {[
              {
                p: safePage + 1,
                icon: <ChevronRight className="h-3.5 w-3.5" />,
                dis: safePage === totalPages,
              },
              {
                p: totalPages,
                icon: <ChevronsRight className="h-3.5 w-3.5" />,
                dis: safePage === totalPages,
              },
            ].map(({ p, icon, dis }, i) => (
              <button
                key={i}
                onClick={() => setPage(p)}
                disabled={dis}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header modal */}
            <div className="bg-navy-800 shrink-0 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{selected.typeIcon}</span>
                  <div>
                    <p className="leading-snug font-bold text-white">{selected.title}</p>
                    <p className="text-navy-300 mt-0.5 text-xs">{selected.typeName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                {(() => {
                  const st = STATUS[selected.status as keyof typeof STATUS] ?? STATUS.selesai
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${st.bg} ${st.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  )
                })()}
                <span className="text-navy-300 text-[11px]">
                  {fmtDate(selected.occurredDate)}
                  {selected.occurredTime && ` · ${selected.occurredTime.slice(0, 5)} WITA`}
                </span>
              </div>
            </div>

            {/* Body modal */}
            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
              <div className="space-y-1 px-6 py-4">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Lokasi
                </p>
                <p className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {[selected.villageName, selected.districtName, selected.regencyName]
                    .filter(Boolean)
                    .join(', ') || 'Kalimantan Timur'}
                </p>
              </div>

              {selected.victims.length > 0 && (
                <div className="px-6 py-4">
                  <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    👥 Korban Jiwa
                  </p>
                  <div className="space-y-1.5">
                    {['meninggal', 'hilang', 'luka_sakit', 'menderita', 'mengungsi'].map((type) => {
                      const total = victimSum(selected.victims, type)
                      if (!total) return null
                      const laki = selected.victims
                        .filter((v) => v.impactType === type)
                        .reduce((s, v) => s + (v.countMale ?? 0), 0)
                      const prp = selected.victims
                        .filter((v) => v.impactType === type)
                        .reduce((s, v) => s + (v.countFemale ?? 0), 0)
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between border-b border-slate-50 py-1 last:border-0"
                        >
                          <span className="text-sm text-slate-600">{IMPACT_LABEL[type]}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>
                              {laki}L / {prp}P
                            </span>
                            <span className="text-navy-800 font-bold">{total} Jiwa</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selected.damages.length > 0 && (
                <div className="px-6 py-4">
                  <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    🏚️ Kerugian
                  </p>
                  <div className="space-y-2">
                    {selected.damages.map((d) => (
                      <div key={d.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-navy-800 text-xs font-semibold">{d.assetName}</span>
                          {d.estimatedLoss && parseFloat(d.estimatedLoss) > 0 && (
                            <span className="text-xs text-slate-500">
                              {fmtRp(parseFloat(d.estimatedLoss))}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex gap-3 text-[10px] text-slate-500">
                          <span>
                            Berat: <strong>{d.heavyDamage ?? 0}</strong>
                          </span>
                          <span>
                            Sedang: <strong>{d.moderateDamage ?? 0}</strong>
                          </span>
                          <span>
                            Ringan: <strong>{d.lightDamage ?? 0}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.description && (
                <div className="px-6 py-4">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    📋 Kronologis
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">{selected.description}</p>
                </div>
              )}

              {selected.currentEffort && (
                <div className="px-6 py-4">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    🚒 Upaya Penanganan
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">{selected.currentEffort}</p>
                </div>
              )}

              {selected.currentCondition && (
                <div className="px-6 py-4">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    🔄 Kondisi Terkini
                  </p>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-medium text-amber-800">
                      {selected.currentCondition}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1 bg-slate-50 px-6 py-4 text-[11px] text-slate-400">
                {selected.source && <p>📡 Sumber: {selected.source}</p>}
                {selected.updatedAt && (
                  <p>🕐 Update: {new Date(selected.updatedAt).toLocaleString('id-ID')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
