// src/app/admin/(dashboard)/gallery/[albumId]/page.tsx
// Halaman detail album — berisi daftar foto/video
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { galleryAlbums, galleryItems } from '@db/schema'
import { eq, asc } from 'drizzle-orm'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlbumEditButton } from '../_components/album-edit-button'
import { GalleryItemsPanel } from '../_components/gallery-items-panel'

interface Props {
  params: Promise<{ albumId: string }>
}

export default async function AlbumDetailPage({ params }: Props) {
  const { albumId } = await params
  const id = Number(albumId)
  if (isNaN(id)) notFound()

  const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id))
  if (!album) notFound()

  const items = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.albumId, id))
    .orderBy(asc(galleryItems.order))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/admin/gallery">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-navy-800 text-2xl font-bold">{album.title}</h1>
              {!album.isActive && <Badge variant="secondary">Nonaktif</Badge>}
            </div>
            {album.description && (
              <p className="text-muted-foreground mt-0.5 text-sm">{album.description}</p>
            )}
          </div>
        </div>
        <AlbumEditButton album={album} />
      </div>

      <GalleryItemsPanel albumId={id} albumType={album.type ?? 'photo'} initialItems={items} />
    </div>
  )
}
