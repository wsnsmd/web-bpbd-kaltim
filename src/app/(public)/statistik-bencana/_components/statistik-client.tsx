// src/app/(public)/statistik-bencana/_components/statistik-client.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Check } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'

interface SummaryStats {
  totalKejadian: number
  mengungsi: number
  menderita: number
  hilang: number
  meninggal: number
  lukaSakit: number
  totalKK: number
  totalKerugian: number
}
interface JenisItem {
  name: string
  category: string
  color: string
  total: number
}
interface Props {
  summaryStats: SummaryStats
  perKabkota: { name: string; total: number }[]
  perJenis: JenisItem[]
  perBulanAll: { tahun: number; bulan: number; total: number }[]
  perTahun: { tahun: number; total: number }[]
  alamCount: number
  nonAlamCount: number
  currentYear: number
  availableYears: number[]
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function fmtNum(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}
function fmtRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} Jt`
  return `Rp ${fmtNum(n)}`
}

interface TooltipPayloadItem {
  name: string
  value: number
  color?: string
  fill?: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-slate-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill }}>
          {p.name}: <strong>{fmtNum(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

export function StatistikClient({
  summaryStats,
  perKabkota,
  perJenis,
  perBulanAll,
  perTahun,
  alamCount,
  nonAlamCount,
  currentYear,
  availableYears,
}: Props) {
  const [selectedYears, setSelectedYears] = useState<number[]>([currentYear])

  function toggleYear(y: number) {
    setSelectedYears((prev) =>
      prev.includes(y)
        ? prev.length > 1
          ? prev.filter((x) => x !== y)
          : prev // min 1 tahun
        : [...prev, y].sort()
    )
  }

  // Hitung data bulan berdasarkan tahun yang dipilih
  const bulanChartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const bulanIdx = i + 1
      const total = selectedYears.reduce((sum, y) => {
        const found = perBulanAll.find((b) => b.tahun === y && b.bulan === bulanIdx)
        return sum + (found?.total ?? 0)
      }, 0)
      return { name: BULAN[i], total }
    })
  }, [selectedYears, perBulanAll])

  const kabkotaChartData = perKabkota.map((k) => ({
    name: k.name.replace('Kabupaten ', 'Kab. ').replace('Kota ', ''),
    total: k.total,
  }))

  const totalForPie = alamCount + nonAlamCount
  const pieData = [
    { name: 'Alam', value: alamCount, color: '#6366f1' },
    { name: 'Non Alam', value: nonAlamCount, color: '#f97316' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-navy-900 px-4 py-8">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="text-navy-400 mb-3 flex items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Statistik Bencana</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                Dashboard Statistik Bencana
              </h1>
              <p className="text-navy-300 mt-1 text-sm">
                Data Bencana BPBD Provinsi Kalimantan Timur · Diperbarui Otomatis
              </p>
            </div>

            {/* ── Filter Tahun ── */}
            {availableYears.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-navy-400 text-xs font-semibold">Tahun:</span>
                {availableYears.map((y) => {
                  const active = selectedYears.includes(y)
                  return (
                    <button
                      key={y}
                      onClick={() => toggleYear(y)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        active
                          ? 'border-orange-400 bg-orange-500 text-white'
                          : 'border-white/20 bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {y}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8">
        {/* ── Summary ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
          {/* Total kejadian — card besar */}
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl bg-orange-500 p-8 text-center text-white shadow-md">
            <p className="mb-2 text-sm font-bold tracking-widest uppercase opacity-90">
              Total Kejadian
            </p>
            <p className="text-7xl leading-none font-black">{fmtNum(summaryStats.totalKejadian)}</p>
            <p className="mt-3 text-xs opacity-70">Seluruh data yang tercatat</p>
          </div>

          {/* Grid 4 stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Mengungsi', value: summaryStats.mengungsi, sub: 'Jiwa' },
              { label: 'Menderita', value: summaryStats.menderita, sub: 'Jiwa' },
              { label: 'Hilang', value: summaryStats.hilang, sub: 'Jiwa' },
              { label: 'Meninggal', value: summaryStats.meninggal, sub: 'Jiwa' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col justify-center rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
              >
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {s.label}
                </p>
                <p className="text-navy-800 mt-1 text-3xl leading-none font-black">
                  {fmtNum(s.value)}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 stats bawah */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Total KK Mengungsi
            </p>
            <p className="text-navy-800 mt-1 text-3xl leading-none font-black">
              {fmtNum(summaryStats.totalKK)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Luka / Sakit
            </p>
            <p className="text-navy-800 mt-1 text-3xl leading-none font-black">
              {fmtNum(summaryStats.lukaSakit)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Jiwa</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Total Taksiran Kerugian
            </p>
            <p className="text-navy-800 mt-1 text-3xl leading-none font-black">
              {fmtRp(summaryStats.totalKerugian)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {fmtNum(summaryStats.totalKerugian)} IDR
            </p>
          </div>
        </div>

        {/* ── Chart Per Kab/Kota + Jenis ──────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Line chart kab/kota */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-bold text-orange-500">
              Jumlah Kejadian Per Kab/Kota
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={kabkotaChartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Kejadian"
                  stroke="#60a5fa"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#60a5fa', strokeWidth: 2, stroke: '#fff' }}
                >
                  <LabelList
                    dataKey="total"
                    position="top"
                    style={{ fontSize: 11, fontWeight: 700, fill: '#1e3a5f' }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie + tabel jenis */}
          <div className="space-y-4">
            {/* Pie chart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-700">Kategori Bencana</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={50}
                    >
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => {
                        const n = Number(v)
                        return [
                          `${fmtNum(n)} (${totalForPie > 0 ? ((n / totalForPie) * 100).toFixed(1) : 0}%)`,
                          '',
                        ]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {pieData.map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: p.color }}
                        />
                        <span className="font-medium text-slate-600">{p.name}</span>
                      </div>
                      <span className="font-black text-slate-800">
                        {totalForPie > 0 ? ((p.value / totalForPie) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabel per jenis */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-700">Per Jenis Bencana</h3>
              <div className="space-y-2.5">
                {perJenis.slice(0, 8).map((j, i) => {
                  const maxVal = perJenis[0]?.total ?? 1
                  const pct = (j.total / maxVal) * 100
                  return (
                    <div key={j.name} className="flex items-center gap-2 text-xs">
                      <span className="w-4 shrink-0 text-right font-semibold text-slate-400">
                        {i + 1}
                      </span>
                      <span className="w-28 truncate font-medium text-slate-700">{j.name}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: j.color }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right font-black text-slate-800">
                        {j.total}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Chart Per Bulan ─────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-base font-bold text-orange-500">Jumlah Kejadian Per Bulan</h3>
          <p className="mb-6 text-xs text-slate-400">Tahun {selectedYears.join(', ')}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bulanChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="total"
                name="Kejadian"
                fill="#e85000"
                radius={[4, 4, 0, 0]}
                maxBarSize={52}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  style={{ fontSize: 11, fontWeight: 700, fill: '#e85000' }}
                  formatter={(v) => (Number(v) > 0 ? v : '')}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-right text-[11px] text-slate-400 italic">
            Sumber Data: Pusdalops PB BPBD Provinsi Kalimantan Timur
          </p>
        </div>

        {/* ── Chart Per Tahun ─────────────────────────────────── */}
        {perTahun.length > 1 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-bold text-orange-500">Tren Kejadian Per Tahun</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={perTahun.map((t) => ({ name: String(t.tahun), total: t.total }))}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  name="Kejadian"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                >
                  <LabelList
                    dataKey="total"
                    position="top"
                    style={{ fontSize: 11, fontWeight: 700, fill: '#6366f1' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="pb-4 text-center text-xs text-slate-400">
          Data diperbarui secara otomatis dari sistem Pusdalops PB BPBD Provinsi Kalimantan Timur
        </p>
      </div>
    </div>
  )
}
