// src/app/admin/(dashboard)/settings/_actions/settings-actions.ts
'use server'

import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { auth } from '@/lib/auth'
import { inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getSettingsAction(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.select().from(siteSettings).where(inArray(siteSettings.key, keys))

  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
}

export async function saveSettingsAction(data: Record<string, string>) {
  const session = await auth()
  if (!session?.user.roles.some((r) => ['super_admin', 'administrator'].includes(r))) {
    return { success: false, error: 'Unauthorized' }
  }

  // Upsert semua key sekaligus
  for (const [key, value] of Object.entries(data)) {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } })
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: true }
}
