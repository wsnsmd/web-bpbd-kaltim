// src/app/api/bmkg-peringatan/route.ts
// Fetch RSS peringatan dini BMKG, filter Kalimantan Timur, ambil detail tiap alert
import { NextResponse } from 'next/server'

const RSS_URL = 'https://www.bmkg.go.id/alerts/nowcast/id/rss.xml'
const KALTIM_KEYWORDS = [
  'kalimantan timur',
  'kaltim',
  // kecamatan/kab Kaltim yang sering muncul di peringatan
  'samarinda',
  'balikpapan',
  'bontang',
  'tenggarong',
  'sangatta',
  'berau',
  'tanjung redeb',
  'penajam',
  'melak',
  'sendawar',
  'long bagun',
  'mahakam',
  'kutai',
]

export interface PeringatanItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  wilayah: string
  waktuMulai: string
  waktuSelesai: string
  infografis: string | null
  severity: string
  urgency: string
  area: string
}

// Parse RSS XML sederhana tanpa library
function parseRSS(
  xml: string
): { title: string; link: string; description: string; pubDate: string; guid: string }[] {
  const items: {
    title: string
    link: string
    description: string
    pubDate: string
    guid: string
  }[] = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const match of itemMatches) {
    const content = match[1]
    const get = (tag: string) => {
      const m = content.match(
        new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i')
      )
      return m?.[1]?.trim() ?? ''
    }
    items.push({
      title: get('title'),
      link: get('link'),
      description: get('description'),
      pubDate: get('pubDate'),
      guid: get('guid'),
    })
  }
  return items
}

// Parse XML CAP alert
function parseCAP(xml: string): Partial<PeringatanItem> {
  const get = (tag: string) => {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    return m?.[1]?.trim() ?? ''
  }
  const webUrl = get('web')
  // URL infografis dari field <web> di CAP
  const infografis = webUrl && webUrl.includes('infografis') ? webUrl : null

  return {
    waktuMulai: get('effective'),
    waktuSelesai: get('expires'),
    severity: get('severity'),
    urgency: get('urgency'),
    area: get('areaDesc'),
    infografis,
  }
}

// Cek apakah item berkaitan dengan Kalimantan Timur
function isKaltim(text: string): boolean {
  const lower = text.toLowerCase()
  return KALTIM_KEYWORDS.some((kw) => lower.includes(kw))
}

export async function GET() {
  try {
    // Fetch RSS
    const rssRes = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BPBD-Kaltim/1.0)' },
      next: { revalidate: 600 }, // cache 10 menit
    })
    if (!rssRes.ok) return NextResponse.json({ items: [], error: 'RSS fetch failed' })

    const rssText = await rssRes.text()
    const rssItems = parseRSS(rssText)

    // Filter yang berkaitan Kaltim
    const kaltimItems = rssItems.filter(
      (item) => isKaltim(item.title) || isKaltim(item.description)
    )

    // Fetch detail CAP untuk tiap item (parallel, max 10)
    const detailPromises = kaltimItems.slice(0, 10).map(async (item) => {
      let capData: Partial<PeringatanItem> = {}
      if (item.link) {
        try {
          const capRes = await fetch(item.link, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BPBD-Kaltim/1.0)' },
            next: { revalidate: 600 },
          })
          if (capRes.ok) {
            const capText = await capRes.text()
            capData = parseCAP(capText)
          }
        } catch {
          /* gagal fetch CAP, lanjut dengan data RSS saja */
        }
      }

      // Extract waktu dari description jika CAP gagal
      const timeMatch = item.description.match(/hingga\s+([\d]+\s+\w+\s+\d{4},\s+[\d:]+\s+\w+)/i)
      const mulaiMatch = item.description.match(
        /(?:akan terjadi pada|terjadi pada)\s+([\d]+\s+\w+\s+\d{4},\s+[\d:]+\s+\w+)/i
      )

      return {
        id: item.guid || item.link,
        title: item.title,
        description: item.description,
        link: item.link,
        pubDate: item.pubDate,
        wilayah: item.title.replace(/hujan lebat.*?di\s+/i, '').trim(),
        waktuMulai: capData.waktuMulai || mulaiMatch?.[1] || '',
        waktuSelesai: capData.waktuSelesai || timeMatch?.[1] || '',
        infografis: capData.infografis || null,
        severity: capData.severity || 'Moderate',
        urgency: capData.urgency || 'Immediate',
        area: capData.area || item.title.split(' di ').pop() || '',
      } as PeringatanItem
    })

    const items = await Promise.all(detailPromises)

    return NextResponse.json(
      { items, total: items.length, updatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' } }
    )
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e.message }, { status: 200 })
  }
}
