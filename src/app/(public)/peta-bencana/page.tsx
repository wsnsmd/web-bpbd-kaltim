// src/app/(public)/peta-bencana/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { db } from '@/lib/db'
import {
  incidents,
  disasterTypes,
  regions,
  incidentVictims,
  incidentDamages,
  incidentPhotos,
  siteSettings,
} from '@db/schema'
import { eq, desc, ne, gte, and } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { PetaBencanaClient } from './_components/peta-bencana-client'

export const metadata = {
  title: 'Peta Bencana',
  description: 'Peta sebaran kejadian bencana di Provinsi Kalimantan Timur.',
}

export default async function PetaBencanaPage() {
  noStore()

  const regencyRegion = alias(regions, 'regency_region')
  const districtRegion = alias(regions, 'district_region')
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(`${currentYear}-01-01`)

  const [allIncidents, settings] = await Promise.all([
    db
      .select({
        id: incidents.id,
        title: incidents.title,
        description: incidents.description,
        disasterTypeId: incidents.disasterTypeId,
        disasterTypeName: disasterTypes.name,
        disasterTypeIcon: disasterTypes.icon,
        disasterTypeColor: disasterTypes.color,
        source: incidents.source,
        occurredDate: incidents.occurredDate,
        occurredTime: incidents.occurredTime,
        regencyId: incidents.regencyId,
        regencyName: regencyRegion.name,
        districtId: incidents.districtId,
        districtName: districtRegion.name,
        villageName: incidents.villageName,
        addressDetail: incidents.addressDetail,
        latitude: incidents.latitude,
        longitude: incidents.longitude,
        status: incidents.status,
        currentCondition: incidents.currentCondition,
        currentEffort: incidents.currentEffort,
        updatedAt: incidents.updatedAt,
      })
      .from(incidents)
      .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
      .leftJoin(regencyRegion, eq(incidents.regencyId, regencyRegion.id))
      .leftJoin(districtRegion, eq(incidents.districtId, districtRegion.id))
      .where(
        and(
          eq(incidents.isPublished, true),
          ne(incidents.status, 'selesai'),
          gte(incidents.occurredDate, startOfYear)
        )
      )
      .orderBy(desc(incidents.occurredDate), desc(incidents.createdAt)),

    db
      .select()
      .from(siteSettings)
      .then((rows) => Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))),
  ])

  const incidentIds = allIncidents.map((i) => i.id)

  // Fetch victims, damages, photos paralel
  const [allVictims, allDamages, allPhotos] =
    incidentIds.length > 0
      ? await Promise.all([
          db.select().from(incidentVictims),
          db.select().from(incidentDamages),
          db.select().from(incidentPhotos).orderBy(incidentPhotos.sortOrder),
        ])
      : [[], [], []]

  const mapToken = settings.mapbox_token ?? ''
  const centerLat = parseFloat(settings.map_latitude ?? '-1.0')
  const centerLng = parseFloat(settings.map_longitude ?? '116.5')

  const incidentData = allIncidents.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    typeName: i.disasterTypeName ?? 'Lain-Lain',
    typeIcon: i.disasterTypeIcon ?? '⚠️',
    typeColor: i.disasterTypeColor ?? '#6b7592',
    source: i.source,
    occurredDate: i.occurredDate ? new Date(i.occurredDate).toISOString() : null,
    occurredTime: i.occurredTime ?? null,
    regencyName: i.regencyName,
    districtName: i.districtName,
    villageName: i.villageName,
    addressDetail: i.addressDetail,
    latitude: parseFloat(i.latitude as unknown as string),
    longitude: parseFloat(i.longitude as unknown as string),
    status: i.status ?? 'aktif',
    currentCondition: i.currentCondition,
    currentEffort: i.currentEffort,
    updatedAt: i.updatedAt ? new Date(i.updatedAt).toISOString() : null,
    victims: allVictims
      .filter((v) => v.incidentId === i.id)
      .map((v) => ({ ...v, ageGroup: v.ageGroup ?? 'tidak_diketahui' })),
    damages: allDamages.filter((d) => d.incidentId === i.id),
    // ← tambah photos
    photos: allPhotos
      .filter((p) => p.incidentId === i.id)
      .map((p) => ({ id: p.id, url: p.url, caption: p.caption ?? '' })),
  }))

  return (
    <PetaBencanaClient
      token={mapToken}
      centerLat={centerLat}
      centerLng={centerLng}
      incidents={incidentData}
      year={currentYear}
    />
  )
}
