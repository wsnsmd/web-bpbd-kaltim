// src/app/admin/(dashboard)/media/page.tsx
import { db } from '@/lib/db'
import { media } from '@db/schema'
import { desc } from 'drizzle-orm'
import { MediaGrid } from './_components/media-grid'

export const metadata = { title: 'Media Library' }

export default async function MediaPage() {
  const items = await db.select().from(media).orderBy(desc(media.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Media Library</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Kelola gambar dan file media</p>
      </div>
      <MediaGrid initialItems={items} />
    </div>
  )
}
