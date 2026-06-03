// src/lib/menu.ts
// Helper query menu dari DB dengan React.cache() agar 1x query per request
import { cache } from 'react'
import { db } from '@/lib/db'
import { menuItems } from '@db/schema'
import { eq, asc, and } from 'drizzle-orm'
import type { MenuLocation } from '@db/schema/navigation'

export interface MenuItem {
  id: number
  label: string
  url: string
  icon: string | null
  target: string | null
  order: number | null
  parentId: number | null
  children?: MenuItem[]
}

// Ambil semua item aktif per lokasi, sudah terurut
export const getMenuItems = cache(async (location: MenuLocation): Promise<MenuItem[]> => {
  try {
    const rows = await db
      .select({
        id: menuItems.id,
        label: menuItems.label,
        url: menuItems.url,
        icon: menuItems.icon,
        target: menuItems.target,
        order: menuItems.order,
        parentId: menuItems.parentId,
      })
      .from(menuItems)
      .where(and(eq(menuItems.location, location), eq(menuItems.isActive, true)))
      .orderBy(asc(menuItems.order))

    return rows
  } catch {
    return []
  }
})

// Bangun struktur hierarki parent → children
export function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const parents = items.filter((i) => !i.parentId)
  const children = items.filter((i) => i.parentId)

  return parents.map((parent) => ({
    ...parent,
    children: children
      .filter((c) => c.parentId === parent.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }))
}
