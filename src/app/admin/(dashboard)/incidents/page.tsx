// src/app/admin/(dashboard)/incidents/page.tsx
import { db } from '@/lib/db'
import { incidents, disasterTypes, disasterCauses, regions } from '@db/schema'
import { eq, desc, and } from 'drizzle-orm'
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
        source: incidents.source,
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
        description: incidents.description,
        isPublished: incidents.isPublished,
        createdAt: incidents.createdAt,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Kejadian Bencana</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola data kejadian bencana yang tampil di halaman Pusdalops
        </p>
      </div>
      <IncidentsPanel
        initialItems={
          items.map((i) => ({
            ...i,
            occurredDate: i.occurredDate
              ? new Date(i.occurredDate).toISOString().slice(0, 10)
              : null,
          })) as any
        }
        disasterTypes={types}
        kabkotas={kabkotas}
        causes={causes}
      />
    </div>
  )
}
