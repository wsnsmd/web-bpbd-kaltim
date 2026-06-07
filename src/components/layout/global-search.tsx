// src/components/layout/global-search.tsx
'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  MapPin,
  BarChart2,
  AlertTriangle,
  FileText,
  Phone,
  Flame,
  Download,
  Newspaper,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Tipe hasil pencarian ──────────────────────────────────────
interface SearchResult {
  type: 'incident' | 'news' | 'download' | 'page' | 'info'
  title: string
  subtitle?: string
  href: string
  icon: React.ReactNode
}

// ── Static pages / quick links ───────────────────────────────
const STATIC_RESULTS: SearchResult[] = [
  {
    type: 'page',
    title: 'Peta Kejadian Bencana',
    subtitle: 'Lihat peta interaktif kejadian aktif',
    href: '/peta-bencana',
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    type: 'page',
    title: 'Statistik Bencana',
    subtitle: 'Dashboard data & chart kejadian',
    href: '/statistik-bencana',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    type: 'page',
    title: 'Peringatan Dini Cuaca',
    subtitle: 'Prakiraan cuaca 10 kab/kota Kaltim',
    href: '/peringatan-dini',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    type: 'page',
    title: 'Data Kejadian Bencana',
    subtitle: 'Tabel lengkap kejadian bencana',
    href: '/data-kejadian',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    type: 'page',
    title: 'Peta Hotspot Karhutla',
    subtitle: 'Sebaran titik api 24 jam terakhir',
    href: '/peta-hotspot',
    icon: <Flame className="h-4 w-4" />,
  },
  {
    type: 'info',
    title: 'Hubungi 112',
    subtitle: 'Layanan darurat 24 jam',
    href: 'tel:112',
    icon: <Phone className="h-4 w-4" />,
  },
  {
    type: 'info',
    title: 'Kontak & Lokasi Kantor',
    subtitle: 'Alamat dan peta lokasi BPBD Kaltim',
    href: '/kontak',
    icon: <MapPin className="h-4 w-4" />,
  },
]

// ── Fetch dari API (incidents + news + downloads) ───────────
async function searchAll(q: string): Promise<SearchResult[]> {
  if (q.length < 2) return []
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`)
    if (!res.ok) return []
    const data: {
      incidents: {
        id: number
        title: string
        regencyName: string | null
        occurredDate: string | null
        status: string
      }[]
      news: {
        id: string
        title: string
        slug: string
        excerpt: string | null
        publishedAt: string | null
        categoryName: string | null
      }[]
      downloads: {
        id: number
        title: string
        category: string
        fileType: string | null
        fileUrl: string
      }[]
    } = await res.json()

    const incidentRes: SearchResult[] = (data.incidents ?? []).map((i) => ({
      type: 'incident',
      title: i.title,
      subtitle: [
        i.regencyName,
        i.occurredDate
          ? new Date(i.occurredDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
      href: `/data-kejadian`,
      icon: <AlertTriangle className="h-4 w-4" />,
    }))

    const newsRes: SearchResult[] = (data.news ?? []).map((n) => ({
      type: 'news',
      title: n.title,
      subtitle: [
        n.categoryName,
        n.publishedAt
          ? new Date(n.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
      href: `/berita/${n.slug}`,
      icon: <Newspaper className="h-4 w-4" />,
    }))

    const downloadRes: SearchResult[] = (data.downloads ?? []).map((d) => ({
      type: 'download',
      title: d.title,
      subtitle: `${d.category}${d.fileType ? ' · ' + d.fileType : ''}`,
      href: d.fileUrl,
      icon: <Download className="h-4 w-4" />,
    }))

    return [...incidentRes, ...newsRes, ...downloadRes]
  } catch {
    return []
  }
}

// ── Filter static pages by query ────────────────────────────
function filterStatic(q: string): SearchResult[] {
  if (!q) return STATIC_RESULTS
  const ql = q.toLowerCase()
  return STATIC_RESULTS.filter(
    (r) => r.title.toLowerCase().includes(ql) || r.subtitle?.toLowerCase().includes(ql)
  )
}

const TYPE_COLOR: Record<string, string> = {
  incident: 'bg-red-100 text-red-600',
  news: 'bg-blue-100 text-blue-600',
  download: 'bg-emerald-100 text-emerald-600',
  page: 'bg-navy-100 text-navy-700',
  info: 'bg-amber-100 text-amber-700',
}
const TYPE_LABEL: Record<string, string> = {
  incident: 'Kejadian',
  news: 'Berita',
  download: 'Unduhan',
  page: 'Halaman',
  info: 'Info',
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>(STATIC_RESULTS)
  const [loading, startTransition] = useTransition()
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Keyboard shortcut Ctrl+K / Cmd+K ────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // ── Focus input saat modal buka ──────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults(STATIC_RESULTS)
      setActiveIdx(-1)
    }
  }, [open])

  // ── Search dengan debounce ───────────────────────────────
  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const staticRes = filterStatic(q)
        const dbRes = await searchAll(q)
        setResults([...dbRes, ...staticRes])
        setActiveIdx(-1)
      })
    }, 200)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    doSearch(q)
  }

  // ── Keyboard navigation ──────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      const r = results[activeIdx]
      if (r) {
        navigate(r.href)
        setOpen(false)
      }
    }
  }

  function navigate(href: string) {
    if (href.startsWith('tel:') || href.startsWith('http')) {
      window.location.href = href
    } else {
      router.push(href)
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2',
          'text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white',
          'dark:border-white/10 dark:bg-white/5 dark:text-slate-500 dark:hover:bg-white/10'
        )}
        aria-label="Cari"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden text-xs sm:inline">Cari...</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline-flex dark:border-white/10 dark:bg-white/5">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed top-[15vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-white/10">
          <Search className={cn('h-4 w-4 shrink-0 text-slate-400', loading && 'animate-pulse')} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Cari kejadian, halaman, informasi..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults(STATIC_RESULTS)
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 sm:block dark:border-white/10">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-400">
              <Search className="h-8 w-8 text-slate-200" />
              <p>Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={`${r.href}-${i}`}>
                  <button
                    onClick={() => navigate(r.href)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition',
                      activeIdx === i
                        ? 'bg-navy-50 dark:bg-white/10'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        TYPE_COLOR[r.type]
                      )}
                    >
                      {r.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {r.title}
                      </p>
                      {r.subtitle && (
                        <p className="truncate text-[11px] text-slate-400">{r.subtitle}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                          TYPE_COLOR[r.type]
                        )}
                      >
                        {TYPE_LABEL[r.type]}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 dark:border-white/10">
          <p className="text-[10px] text-slate-400">
            <kbd className="rounded border border-slate-200 px-1 py-0.5 dark:border-white/10">
              ↑↓
            </kbd>{' '}
            navigasi ·
            <kbd className="ml-1 rounded border border-slate-200 px-1 py-0.5 dark:border-white/10">
              Enter
            </kbd>{' '}
            pilih ·
            <kbd className="ml-1 rounded border border-slate-200 px-1 py-0.5 dark:border-white/10">
              Esc
            </kbd>{' '}
            tutup
          </p>
          {query.length >= 2 && (
            <button
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`)
                setOpen(false)
              }}
              className="text-navy-600 shrink-0 text-[11px] font-semibold transition hover:text-orange-600 hover:underline"
            >
              Lihat semua hasil →
            </button>
          )}
        </div>
      </div>
    </>
  )
}
