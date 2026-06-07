// src/app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageViews } from '@db/schema'
import { UAParser } from 'ua-parser-js'

// ── Rate limiter in-memory (per IP, per path) ─────────────────
// Key: `${ip}:${path}` → timestamp terakhir track
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 10_000 // 10 detik cooldown per IP per path

// Bersihkan entri lama setiap 5 menit agar tidak memory leak
setInterval(
  () => {
    const cutoff = Date.now() - RATE_LIMIT_MS * 10
    for (const [key, ts] of rateLimitMap.entries()) {
      if (ts < cutoff) rateLimitMap.delete(key)
    }
  },
  5 * 60 * 1000
)

// ── Bot detection ─────────────────────────────────────────────
const BOT_PATTERN =
  /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|facebookexternalhit|linkedinbot|twitterbot|whatsapp|telegram|curl|wget|python-requests|java|go-http|axios\/|node-fetch/i

function isBot(ua: string): boolean {
  return BOT_PATTERN.test(ua)
}

// ── UA Parser ─────────────────────────────────────────────────
function parseUA(ua: string) {
  const parser = new UAParser(ua)
  const result = parser.getResult()
  return {
    browser: result.browser.name ?? 'Unknown',
    os: result.os.name ?? 'Unknown',
    device: result.device.type ?? 'desktop',
  }
}

// ── IP Geolocation ────────────────────────────────────────────
async function lookupIP(ip: string): Promise<{ country: string; city: string }> {
  if (
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return { country: 'Local', city: 'Local' }
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city&lang=id`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return { country: 'Unknown', city: 'Unknown' }
    const data = await res.json()
    return { country: data.country ?? 'Unknown', city: data.city ?? 'Unknown' }
  } catch {
    return { country: 'Unknown', city: 'Unknown' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') ?? ''

    // 1. Skip bot
    if (isBot(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' })
    }

    const body = await request.json()
    const { path, title, referrer, sessionId } = body

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // 2. Skip admin & API paths
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: 'admin' })
    }

    // 3. Ambil IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : (request.headers.get('x-real-ip') ?? '127.0.0.1')

    // 4. Rate limit — cegah spam dari IP yang sama untuk path yang sama
    const rlKey = `${ip}:${path}`
    const lastTs = rateLimitMap.get(rlKey) ?? 0
    if (Date.now() - lastTs < RATE_LIMIT_MS) {
      return NextResponse.json({ ok: true, skipped: 'rate_limited' })
    }
    rateLimitMap.set(rlKey, Date.now())

    // 5. Parse UA & lookup lokasi
    const parsed = parseUA(ua)
    const location = await lookupIP(ip)

    // 6. Simpan ke DB
    await db.insert(pageViews).values({
      path,
      title: title ?? null,
      referrer: referrer ?? null,
      userAgent: ua,
      browser: parsed.browser,
      os: parsed.os,
      device: parsed.device,
      ip,
      country: location.country,
      city: location.city,
      sessionId: sessionId ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Analytics track error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
