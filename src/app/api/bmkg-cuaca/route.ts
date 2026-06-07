// src/app/api/bmkg-cuaca/route.ts
// Proxy untuk API BMKG — menghindari CORS dan 403 dari server-side fetch
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const adm4 = request.nextUrl.searchParams.get('adm4')
  if (!adm4) return NextResponse.json({ error: 'adm4 required' }, { status: 400 })

  try {
    const res = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BPBD-Kaltim/1.0)',
        Accept: 'application/json',
        Referer: 'https://www.bmkg.go.id',
      },
      next: { revalidate: 3600 }, // cache 1 jam
    })

    if (!res.ok) {
      return NextResponse.json({ error: `BMKG returned ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (e) {
    return NextResponse.json({ error: `Failed to fetch BMKG ${e}` }, { status: 500 })
  }
}
