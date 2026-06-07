// src/app/admin/(dashboard)/gallery/_actions/gallery-actions.ts
'use server'

import { db } from '@/lib/db'
import { galleryAlbums, galleryItems } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ── Album schemas ─────────────────────────────────────────────
const albumSchema = z.object({
  title: z.string().min(1, 'Judul album wajib diisi'),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  type: z.enum(['photo', 'video', 'mixed']),
  isActive: z.boolean().default(true),
})

// ── Item schemas ──────────────────────────────────────────────
const itemSchema = z.object({
  albumId: z.number(),
  type: z.enum(['photo', 'video']),
  title: z.string().min(1, 'Judul wajib diisi'),
  caption: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type AlbumFormValues = z.infer<typeof albumSchema>
export type ItemFormValues = z.infer<typeof itemSchema>

// ════════════════════════════════════════════════════════════
// ALBUM ACTIONS
// ════════════════════════════════════════════════════════════

export async function getAlbumsAction() {
  return db
    .select({
      id: galleryAlbums.id,
      title: galleryAlbums.title,
      description: galleryAlbums.description,
      coverUrl: galleryAlbums.coverUrl,
      type: galleryAlbums.type,
      order: galleryAlbums.order,
      isActive: galleryAlbums.isActive,
      createdAt: galleryAlbums.createdAt,
    })
    .from(galleryAlbums)
    .orderBy(asc(galleryAlbums.order))
}

export async function createAlbumAction(values: AlbumFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = albumSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const existing = await db.select({ order: galleryAlbums.order }).from(galleryAlbums)
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((i) => i.order ?? 0)) + 1 : 1

  await db.insert(galleryAlbums).values({
    ...parsed.data,
    description: parsed.data.description || null,
    coverUrl: parsed.data.coverUrl || null,
    order: nextOrder,
    createdBy: session.user.id,
  })

  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return { success: true }
}

export async function updateAlbumAction(id: number, values: AlbumFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = albumSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db
    .update(galleryAlbums)
    .set({
      ...parsed.data,
      description: parsed.data.description || null,
      coverUrl: parsed.data.coverUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(galleryAlbums.id, id))

  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return { success: true }
}

export async function deleteAlbumAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  // Items terhapus otomatis karena cascade
  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id))
  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return { success: true }
}

export async function reorderAlbumsAction(orderedIds: number[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(galleryAlbums)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(galleryAlbums.id, orderedIds[i]))
  }

  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return { success: true }
}

export async function toggleAlbumAction(id: number, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db
    .update(galleryAlbums)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(galleryAlbums.id, id))

  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return { success: true }
}

// ════════════════════════════════════════════════════════════
// ITEM ACTIONS
// ════════════════════════════════════════════════════════════

export async function getAlbumItemsAction(albumId: number) {
  return db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.albumId, albumId))
    .orderBy(asc(galleryItems.order))
}

export async function createItemAction(values: ItemFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = itemSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const existing = await db
    .select({ order: galleryItems.order })
    .from(galleryItems)
    .where(eq(galleryItems.albumId, parsed.data.albumId))
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((i) => i.order ?? 0)) + 1 : 1

  await db.insert(galleryItems).values({
    ...parsed.data,
    caption: parsed.data.caption || null,
    thumbnailUrl: parsed.data.thumbnailUrl || null,
    videoUrl: parsed.data.videoUrl || null,
    order: nextOrder,
    uploadedBy: session.user.id,
  })

  // Auto-set cover album jika belum ada
  const [album] = await db
    .select({ coverUrl: galleryAlbums.coverUrl })
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, parsed.data.albumId))
  if (!album?.coverUrl && parsed.data.thumbnailUrl) {
    await db
      .update(galleryAlbums)
      .set({ coverUrl: parsed.data.thumbnailUrl })
      .where(eq(galleryAlbums.id, parsed.data.albumId))
  }

  revalidatePath('/')
  revalidatePath(`/admin/gallery/${parsed.data.albumId}`)
  return { success: true }
}

export async function updateItemAction(id: number, values: ItemFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = itemSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db
    .update(galleryItems)
    .set({
      ...parsed.data,
      caption: parsed.data.caption || null,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      videoUrl: parsed.data.videoUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(galleryItems.id, id))

  revalidatePath('/')
  revalidatePath(`/admin/gallery/${parsed.data.albumId}`)
  return { success: true }
}

export async function deleteItemAction(id: number, albumId: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(galleryItems).where(eq(galleryItems.id, id))
  revalidatePath('/')
  revalidatePath(`/admin/gallery/${albumId}`)
  return { success: true }
}

export async function reorderItemsAction(albumId: number, orderedIds: number[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(galleryItems)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(galleryItems.id, orderedIds[i]))
  }

  revalidatePath('/')
  revalidatePath(`/admin/gallery/${albumId}`)
  return { success: true }
}

export async function toggleGalleryItemAction(id: number, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db
    .update(galleryItems)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(galleryItems.id, id))

  revalidatePath('/')
  return { success: true }
}
