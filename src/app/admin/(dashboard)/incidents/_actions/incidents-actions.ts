// src/app/admin/(dashboard)/incidents/_actions/incidents-actions.ts
'use server'

import { db } from '@/lib/db'
import { incidents, incidentVictims, incidentDamages, incidentPhotos } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

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
  areaHeavy: z.number().optional(),
  areaMedium: z.number().optional(),
  areaLight: z.number().optional(),
  estimatedLoss: z.number().default(0),
  notes: z.string().optional(),
})

const photoSchema = z.object({
  url: z.string().min(1),
  caption: z.string().optional(),
  sortOrder: z.number().default(0),
})

const schema = z.object({
  title: z.string().min(1),
  disasterTypeId: z.number().min(1),
  causeId: z.number().optional(),
  causeDetail: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  occurredDate: z.string().min(1),
  occurredTime: z.string().optional(),
  regencyId: z.string().min(1),
  districtId: z.string().optional(),
  villageName: z.string().optional(),
  addressDetail: z.string().optional(),
  latitude: z.string().min(1),
  longitude: z.string().min(1),
  status: z.enum(['aktif', 'ditangani', 'selesai']),
  currentCondition: z.string().optional(),
  currentEffort: z.string().optional(),
  isPublished: z.boolean().default(true),
  victims: z.array(victimSchema).default([]),
  damages: z.array(damageSchema).default([]),
  photos: z.array(photoSchema).default([]),
})

export type IncidentFormValues = z.infer<typeof schema>

function n(v?: string | null) {
  return v?.trim() || null
}

// ── Upload foto ke server ───────────────────────────────────────
export async function uploadIncidentPhotoAction(formData: FormData) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file) return { success: false, error: 'File tidak ditemukan' }

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' }
  }

  // Validasi ukuran (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { success: false, error: 'Ukuran file maksimal 5MB.' }
  }

  const ext = extname(file.name) || '.jpg'
  const filename = `incident-${randomUUID()}${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'incidents')

  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return {
    success: true,
    url: `/uploads/incidents/${filename}`,
  }
}

// ── Hapus foto dari server ──────────────────────────────────────
export async function deleteIncidentPhotoAction(photoId: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const [photo] = await db
    .select()
    .from(incidentPhotos)
    .where(eq(incidentPhotos.id, photoId))
    .limit(1)

  if (!photo) return { success: false, error: 'Foto tidak ditemukan' }

  // Hapus file fisik
  if (photo.url.startsWith('/uploads/')) {
    const filePath = join(process.cwd(), 'public', photo.url)
    try {
      await unlink(filePath)
    } catch {
      /* file mungkin sudah tidak ada */
    }
  }

  await db.delete(incidentPhotos).where(eq(incidentPhotos.id, photoId))
  revalidatePath('/admin/incidents')
  return { success: true }
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

  if (d.damages.length > 0) {
    await db.insert(incidentDamages).values(
      d.damages.map((dm) => ({
        incidentId,
        assetName: dm.assetName,
        heavyDamage: dm.heavyDamage,
        moderateDamage: dm.moderateDamage,
        lightDamage: dm.lightDamage,
        areaHeavy: String(dm.areaHeavy ?? 0),
        areaMedium: String(dm.areaMedium ?? 0),
        areaLight: String(dm.areaLight ?? 0),
        estimatedLoss: String(dm.estimatedLoss),
        notes: n(dm.notes),
      }))
    )
  }

  if (d.photos.length > 0) {
    await db.insert(incidentPhotos).values(
      d.photos.map((p, i) => ({
        incidentId,
        url: p.url,
        caption: n(p.caption),
        sortOrder: p.sortOrder ?? i,
        uploadedBy: session.user.id,
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

  await db.delete(incidentDamages).where(eq(incidentDamages.incidentId, id))
  if (d.damages.length > 0) {
    await db.insert(incidentDamages).values(
      d.damages.map((dm) => ({
        incidentId: id,
        assetName: dm.assetName,
        heavyDamage: dm.heavyDamage,
        moderateDamage: dm.moderateDamage,
        lightDamage: dm.lightDamage,
        areaHeavy: String(dm.areaHeavy ?? 0),
        areaMedium: String(dm.areaMedium ?? 0),
        areaLight: String(dm.areaLight ?? 0),
        estimatedLoss: String(dm.estimatedLoss),
        notes: n(dm.notes),
      }))
    )
  }

  // Photos: hapus yang tidak ada di list baru, insert yang baru
  const existingPhotos = await db
    .select({ id: incidentPhotos.id, url: incidentPhotos.url })
    .from(incidentPhotos)
    .where(eq(incidentPhotos.incidentId, id))

  const newUrls = new Set(d.photos.map((p) => p.url))
  // Hapus foto yang dihapus user
  for (const ep of existingPhotos) {
    if (!newUrls.has(ep.url)) {
      if (ep.url.startsWith('/uploads/')) {
        const filePath = join(process.cwd(), 'public', ep.url)
        try {
          await (await import('fs/promises')).unlink(filePath)
        } catch {}
      }
      await db.delete(incidentPhotos).where(eq(incidentPhotos.id, ep.id))
    }
  }

  // Insert foto baru yang belum ada
  const existingUrls = new Set(existingPhotos.map((p) => p.url))
  const newPhotos = d.photos.filter((p) => !existingUrls.has(p.url))
  if (newPhotos.length > 0) {
    await db.insert(incidentPhotos).values(
      newPhotos.map((p, i) => ({
        incidentId: id,
        url: p.url,
        caption: n(p.caption),
        sortOrder: p.sortOrder ?? i,
        uploadedBy: session.user.id,
      }))
    )
  }

  // Update sortOrder foto yang ada
  for (const p of d.photos) {
    if (existingUrls.has(p.url)) {
      const existing = existingPhotos.find((ep) => ep.url === p.url)
      if (existing) {
        await db
          .update(incidentPhotos)
          .set({ caption: n(p.caption), sortOrder: p.sortOrder })
          .where(eq(incidentPhotos.id, existing.id))
      }
    }
  }

  revalidatePath('/pusdalops')
  revalidatePath('/admin/incidents')
  return { success: true }
}

export async function deleteIncidentAction(id: number) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  // Hapus file foto fisik sebelum delete record
  const photos = await db.select().from(incidentPhotos).where(eq(incidentPhotos.incidentId, id))
  for (const p of photos) {
    if (p.url.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', p.url)
      try {
        await unlink(filePath)
      } catch {}
    }
  }

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
