// src/app/admin/(dashboard)/pages/_actions/page-actions.ts
'use server'

import { db } from '@/lib/db'
import { pages } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const pageSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9/-]+$/, 'Slug hanya huruf kecil, angka, - dan /'),
  content: z.string().min(1, 'Konten tidak boleh kosong'),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  template: z.string().default('default'),
  showInNav: z.boolean().default(false),
  navOrder: z.string().optional(),
  parentId: z.string().optional(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export type PageFormValues = z.infer<typeof pageSchema>

function resolvePublishedAt(
  status: string,
  publishedAtStr?: string,
  existing?: Date | null
): Date | null {
  if (status !== 'published') return null
  if (publishedAtStr) {
    const d = new Date(publishedAtStr)
    if (!isNaN(d.getTime())) return d
  }
  return existing ?? new Date()
}

export async function createPageAction(values: PageFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = pageSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { data } = parsed

  await db.insert(pages).values({
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt || null,
    featuredImage: data.featuredImage || null,
    status: data.status,
    template: data.template,
    showInNav: data.showInNav,
    navOrder: data.navOrder || '0',
    parentId: data.parentId || null,
    authorId: session.user.id,
    publishedAt: resolvePublishedAt(data.status, data.publishedAt),
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  })

  revalidatePath('/admin/pages')
  revalidatePath('/')
  return { success: true }
}

export async function updatePageAction(id: string, values: PageFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = pageSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { data } = parsed

  const [existing] = await db
    .select({ status: pages.status, publishedAt: pages.publishedAt })
    .from(pages)
    .where(eq(pages.id, id))

  await db
    .update(pages)
    .set({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || null,
      featuredImage: data.featuredImage || null,
      status: data.status,
      template: data.template,
      showInNav: data.showInNav,
      navOrder: data.navOrder || '0',
      parentId: data.parentId || null,
      publishedAt: resolvePublishedAt(data.status, data.publishedAt, existing?.publishedAt),
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))

  revalidatePath('/admin/pages')
  revalidatePath(`/${data.slug}`)
  return { success: true }
}

export async function deletePageAction(id: string) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const [page] = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.id, id))
  await db.delete(pages).where(eq(pages.id, id))

  revalidatePath('/admin/pages')
  if (page?.slug) revalidatePath(`/${page.slug}`)
  return { success: true }
}

export async function getPagesForSelectAction() {
  return db
    .select({ id: pages.id, title: pages.title, slug: pages.slug })
    .from(pages)
    .where(eq(pages.status, 'published'))
}
