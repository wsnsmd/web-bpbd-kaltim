// src/app/(public)/_sections/map-section.tsx
import Link from 'next/link'
import { ExternalLink, MapPin, List } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const INCIDENTS = [
  {
    type: 'Karhutla',
    typeClass: 'bg-[var(--danger-light)] text-[var(--danger-text)]',
    status: 'Aktif',
    statusColor: 'text-[var(--danger)]',
    title: 'Kebakaran Hutan Perbukitan Berau Barat',
    loc: 'Kab. Berau',
    detail: '±240 ha terbakar',
  },
  {
    type: 'Banjir',
    typeClass: 'bg-[var(--caution-light)] text-[var(--caution-text)]',
    status: 'Dipantau',
    statusColor: 'text-[var(--warning)]',
    title: 'Genangan Banjir Pesisir Samarinda Ilir',
    loc: 'Kota Samarinda',
    detail: '380 KK terdampak',
  },
  {
    type: 'Karhutla',
    typeClass: 'bg-[var(--danger-light)] text-[var(--danger-text)]',
    status: 'Aktif',
    statusColor: 'text-[var(--danger)]',
    title: 'Titik Api Kawasan Gambut Kutai Timur',
    loc: 'Kab. Kutai Timur',
    detail: '18 titik api',
  },
  {
    type: 'Longsor',
    typeClass: 'bg-[var(--warning-light)] text-[var(--warning-text)]',
    status: 'Dipantau',
    statusColor: 'text-[var(--warning)]',
    title: 'Ancaman Longsor Lereng Mahakam Ulu',
    loc: 'Kab. Mahakam Ulu',
    detail: 'Siaga I',
  },
]

export function MapSection() {
  return (
    <section id="peta" className="bg-background border-border border-y py-20">
      <div className="container-content mx-auto max-w-(--width-content)">
        {/* Header Section */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-(--orange-600) uppercase">
              <span className="h-0.5 w-4.5 rounded-full bg-(--orange-500)" />
              Pusdalops Real-time
            </div>
            <h2 className="text-foreground text-[clamp(1.35rem,2.5vw,1.875rem)] font-bold tracking-tight">
              Peta Sebaran Kejadian Bencana
            </h2>
          </div>

          <Button
            variant="link"
            asChild
            className="hidden text-xs font-semibold text-(--navy-600) hover:text-(--orange-600) sm:flex"
          >
            <Link href="/informasi/peta">
              Buka Peta Penuh <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          {/* Map Placeholder */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-(--navy-900)">
            {/* Grid Pattern */}
            <svg
              className="absolute inset-0 h-full w-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapgrid)" />
            </svg>

            {/* Kaltim Outline Simulation */}
            <svg
              className="absolute inset-0 h-full w-full opacity-20"
              viewBox="0 0 800 450"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M120,80 L200,60 L300,55 L420,70 L520,90 L600,120 L650,160 L660,220 L640,280 L580,330 L500,360 L400,370 L300,355 L200,330 L130,290 L100,230 L90,170 Z"
                fill="none"
                stroke="rgba(255,255,255,.6)"
                strokeWidth="2"
                strokeDasharray="8,4"
              />
            </svg>

            {/* Incident Dots */}
            {[
              { top: '35%', left: '62%', bg: 'bg-[var(--orange-500)]' },
              { top: '28%', left: '45%', bg: 'bg-[var(--orange-500)]' },
              { top: '55%', left: '30%', bg: 'bg-[var(--caution)]' },
              { top: '62%', left: '55%', bg: 'bg-[var(--caution)]' },
              { top: '42%', left: '38%', bg: 'bg-[var(--gold-400)]' },
            ].map((dot, i) => (
              <div
                key={i}
                className={cn(
                  'absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-white/60',
                  dot.bg
                )}
                style={{ top: dot.top, left: dot.left }}
              />
            ))}

            {/* Live Badge */}
            <div className="bg-navy-950/80 absolute top-3 right-3 flex items-center rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/70 backdrop-blur-md">
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-(--safe)" />
              Live — Juni 2026
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              {[
                { bg: 'bg-[var(--orange-500)]', label: 'Karhutla' },
                { bg: 'bg-[var(--caution)]', label: 'Banjir' },
                { bg: 'bg-[var(--gold-400)]', label: 'Longsor' },
              ].map((leg) => (
                <div
                  key={leg.label}
                  className="bg-navy-950/75 flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', leg.bg)} />
                  {leg.label}
                </div>
              ))}
            </div>
          </div>

          {/* Incidents Sidebar */}
          <div className="flex flex-col gap-2.5">
            <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-wider uppercase">
              Kejadian Aktif & Dipantau
            </p>

            {INCIDENTS.map((inc) => (
              <Card
                key={inc.title}
                className="bg-secondary/50 border-border gap-0 rounded-xl p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                      inc.typeClass
                    )}
                  >
                    {inc.type}
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-[10px] font-semibold',
                      inc.statusColor
                    )}
                  >
                    <span className="text-[7px]">●</span>
                    {inc.status}
                  </span>
                </div>
                <p className="text-foreground mb-1 text-[13px] leading-snug font-semibold">
                  {inc.title}
                </p>
                <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <MapPin className="text-muted-foreground/70 h-3 w-3" />
                  {inc.loc} • {inc.detail}
                </p>
              </Card>
            ))}

            <Button
              variant="outline"
              asChild
              className="border-border mt-1 w-full rounded-[9px] text-(--navy-700) hover:bg-(--navy-50) hover:text-(--navy-700)"
            >
              <Link href="/informasi/kejadian">
                <List className="mr-2 h-4 w-4" />
                Semua Kejadian
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
