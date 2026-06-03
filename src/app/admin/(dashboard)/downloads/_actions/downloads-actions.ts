// src/app/admin/(dashboard)/downloads/_actions/downloads-actions.ts
'use server'

import { db } from '@/lib/db'
import { downloads } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq, asc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  fileUrl: z.string().min(1, 'URL file wajib diisi'),
  fileType: z.string().default('PDF'),
  fileSize: z.string().optional(),
  icon: z.string().default('FileText'),
  colorScheme: z.enum(['danger', 'caution', 'warning', 'safe', 'navy']).default('navy'),
  isActive: z.boolean().default(true),
})

export type DownloadFormValues = z.infer<typeof schema>

export async function getDownloadsAction() {
  return db.select().from(downloads).orderBy(asc(downloads.order))
}

export async function createDownloadAction(values: DownloadFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const existing = await db.select({ order: downloads.order }).from(downloads)
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((i) => i.order ?? 0)) + 1 : 1

  await db.insert(downloads).values({
    ...parsed.data,
    fileSize: parsed.data.fileSize || null,
    order: nextOrder,
    uploadedBy: session.user.id,
  })

  revalidatePath('/')
  revalidatePath('/admin/downloads')
  return { success: true }
}

export async function updateDownloadAction(id: number, values: DownloadFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db
    .update(downloads)
    .set({
      ...parsed.data,
      fileSize: parsed.data.fileSize || null,
      updatedAt: new Date(),
    })
    .where(eq(downloads.id, id))

  revalidatePath('/')
  revalidatePath('/admin/downloads')
  return { success: true }
}

export async function deleteDownloadAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(downloads).where(eq(downloads.id, id))
  revalidatePath('/')
  revalidatePath('/admin/downloads')
  return { success: true }
}

export async function reorderDownloadsAction(orderedIds: number[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(downloads)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(downloads.id, orderedIds[i]))
  }

  revalidatePath('/')
  revalidatePath('/admin/downloads')
  return { success: true }
}

export async function toggleDownloadAction(id: number, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.update(downloads).set({ isActive, updatedAt: new Date() }).where(eq(downloads.id, id))

  revalidatePath('/')
  revalidatePath('/admin/downloads')
  return { success: true }
}
