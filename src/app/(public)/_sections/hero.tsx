// src/app/(public)/_sections/hero.tsx
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { StatusBadge } from '@components/shared/status-badge'
import { Shield, MapPin, Users, Flame, HeartHandshake, Building2 } from 'lucide-react'

const HERO_STATS = [
  {
    icon: Flame,
    value: '47',
    label: 'Kejadian bencana\ntahun 2026',
    color: 'text-[var(--orange-300)]',
  },
  {
    icon: Users,
    value: '12.430',
    label: 'Jiwa terdampak\nditangani',
    color: 'text-[var(--navy-300)]',
  },
  {
    icon: HeartHandshake,
    value: '128',
    label: 'Tim relawan\naktif',
    color: 'text-[var(--gold-300)]',
  },
  {
    icon: Building2,
    value: '10',
    label: 'Kab/Kota\nwilayah kerja',
    color: 'text-[var(--navy-400)]',
  },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-(--navy-900)">
      {/* Stripe texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -55deg,
            transparent, transparent 40px,
            rgba(255,255,255,0.018) 40px,
            rgba(255,255,255,0.018) 41px
          )`,
        }}
      />
      {/* Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-105 w-105 rounded-full"
        style={{
          background: 'rgba(46,114,201,0.18)',
          filter: 'blur(80px)',
          transform: 'translate(25%, -50%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[10%] h-70 w-70 rounded-full"
        style={{
          background: 'rgba(232,80,0,0.12)',
          filter: 'blur(80px)',
          transform: 'translateY(50%)',
        }}
      />

      <div className="max-w-content relative mx-auto px-6 py-20 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* ── Left: Text ─────────────────────────────── */}
          <div>
            {/* Kicker pill */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400"
                style={{ animation: 'pulse 2s ease-in-out infinite' }}
              />
              <span className="text-xs font-medium text-(--navy-200)">
                Portal Resmi — Pemerintah Provinsi Kalimantan Timur
              </span>
            </div>

            {/* Heading */}
            <h1
              className="mb-5 font-serif leading-[1.12] tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
            >
              Penanggulangan <br className="hidden sm:block" />
              Bencana{' '}
              <em className="not-italic" style={{ color: 'var(--gold-300)' }}>
                Kalimantan Timur
              </em>
            </h1>

            <p
              className="mb-8 max-w-110 text-base leading-relaxed"
              style={{ color: 'var(--navy-300)' }}
            >
              Pusat koordinasi, informasi, dan layanan kebencanaan wilayah{' '}
              <strong className="font-semibold text-white">Benua Etam</strong>. Tanggap, Tangguh,
              dan Cepat untuk keselamatan masyarakat.
            </p>

            {/* ── CTA Buttons ── */}
            <div className="flex flex-wrap gap-3">
              {/* Layanan Publik — orange solid */}
              <Button
                asChild
                size="lg"
                className="bg-(--orange-500) text-white shadow-[0_2px_12px_rgba(232,80,0,0.35)] hover:-translate-y-px hover:bg-(--orange-400) hover:shadow-[0_4px_20px_rgba(232,80,0,0.45)]"
              >
                <Link href="#layanan">Layanan Publik</Link>
              </Button>

              {/* Peta Bencana — outline glass */}
              <Button
                asChild
                size="lg"
                className="border border-white/20 text-white hover:-translate-y-px hover:border-white/40 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <Link href="/informasi/peta">
                  <MapPin className="h-4 w-4" />
                  Peta Bencana
                </Link>
              </Button>

              {/* Laporkan Bencana — orange gelap */}
              <Button
                asChild
                size="lg"
                className="tracking-wide text-(--orange-100) uppercase hover:-translate-y-px"
                style={{ background: 'var(--orange-800)' }}
              >
                <Link href="#lapor">Laporkan Bencana</Link>
              </Button>
            </div>
          </div>

          {/* ── Right: Widgets ─────────────────────────── */}
          <div className="hidden flex-col gap-3 md:flex">
            {/* Status widget */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="text-[11px] font-bold tracking-widest uppercase"
                  style={{ color: 'var(--navy-400)' }}
                >
                  Status Siaga Provinsi
                </span>
                <span className="text-[11px]" style={{ color: 'var(--navy-500)' }}>
                  Update hari ini
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                  style={{
                    border: '2.5px solid #22c55e',
                    background: 'rgba(34,197,94,0.10)',
                    animation: 'breathe 3s ease-in-out infinite',
                  }}
                >
                  <Shield className="h-6 w-6 text-green-300" />
                </div>
                <div>
                  <StatusBadge level="safe" className="mb-1.5" />
                  <p className="mt-1 text-[12px]" style={{ color: 'var(--navy-300)' }}>
                    Tidak ada kejadian bencana signifikan terpantau
                  </p>
                </div>
              </div>
            </div>

            {/* Stats 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {HERO_STATS.map(({ icon: Icon, value, label, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Icon className={`mb-2.5 h-4 w-4 ${color}`} />
                  <p className="mb-1 text-2xl leading-none font-bold tracking-tight text-white">
                    {value}
                  </p>
                  <p
                    className="text-[11px] leading-snug whitespace-pre-line"
                    style={{ color: 'var(--navy-400)' }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
