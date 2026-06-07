// src/app/admin/(dashboard)/analytics/_components/analytics-client.tsx
'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  MousePointer,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  totalViews: number
  todayViews: number
  yesterdayViews: number
  last7Views: number
  uniqueToday: number
  perHari: { date: string; total: number }[]
  topPages: { path: string; title: string; total: number }[]
  perBrowser: { name: string; total: number }[]
  perOS: { name: string; total: number }[]
  perDevice: { name: string; total: number }[]
  perCountry: { name: string; total: number }[]
  perCity: { name: string; country: string; total: number }[]
  topReferrers: { referrer: string; total: number }[]
}

const COLORS = [
  '#e85000',
  '#1b56a8',
  '#c98b00',
  '#16a34a',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
]

const DEVICE_ICON: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
  desktop: <Monitor className="h-4 w-4" />,
}

function fmtNum(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}
function fmtDate(d: string) {
  const dt = new Date(d)
  return `${dt.getDate()}/${dt.getMonth() + 1}`
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-600">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-navy-800 font-bold">
          {fmtNum(p.value)} kunjungan
        </p>
      ))}
    </div>
  )
}

export function AnalyticsClient({
  totalViews,
  todayViews,
  yesterdayViews,
  last7Views,
  uniqueToday,
  perHari,
  topPages,
  perBrowser,
  perOS,
  perDevice,
  perCountry,
  perCity,
  topReferrers,
}: Props) {
  const [activeTab, setActiveTab] = useState<'pages' | 'geo' | 'tech' | 'referrer'>('pages')

  const todayDiff =
    yesterdayViews > 0 ? (((todayViews - yesterdayViews) / yesterdayViews) * 100).toFixed(0) : '0'
  const isUp = todayViews >= yesterdayViews
  const totalDevice = perDevice.reduce((s, d) => s + d.total, 0)

  // Buat labels untuk chart
  const chartData = perHari.map((d) => ({
    date: fmtDate(d.date),
    total: d.total,
  }))

  return (
    <div className="space-y-6">
      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Total Kunjungan',
            val: fmtNum(totalViews),
            sub: 'Semua waktu',
            icon: <Eye className="h-5 w-5" />,
            bg: 'bg-navy-50',
            color: 'text-navy-700',
          },
          {
            label: 'Hari Ini',
            val: fmtNum(todayViews),
            sub: `${isUp ? '↑' : '↓'} ${Math.abs(Number(todayDiff))}% vs kemarin`,
            icon: isUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />,
            bg: isUp ? 'bg-green-50' : 'bg-red-50',
            color: isUp ? 'text-green-700' : 'text-red-700',
          },
          {
            label: '7 Hari Terakhir',
            val: fmtNum(last7Views),
            sub: `~${Math.round(last7Views / 7)} / hari`,
            icon: <TrendingUp className="h-5 w-5" />,
            bg: 'bg-blue-50',
            color: 'text-blue-700',
          },
          {
            label: 'Sesi Unik Hari Ini',
            val: fmtNum(uniqueToday),
            sub: 'Pengunjung berbeda',
            icon: <Users className="h-5 w-5" />,
            bg: 'bg-purple-50',
            color: 'text-purple-700',
          },
        ].map((s) => (
          <Card key={s.label} className={`border-0 ${s.bg}`}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                <span className={s.color}>{s.icon}</span>
              </div>
              <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Chart 30 hari ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-navy-800 text-sm font-bold">
            Tren Kunjungan 30 Hari Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVisit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e85000" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#e85000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Kunjungan"
                stroke="#e85000"
                strokeWidth={2}
                fill="url(#gradVisit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Device pie + Tab detail ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        {/* Device */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-navy-800 text-sm font-bold">Perangkat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={perDevice.map((d) => ({ name: d.name, value: d.total }))}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                >
                  {perDevice.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [fmtNum(Number(v)), '']} />
              </PieChart>
            </ResponsiveContainer>
            {perDevice.map((d, i) => {
              const pct = totalDevice > 0 ? ((d.total / totalDevice) * 100).toFixed(0) : 0
              return (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span style={{ color: COLORS[i % COLORS.length] }}>
                      {DEVICE_ICON[d.name] ?? <Monitor className="h-4 w-4" />}
                    </span>
                    <span className="text-slate-600 capitalize">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{pct}%</span>
                    <span className="text-navy-800 font-bold">{fmtNum(d.total)}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Tab detail */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'pages', label: 'Halaman Populer' },
                { key: 'geo', label: 'Lokasi' },
                { key: 'tech', label: 'Browser & OS' },
                { key: 'referrer', label: 'Referrer' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as typeof activeTab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === t.key
                      ? 'bg-navy-800 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Halaman Populer */}
            {activeTab === 'pages' && (
              <div className="space-y-2">
                {topPages.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">Belum ada data</p>
                ) : (
                  topPages.map((p, i) => {
                    const maxVal = topPages[0]?.total ?? 1
                    const pct = (p.total / maxVal) * 100
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-700">
                              {p.title !== p.path ? p.title : p.path}
                            </p>
                            <p className="truncate font-mono text-[10px] text-slate-400">
                              {p.path}
                            </p>
                          </div>
                          <span className="text-navy-800 ml-3 shrink-0 font-bold">
                            {fmtNum(p.total)}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-slate-100">
                          <div
                            className="h-1 rounded-full bg-orange-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Lokasi */}
            {activeTab === 'geo' && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    🌍 Negara
                  </p>
                  <div className="space-y-1.5">
                    {perCountry.map((c, i) => {
                      const max = perCountry[0]?.total ?? 1
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-24 truncate text-slate-600">{c.name}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-blue-400"
                              style={{ width: `${(c.total / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-navy-800 w-8 text-right font-bold">{c.total}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    🏙️ Kota
                  </p>
                  <div className="space-y-1.5">
                    {perCity.map((c, i) => {
                      const max = perCity[0]?.total ?? 1
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-24 truncate text-slate-600">{c.name}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-teal-400"
                              style={{ width: `${(c.total / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-navy-800 w-8 text-right font-bold">{c.total}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Browser & OS */}
            {activeTab === 'tech' && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    🌐 Browser
                  </p>
                  <div className="space-y-1.5">
                    {perBrowser.map((b, i) => {
                      const max = perBrowser[0]?.total ?? 1
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-24 truncate text-slate-600">{b.name}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-orange-400"
                              style={{
                                width: `${(b.total / max) * 100}%`,
                                background: COLORS[i % COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-navy-800 w-8 text-right font-bold">{b.total}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    💻 Sistem Operasi
                  </p>
                  <div className="space-y-1.5">
                    {perOS.map((o, i) => {
                      const max = perOS[0]?.total ?? 1
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-24 truncate text-slate-600">{o.name}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${(o.total / max) * 100}%`,
                                background: COLORS[i % COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-navy-800 w-8 text-right font-bold">{o.total}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Referrer */}
            {activeTab === 'referrer' && (
              <div className="space-y-2">
                {topReferrers.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">Belum ada data referrer</p>
                ) : (
                  topReferrers.map((r, i) => {
                    const max = topReferrers[0]?.total ?? 1
                    let domain = r.referrer
                    try {
                      domain = new URL(r.referrer).hostname
                    } catch {}
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <MousePointer className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate text-slate-600">{domain}</span>
                          </div>
                          <span className="text-navy-800 ml-3 shrink-0 font-bold">
                            {fmtNum(r.total)}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-slate-100">
                          <div
                            className="h-1 rounded-full bg-purple-400"
                            style={{ width: `${(r.total / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
