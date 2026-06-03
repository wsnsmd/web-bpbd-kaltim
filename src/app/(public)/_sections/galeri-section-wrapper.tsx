// src/app/(public)/_sections/galeri-section-wrapper.tsx
// RSC wrapper — fetch data lalu pass ke GaleriSection (Client)
import { db } from '@/lib/db'
import { galleryItems } from '@db/schema'
import { eq, asc, and } from 'drizzle-orm'
import { cache } from 'react'
import { GaleriSection } from './galeri-section'

const getGallery = cache(async () => {
  const all = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.isActive, true))
    .orderBy(asc(galleryItems.order))
  return {
    photos: all.filter((i) => i.type === 'photo').slice(0, 4) as any,
    videos: all.filter((i) => i.type === 'video').slice(0, 4) as any,
  }
})

export async function GaleriSectionWrapper() {
  const { photos, videos } = await getGallery()
  return <GaleriSection photos={photos} videos={videos} />
}
