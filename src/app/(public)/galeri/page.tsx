// src/app/(public)/galeri/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { galleryAlbums, galleryItems } from '@db/schema'
import { eq, asc, count } from 'drizzle-orm'
import { ChevronRight, Images, Film, LayoutGrid, Camera } from 'lucide-react'

export const metadata = {
  title: 'Galeri & Dokumentasi — BPBD Kaltim',
  description: 'Dokumentasi foto dan video kegiatan BPBD Provinsi Kalimantan Timur.',
}

function getYoutubeThumbnail(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null
}

const TYPE_ICON = { photo: Camera, video: Film, mixed: LayoutGrid }
const TYPE_LABEL = { photo: 'Foto', video: 'Video', mixed: 'Campuran' }

export default async function GaleriPage() {
  noStore()

  const albums = await db
    .select({
      id: galleryAlbums.id,
      title: galleryAlbums.title,
      description: galleryAlbums.description,
      coverUrl: galleryAlbums.coverUrl,
      type: galleryAlbums.type,
      order: galleryAlbums.order,
      itemCount: count(galleryItems.id),
    })
    .from(galleryAlbums)
    .leftJoin(galleryItems, eq(galleryItems.albumId, galleryAlbums.id))
    .where(eq(galleryAlbums.isActive, true))
    .groupBy(galleryAlbums.id)
    .orderBy(asc(galleryAlbums.order))

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
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="container-content max-w-content relative z-10 mx-auto py-12">
          <div className="text-navy-400 mb-4 flex items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Galeri</span>
          </div>
          <p className="mb-2 text-[11px] font-bold tracking-widest text-orange-400 uppercase">
            Dokumentasi Visual
          </p>
          <h1 className="mb-2 text-3xl leading-none font-black tracking-tight text-white md:text-4xl">
            Galeri & Dokumentasi
          </h1>
          <p className="text-navy-300 max-w-lg text-sm">
            Foto dan video dokumentasi kegiatan BPBD Provinsi Kalimantan Timur
          </p>
        </div>
      </div>

      <div className="container-content max-w-content mx-auto py-10">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Images className="h-12 w-12 text-slate-300" />
            <p className="text-muted-foreground text-sm">Belum ada album galeri.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => {
              const TypeIcon = TYPE_ICON[album.type ?? 'photo']
              return (
                <Link key={album.id} href={`/galeri/${album.id}`} className="group block">
                  <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {/* Cover */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      {album.coverUrl ? (
                        <Image
                          src={album.coverUrl}
                          alt={album.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="bg-navy-50 flex h-full items-center justify-center">
                          <TypeIcon className="text-navy-200 h-12 w-12" />
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                          <TypeIcon className="h-2.5 w-2.5" />
                          {TYPE_LABEL[album.type ?? 'photo']}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                          {album.itemCount} item
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="text-navy-800 group-hover:text-navy-600 mb-1 line-clamp-1 text-base font-bold transition">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
