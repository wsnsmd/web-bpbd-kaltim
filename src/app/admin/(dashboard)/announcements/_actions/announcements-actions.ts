// src/app/admin/(dashboard)/announcements/_actions/announcements-actions.ts
'use server'

import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export interface TickerItem {
  id: string
  text: string
  icon: string | undefined
  isActive: boolean
  order: number
}

const schema = z.object({
  text: z.string().min(3, 'Teks minimal 3 karakter'),
  icon: z.string().optional(),
  isActive: z.boolean(),
})

export type TickerFormValues = z.infer<typeof schema>

async function load(): Promise<TickerItem[]> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ticker_items'))
  if (!row?.value) return []
  try {
    return JSON.parse(row.value)
  } catch {
    return []
  }
}

async function save(items: TickerItem[]) {
  await db
    .insert(siteSettings)
    .values({ key: 'ticker_items', value: JSON.stringify(items) })
    .onDuplicateKeyUpdate({ set: { value: JSON.stringify(items), updatedAt: new Date() } })
}

export async function getTickerItemsAction() {
  return load()
}

export async function createTickerItemAction(values: TickerFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const items = await load()
  await save([
    ...items,
    {
      id: crypto.randomUUID(),
      text: parsed.data.text,
      icon: parsed.data.icon,
      isActive: parsed.data.isActive,
      order: items.length + 1,
    },
  ])

  revalidatePath('/')
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function updateTickerItemAction(id: string, values: TickerFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const items = await load()
  await save(items.map((i) => (i.id === id ? { ...i, ...parsed.data } : i)))

  revalidatePath('/')
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function deleteTickerItemAction(id: string) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await save((await load()).filter((i) => i.id !== id))
  revalidatePath('/')
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function reorderTickerItemsAction(orderedIds: string[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const items = await load()
  const reordered = orderedIds
    .map((id, idx) => {
      const item = items.find((i) => i.id === id)
      return item ? { ...item, order: idx + 1 } : null
    })
    .filter(Boolean) as TickerItem[]
  await save(reordered)

  revalidatePath('/')
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function toggleTickerItemAction(id: string, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const items = await load()
  await save(items.map((i) => (i.id === id ? { ...i, isActive } : i)))

  revalidatePath('/')
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function getTickerSpeedAction(): Promise<number> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ticker_speed'))
  return row?.value ? Number(row.value) : 40
}

export async function saveTickerSpeedAction(speed: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db
    .insert(siteSettings)
    .values({ key: 'ticker_speed', value: String(speed) })
    .onDuplicateKeyUpdate({ set: { value: String(speed), updatedAt: new Date() } })

  revalidatePath('/')
  revalidatePath('/admin/announcements')
  return { success: true }
}
