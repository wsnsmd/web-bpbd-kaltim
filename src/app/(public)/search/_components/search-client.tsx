// src/app/(public)/search/_components/search-client.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import {
  Search,
  AlertTriangle,
  Newspaper,
  Download,
  MapPin,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface IncidentItem {
  id: number
  title: string
  description: string | null
  regencyName: string | null
  occurredDate: string | null
  status: string
}
interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
  categoryName: string | null
  featuredImage: string | null
}
interface DownloadItem {
  id: number
  title: string
  category: string
  fileType: string | null
  fileUrl: string
  fileSize: string | null
}

interface Props {
  query: string
  activeType: string
  pageNum: number
  pageSize: number
  results: { incidents: IncidentItem[]; news: NewsItem[]; downloads: DownloadItem[] }
  totals: { incident: number; news: number; download: number }
  grandTotal: number
}

const STATUS_CONFIG = {
  aktif: { label: 'Aktif', dot: 'bg-red-500 animate-pulse', text: 'text-red-600', bg: 'bg-red-50' },
  ditangani: { label: 'Ditangani', dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  selesai: { label: 'Selesai', dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' },
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(d))
}

// Highlight query dalam teks
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-orange-100 px-0.5 text-orange-700">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export function SearchClient({
  query,
  activeType,
  pageNum,
  pageSize,
  results,
  totals,
  grandTotal,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const TABS = [
    { key: 'all', label: 'Semua', count: grandTotal },
    {
      key: 'incident',
      label: 'Kejadian',
      count: totals.incident,
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    {
      key: 'news',
      label: 'Berita',
      count: totals.news,
      icon: <Newspaper className="h-3.5 w-3.5" />,
    },
    {
      key: 'download',
      label: 'Unduhan',
      count: totals.download,
      icon: <Download className="h-3.5 w-3.5" />,
    },
  ]

  function navigate(type: string, page = 1) {
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}`)
    })
  }

  const totalPages = Math.ceil(
    (activeType === 'incident'
      ? totals.incident
      : activeType === 'news'
        ? totals.news
        : activeType === 'download'
          ? totals.download
          : grandTotal) / pageSize
  )

  return (
    <div className="space-y-6">
      {/* ── Stats + Tabs ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Ditemukan <strong className="text-navy-800">{grandTotal}</strong> hasil untuk{' '}
          <strong className="text-orange-600">&ldquo;{query}&rdquo;</strong>
        </p>

        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate(t.key)}
              disabled={isPending}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition',
                activeType === t.key
                  ? 'bg-navy-800 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              {t.icon}
              {t.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px]',
                  activeType === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {grandTotal === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Search className="h-10 w-10 text-slate-200" />
          <p className="font-medium text-slate-500">Tidak ada hasil ditemukan</p>
          <p className="text-sm text-slate-400">Coba kata kunci lain atau lebih umum</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Kejadian ── */}
          {results.incidents.length > 0 && (
            <section>
              {activeType === 'all' && (
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-navy-800 flex items-center gap-2 text-sm font-bold">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Kejadian Bencana
                  </h2>
                  {totals.incident > 3 && (
                    <button
                      onClick={() => navigate('incident')}
                      className="text-navy-600 text-xs font-semibold hover:underline"
                    >
                      Lihat semua {totals.incident} →
                    </button>
                  )}
                </div>
              )}
              <div className="space-y-3">
                {results.incidents.map((item) => {
                  const st =
                    STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ??
                    STATUS_CONFIG.selesai
                  return (
                    <Link
                      key={item.id}
                      href="/data-kejadian"
                      className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <p className="text-navy-800 text-sm leading-snug font-semibold">
                            <Highlight text={item.title} query={query} />
                          </p>
                          <div
                            className={cn(
                              'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5',
                              st.bg
                            )}
                          >
                            <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                            <span className={cn('text-[10px] font-bold', st.text)}>{st.label}</span>
                          </div>
                        </div>
                        {item.description && (
                          <p className="mb-1.5 line-clamp-1 text-xs text-slate-500">
                            <Highlight text={item.description} query={query} />
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          {item.regencyName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.regencyName}
                            </span>
                          )}
                          {item.occurredDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {fmtDate(item.occurredDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Berita ── */}
          {results.news.length > 0 && (
            <section>
              {activeType === 'all' && (
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-navy-800 flex items-center gap-2 text-sm font-bold">
                    <Newspaper className="h-4 w-4 text-blue-500" />
                    Berita & Informasi
                  </h2>
                  {totals.news > 3 && (
                    <button
                      onClick={() => navigate('news')}
                      className="text-navy-600 text-xs font-semibold hover:underline"
                    >
                      Lihat semua {totals.news} →
                    </button>
                  )}
                </div>
              )}
              <div className="space-y-3">
                {results.news.map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <Newspaper className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p className="text-navy-800 text-sm leading-snug font-semibold">
                          <Highlight text={item.title} query={query} />
                        </p>
                        {item.categoryName && (
                          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            {item.categoryName}
                          </span>
                        )}
                      </div>
                      {item.excerpt && (
                        <p className="mb-1.5 line-clamp-2 text-xs text-slate-500">
                          <Highlight text={item.excerpt} query={query} />
                        </p>
                      )}
                      {item.publishedAt && (
                        <p className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {fmtDate(item.publishedAt)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Unduhan ── */}
          {results.downloads.length > 0 && (
            <section>
              {activeType === 'all' && (
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-navy-800 flex items-center gap-2 text-sm font-bold">
                    <Download className="h-4 w-4 text-emerald-500" />
                    Dokumen & Unduhan
                  </h2>
                  {totals.download > 3 && (
                    <button
                      onClick={() => navigate('download')}
                      className="text-navy-600 text-xs font-semibold hover:underline"
                    >
                      Lihat semua {totals.download} →
                    </button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {results.downloads.map((item) => (
                  <a
                    key={item.id}
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <FileText className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-navy-800 line-clamp-1 text-sm leading-snug font-semibold">
                        <Highlight text={item.title} query={query} />
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold">
                          {item.fileType ?? 'FILE'}
                        </span>
                        <span>{item.category}</span>
                        {item.fileSize && <span>{item.fileSize}</span>}
                      </div>
                    </div>
                    <Download className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── Pagination (hanya saat filter tab aktif) ── */}
          {activeType !== 'all' && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                Hal {pageNum} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(activeType, pageNum - 1)}
                  disabled={pageNum === 1 || isPending}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
                </button>
                <button
                  onClick={() => navigate(activeType, pageNum + 1)}
                  disabled={pageNum >= totalPages || isPending}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
