// src/lib/site-settings.ts
// Helper untuk ambil settings dari DB, dengan cache per-request
import { cache } from 'react'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { DEFAULT_SETTINGS } from '@db/schema/settings'

export const getSiteSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await db.select().from(siteSettings)
    const saved = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
    return { ...DEFAULT_SETTINGS, ...saved }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
})
