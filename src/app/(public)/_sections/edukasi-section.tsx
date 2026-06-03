// src/app/(public)/_sections/edukasi-section.tsx
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { db } from '@/lib/db'
import { news, newsCategories } from '@db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { cache } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// Category ID dari DB
const EDUKASI_CATEGORY_ID = 5
const PENGUMUMAN_CATEGORY_ID = 6

const getEdukasiNews = cache(async () => {
  return db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      viewCount: news.viewCount,
      publishedAt: news.publishedAt,
    })
    .from(news)
    .where(and(eq(news.categoryId, EDUKASI_CATEGORY_ID), eq(news.status, 'published')))
    .orderBy(desc(news.publishedAt))
    .limit(4)
})

const getPengumumanNews = cache(async () => {
  return db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      publishedAt: news.publishedAt,
    })
    .from(news)
    .where(and(eq(news.categoryId, PENGUMUMAN_CATEGORY_ID), eq(news.status, 'published')))
    .orderBy(desc(news.publishedAt))
    .limit(4)
})

function formatMeta(publishedAt: Date | null, viewCount: number | null) {
  if (!publishedAt) return `${(viewCount ?? 0).toLocaleString('id')} dibaca`
  const ago = formatDistanceToNow(publishedAt, { addSuffix: true, locale: localeId })
  return `${ago} · ${(viewCount ?? 0).toLocaleString('id')} dibaca`
}

function formatDate(publishedAt: Date | null) {
  if (!publishedAt) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(publishedAt)
}

// Icon mapping berdasarkan urutan — bisa diubah sesuai selera
const EDUKASI_ICONS = ['Flame', 'Waves', 'Mountain', 'Wind', 'CloudRain', 'Zap']

export async function EdukasiSection() {
  const [edukasiItems, pengumumanItems] = await Promise.all([getEdukasiNews(), getPengumumanNews()])

  return (
    <section className="bg-navy-950 py-20">
      <div className="container-content mx-auto max-w-(--width-content)">
        <div className="grid gap-16 md:grid-cols-2">
          {/* ── Kolom Edukasi ── */}
          <div>
            <div className="text-gold-300 mb-8 flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
              <span className="bg-gold-400 h-0.5 w-5 rounded-full" />
              Edukasi Kebencanaan
            </div>
            <h2 className="mb-8 text-3xl font-bold text-white">Edukasi & Mitigasi Bencana</h2>

            {edukasiItems.length === 0 ? (
              <p className="text-navy-400 text-sm">Belum ada konten edukasi.</p>
            ) : (
              <div className="space-y-3">
                {edukasiItems.map((item, idx) => {
                  const iconName = EDUKASI_ICONS[idx % EDUKASI_ICONS.length]
                  const Icon = (LucideIcons as any)[iconName] ?? LucideIcons.BookOpen
                  return (
                    <Link
                      key={item.id}
                      href={`/berita/${item.slug}`}
                      className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/4 p-4 transition-colors hover:bg-white/8"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/6">
                        <Icon className="text-gold-300 h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 line-clamp-2 text-[14px] font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="text-navy-400 text-[11px]">
                          {formatMeta(item.publishedAt, item.viewCount)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            <Link
              href="/berita?kategori=edukasi"
              className="text-gold-300 mt-6 inline-flex items-center gap-2 text-xs font-semibold hover:underline"
            >
              Lihat semua edukasi <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* ── Kolom Pengumuman ── */}
          <div>
            <div className="text-gold-300 mb-8 flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
              <span className="bg-gold-400 h-0.5 w-5 rounded-full" />
              Pengumuman
            </div>
            <h2 className="mb-8 text-3xl font-bold text-white">Pengumuman Resmi Terkini</h2>

            {pengumumanItems.length === 0 ? (
              <p className="text-navy-400 text-sm">Belum ada pengumuman.</p>
            ) : (
              <div className="space-y-3">
                {pengumumanItems.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/4 p-4 transition-colors hover:bg-white/8"
                  >
                    <div className="bg-gold-400/10 text-gold-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <p className="mb-1 line-clamp-2 text-[14px] font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="text-navy-400 flex items-center gap-1.5 text-[11px]">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/berita?kategori=pengumuman"
              className="text-gold-300 mt-6 inline-flex items-center gap-2 text-xs font-semibold hover:underline"
            >
              Lihat semua pengumuman <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
