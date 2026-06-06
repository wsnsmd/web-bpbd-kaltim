// src/app/admin/(dashboard)/incidents/_actions/timeline-actions.ts
'use server'

import { db } from '@/lib/db'
import { incidentTimelines, incidents } from '@db/schema'
import { users } from '@db/schema/users'
import { auth } from '@/lib/auth'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  eventType: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  statusAfter: z.enum(['aktif', 'ditangani', 'selesai']).optional(),
  loggedAt: z.string(),
})

export async function getTimelineAction(incidentId: number) {
  return db
    .select({
      id: incidentTimelines.id,
      eventType: incidentTimelines.eventType,
      title: incidentTimelines.title,
      description: incidentTimelines.description,
      statusBefore: incidentTimelines.statusBefore,
      statusAfter: incidentTimelines.statusAfter,
      loggedAt: incidentTimelines.loggedAt,
      creatorName: users.name,
    })
    .from(incidentTimelines)
    .leftJoin(users, eq(incidentTimelines.createdBy, users.id))
    .where(eq(incidentTimelines.incidentId, incidentId))
    .orderBy(asc(incidentTimelines.loggedAt))
}

export async function addTimelineAction(
  incidentId: number,
  currentStatus: string,
  values: z.infer<typeof schema>
) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const d = parsed.data

  await db.insert(incidentTimelines).values({
    incidentId,
    eventType: d.eventType as any,
    title: d.title,
    description: d.description || null,
    statusBefore: currentStatus as any,
    statusAfter: d.statusAfter ?? null,
    loggedAt: new Date(d.loggedAt),
    createdBy: session.user.id,
  })

  // Update status insiden jika ada perubahan status
  if (d.statusAfter && d.statusAfter !== currentStatus) {
    await db
      .update(incidents)
      .set({ status: d.statusAfter, updatedAt: new Date() })
      .where(eq(incidents.id, incidentId))
  }

  revalidatePath('/admin/incidents')
  revalidatePath('/pusdalops')
  return { success: true }
}
