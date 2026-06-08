// src/app/(public)/peringatan-dini/_components/peringatan-grid.tsx
// Server Component — fetch dari API route kita
import { Clock, MapPin, ExternalLink, CloudLightning, Info } from 'lucide-react'

interface PeringatanItem {
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

const SEVERITY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Extreme: {
    label: 'Ekstrem',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500 animate-pulse',
  },
  Severe: {
    label: 'Parah',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500 animate-pulse',
  },
  Moderate: {
    label: 'Sedang',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  Minor: {
    label: 'Ringan',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
  },
}

function fmtPubDate(d: string) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return d
  }
}

// Potong deskripsi panjang — ambil kalimat pertama saja
function shortDesc(desc: string): string {
  const sentences = desc.split('.').filter(Boolean)
  return sentences[0]?.trim() + '.' || desc.slice(0, 200)
}

async function getPeringatan(): Promise<{ items: PeringatanItem[]; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/bmkg-peringatan`, {
      next: { revalidate: 600 },
    })
    if (!res.ok) return { items: [] }
    return await res.json()
  } catch {
    return { items: [] }
  }
}

export async function PeringatanGrid() {
  const { items, error } = await getPeringatan()

  if (error || items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white py-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
          <Info className="h-6 w-6 text-green-500" />
        </div>
        <p className="font-semibold text-slate-700">Tidak Ada Peringatan Aktif</p>
        <p className="max-w-xs text-sm text-slate-400">
          Saat ini tidak ada peringatan dini cuaca aktif untuk wilayah Kalimantan Timur dari BMKG.
        </p>
        <a
          href="https://www.bmkg.go.id/cuaca/peringatan-dini-cuaca/64"
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy-600 mt-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Lihat di BMKG
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const sev = SEVERITY_CONFIG[item.severity] ?? SEVERITY_CONFIG.Moderate
        return (
          <div
            key={item.id}
            className={`rounded-2xl border ${sev.border} ${sev.bg} overflow-hidden shadow-sm`}
          >
            <div className="p-5">
              {/* Header */}
              <div className="mb-3 flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${sev.text} bg-white/60`}
                >
                  <CloudLightning className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${sev.text} bg-white/60`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                      {sev.label}
                    </span>
                    <span className="text-[10px] text-slate-500">{fmtPubDate(item.pubDate)}</span>
                  </div>
                  <h3 className={`text-sm leading-snug font-bold ${sev.text}`}>{item.title}</h3>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-slate-400 transition hover:text-slate-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Lokasi */}
              {item.area && (
                <div className="mb-3 flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="line-clamp-1">{item.area}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Deskripsi singkat */}
                <div>
                  <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {shortDesc(item.description)}
                  </p>
                  {/* Waktu berlaku */}
                  {item.waktuSelesai && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      Berlaku hingga: <strong>{item.waktuSelesai}</strong>
                    </div>
                  )}
                </div>

                {/* Infografis */}
                {item.infografis && (
                  <a
                    href={item.infografis}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-white/60 bg-white/40 transition hover:opacity-90"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.infografis}
                      alt={`Infografis ${item.title}`}
                      className="h-auto w-full object-cover"
                      loading="lazy"
                    />
                    <div className="flex items-center gap-1.5 bg-white/60 px-3 py-2 text-[10px] text-slate-500">
                      <ExternalLink className="h-3 w-3" />
                      Lihat infografis lengkap
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <p className="pt-2 text-center text-xs text-slate-400">
        Menampilkan {items.length} peringatan aktif · Sumber:{' '}
        <a
          href="https://www.bmkg.go.id/alerts/nowcast/id/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          BMKG Nowcasting RSS
        </a>
      </p>
    </div>
  )
}
