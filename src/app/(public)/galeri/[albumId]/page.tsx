// src/app/(public)/galeri/[albumId]/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { galleryAlbums, galleryItems } from '@db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { ChevronRight, Camera, Film, LayoutGrid } from 'lucide-react'
import { GaleriAlbumClient } from './_components/galeri-album-client'

interface Props {
  params: Promise<{ albumId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { albumId } = await params
  const [album] = await db
    .select({ title: galleryAlbums.title })
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, Number(albumId)))
  return {
    title: album ? `${album.title} — Galeri BPBD Kaltim` : 'Galeri',
  }
}

function getYoutubeThumbnail(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null
}

const TYPE_LABEL = { photo: 'Foto', video: 'Video', mixed: 'Campuran' }

export default async function GaleriAlbumPage({ params }: Props) {
  noStore()
  const { albumId } = await params
  const id = Number(albumId)
  if (isNaN(id)) notFound()

  const [album] = await db
    .select()
    .from(galleryAlbums)
    .where(and(eq(galleryAlbums.id, id), eq(galleryAlbums.isActive, true)))
  if (!album) notFound()

  const items = await db
    .select()
    .from(galleryItems)
    .where(and(eq(galleryItems.albumId, id), eq(galleryItems.isActive, true)))
    .orderBy(asc(galleryItems.order))

  // Inject auto-thumbnail YouTube ke items
  const itemsWithThumb = items.map((item) => ({
    ...item,
    displayThumb: item.thumbnailUrl || getYoutubeThumbnail(item.videoUrl),
  }))

  const photos = itemsWithThumb.filter((i) => i.type === 'photo')
  const videos = itemsWithThumb.filter((i) => i.type === 'video')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container-content max-w-content relative z-10 mx-auto py-12">
          <div className="text-navy-400 mb-4 flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/galeri" className="transition hover:text-white">
              Galeri
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{album.title}</span>
          </div>
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-full border border-orange-500/30 bg-orange-500/20 px-3 py-1 text-[11px] font-bold tracking-wider text-orange-300 uppercase">
              {TYPE_LABEL[album.type ?? 'photo']}
            </span>
            <span className="text-navy-400 text-xs">{items.length} item</span>
          </div>
          <h1 className="mb-2 text-3xl leading-none font-black tracking-tight text-white md:text-4xl">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-navy-300 max-w-lg text-sm">{album.description}</p>
          )}
        </div>
      </div>

      <div className="container-content max-w-content mx-auto py-10">
        <GaleriAlbumClient albumType={album.type ?? 'photo'} photos={photos} videos={videos} />
      </div>
    </div>
  )
}
