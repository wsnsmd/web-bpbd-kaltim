// src/app/admin/(dashboard)/master-data/_actions/master-data-actions.ts
'use server'

import { db } from '@/lib/db'
import { disasterTypes, disasterCauses } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ── Disaster Types ────────────────────────────────────────────
const typeSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  category: z.enum(['alam', 'non_alam']),
  icon: z.string().max(10).default('⚠️'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Format hex tidak valid')
    .default('#6b7592'),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
})

export async function createDisasterTypeAction(values: z.infer<typeof typeSchema>) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  const parsed = typeSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
  await db.insert(disasterTypes).values(parsed.data)
  revalidatePath('/admin/master-data')
  revalidatePath('/admin/incidents')
  return { success: true }
}

export async function updateDisasterTypeAction(id: number, values: z.infer<typeof typeSchema>) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  const parsed = typeSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
  await db.update(disasterTypes).set(parsed.data).where(eq(disasterTypes.id, id))
  revalidatePath('/admin/master-data')
  revalidatePath('/admin/incidents')
  return { success: true }
}

export async function deleteDisasterTypeAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  await db.delete(disasterTypes).where(eq(disasterTypes.id, id))
  revalidatePath('/admin/master-data')
  return { success: true }
}

export async function toggleDisasterTypeAction(id: number, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  await db.update(disasterTypes).set({ isActive }).where(eq(disasterTypes.id, id))
  revalidatePath('/admin/master-data')
  return { success: true }
}

// ── Disaster Causes ───────────────────────────────────────────
const causeSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  isActive: z.boolean().default(true),
})

export async function createDisasterCauseAction(values: z.infer<typeof causeSchema>) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  const parsed = causeSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
  await db.insert(disasterCauses).values(parsed.data)
  revalidatePath('/admin/master-data')
  return { success: true }
}

export async function updateDisasterCauseAction(id: number, values: z.infer<typeof causeSchema>) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  const parsed = causeSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
  await db.update(disasterCauses).set(parsed.data).where(eq(disasterCauses.id, id))
  revalidatePath('/admin/master-data')
  return { success: true }
}

export async function deleteDisasterCauseAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  await db.delete(disasterCauses).where(eq(disasterCauses.id, id))
  revalidatePath('/admin/master-data')
  return { success: true }
}
