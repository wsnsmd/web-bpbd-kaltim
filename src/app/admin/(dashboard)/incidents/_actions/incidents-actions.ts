// src/app/admin/(dashboard)/incidents/_actions/incidents-actions.ts
'use server'

import { db } from '@/lib/db'
import { incidents, incidentVictims, incidentDamages } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const victimSchema = z.object({
  impactType: z.enum(['meninggal', 'hilang', 'luka_sakit', 'menderita', 'mengungsi']),
  ageGroup: z.enum(['anak', 'dewasa', 'lansia', 'tidak_diketahui']),
  countMale: z.number().default(0),
  countFemale: z.number().default(0),
  notes: z.string().optional(),
})

const damageSchema = z.object({
  assetName: z.string().min(1),
  heavyDamage: z.number().default(0),
  moderateDamage: z.number().default(0),
  lightDamage: z.number().default(0),
  estimatedLoss: z.number().default(0),
  notes: z.string().optional(),
})

const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  disasterTypeId: z.number().min(1, 'Jenis bencana wajib dipilih'),
  causeId: z.number().optional(),
  causeDetail: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  occurredDate: z.string().min(1, 'Tanggal kejadian wajib diisi'),
  occurredTime: z.string().optional(),
  regencyId: z.string().min(1, 'Kab/Kota wajib dipilih'),
  districtId: z.string().optional(),
  villageName: z.string().optional(),
  addressDetail: z.string().optional(),
  latitude: z.string().min(1, 'Latitude wajib diisi'),
  longitude: z.string().min(1, 'Longitude wajib diisi'),
  status: z.enum(['aktif', 'ditangani', 'selesai']),
  currentCondition: z.string().optional(),
  currentEffort: z.string().optional(),
  isPublished: z.boolean().default(true),
  victims: z.array(victimSchema).default([]),
  damages: z.array(damageSchema).default([]),
})

export type IncidentFormValues = z.infer<typeof schema>

function n(v?: string | null) {
  return v?.trim() || null
}

export async function createIncidentAction(values: IncidentFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const d = parsed.data

  const [result] = await db
    .insert(incidents)
    .values({
      title: d.title,
      disasterTypeId: d.disasterTypeId,
      causeId: d.causeId ?? null,
      causeDetail: n(d.causeDetail),
      description: n(d.description),
      source: n(d.source),
      occurredDate: new Date(d.occurredDate),
      occurredTime: n(d.occurredTime),
      provinceId: '64',
      regencyId: d.regencyId,
      districtId: n(d.districtId),
      villageName: n(d.villageName),
      addressDetail: n(d.addressDetail),
      latitude: d.latitude,
      longitude: d.longitude,
      status: d.status,
      currentCondition: n(d.currentCondition),
      currentEffort: n(d.currentEffort),
      isPublished: d.isPublished,
      reportedBy: session.user.id,
    })
    .$returningId()

  const incidentId = result.id

  // Insert victims
  if (d.victims.length > 0) {
    await db.insert(incidentVictims).values(
      d.victims.map((v) => ({
        incidentId,
        impactType: v.impactType,
        ageGroup: v.ageGroup,
        countMale: v.countMale,
        countFemale: v.countFemale,
        countTotal: (v.countMale || 0) + (v.countFemale || 0),
        notes: n(v.notes),
      }))
    )
  }

  // Insert damages
  if (d.damages.length > 0) {
    await db.insert(incidentDamages).values(
      d.damages.map((dm) => ({
        incidentId,
        assetName: dm.assetName,
        heavyDamage: dm.heavyDamage,
        moderateDamage: dm.moderateDamage,
        lightDamage: dm.lightDamage,
        estimatedLoss: String(dm.estimatedLoss),
        notes: n(dm.notes),
      }))
    )
  }

  revalidatePath('/pusdalops')
  revalidatePath('/admin/incidents')
  return { success: true }
}

export async function updateIncidentAction(id: number, values: IncidentFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const d = parsed.data

  await db
    .update(incidents)
    .set({
      title: d.title,
      disasterTypeId: d.disasterTypeId,
      causeId: d.causeId ?? null,
      causeDetail: n(d.causeDetail),
      description: n(d.description),
      source: n(d.source),
      occurredDate: new Date(d.occurredDate),
      occurredTime: n(d.occurredTime),
      regencyId: d.regencyId,
      districtId: n(d.districtId),
      villageName: n(d.villageName),
      addressDetail: n(d.addressDetail),
      latitude: d.latitude,
      longitude: d.longitude,
      status: d.status,
      currentCondition: n(d.currentCondition),
      currentEffort: n(d.currentEffort),
      isPublished: d.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(incidents.id, id))

  // Replace victims — hapus lama, insert baru
  await db.delete(incidentVictims).where(eq(incidentVictims.incidentId, id))
  if (d.victims.length > 0) {
    await db.insert(incidentVictims).values(
      d.victims.map((v) => ({
        incidentId: id,
        impactType: v.impactType,
        ageGroup: v.ageGroup,
        countMale: v.countMale,
        countFemale: v.countFemale,
        countTotal: (v.countMale || 0) + (v.countFemale || 0),
        notes: n(v.notes),
      }))
    )
  }

  // Replace damages
  await db.delete(incidentDamages).where(eq(incidentDamages.incidentId, id))
  if (d.damages.length > 0) {
    await db.insert(incidentDamages).values(
      d.damages.map((dm) => ({
        incidentId: id,
        assetName: dm.assetName,
        heavyDamage: dm.heavyDamage,
        moderateDamage: dm.moderateDamage,
        lightDamage: dm.lightDamage,
        estimatedLoss: String(dm.estimatedLoss),
        notes: n(dm.notes),
      }))
    )
  }

  revalidatePath('/pusdalops')
  revalidatePath('/admin/incidents')
  return { success: true }
}

export async function deleteIncidentAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  await db.delete(incidents).where(eq(incidents.id, id))
  revalidatePath('/pusdalops')
  revalidatePath('/admin/incidents')
  return { success: true }
}

export async function togglePublishAction(id: number, isPublished: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }
  await db.update(incidents).set({ isPublished, updatedAt: new Date() }).where(eq(incidents.id, id))
  revalidatePath('/pusdalops')
  revalidatePath('/admin/incidents')
  return { success: true }
}
