// src/app/(public)/statistik-bencana/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { db } from '@/lib/db'
import { incidents, disasterTypes, regions, incidentVictims, incidentDamages } from '@db/schema'
import { eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { StatistikClient } from './_components/statistik-client'

export const metadata = {
  title: 'Statistik Bencana',
  description: 'Data statistik kejadian bencana di Provinsi Kalimantan Timur.',
}

export default async function StatistikPage() {
  noStore()

  const regencyAlias = alias(regions, 'regency_r')
  const currentYear = new Date().getFullYear()

  // Ambil semua data mentah per incident — filter dilakukan di client
  const [rawIncidents, rawVictims, rawDamages] = await Promise.all([
    // Semua incident dengan tahun + kab/kota + jenis
    db
      .select({
        id: incidents.id,
        tahun: sql<number>`YEAR(${incidents.occurredDate})`,
        bulan: sql<number>`MONTH(${incidents.occurredDate})`,
        regencyId: incidents.regencyId,
        regencyName: regencyAlias.name,
        typeId: incidents.disasterTypeId,
        typeName: disasterTypes.name,
        typeCategory: disasterTypes.category,
        typeColor: disasterTypes.color,
      })
      .from(incidents)
      .leftJoin(regencyAlias, eq(incidents.regencyId, regencyAlias.id))
      .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
      .where(sql`${incidents.occurredDate} IS NOT NULL`),

    // Semua korban dengan incidentId
    db
      .select({
        incidentId: incidentVictims.incidentId,
        impactType: incidentVictims.impactType,
        countMale: incidentVictims.countMale,
        countFemale: incidentVictims.countFemale,
        countTotal: incidentVictims.countTotal,
      })
      .from(incidentVictims),

    // Semua kerugian dengan incidentId
    db
      .select({
        incidentId: incidentDamages.incidentId,
        estimatedLoss: incidentDamages.estimatedLoss,
      })
      .from(incidentDamages),

    // Master jenis untuk warna
    db
      .select({
        id: disasterTypes.id,
        name: disasterTypes.name,
        category: disasterTypes.category,
        color: disasterTypes.color,
      })
      .from(disasterTypes),
  ])

  const availableYears = [
    ...new Set(rawIncidents.map((r) => Number(r.tahun)).filter(Boolean)),
  ].sort((a, b) => b - a)

  return (
    <StatistikClient
      rawIncidents={rawIncidents.map((r) => ({
        id: r.id,
        tahun: Number(r.tahun),
        bulan: Number(r.bulan),
        regencyName: r.regencyName ?? 'Tidak Diketahui',
        typeName: r.typeName ?? 'Lain-Lain',
        typeCategory: r.typeCategory ?? 'alam',
        typeColor: r.typeColor ?? '#6b7592',
      }))}
      rawVictims={rawVictims.map((v) => ({
        incidentId: v.incidentId,
        impactType: v.impactType,
        countMale: Number(v.countMale ?? 0),
        countFemale: Number(v.countFemale ?? 0),
        countTotal: Number(v.countTotal ?? 0),
      }))}
      rawDamages={rawDamages.map((d) => ({
        incidentId: d.incidentId,
        estimatedLoss: Number(d.estimatedLoss ?? 0),
      }))}
      availableYears={availableYears}
      currentYear={currentYear}
    />
  )
}
