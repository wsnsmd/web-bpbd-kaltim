// src/app/(public)/statistik-bencana/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { db } from '@/lib/db'
import { incidents, disasterTypes, regions, incidentVictims, incidentDamages } from '@db/schema'
import { eq, desc, sql, sum, count } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { StatistikClient } from './_components/statistik-client'

export const metadata = {
  title: 'Statistik Bencana — BPBD Kaltim',
  description: 'Data statistik kejadian bencana di Provinsi Kalimantan Timur.',
}

export default async function StatistikPage() {
  noStore()

  const regencyAlias = alias(regions, 'regency_r')
  const currentYear = new Date().getFullYear()

  const [perKabkota, perJenis, perBulan, perTahun, korbanAgg, kerugianAgg, kkTerdampak, totalAll] =
    await Promise.all([
      // Per kab/kota
      db
        .select({
          regencyName: regencyAlias.name,
          total: count(incidents.id),
        })
        .from(incidents)
        .leftJoin(regencyAlias, eq(incidents.regencyId, regencyAlias.id))
        .groupBy(incidents.regencyId, regencyAlias.name)
        .orderBy(desc(count(incidents.id))),

      // Per jenis bencana
      db
        .select({
          name: disasterTypes.name,
          category: disasterTypes.category,
          color: disasterTypes.color,
          total: count(incidents.id),
        })
        .from(incidents)
        .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
        .groupBy(
          incidents.disasterTypeId,
          disasterTypes.name,
          disasterTypes.category,
          disasterTypes.color
        )
        .orderBy(desc(count(incidents.id))),

      // Per bulan + tahun (untuk filter di client)
      db
        .select({
          tahun: sql<number>`YEAR(${incidents.occurredDate})`,
          bulan: sql<number>`MONTH(${incidents.occurredDate})`,
          total: count(incidents.id),
        })
        .from(incidents)
        .where(sql`${incidents.occurredDate} IS NOT NULL`)
        .groupBy(sql`YEAR(${incidents.occurredDate})`, sql`MONTH(${incidents.occurredDate})`)
        .orderBy(sql`YEAR(${incidents.occurredDate})`, sql`MONTH(${incidents.occurredDate})`),

      // Per tahun
      db
        .select({
          tahun: sql<number>`YEAR(${incidents.occurredDate})`,
          total: count(incidents.id),
        })
        .from(incidents)
        .where(sql`${incidents.occurredDate} IS NOT NULL`)
        .groupBy(sql`YEAR(${incidents.occurredDate})`)
        .orderBy(sql`YEAR(${incidents.occurredDate})`),

      // Korban per tipe
      db
        .select({
          impactType: incidentVictims.impactType,
          totalMale: sum(incidentVictims.countMale),
          totalFemale: sum(incidentVictims.countFemale),
          total: sum(incidentVictims.countTotal),
        })
        .from(incidentVictims)
        .groupBy(incidentVictims.impactType),

      // Total kerugian
      db.select({ totalKerugian: sum(incidentDamages.estimatedLoss) }).from(incidentDamages),

      // KK mengungsi
      db
        .select({ total: sum(incidentVictims.countTotal) })
        .from(incidentVictims)
        .where(eq(incidentVictims.impactType, 'mengungsi')),

      // Total semua
      db.select({ total: count(incidents.id) }).from(incidents),
    ])

  const getVictim = (type: string) => korbanAgg.find((k) => k.impactType === type)

  const summaryStats = {
    totalKejadian: totalAll[0]?.total ?? 0,
    mengungsi: Number(getVictim('mengungsi')?.total ?? 0),
    menderita: Number(getVictim('menderita')?.total ?? 0),
    hilang: Number(getVictim('hilang')?.total ?? 0),
    meninggal: Number(getVictim('meninggal')?.total ?? 0),
    lukaSakit: Number(getVictim('luka_sakit')?.total ?? 0),
    totalKK: Number(kkTerdampak[0]?.total ?? 0),
    totalKerugian: Number(kerugianAgg[0]?.totalKerugian ?? 0),
  }

  // Tahun tersedia untuk filter
  const availableYears = [...new Set(perTahun.map((t) => Number(t.tahun)))].sort((a, b) => b - a)

  // Per bulan tahun berjalan (default view)
  const perBulanCurrentYear = Array.from({ length: 12 }, (_, i) => {
    const found = perBulan.find((b) => Number(b.tahun) === currentYear && Number(b.bulan) === i + 1)
    return { bulan: i + 1, total: Number(found?.total ?? 0) }
  })

  // Semua data bulan (untuk filter client-side jika perlu)
  const perBulanAll = perBulan.map((b) => ({
    tahun: Number(b.tahun),
    bulan: Number(b.bulan),
    total: Number(b.total),
  }))

  const alamCount = perJenis
    .filter((j) => j.category === 'alam')
    .reduce((s, j) => s + Number(j.total), 0)
  const nonAlamCount = perJenis
    .filter((j) => j.category === 'non_alam')
    .reduce((s, j) => s + Number(j.total), 0)

  return (
    <StatistikClient
      summaryStats={summaryStats}
      perKabkota={perKabkota.map((k) => ({
        name: k.regencyName ?? 'Tidak Diketahui',
        total: Number(k.total),
      }))}
      perJenis={perJenis.map((j) => ({
        name: j.name ?? 'Lain-Lain',
        category: j.category ?? 'alam',
        color: j.color ?? '#6b7592',
        total: Number(j.total),
      }))}
      perBulan={perBulanCurrentYear}
      perBulanAll={perBulanAll}
      perTahun={perTahun.map((t) => ({ tahun: Number(t.tahun), total: Number(t.total) }))}
      alamCount={alamCount}
      nonAlamCount={nonAlamCount}
      currentYear={currentYear}
      availableYears={availableYears}
    />
  )
}
