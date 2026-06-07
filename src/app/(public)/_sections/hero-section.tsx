// src/app/(public)/_sections/hero-section.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { siteSettings, incidents } from '@db/schema'
import { LayoutList, MapPin, AlertTriangle } from 'lucide-react'
import { eq, and, gte, count } from 'drizzle-orm'

async function getHeroData() {
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(`${currentYear}-01-01`)
  const [rows, activeCount, totalCount] = await Promise.all([
    db.select().from(siteSettings),
    db
      .select({ total: count() })
      .from(incidents)
      .where(and(eq(incidents.isPublished, true), eq(incidents.status, 'aktif'))),
    db
      .select({ total: count() })
      .from(incidents)
      .where(and(eq(incidents.isPublished, true), gte(incidents.occurredDate, startOfYear))),
  ])
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  return {
    title: map.hero_title || 'Penanggulangan Bencana\nKalimantan Timur',
    subtitle: map.hero_subtitle || 'Tanggap, Tangguh, Cepat',
    description:
      map.hero_description ||
      'Pusat koordinasi, informasi, dan layanan kebencanaan wilayah Benua Etam untuk keselamatan masyarakat.',
    badge: map.hero_badge || 'Portal Resmi — Pemerintah Provinsi Kalimantan Timur',
    ctaPrimaryLabel: map.hero_cta_primary_label || 'Peta Bencana',
    ctaPrimaryHref: map.hero_cta_primary_href || '/peta-bencana',
    ctaSecondaryLabel: map.hero_cta_secondary_label || 'Data Kejadian',
    ctaSecondaryHref: map.hero_cta_secondary_href || '/data-kejadian',
    bgImage: map.hero_bg_image || '',
    statusWilayah: map.status_wilayah || 'aman',
    activeIncidents: Number(activeCount[0]?.total ?? 0),
    yearIncidents: Number(totalCount[0]?.total ?? 0),
    currentYear,
  }
}

const STATUS_HERO = {
  aman: { label: 'Kondisi Normal', color: '#22c55e', pulse: 'bg-green-400' },
  waspada: { label: 'Status Waspada', color: '#eab308', pulse: 'bg-yellow-400' },
  siaga: { label: 'Status Siaga', color: '#f97316', pulse: 'bg-orange-400' },
  tanggap: { label: 'Tanggap Darurat', color: '#ef4444', pulse: 'bg-red-400' },
}

export async function HeroSection() {
  noStore()
  const s = await getHeroData()
  const titleLines = s.title.split('\n')
  const titleLine1 = titleLines[0] ?? ''
  const titleLine2 = titleLines[1] ?? ''
  const stCfg = STATUS_HERO[s.statusWilayah as keyof typeof STATUS_HERO] ?? STATUS_HERO.aman

  return (
    <section className="bg-navy-950 relative flex min-h-svh flex-col justify-center overflow-hidden pb-24 md:pb-32">
      {/* ── BG Photo ── */}
      {s.bgImage && (
        <>
          <Image
            src={s.bgImage}
            alt=""
            fill
            priority
            className="object-cover object-center opacity-25"
            sizes="100vw"
          />
          <div className="from-navy-950 via-navy-950/60 absolute inset-0 bg-gradient-to-r to-transparent" />
        </>
      )}

      {/* ── Aurora blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full opacity-[0.22]"
          style={{
            background: 'radial-gradient(circle, #e85000 0%, transparent 70%)',
            animation: 'blobFloat1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-[0.15]"
          style={{
            background: 'radial-gradient(circle, #1b56a8 0%, transparent 70%)',
            animation: 'blobFloat2 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, #e5aa0d 0%, transparent 70%)',
            animation: 'blobFloat3 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Dot pattern ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 40%, black 30%, transparent 100%)',
        }}
      />

      {/* ══ DEKORASI SVG KANAN ══ */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 overflow-hidden"
        style={{ animation: 'fadeInRight 1.2s 0.3s ease both', opacity: 0 }}
      >
        {/* Radar / sonar ring animasi */}
        <svg
          className="absolute top-1/2 right-[-5%] -translate-y-1/2 opacity-[0.12]"
          width="680"
          height="680"
          viewBox="0 0 680 680"
          fill="none"
        >
          {[340, 280, 220, 160, 100, 50].map((r, i) => (
            <circle
              key={i}
              cx="340"
              cy="340"
              r={r}
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={i === 0 ? 1.5 : 0.8}
              strokeDasharray={i % 2 === 0 ? 'none' : '4 8'}
              fill="none"
            />
          ))}
          {/* Garis crosshair */}
          <line
            x1="340"
            y1="0"
            x2="340"
            y2="680"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
            strokeDasharray="4 12"
          />
          <line
            x1="0"
            y1="340"
            x2="680"
            y2="340"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
            strokeDasharray="4 12"
          />
          {/* Sweep radar */}
          <path
            d="M340 340 L340 40 A300 300 0 0 1 620 340 Z"
            fill="url(#radarSweep)"
            style={{ transformOrigin: '340px 340px', animation: 'radarSpin 6s linear infinite' }}
          />
          <defs>
            <radialGradient id="radarSweep" cx="0%" cy="50%" r="100%">
              <stop offset="0%" stopColor="#e85000" stopOpacity="0" />
              <stop offset="70%" stopColor="#e85000" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
            </radialGradient>
          </defs>
        </svg>

        {/* Titik hotspot melayang — simulasi titik api di peta */}
        {[
          { x: '55%', y: '32%', r: 5, delay: '0s', color: '#ef4444', pulse: true },
          { x: '72%', y: '55%', r: 4, delay: '0.8s', color: '#f97316', pulse: true },
          { x: '45%', y: '62%', r: 3, delay: '1.4s', color: '#ef4444', pulse: false },
          { x: '80%', y: '38%', r: 3, delay: '2.1s', color: '#fbbf24', pulse: false },
          { x: '60%', y: '70%', r: 4, delay: '0.4s', color: '#f97316', pulse: true },
          { x: '38%', y: '45%', r: 2.5, delay: '1.8s', color: '#ef4444', pulse: false },
          { x: '88%', y: '62%', r: 3, delay: '3.2s', color: '#fbbf24', pulse: true },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: dot.x,
              top: dot.y,
              animation: `dotAppear 0.6s ${dot.delay} ease both`,
              opacity: 0,
            }}
          >
            {/* Outer ring pulse */}
            {dot.pulse && (
              <div
                className="absolute -inset-2 rounded-full"
                style={{
                  border: `1.5px solid ${dot.color}`,
                  animation: 'pingRing 2s ease-out infinite',
                  animationDelay: dot.delay,
                  opacity: 0.5,
                }}
              />
            )}
            <div
              className="rounded-full"
              style={{
                width: dot.r * 2,
                height: dot.r * 2,
                background: dot.color,
                boxShadow: `0 0 ${dot.r * 3}px ${dot.r}px ${dot.color}80`,
              }}
            />
          </div>
        ))}

        {/* Garis koneksi antar titik — SVG polyline */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.08]"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid meet"
        >
          <polyline
            points="330,192 432,330 270,372 480,228 360,420 528,372"
            fill="none"
            stroke="#e85000"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        </svg>

        {/* Info card melayang — kejadian aktif */}
        <div
          className="absolute top-[20%] right-[12%]"
          style={{
            animation: 'floatCard 4s ease-in-out infinite, dotAppear 0.8s 1s ease both',
            opacity: 0,
          }}
        >
          <div
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <p className="mb-1 text-[9px] font-bold tracking-widest text-white/40 uppercase">
              Titik Aktif
            </p>
            <p className="text-2xl leading-none font-black text-orange-400">{s.activeIncidents}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              <span className="text-[10px] text-white/50">Sedang ditangani</span>
            </div>
          </div>
        </div>

        {/* Shield icon besar — melambangkan perlindungan */}
        <svg
          className="absolute right-[8%] bottom-[15%] opacity-[0.06]"
          width="180"
          height="200"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z"
            fill="white"
          />
        </svg>
      </div>

      {/* ══ KONTEN UTAMA ══ */}
      <div className="container-content relative z-10 mx-auto max-w-(--width-content) px-6">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="mb-7"
            style={{ animation: 'fadeSlideUp 0.6s 0.05s ease both', opacity: 0 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stCfg.pulse} animate-pulse`} />
              <span className="text-[11px] font-bold tracking-[0.15em] text-white/60 uppercase">
                {s.badge}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ animation: 'fadeSlideUp 0.7s 0.15s ease both', opacity: 0 }}>
            <p className="mb-2 text-[11px] font-bold tracking-[0.25em] text-orange-400 uppercase">
              {s.subtitle}
            </p>
            <h1 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] font-black tracking-tight">
              <span className="block text-white/90">{titleLine1}</span>
              {titleLine2 && (
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #f46a1a 0%, #e85000 45%, #fbbf24 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {titleLine2}
                </span>
              )}
            </h1>
          </div>

          {/* Divider */}
          <div
            className="my-6 flex items-center gap-3"
            style={{ animation: 'fadeSlideUp 0.6s 0.25s ease both', opacity: 0 }}
          >
            <div
              className="h-px max-w-[72px] flex-1"
              style={{ background: 'linear-gradient(90deg, #e85000, transparent)' }}
            />
            <div className="h-1 w-1 rounded-full bg-orange-500" />
          </div>

          {/* Deskripsi */}
          <p
            className="mb-10 max-w-lg text-[15px] leading-[1.8] text-white/50"
            style={{ animation: 'fadeSlideUp 0.6s 0.3s ease both', opacity: 0 }}
          >
            {s.description}
          </p>

          {/* CTA */}
          <div
            className="mb-14 flex flex-wrap items-center gap-3"
            style={{ animation: 'fadeSlideUp 0.6s 0.4s ease both', opacity: 0 }}
          >
            {s.ctaPrimaryLabel && (
              <Link
                href={s.ctaPrimaryHref}
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/40"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                <LayoutList className="h-4 w-4" />
                {s.ctaPrimaryLabel}
              </Link>
            )}
            {s.ctaSecondaryLabel && (
              <Link
                href={s.ctaSecondaryHref}
                className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)' }}
              >
                <MapPin className="h-4 w-4" />
                {s.ctaSecondaryLabel}
              </Link>
            )}
            <Link
              href="tel:112"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600/90 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-600"
            >
              <AlertTriangle className="h-4 w-4" />
              Darurat 112
            </Link>
          </div>

          {/* Stats ticker */}
          <div
            className="flex flex-wrap gap-0"
            style={{ animation: 'fadeSlideUp 0.6s 0.5s ease both', opacity: 0 }}
          >
            {[
              { val: s.activeIncidents, label: 'Kejadian Aktif', accent: '#f87171' },
              { val: s.yearIncidents, label: `Kejadian ${s.currentYear}`, accent: '#fb923c' },
              { val: 10, label: 'Kab/Kota Terpantau', accent: '#fbbf24' },
            ].map((stat, i) => (
              <div
                key={i}
                className="pr-8"
                style={{
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  paddingLeft: i > 0 ? 32 : 0,
                }}
              >
                <p
                  className="text-[clamp(2rem,4vw,3rem)] leading-none font-black tabular-nums"
                  style={{ color: stat.accent }}
                >
                  {stat.val}
                </p>
                <p className="mt-1 text-[11px] font-medium text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, #060e1a, transparent)' }}
      />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity:0; transform:translateX(40px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes dotAppear {
          from { opacity:0; transform:scale(0.5); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes pingRing {
          0%   { transform:scale(1);   opacity:0.6; }
          100% { transform:scale(2.5); opacity:0;   }
        }
        @keyframes radarSpin {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes floatCard {
          0%,100% { transform:translateY(0px); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes blobFloat1 {
          0%,100% { transform:translate(0,0) scale(1); }
          33%     { transform:translate(40px,-30px) scale(1.1); }
          66%     { transform:translate(-20px,40px) scale(0.95); }
        }
        @keyframes blobFloat2 {
          0%,100% { transform:translate(0,0) scale(1); }
          40%     { transform:translate(-50px,30px) scale(1.05); }
          70%     { transform:translate(30px,-40px) scale(0.9); }
        }
        @keyframes blobFloat3 {
          0%,100% { transform:translate(-50%,-50%) scale(1); }
          50%     { transform:translate(-50%,-50%) scale(1.3); }
        }
      `}</style>
    </section>
  )
}
