// src/app/(public)/peringatan-dini/_components/cuaca-grid.tsx
'use client'

import { useEffect, useState } from 'react'
import { Thermometer, Wind, Droplets, Eye, RefreshCw } from 'lucide-react'

interface KotaItem {
  kode: string
  nama: string
  ibukota: string
  kecamatan: string
}

interface CuacaData {
  desc: string
  emoji: string
  warna: string
  suhu: number
  kelembapan: number
  angin: number
  arahAngin: string
  jangkauPandang: string
  future: { time: string; emoji: string; suhu: number }[]
  lokasi: string
}

const WEATHER_MAP: Record<number, { desc: string; emoji: string; warna: string }> = {
  0: { desc: 'Cerah', emoji: '☀️', warna: 'text-yellow-500' },
  1: { desc: 'Cerah Berawan', emoji: '⛅', warna: 'text-yellow-400' },
  2: { desc: 'Cerah Berawan', emoji: '⛅', warna: 'text-yellow-400' },
  3: { desc: 'Berawan', emoji: '☁️', warna: 'text-slate-400' },
  4: { desc: 'Berawan Tebal', emoji: '☁️', warna: 'text-slate-500' },
  5: { desc: 'Udara Kabur', emoji: '🌫️', warna: 'text-slate-400' },
  10: { desc: 'Asap', emoji: '🌫️', warna: 'text-orange-400' },
  45: { desc: 'Kabut', emoji: '🌁', warna: 'text-slate-400' },
  60: { desc: 'Hujan Ringan', emoji: '🌦️', warna: 'text-blue-400' },
  61: { desc: 'Hujan Sedang', emoji: '🌧️', warna: 'text-blue-500' },
  63: { desc: 'Hujan Lebat', emoji: '🌧️', warna: 'text-blue-600' },
  80: { desc: 'Hujan Lokal', emoji: '🌦️', warna: 'text-blue-400' },
  95: { desc: 'Hujan Badai', emoji: '⛈️', warna: 'text-purple-500' },
  97: { desc: 'Hujan Badai', emoji: '⛈️', warna: 'text-purple-500' },
}

function getW(code: number) {
  return WEATHER_MAP[code] ?? { desc: 'Tidak diketahui', emoji: '❓', warna: 'text-slate-400' }
}

function fmtHour(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}.00`
}

async function fetchCuaca(kode: string): Promise<CuacaData | null> {
  try {
    // Gunakan proxy route agar tidak kena CORS/403
    const res = await fetch(`/api/bmkg-cuaca?adm4=${kode}`)
    if (!res.ok) return null
    const data = await res.json()

    const lokasi = data?.lokasi
    const cuacaList: any[][] = data?.data?.[0]?.cuaca ?? data?.cuaca ?? []

    const now = Date.now()
    let closest: any = null
    let minDiff = Infinity
    const allItems = cuacaList.flat()

    for (const item of allItems) {
      const t = new Date(item.local_datetime ?? item.datetime ?? '').getTime()
      if (!isNaN(t) && Math.abs(now - t) < minDiff) {
        minDiff = Math.abs(now - t)
        closest = item
      }
    }
    if (!closest) return null

    const future = allItems
      .filter((i) => new Date(i.local_datetime ?? i.datetime ?? '').getTime() > now)
      .slice(0, 3)
      .map((f) => ({
        time: fmtHour(f.local_datetime ?? f.datetime),
        emoji: getW(f.weather).emoji,
        suhu: f.t,
      }))

    const w = getW(closest.weather)
    return {
      desc: w.desc,
      emoji: w.emoji,
      warna: w.warna,
      suhu: closest.t,
      kelembapan: closest.hu,
      angin: closest.ws,
      arahAngin: closest.wd ?? '',
      jangkauPandang: closest.vs_text ?? '—',
      future,
      lokasi: [lokasi?.desa, lokasi?.kecamatan].filter(Boolean).join(', ') || '',
    }
  } catch {
    return null
  }
}

function CuacaCard({
  kota,
  data,
  loading,
}: {
  kota: KotaItem
  data: CuacaData | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="h-3 w-20 rounded bg-slate-100" />
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-100" />
        </div>
        <div className="mb-3 h-5 w-28 rounded bg-slate-100" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 rounded bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-navy-800 text-sm font-bold">{kota.nama}</p>
            <p className="text-xs text-slate-400">{kota.ibukota}</p>
          </div>
          <span className="text-2xl">❓</span>
        </div>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
          Data cuaca tidak tersedia saat ini
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-navy-800 text-sm leading-snug font-bold">{kota.nama}</p>
          <p className="text-xs text-slate-400">{kota.ibukota}</p>
          {data.lokasi && (
            <p className="mt-0.5 truncate text-[10px] text-slate-300">{data.lokasi}</p>
          )}
        </div>
        <span className="ml-2 shrink-0 text-3xl">{data.emoji}</span>
      </div>

      <p className={`mb-3 text-sm font-semibold ${data.warna}`}>{data.desc}</p>

      <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Thermometer className="h-3.5 w-3.5 shrink-0 text-orange-400" />
          <span>
            <strong>{data.suhu}°C</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Droplets className="h-3.5 w-3.5 shrink-0 text-blue-400" />
          <span>
            <strong>{data.kelembapan}%</strong> RH
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Wind className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          <span>
            <strong>{data.angin}</strong> km/j {data.arahAngin}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Eye className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{data.jangkauPandang}</span>
        </div>
      </div>

      {data.future.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Prakiraan Berikutnya
          </p>
          <div className="flex gap-1.5">
            {data.future.map((f, i) => (
              <div key={i} className="flex-1 rounded-lg bg-slate-50 px-1 py-2 text-center">
                <p className="text-[10px] text-slate-400">{f.time}</p>
                <p className="my-1 text-base leading-none">{f.emoji}</p>
                <p className="text-[10px] font-semibold text-slate-600">{f.suhu}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function CuacaGrid({ kotaList }: { kotaList: KotaItem[] }) {
  const [cuacaMap, setCuacaMap] = useState<Record<string, CuacaData | null>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>(
    Object.fromEntries(kotaList.map((k) => [k.kode, true]))
  )
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  async function loadAll() {
    setLoading(Object.fromEntries(kotaList.map((k) => [k.kode, true])))
    // Fetch semua serentak
    const results = await Promise.all(
      kotaList.map(async (kota) => {
        const data = await fetchCuaca(kota.kode)
        return [kota.kode, data] as const
      })
    )
    setCuacaMap(Object.fromEntries(results))
    setLoading(Object.fromEntries(kotaList.map((k) => [k.kode, false])))
    setLastUpdate(new Date())
  }

  useEffect(() => {
    loadAll()
  }, [])

  const isLoadingAny = Object.values(loading).some(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-navy-800 text-base font-bold">
          Prakiraan Cuaca — 10 Kabupaten/Kota Kalimantan Timur
        </h2>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <p className="text-xs text-slate-400">
              Update:{' '}
              {lastUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
            </p>
          )}
          <button
            onClick={loadAll}
            disabled={isLoadingAny}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoadingAny ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kotaList.map((kota) => (
          <CuacaCard
            key={kota.kode}
            kota={kota}
            data={cuacaMap[kota.kode] ?? null}
            loading={loading[kota.kode] ?? false}
          />
        ))}
      </div>
    </div>
  )
}
