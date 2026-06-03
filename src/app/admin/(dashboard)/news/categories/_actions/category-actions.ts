// src/app/admin/(dashboard)/news/categories/_actions/category-actions.ts
'use server'

import { db } from '@/lib/db'
import { newsCategories } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan -'),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Format warna tidak valid')
    .default('#1b56a8'),
})

export type CategoryFormValues = z.infer<typeof schema>

export async function createCategoryAction(values: CategoryFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db.insert(newsCategories).values(parsed.data)
  revalidatePath('/admin/news/categories')
  return { success: true }
}

export async function updateCategoryAction(id: number, values: CategoryFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db.update(newsCategories).set(parsed.data).where(eq(newsCategories.id, id))
  revalidatePath('/admin/news/categories')
  return { success: true }
}

export async function deleteCategoryAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(newsCategories).where(eq(newsCategories.id, id))
  revalidatePath('/admin/news/categories')
  return { success: true }
}
