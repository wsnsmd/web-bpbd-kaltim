// src/app/admin/(dashboard)/news/_actions/news-actions.ts
'use server'

import { db } from '@/lib/db'
import { news, newsCategories } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const newsSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan -'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Konten terlalu pendek'),
  featuredImage: z.string().optional(),
  categoryId: z.number().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  isFeatured: z.boolean().default(false),
  // Fix 4: publishedAt sebagai string ISO dari datetime-local input
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export type NewsFormValues = z.infer<typeof newsSchema>

function resolvePublishedAt(
  status: string,
  publishedAtStr?: string,
  existingPublishedAt?: Date | null
): Date | null {
  if (status !== 'published') return null
  // Gunakan tanggal dari form jika diisi
  if (publishedAtStr) {
    const d = new Date(publishedAtStr)
    if (!isNaN(d.getTime())) return d
  }
  // Pertahankan tanggal lama jika sudah published sebelumnya
  if (existingPublishedAt) return existingPublishedAt
  // Default: sekarang
  return new Date()
}

export async function createNewsAction(values: NewsFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = newsSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { data } = parsed

  await db.insert(news).values({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || null,
    content: data.content,
    featuredImage: data.featuredImage || null,
    categoryId: data.categoryId ?? null,
    authorId: session.user.id,
    status: data.status,
    isFeatured: data.isFeatured,
    publishedAt: resolvePublishedAt(data.status, data.publishedAt),
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  })

  revalidatePath('/admin/news')
  revalidatePath('/')
  return { success: true }
}

export async function updateNewsAction(id: string, values: NewsFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = newsSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { data } = parsed

  const [existing] = await db
    .select({ status: news.status, publishedAt: news.publishedAt })
    .from(news)
    .where(eq(news.id, id))

  await db
    .update(news)
    .set({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content,
      featuredImage: data.featuredImage || null,
      categoryId: data.categoryId ?? null,
      status: data.status,
      isFeatured: data.isFeatured,
      publishedAt: resolvePublishedAt(data.status, data.publishedAt, existing?.publishedAt),
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    })
    .where(eq(news.id, id))

  revalidatePath('/admin/news')
  revalidatePath('/')
  return { success: true }
}

export async function deleteNewsAction(id: string) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(news).where(eq(news.id, id))

  revalidatePath('/admin/news')
  revalidatePath('/')
  return { success: true }
}

export async function getCategoriesAction() {
  return db
    .select({ id: newsCategories.id, name: newsCategories.name })
    .from(newsCategories)
    .orderBy(newsCategories.name)
}
