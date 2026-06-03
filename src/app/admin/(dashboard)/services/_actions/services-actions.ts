// src/app/admin/(dashboard)/homepage/services/_actions/services-actions.ts
'use server'

import { db } from '@/lib/db'
import { services } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq, asc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  label: z.string().min(1, 'Label wajib diisi'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon wajib diisi'),
  href: z.string().min(1, 'URL wajib diisi'),
  isActive: z.boolean().default(true),
})

export type ServiceFormValues = z.infer<typeof schema>

export async function getServicesAction() {
  return db.select().from(services).orderBy(asc(services.order))
}

export async function createServiceAction(values: ServiceFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const existing = await db
    .select({ order: services.order })
    .from(services)
    .orderBy(asc(services.order))
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((i) => i.order ?? 0)) + 1 : 1

  await db.insert(services).values({ ...parsed.data, order: nextOrder })

  revalidatePath('/')
  revalidatePath('/admin/services')
  return { success: true }
}

export async function updateServiceAction(id: number, values: ServiceFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db
    .update(services)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(services.id, id))

  revalidatePath('/')
  revalidatePath('/admin/services')
  return { success: true }
}

export async function deleteServiceAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(services).where(eq(services.id, id))

  revalidatePath('/')
  revalidatePath('/admin/services')
  return { success: true }
}

export async function reorderServicesAction(orderedIds: number[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(services)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(services.id, orderedIds[i]))
  }

  revalidatePath('/')
  revalidatePath('/admin/services')
  return { success: true }
}

export async function toggleServiceAction(id: number, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.update(services).set({ isActive, updatedAt: new Date() }).where(eq(services.id, id))

  revalidatePath('/')
  revalidatePath('/admin/services')
  return { success: true }
}
