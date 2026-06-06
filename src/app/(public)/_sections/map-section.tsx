// src/app/(public)/_sections/map-section.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { ExternalLink, MapPin, List, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { db } from '@/lib/db'
import { incidents, disasterTypes, regions, siteSettings } from '@db/schema'
import { eq, desc, ne, gte, and } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { MapPreview } from './_components/map-preview'

function fmtShort(d: Date | string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(d))
}

export async function MapSection() {
  noStore()

  const regencyAlias = alias(regions, 'regency_r')
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(`${currentYear}-01-01`)

  const [activeIncidents, allActive, settings] = await Promise.all([
    db
      .select({
        id: incidents.id,
        title: incidents.title,
        disasterTypeName: disasterTypes.name,
        disasterTypeIcon: disasterTypes.icon,
        disasterTypeColor: disasterTypes.color,
        regencyName: regencyAlias.name,
        villageName: incidents.villageName,
        status: incidents.status,
        occurredDate: incidents.occurredDate,
        latitude: incidents.latitude,
        longitude: incidents.longitude,
      })
      .from(incidents)
      .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
      .leftJoin(regencyAlias, eq(incidents.regencyId, regencyAlias.id))
      .where(
        and(
          eq(incidents.isPublished, true),
          ne(incidents.status, 'selesai'),
          gte(incidents.occurredDate, startOfYear)
        )
      )
      .orderBy(desc(incidents.occurredDate))
      .limit(4),

    db
      .select({ id: incidents.id, status: incidents.status })
      .from(incidents)
      .where(
        and(
          eq(incidents.isPublished, true),
          ne(incidents.status, 'selesai'),
          gte(incidents.occurredDate, startOfYear)
        )
      ),

    db
      .select()
      .from(siteSettings)
      .then((rows) => Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))),
  ])

  const totalAktif = allActive.filter((i) => i.status === 'aktif').length
  const totalDitangani = allActive.filter((i) => i.status === 'ditangani').length

  const mapToken = settings.mapbox_token ?? ''
  const centerLat = parseFloat(settings.map_latitude ?? '-1.0')
  const centerLng = parseFloat(settings.map_longitude ?? '116.5')

  // Serialisasi untuk client component
  const incidentPoints = activeIncidents.map((i) => ({
    id: i.id,
    title: i.title,
    typeIcon: i.disasterTypeIcon ?? '⚠️',
    typeColor: i.disasterTypeColor ?? '#6b7592',
    status: i.status ?? 'ditangani',
    latitude: parseFloat(i.latitude as unknown as string),
    longitude: parseFloat(i.longitude as unknown as string),
  }))

  const STATUS_CONFIG = {
    aktif: { label: 'Aktif', dotBg: 'bg-red-500', textColor: 'text-red-600', pulse: true },
    ditangani: {
      label: 'Ditangani',
      dotBg: 'bg-amber-400',
      textColor: 'text-amber-600',
      pulse: false,
    },
  }

  return (
    <section id="peta" className="bg-background border-border border-y py-20">
      <div className="container-content mx-auto max-w-(--width-content)">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-(--orange-600) uppercase">
              <span className="h-0.5 w-4.5 rounded-full bg-(--orange-500)" />
              Pusdalops Real-time
            </div>
            <h2 className="text-foreground text-[clamp(1.35rem,2.5vw,1.875rem)] font-bold tracking-tight">
              Peta Sebaran Kejadian Bencana
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Kejadian aktif & ditangani Tahun {currentYear}
            </p>
          </div>
          <Button
            variant="link"
            asChild
            className="hidden text-xs font-semibold text-(--navy-600) hover:text-(--orange-600) sm:flex"
          >
            <Link href="/peta-bencana">
              Buka Peta Penuh <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          {/* Peta Mapbox — client component */}
          <MapPreview
            token={mapToken}
            centerLat={centerLat}
            centerLng={centerLng}
            incidents={incidentPoints}
            totalAktif={totalAktif}
            totalDitangani={totalDitangani}
            year={currentYear}
          />

          {/* Sidebar list */}
          <div className="flex flex-col gap-2.5">
            <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-wider uppercase">
              Kejadian Aktif & Ditangani
            </p>

            {activeIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border py-10 text-center">
                <AlertTriangle className="h-7 w-7 text-slate-300" />
                <p className="text-muted-foreground text-sm">Tidak ada kejadian aktif</p>
              </div>
            ) : (
              activeIncidents.map((inc) => {
                const st =
                  STATUS_CONFIG[inc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.ditangani
                return (
                  <Link key={inc.id} href="/peta-bencana">
                    <Card className="bg-secondary/50 border-border cursor-pointer gap-0 rounded-xl p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                          style={{
                            background: `${inc.disasterTypeColor ?? '#6b7592'}18`,
                            color: inc.disasterTypeColor ?? '#6b7592',
                          }}
                        >
                          {inc.disasterTypeIcon} {inc.disasterTypeName ?? 'Bencana'}
                        </span>
                        <span
                          className={cn(
                            'flex items-center gap-1 text-[10px] font-semibold',
                            st.textColor
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              st.dotBg,
                              st.pulse && 'animate-pulse'
                            )}
                          />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-foreground mb-1 line-clamp-1 text-[13px] leading-snug font-semibold">
                        {inc.title}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                        <MapPin className="text-muted-foreground/70 h-3 w-3 shrink-0" />
                        {[inc.villageName, inc.regencyName].filter(Boolean).join(', ') ||
                          'Kalimantan Timur'}
                        {inc.occurredDate && (
                          <span className="ml-auto shrink-0 text-[10px]">
                            {fmtShort(inc.occurredDate)}
                          </span>
                        )}
                      </p>
                    </Card>
                  </Link>
                )
              })
            )}

            <Button
              variant="outline"
              asChild
              className="border-border mt-1 w-full rounded-[9px] text-(--navy-700) hover:bg-(--navy-50) hover:text-(--navy-700)"
            >
              <Link href="/peta-bencana">
                <List className="mr-2 h-4 w-4" />
                Lihat Semua di Peta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
