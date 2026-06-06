// src/app/admin/(dashboard)/incidents/_actions/region-actions.ts
// Server actions untuk cascading dropdown wilayah

'use server'

import { db } from '@/lib/db'
import { regions } from '@db/schema/incidents'
import { eq } from 'drizzle-orm'

export async function getKabkotas() {
  return db
    .select({ id: regions.id, name: regions.name })
    .from(regions)
    .where(eq(regions.level, 'kabkota'))
    .orderBy(regions.name)
}

export async function getKecamatans(kabkotaId: string) {
  return db
    .select({ id: regions.id, name: regions.name })
    .from(regions)
    .where(eq(regions.parentId, kabkotaId))
    .orderBy(regions.name)
}

export async function getKelurahans(kecamatanId: string) {
  return db
    .select({ id: regions.id, name: regions.name })
    .from(regions)
    .where(eq(regions.parentId, kecamatanId))
    .orderBy(regions.name)
}
