// src/app/(public)/peringatan-dini/page.tsx
// Data cuaca diambil client-side via proxy /api/bmkg-cuaca untuk menghindari 403
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, ExternalLink, AlertTriangle, CloudRain, Clock } from 'lucide-react'
import { CuacaGrid } from './_components/cuaca-grid'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Peringatan Dini Cuaca — BPBD Kaltim',
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
                Prakiraan & Peringatan Dini Cuaca
              </h1>
              <p className="text-navy-300 mt-1 text-sm">
                10 Kabupaten/Kota Kalimantan Timur · Diperbarui setiap 1 jam
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              className="shrink-0 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <a
                href="https://www.bmkg.go.id/cuaca/peringatan-dini-cuaca/64"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Peringatan Dini Resmi BMKG
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-content mx-auto max-w-(--width-content) space-y-8 px-4 py-8">
        {/* Grid cuaca — client component yang fetch dari proxy */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-2 h-4 w-3/4 rounded bg-slate-100" />
                  <div className="mb-4 h-3 w-1/2 rounded bg-slate-100" />
                  <div className="mb-3 h-8 w-1/4 rounded bg-slate-100" />
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 rounded bg-slate-100" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <CuacaGrid kotaList={KOTA_KALTIM} />
        </Suspense>

        {/* Banner peringatan dini resmi */}
        <div className="mt-4 mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="mb-1 font-bold text-amber-800">Peringatan Dini Cuaca Resmi BMKG</p>
              <p className="mb-4 text-sm text-amber-700">
                Untuk peringatan dini cuaca resmi (badai, hujan lebat, angin kencang, dan potensi
                bencana hidrometeorologi) silakan kunjungi langsung halaman BMKG Kalimantan Timur.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {/* Tombol 1: Peringatan Dini Kaltim */}
                <Button asChild className="rounded-xl font-bold">
                  <a
                    href="https://www.bmkg.go.id/cuaca/peringatan-dini-cuaca/64"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Peringatan Dini Kaltim
                  </a>
                </Button>

                {/* Tombol 2: Prakiraan Detail BMKG */}
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <a
                    href="https://www.bmkg.go.id/cuaca/prakiraan-cuaca-indonesia.bmkg?Prov=64"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CloudRain className="mr-2 h-4 w-4" />
                    Prakiraan Detail BMKG
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Data prakiraan cuaca dari API terbuka{' '}
          <a
            href="https://data.bmkg.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-500 hover:underline"
          >
            BMKG
          </a>{' '}
          · Cache 1 jam · Wajib mencantumkan BMKG sebagai sumber data
        </p>
      </div>
    </div>
  )
}
