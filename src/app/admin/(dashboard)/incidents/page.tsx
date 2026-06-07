// src/app/admin/(dashboard)/incidents/page.tsx
import { db } from '@/lib/db'
import {
  incidents,
  disasterTypes,
  disasterCauses,
  regions,
  incidentVictims,
  incidentDamages,
} from '@db/schema'
import { eq, desc } from 'drizzle-orm'
import { IncidentsPanel } from './_components/incidents-panel'

export const metadata = { title: 'Kejadian Bencana — Admin' }

export default async function IncidentsPage() {
  const [items, types, kabkotas, causes] = await Promise.all([
    // Ambil incidents dengan join disasterType & regency
    db
      .select({
        id: incidents.id,
        title: incidents.title,
        disasterTypeId: incidents.disasterTypeId,
        disasterTypeName: disasterTypes.name,
        disasterTypeIcon: disasterTypes.icon,
        disasterTypeColor: disasterTypes.color,
        causeId: incidents.causeId,
        causeDetail: incidents.causeDetail,
        source: incidents.source,
        description: incidents.description,
        occurredDate: incidents.occurredDate,
        occurredTime: incidents.occurredTime,
        regencyId: incidents.regencyId,
        regencyName: regions.name,
        districtId: incidents.districtId,
        villageName: incidents.villageName,
        addressDetail: incidents.addressDetail,
        latitude: incidents.latitude,
        longitude: incidents.longitude,
        status: incidents.status,
        currentCondition: incidents.currentCondition,
        currentEffort: incidents.currentEffort,
        isPublished: incidents.isPublished,
        createdAt: incidents.createdAt,
        updatedAt: incidents.updatedAt,
      })
      .from(incidents)
      .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
      .leftJoin(regions, eq(incidents.regencyId, regions.id))
      .orderBy(desc(incidents.occurredDate), desc(incidents.createdAt)),

    // Master jenis bencana
    db
      .select()
      .from(disasterTypes)
      .where(eq(disasterTypes.isActive, true))
      .orderBy(disasterTypes.sortOrder),

    // Master kab/kota
    db
      .select({ id: regions.id, name: regions.name })
      .from(regions)
      .where(eq(regions.level, 'kabkota'))
      .orderBy(regions.name),
    db
      .select({ id: disasterCauses.id, name: disasterCauses.name })
      .from(disasterCauses)
      .where(eq(disasterCauses.isActive, true))
      .orderBy(disasterCauses.name),
  ])

  const itemsWithDetails = await Promise.all(
    items.map(async (item) => {
      const victims = await db
        .select()
        .from(incidentVictims)
        .where(eq(incidentVictims.incidentId, item.id))

      const damages = await db
        .select()
        .from(incidentDamages)
        .where(eq(incidentDamages.incidentId, item.id))

      return {
        id: item.id,
        title: item.title ?? '',
        disasterTypeId: item.disasterTypeId,
        disasterTypeName: item.disasterTypeName,
        disasterTypeIcon: item.disasterTypeIcon,
        disasterTypeColor: item.disasterTypeColor,
        causeId: item.causeId,
        causeDetail: item.causeDetail,
        source: item.source,
        description: item.description,
        occurredDate: item.occurredDate
          ? new Date(item.occurredDate).toISOString().slice(0, 10)
          : null,
        occurredTime: item.occurredTime,
        regencyId: item.regencyId,
        regencyName: item.regencyName,
        districtId: item.districtId,
        villageName: item.villageName,
        addressDetail: item.addressDetail,
        latitude: item.latitude,
        longitude: item.longitude,
        status: item.status ?? 'aktif', // ← Pastikan tidak null
        currentCondition: item.currentCondition,
        currentEffort: item.currentEffort,
        isPublished: item.isPublished ?? true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        victims: victims.map((v) => ({
          id: v.id,
          incidentId: v.incidentId,
          impactType: v.impactType,
          ageGroup: v.ageGroup,
          countMale: v.countMale ?? 0,
          countFemale: v.countFemale ?? 0,
          countTotal: v.countTotal,
        })),
        damages: damages.map((d) => ({
          id: d.id,
          incidentId: d.incidentId,
          assetName: d.assetName,
          heavyDamage: d.heavyDamage ?? 0,
          moderateDamage: d.moderateDamage ?? 0,
          lightDamage: d.lightDamage ?? 0,
          estimatedLoss: Number(d.estimatedLoss) ?? 0,
        })),
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Kejadian Bencana</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola data kejadian bencana yang tampil di halaman Pusdalops
        </p>
      </div>
      <IncidentsPanel
        initialItems={itemsWithDetails as any}
        disasterTypes={types}
        kabkotas={kabkotas}
        causes={causes}
      />
    </div>
  )
}
