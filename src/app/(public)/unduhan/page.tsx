// src/app/(public)/unduhan/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { db } from '@/lib/db'
import { downloads, siteSettings } from '@db/schema'
import { asc, eq } from 'drizzle-orm'
import {
  FileText,
  Download,
  ChevronRight,
  FolderOpen,
  ArrowUpRight,
  Tag,
  Files,
  ChevronLeft,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DEFAULT_DOWNLOAD_CATEGORIES } from '@db/schema/downloads'
import { cn } from '@/lib/utils'
import { DownloadSearch } from './_components/download-search'

export const metadata = {
  title: 'Download Center',
  description:
    'Unduh dokumen, laporan, regulasi, SOP, dan panduan resmi BPBD Provinsi Kalimantan Timur.',
}

interface Props {
  searchParams: Promise<{
    kategori?: string
    q?: string
    hal?: string
    tahun?: string
    bulan?: string
  }>
}

const PER_PAGE = 12

const COLOR_HEX: Record<string, { bg: string; text: string; accent: string }> = {
  danger: { bg: '#fef0e6', text: '#6b2100', accent: '#e85000' },
  caution: { bg: '#ebf3fd', text: '#0f2d5c', accent: '#2e72c9' },
  warning: { bg: '#fdf7e0', text: '#573a00', accent: '#c98b00' },
  safe: { bg: '#f0fdf4', text: '#14532d', accent: '#22c55e' },
  navy: { bg: '#ebf3fd', text: '#0f2d5c', accent: '#1b56a8' },
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

// Type untuk Lucide icons
type LucideIconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

function DynamicIcon({
  name,
  style,
  className,
}: {
  name: string | null
  style?: React.CSSProperties
  className?: string
}) {
  const defaultIcon: LucideIconComponent = LucideIcons.FileText
  let Icon: LucideIconComponent = defaultIcon

  if (name && name in LucideIcons) {
    const MaybeIcon = (LucideIcons as Record<string, unknown>)[name]
    if (typeof MaybeIcon === 'function') {
      Icon = MaybeIcon as LucideIconComponent
    }
  }

  return <Icon className={className} style={style} />
}

function buildQuery(params: {
  kategori?: string
  q?: string
  hal?: number
  tahun?: string
  bulan?: string
}) {
  const p = new URLSearchParams()
  if (params.kategori) p.set('kategori', params.kategori)
  if (params.q) p.set('q', params.q)
  if (params.tahun) p.set('tahun', params.tahun)
  if (params.bulan) p.set('bulan', params.bulan)
  if (params.hal && params.hal > 1) p.set('hal', String(params.hal))
  const str = p.toString()
  return str ? `?${str}` : ''
}

export default async function UnduhanPage({ searchParams }: Props) {
  noStore()
  const { kategori, q, hal, tahun, bulan } = await searchParams
  const page = Math.max(1, Number(hal) || 1)
  const offset = (page - 1) * PER_PAGE

  const [allItems, categorySetting] = await Promise.all([
    db.select().from(downloads).where(eq(downloads.isActive, true)).orderBy(asc(downloads.order)),
    db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'download_categories'))
      .then((r) => r[0]),
  ])

  const categories = categorySetting?.value
    ? categorySetting.value
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : DEFAULT_DOWNLOAD_CATEGORIES

  // Kumpulkan tahun yang tersedia dari data
  const availableYears = [
    ...new Set(
      allItems
        .map((d) => (d.createdAt ? new Date(d.createdAt).getFullYear() : null))
        .filter(Boolean) as number[]
    ),
  ].sort((a, b) => b - a)

  // Filter
  let filtered = allItems
  if (kategori) filtered = filtered.filter((d) => d.category === kategori)
  if (tahun)
    filtered = filtered.filter(
      (d) => d.createdAt && new Date(d.createdAt).getFullYear() === Number(tahun)
    )
  if (bulan)
    filtered = filtered.filter(
      (d) => d.createdAt && new Date(d.createdAt).getMonth() + 1 === Number(bulan)
    )
  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter(
      (d) => d.title.toLowerCase().includes(lower) || d.category.toLowerCase().includes(lower)
    )
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / PER_PAGE)
  const paged = filtered.slice(offset, offset + PER_PAGE)

  const countByCategory = Object.fromEntries(
    categories.map((cat) => [cat, allItems.filter((d) => d.category === cat).length])
  )
  const activeCategories = categories.filter((cat) => (countByCategory[cat] ?? 0) > 0)

  const hasFilter = !!(kategori || q || tahun || bulan)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-navy-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="container-content max-w-content relative z-10 mx-auto py-12">
          <div className="text-navy-400 mb-4 flex items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Download Center</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold tracking-widest text-orange-400 uppercase">
                Dokumen Publik
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Download Center
              </h1>
              <p className="text-navy-300 mt-2 max-w-md text-sm">
                Akses terbuka dokumen resmi BPBD Provinsi Kalimantan Timur
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center">
                <p className="text-xl leading-none font-black text-white">{allItems.length}</p>
                <p className="text-navy-400 mt-0.5 text-[10px] tracking-wider uppercase">Dokumen</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center">
                <p className="text-xl leading-none font-black text-white">
                  {activeCategories.length}
                </p>
                <p className="text-navy-400 mt-0.5 text-[10px] tracking-wider uppercase">
                  Kategori
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-content max-w-content mx-auto py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          {/* ── Sidebar ── */}
          <aside className="space-y-4 lg:sticky lg:top-30">
            <DownloadSearch defaultValue={q} />

            {/* Kategori */}
            <Card className="gap-0 overflow-hidden rounded-xl p-0">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <Tag className="text-navy-600 h-4 w-4" />
                <h3 className="text-navy-800 text-sm font-bold">Kategori</h3>
              </div>
              <nav className="p-2">
                <Link
                  href={buildQuery({ q, tahun, bulan })}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all',
                    !kategori
                      ? 'bg-navy-800 text-white'
                      : 'hover:text-navy-800 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Files className="h-3.5 w-3.5 shrink-0" /> Semua
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                      !kategori ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {allItems.length}
                  </span>
                </Link>
                {activeCategories.map((cat) => {
                  const count = countByCategory[cat] ?? 0
                  const active = kategori === cat
                  const firstItem = allItems.find((d) => d.category === cat)
                  const color = COLOR_HEX[firstItem?.colorScheme ?? 'navy']
                  return (
                    <Link
                      key={cat}
                      href={buildQuery({ kategori: cat, q, tahun, bulan })}
                      className={cn(
                        'mt-0.5 flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all',
                        active
                          ? 'text-white'
                          : 'hover:text-navy-800 text-slate-600 hover:bg-slate-50'
                      )}
                      style={active ? { background: color.accent } : {}}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: active ? 'rgba(255,255,255,0.7)' : color.accent }}
                        />
                        {cat}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {count}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </Card>

            {/* Filter Tahun & Bulan */}
            {availableYears.length > 0 && (
              <Card className="gap-0 overflow-hidden rounded-xl p-0">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                  <CalendarDays className="text-navy-600 h-4 w-4" />
                  <h3 className="text-navy-800 text-sm font-bold">Tahun &amp; Bulan</h3>
                </div>
                <nav className="space-y-0.5 p-2">
                  {availableYears.map((yr) => {
                    const activeYear = tahun === String(yr)
                    const yearMonths = [
                      ...new Set(
                        allItems
                          .filter((d) => d.createdAt && new Date(d.createdAt).getFullYear() === yr)
                          .map((d) => new Date(d.createdAt!).getMonth() + 1)
                      ),
                    ].sort((a, b) => a - b)

                    return (
                      <div key={yr}>
                        <Link
                          href={
                            activeYear && !bulan
                              ? buildQuery({ kategori, q })
                              : buildQuery({ kategori, q, tahun: String(yr) })
                          }
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all',
                            activeYear
                              ? 'bg-navy-800 text-white'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          <span>{yr}</span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                              activeYear ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            {
                              allItems.filter(
                                (d) => d.createdAt && new Date(d.createdAt).getFullYear() === yr
                              ).length
                            }
                          </span>
                        </Link>

                        {/* Sub-item bulan — tampil jika tahun aktif */}
                        {activeYear &&
                          yearMonths.map((m) => {
                            const activeBulan = bulan === String(m)
                            const count = allItems.filter(
                              (d) =>
                                d.createdAt &&
                                new Date(d.createdAt).getFullYear() === yr &&
                                new Date(d.createdAt).getMonth() + 1 === m
                            ).length
                            return (
                              <Link
                                key={m}
                                href={
                                  activeBulan
                                    ? buildQuery({ kategori, q, tahun: String(yr) })
                                    : buildQuery({
                                        kategori,
                                        q,
                                        tahun: String(yr),
                                        bulan: String(m),
                                      })
                                }
                                className={cn(
                                  'ml-3 flex items-center justify-between rounded-lg px-3.5 py-2 text-xs font-medium transition-all',
                                  activeBulan
                                    ? 'bg-orange-500 text-white'
                                    : 'hover:text-navy-700 text-slate-500 hover:bg-slate-50'
                                )}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                                  {MONTH_NAMES[m - 1]}
                                </span>
                                <span
                                  className={cn(
                                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                                    activeBulan
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-100 text-slate-400'
                                  )}
                                >
                                  {count}
                                </span>
                              </Link>
                            )
                          })}
                      </div>
                    )
                  })}
                </nav>
              </Card>
            )}
          </aside>

          {/* ── Daftar Dokumen ── */}
          <div className="min-h-120">
            {/* Info bar */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {q ? (
                  <>
                    <strong className="text-navy-800">{total}</strong> hasil untuk &quot;
                    <em className="text-navy-700 font-medium not-italic">{q}</em>&quot;
                  </>
                ) : kategori ? (
                  <>
                    <strong className="text-navy-800">{total}</strong> dokumen dalam &quot;
                    <em className="text-navy-700 font-medium not-italic">{kategori}</em>&quot;
                  </>
                ) : (
                  <>
                    <strong className="text-navy-800">{total}</strong> dokumen tersedia
                  </>
                )}
                {totalPages > 1 && (
                  <span className="text-slate-400">
                    {' '}
                    · hal. {page}/{totalPages}
                  </span>
                )}
              </p>
              {hasFilter && (
                <Link
                  href="/unduhan"
                  className="flex items-center gap-1 text-xs font-semibold text-orange-600 transition hover:text-orange-700"
                >
                  ✕ Reset filter
                </Link>
              )}
            </div>

            {/* Grid dalam Card putih */}
            <Card className="overflow-hidden rounded-xl p-0">
              {paged.length === 0 ? (
                <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
                    <FolderOpen className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-navy-800 mb-1 font-semibold">Dokumen tidak ditemukan</p>
                    <p className="text-sm text-slate-500">Coba kata kunci lain atau reset filter</p>
                  </div>
                  <Link
                    href="/unduhan"
                    className="bg-navy-800 hover:bg-navy-700 rounded-lg px-5 py-2 text-xs font-bold text-white transition"
                  >
                    Lihat semua
                  </Link>
                </CardContent>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                    {paged.map((dl) => {
                      const color = COLOR_HEX[dl.colorScheme ?? 'navy'] ?? COLOR_HEX.navy
                      return (
                        <a
                          key={dl.id}
                          href={dl.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 hover:shadow-md"
                        >
                          {/* Top accent bar */}
                          <div className="h-1 w-full" style={{ background: color.accent }} />

                          <div className="flex flex-1 flex-col gap-3 p-5">
                            <div className="flex items-center justify-between">
                              <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl"
                                style={{ background: color.bg }}
                              >
                                <DynamicIcon
                                  name={dl.icon}
                                  className="h-5 w-5"
                                  style={{ color: color.text }}
                                />
                              </div>
                              <span
                                className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase"
                                style={{ background: color.bg, color: color.text }}
                              >
                                {dl.category}
                              </span>
                            </div>

                            <p className="text-navy-800 group-hover:text-navy-600 line-clamp-2 flex-1 text-sm leading-snug font-semibold transition">
                              {dl.title}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                              <span className="flex items-center gap-1 text-slate-400">
                                <FileText className="h-3 w-3" />
                                {dl.fileSize ?? '—'} · {dl.fileType ?? 'PDF'}
                              </span>
                              <span
                                className="flex items-center gap-1 font-bold transition"
                                style={{ color: color.accent }}
                              >
                                <Download className="h-3 w-3 group-hover:hidden" />
                                <ArrowUpRight className="hidden h-3 w-3 group-hover:block" />
                                Unduh
                              </span>
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                      <Link
                        href={
                          page > 1
                            ? `/unduhan${buildQuery({ kategori, q, tahun, bulan, hal: page - 1 })}`
                            : '#'
                        }
                        aria-disabled={page <= 1}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
                          page > 1
                            ? 'text-navy-700 hover:bg-navy-50'
                            : 'pointer-events-none text-slate-300'
                        )}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
                      </Link>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                          .reduce<(number | '...')[]>((acc, p, i, arr) => {
                            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                            acc.push(p)
                            return acc
                          }, [])
                          .map((p, i) =>
                            p === '...' ? (
                              <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">
                                …
                              </span>
                            ) : (
                              <Link
                                key={p}
                                href={`/unduhan${buildQuery({ kategori, q, tahun, bulan, hal: p as number })}`}
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition',
                                  p === page
                                    ? 'bg-navy-800 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                )}
                              >
                                {p}
                              </Link>
                            )
                          )}
                      </div>

                      <Link
                        href={
                          page < totalPages
                            ? `/unduhan${buildQuery({ kategori, q, tahun, bulan, hal: page + 1 })}`
                            : '#'
                        }
                        aria-disabled={page >= totalPages}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
                          page < totalPages
                            ? 'text-navy-700 hover:bg-navy-50'
                            : 'pointer-events-none text-slate-300'
                        )}
                      >
                        Berikutnya <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
