// src/app/(public)/data-kejadian/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { db } from '@/lib/db'
import { incidents, disasterTypes, regions, incidentVictims, incidentDamages } from '@db/schema'
import { eq, desc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { DataKejadianClient } from './_components/data-kejadian-client'

export const metadata = {
  title: 'Data Kejadian Bencana — BPBD Kaltim',
  description: 'Data lengkap kejadian bencana di Provinsi Kalimantan Timur.',
}

export default async function DataKejadianPage() {
  noStore()

  const regencyAlias = alias(regions, 'regency_r')
  const districtAlias = alias(regions, 'district_r')

  const [allIncidents, kabkotas, jenisOptions] = await Promise.all([
    db
      .select({
        id: incidents.id,
        title: incidents.title,
        description: incidents.description,
        disasterTypeName: disasterTypes.name,
        disasterTypeIcon: disasterTypes.icon,
        disasterTypeColor: disasterTypes.color,
        disasterTypeId: incidents.disasterTypeId,
        source: incidents.source,
        occurredDate: incidents.occurredDate,
        occurredTime: incidents.occurredTime,
        regencyId: incidents.regencyId,
        regencyName: regencyAlias.name,
        districtName: districtAlias.name,
        villageName: incidents.villageName,
        status: incidents.status,
        currentCondition: incidents.currentCondition,
        currentEffort: incidents.currentEffort,
        updatedAt: incidents.updatedAt,
      })
      .from(incidents)
      .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
      .leftJoin(regencyAlias, eq(incidents.regencyId, regencyAlias.id))
      .leftJoin(districtAlias, eq(incidents.districtId, districtAlias.id))
      .where(eq(incidents.isPublished, true))
      .orderBy(desc(incidents.occurredDate)),

    db
      .select({ id: regions.id, name: regions.name })
      .from(regions)
      .where(eq(regions.level, 'kabkota'))
      .orderBy(regions.name),

    db
      .select({ id: disasterTypes.id, name: disasterTypes.name, icon: disasterTypes.icon })
      .from(disasterTypes)
      .where(eq(disasterTypes.isActive, true))
      .orderBy(disasterTypes.sortOrder),
  ])

  // Ambil semua victims & damages
  const [allVictims, allDamages] = await Promise.all([
    db.select().from(incidentVictims),
    db.select().from(incidentDamages),
  ])

  const incidentData = allIncidents.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    typeName: i.disasterTypeName ?? 'Lain-Lain',
    typeIcon: i.disasterTypeIcon ?? '⚠️',
    typeColor: i.disasterTypeColor ?? '#6b7592',
    typeId: i.disasterTypeId,
    source: i.source,
    occurredDate: i.occurredDate ? new Date(i.occurredDate).toISOString().slice(0, 10) : null,
    occurredTime: i.occurredTime ?? null,
    regencyId: i.regencyId,
    regencyName: i.regencyName,
    districtName: i.districtName,
    villageName: i.villageName,
    status: i.status ?? 'selesai',
    currentCondition: i.currentCondition,
    currentEffort: i.currentEffort,
    updatedAt: i.updatedAt ? new Date(i.updatedAt).toISOString() : null,
    victims: allVictims.filter((v) => v.incidentId === i.id),
    damages: allDamages.filter((d) => d.incidentId === i.id),
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-900 px-4 py-8">
        <div className="container-content mx-auto max-w-(--width-content)">
          <div className="text-navy-400 mb-3 flex items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Data Kejadian</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Data Kejadian Bencana
          </h1>
          <p className="text-navy-300 mt-1 text-sm">
            Rekapitulasi seluruh kejadian bencana yang tercatat di Provinsi Kalimantan Timur
          </p>
        </div>
      </div>

      <div className="container-content mx-auto max-w-(--width-content) px-4 py-8">
        <DataKejadianClient
          incidents={incidentData}
          kabkotas={kabkotas}
          jenisOptions={jenisOptions}
        />
      </div>
    </div>
  )
}
