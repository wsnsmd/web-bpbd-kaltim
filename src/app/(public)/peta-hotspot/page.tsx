// src/app/(public)/peta-hotspot/page.tsx
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { PetaHotspotClient } from './_components/peta-hotspot-client'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'

export const metadata = {
  title: 'Peta Sebaran Hotspot — BPBD Kaltim',
  description: 'Peta sebaran titik api (hotspot) karhutla di Kalimantan Timur.',
}

export default async function PetaHotspotPage() {
  // Ambil mapbox token dari settings
  const rows = await db.select().from(siteSettings)
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  const mapToken = settings.mapbox_token ?? ''
  const centerLat = parseFloat(settings.map_latitude ?? '-1.0')
  const centerLng = parseFloat(settings.map_longitude ?? '116.5')

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header compact */}
      <div className="bg-navy-900 border-navy-800 z-10 flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <Link
          href="/"
          className="text-navy-400 flex items-center gap-1 text-xs transition hover:text-white"
        >
          ← Beranda
        </Link>
        <div className="bg-navy-700 h-4 w-px" />
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-bold text-white">Peta Sebaran Hotspot</span>
          <span className="text-navy-400 text-xs">24 Jam Terakhir · Kalimantan Timur</span>
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <span className="text-navy-400 text-[10px]">Sumber:</span>
          <a
            href="https://sipongi.menlhk.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-orange-400 hover:underline"
          >
            SIPONGI KLHK
          </a>
          <span className="text-navy-400 text-[10px]">· NASA FIRMS</span>
        </div>
      </div>

      <PetaHotspotClient mapToken={mapToken} centerLat={centerLat} centerLng={centerLng} />
    </div>
  )
}
