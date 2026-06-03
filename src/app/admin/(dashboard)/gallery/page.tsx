// src/app/admin/(dashboard)/gallery/page.tsx
// Halaman daftar album
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { galleryAlbums, galleryItems } from '@db/schema'
import { asc, count, eq } from 'drizzle-orm'
import { Plus, Pencil, Trash2, Eye, Images, Film, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlbumCreateButton } from './_components/album-create-button'
import { AlbumDeleteButton } from './_components/album-delete-button'

export const metadata = { title: 'Galeri & Album' }

const TYPE_LABEL = { photo: 'Foto', video: 'Video', mixed: 'Campuran' }
const TYPE_ICON = { photo: Images, video: Film, mixed: LayoutGrid }

export default async function GalleryPage() {
  const rows = await db
    .select({
      id: galleryAlbums.id,
      title: galleryAlbums.title,
      description: galleryAlbums.description,
      coverUrl: galleryAlbums.coverUrl,
      type: galleryAlbums.type,
      order: galleryAlbums.order,
      isActive: galleryAlbums.isActive,
      itemCount: count(galleryItems.id),
    })
    .from(galleryAlbums)
    .leftJoin(galleryItems, eq(galleryItems.albumId, galleryAlbums.id))
    .groupBy(galleryAlbums.id)
    .orderBy(asc(galleryAlbums.order))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Galeri & Album</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Kelola album foto dan video dokumentasi kegiatan
          </p>
        </div>
        <AlbumCreateButton />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <Images className="text-muted-foreground h-12 w-12 opacity-30" />
            <p className="text-muted-foreground text-sm">
              Belum ada album. Buat album pertama Anda.
            </p>
            <AlbumCreateButton />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((album) => {
            const TypeIcon = TYPE_ICON[album.type ?? 'photo']
            return (
              <Card
                key={album.id}
                className={`overflow-hidden transition-all hover:shadow-md ${!album.isActive ? 'opacity-60' : ''}`}
              >
                {/* Cover */}
                <Link href={`/admin/gallery/${album.id}`}>
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <TypeIcon className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                    {/* Overlay badge */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="border-0 bg-black/60 text-[10px] text-white">
                        <TypeIcon className="mr-1 h-2.5 w-2.5" />
                        {TYPE_LABEL[album.type ?? 'photo']}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="border-0 bg-black/60 text-[10px] text-white">
                        {album.itemCount} item
                      </Badge>
                    </div>
                    {!album.isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Badge variant="secondary">Nonaktif</Badge>
                      </div>
                    )}
                  </div>
                </Link>

                <CardContent className="p-4">
                  <Link href={`/admin/gallery/${album.id}`}>
                    <h3 className="text-navy-800 hover:text-navy-600 line-clamp-1 text-sm font-semibold">
                      {album.title}
                    </h3>
                  </Link>
                  {album.description && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                      {album.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/admin/gallery/${album.id}`}>
                        <Eye className="h-3 w-3" /> Buka Album
                      </Link>
                    </Button>
                    <div className="flex gap-1">
                      <AlbumDeleteButton id={album.id} title={album.title} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
