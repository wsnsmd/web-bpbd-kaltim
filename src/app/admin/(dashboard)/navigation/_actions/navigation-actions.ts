// src/app/admin/(dashboard)/navigation/_actions/navigation-actions.ts
'use server'

import { db } from '@/lib/db'
import { menuItems } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { MenuLocation } from '@db/schema/navigation'

const menuItemSchema = z.object({
  location: z.enum(['main_nav', 'instansi_bar', 'footer_quick', 'footer_instansi']),
  label: z.string().min(1, 'Label wajib diisi'),
  url: z.string().min(1, 'URL wajib diisi'),
  icon: z.string().optional(),
  target: z.enum(['_self', '_blank']).default('_self'),
  isActive: z.boolean().default(true),
  parentId: z.number().optional(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

export async function getMenuItemsByLocation(location: MenuLocation) {
  return db
    .select()
    .from(menuItems)
    .where(eq(menuItems.location, location))
    .orderBy(asc(menuItems.order))
}

export async function createMenuItemAction(values: MenuItemFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = menuItemSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  // Hitung order berikutnya
  const existing = await db
    .select({ order: menuItems.order })
    .from(menuItems)
    .where(eq(menuItems.location, parsed.data.location))
    .orderBy(asc(menuItems.order))

  const nextOrder = existing.length > 0 ? Math.max(...existing.map((i) => i.order ?? 0)) + 1 : 1

  await db.insert(menuItems).values({
    ...parsed.data,
    icon: parsed.data.icon || null,
    parentId: parsed.data.parentId || null,
    order: nextOrder,
  })

  revalidatePath('/')
  revalidatePath('/admin/navigation')
  return { success: true }
}

export async function updateMenuItemAction(id: number, values: MenuItemFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = menuItemSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db
    .update(menuItems)
    .set({
      ...parsed.data,
      icon: parsed.data.icon || null,
      parentId: parsed.data.parentId || null,
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, id))

  revalidatePath('/')
  revalidatePath('/admin/navigation')
  return { success: true }
}

export async function deleteMenuItemAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.delete(menuItems).where(eq(menuItems.id, id))

  revalidatePath('/')
  revalidatePath('/admin/navigation')
  return { success: true }
}

export async function reorderMenuItemsAction(location: MenuLocation, orderedIds: number[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  // Update order sesuai posisi array
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(menuItems)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(menuItems.id, orderedIds[i]))
  }

  revalidatePath('/')
  revalidatePath('/admin/navigation')
  return { success: true }
}

export async function toggleMenuItemAction(id: number, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.update(menuItems).set({ isActive, updatedAt: new Date() }).where(eq(menuItems.id, id))

  revalidatePath('/')
  revalidatePath('/admin/navigation')
  return { success: true }
}

export async function reorderSubmenuItemsAction(orderedIds: number[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(menuItems)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(menuItems.id, orderedIds[i]))
  }

  revalidatePath('/')
  revalidatePath('/admin/navigation')
  return { success: true }
}
