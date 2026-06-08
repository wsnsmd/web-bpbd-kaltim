// src/app/(public)/peringatan-dini/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, ExternalLink, AlertTriangle, CloudRain } from 'lucide-react'
import { CuacaGrid } from './_components/cuaca-grid'
import { PeringatanGrid } from './_components/peringatan-grid'

export const metadata = {
  title: 'Peringatan Dini Cuaca',
  description:
    'Informasi prakiraan cuaca dan peringatan dini 10 kab/kota Kalimantan Timur dari BMKG.',
}

export const KOTA_KALTIM = [
  {
    kode: '64.72.09.1003',
    nama: 'Kota Samarinda',
    ibukota: 'Samarinda',
    kecamatan: 'Samarinda Kota',
  },
  {
    kode: '64.71.06.1005',
    nama: 'Kota Balikpapan',
    ibukota: 'Balikpapan',
    kecamatan: 'Balikpapan Kota',
  },
  { kode: '64.74.01.1001', nama: 'Kota Bontang', ibukota: 'Bontang', kecamatan: 'Bontang Utara' },
  {
    kode: '64.02.06.1010',
    nama: 'Kab. Kutai Kartanegara',
    ibukota: 'Tenggarong',
    kecamatan: 'Tenggarong',
  },
  {
    kode: '64.08.04.2001',
    nama: 'Kab. Kutai Timur',
    ibukota: 'Sangatta',
    kecamatan: 'Sangatta Utara',
  },
  {
    kode: '64.03.05.1004',
    nama: 'Kab. Berau',
    ibukota: 'Tanjung Redeb',
    kecamatan: 'Tanjung Redeb',
  },
  { kode: '64.01.04.1001', nama: 'Kab. Paser', ibukota: 'Tanah Grogot', kecamatan: 'Tanah Grogot' },
  {
    kode: '64.07.07.2019',
    nama: 'Kab. Kutai Barat',
    ibukota: 'Sendawar',
    kecamatan: 'Barong Tongkok',
  },
  {
    kode: '64.09.01.1011',
    nama: 'Kab. Penajam Paser Utara',
    ibukota: 'Penajam',
    kecamatan: 'Penajam',
  },
  {
    kode: '64.11.01.2006',
    nama: 'Kab. Mahakam Ulu',
    ibukota: 'Long Bagun',
    kecamatan: 'Long Bagun',
  },
]

// Skeleton card
function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex justify-between">
        <div className="h-4 w-2/3 rounded bg-slate-100" />
        <div className="h-6 w-6 rounded-full bg-slate-100" />
      </div>
      <div className="h-3 w-1/2 rounded bg-slate-100" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

export default function PeringatanDiniPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-900 px-4 py-8">
        <div className="container-content mx-auto max-w-(--width-content)">
          <div className="text-navy-400 mb-3 flex items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Peringatan Dini</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                <AlertTriangle className="h-3 w-3" />
                Data Real-time BMKG
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                Peringatan Dini & Prakiraan Cuaca
              </h1>
              <p className="text-navy-300 mt-1 text-sm">
                Kalimantan Timur · Diperbarui setiap 10 menit
              </p>
            </div>
            <a
              href="https://www.bmkg.go.id/cuaca/peringatan-dini-cuaca/64"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka di BMKG
            </a>
          </div>
        </div>
      </div>

      <div className="container-content mx-auto max-w-(--width-content) space-y-10 px-4 py-8">
        {/* ── Peringatan Dini Aktif dari RSS BMKG ── */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-navy-800 flex items-center gap-2 text-base font-bold">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Peringatan Dini Aktif — Kalimantan Timur
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Sumber: BMKG Nowcasting RSS · Filter wilayah Kalimantan Timur
              </p>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            }
          >
            <PeringatanGrid />
          </Suspense>
        </section>

        {/* ── Prakiraan Cuaca 10 Kab/Kota ── */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-navy-800 flex items-center gap-2 text-base font-bold">
                <CloudRain className="h-4 w-4 text-blue-500" />
                Prakiraan Cuaca — 10 Kabupaten/Kota
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">Sumber: API BMKG · Cache 1 jam</p>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            }
          >
            <CuacaGrid kotaList={KOTA_KALTIM} />
          </Suspense>
        </section>

        {/* Credit */}
        <p className="pb-4 text-center text-xs text-slate-400">
          Data dari API terbuka{' '}
          <a
            href="https://data.bmkg.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-500 hover:underline"
          >
            BMKG
          </a>{' '}
          · Peringatan dini cache 10 menit · Prakiraan cuaca cache 1 jam
        </p>
      </div>
    </div>
  )
}
