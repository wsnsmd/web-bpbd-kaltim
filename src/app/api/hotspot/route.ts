// src/app/api/hotspot/route.ts
// Fetch + parse data hotspot dari sipongidata setiap 24 jam
import { NextResponse } from 'next/server'

const SIPONGI_URL =
  'https://opsroom.sipongidata.my.id/api/sebaran/download?late=24&provinsi=Kalimantan%20Timur&confidence=all&satelit=all-nasa&tipe=txt'

export interface HotspotPoint {
  provinsi: string
  kabkota: string
  kecamatan: string
  desa: string
  tanggal: string
  waktu: string
  satelit: string
  confidence: string
  latitude: number
  longitude: number
}

function parseTxt(text: string): HotspotPoint[] {
  const lines = text.trim().split('\n')
  const points: HotspotPoint[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(',')
    if (parts.length < 10) continue

    const lat = parseFloat(parts[8]?.trim())
    const lng = parseFloat(parts[9]?.trim())
    if (isNaN(lat) || isNaN(lng)) continue

    points.push({
      provinsi: parts[0]?.trim() ?? '',
      kabkota: parts[1]?.trim() ?? '',
      kecamatan: parts[2]?.trim() ?? '',
      desa: parts[3]?.trim() ?? '',
      tanggal: parts[4]?.trim() ?? '',
      waktu: parts[5]?.trim() ?? '',
      satelit: parts[6]?.trim() ?? '',
      confidence: parts[7]?.trim() ?? '',
      latitude: lat,
      longitude: lng,
    })
  }

  return points
}

export async function GET() {
  try {
    const res = await fetch(SIPONGI_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BPBD-Kaltim/1.0)',
        Accept: 'text/plain, */*',
      },
      next: { revalidate: 86400 }, // cache 24 jam
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Sipongi returned ${res.status}`, points: [] },
        { status: 200 } // return 200 dengan empty agar UI tidak crash
      )
    }

    const text = await res.text()
    const points = parseTxt(text)

    // Stats agregat
    const stats = {
      total: points.length,
      high: points.filter((p) => p.confidence.toLowerCase() === 'high').length,
      medium: points.filter((p) => p.confidence.toLowerCase() === 'medium').length,
      low: points.filter((p) => p.confidence.toLowerCase() === 'low').length,
      perKab: Object.entries(
        points.reduce(
          (acc, p) => {
            acc[p.kabkota] = (acc[p.kabkota] ?? 0) + 1
            return acc
          },
          {} as Record<string, number>
        )
      ).sort((a, b) => b[1] - a[1]),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(
      { points, stats },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } }
    )
  } catch (e: any) {
    console.error('Hotspot fetch error:', e)
    return NextResponse.json({ error: e.message, points: [], stats: null }, { status: 200 })
  }
}
