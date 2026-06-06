// src/app/(public)/_sections/hero-section.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, LayoutList, MapPin, AlertTriangle, ChevronRight } from 'lucide-react'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'

async function getHeroSettings() {
  const rows = await db.select().from(siteSettings)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  return {
    title: map.hero_title || 'Penanggulangan Bencana\nKalimantan Timur',
    subtitle: map.hero_subtitle || 'Tanggap, Tangguh, Cepat',
    description:
      map.hero_description ||
      'Pusat koordinasi, informasi, dan layanan kebencanaan wilayah Benua Etam untuk keselamatan masyarakat.',
    badge: map.hero_badge || 'Portal Resmi — Pemerintah Provinsi Kalimantan Timur',
    ctaPrimaryLabel: map.hero_cta_primary_label || 'Layanan Publik',
    ctaPrimaryHref: map.hero_cta_primary_href || '#layanan',
    ctaSecondaryLabel: map.hero_cta_secondary_label || 'Peta Bencana',
    ctaSecondaryHref: map.hero_cta_secondary_href || '#peta',
    bgImage: map.hero_bg_image || '',
    statusText: map.hero_status_text || 'Kondisi Wilayah: Normal & Aman',
    statusWilayah: map.status_wilayah || 'aman',
  }
}

export async function HeroSection() {
  noStore()
  const s = await getHeroSettings()

  // Split judul baris 1 & 2
  const titleLines = s.title.split('\n')
  const titleLine1 = titleLines[0] ?? ''
  const titleLine2 = titleLines[1] ?? ''

  const STATUS_HERO_CONFIG = {
    aman: {
      label: 'Status Siaga',
      dot: 'text-green-400',
      ring: 'border-green-400/40 bg-green-400/10',
      icon: 'text-green-400',
    },
    waspada: {
      label: 'Waspada',
      dot: 'text-yellow-400',
      ring: 'border-yellow-400/40 bg-yellow-400/10',
      icon: 'text-yellow-400',
    },
    siaga: {
      label: 'Siaga',
      dot: 'text-orange-400',
      ring: 'border-orange-400/40 bg-orange-400/10',
      icon: 'text-orange-400',
    },
    tanggap: {
      label: 'Tanggap Darurat',
      dot: 'text-red-400',
      ring: 'border-red-400/40 bg-red-400/10',
      icon: 'text-red-400',
    },
  }
  const stCfg =
    STATUS_HERO_CONFIG[s.statusWilayah as keyof typeof STATUS_HERO_CONFIG] ??
    STATUS_HERO_CONFIG.aman

  return (
    <section className="bg-navy-500 relative flex min-h-[95vh] flex-col justify-center overflow-hidden">
      {/* ── Background foto / gradient ── */}
      {s.bgImage ? (
        <>
          <Image
            src={s.bgImage}
            alt="Hero Background"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Multi-layer overlay untuk keterbacaan teks */}
          <div className="from-navy-950/95 via-navy-950/75 to-navy-900/40 absolute inset-0 bg-linear-to-r" />
          <div className="from-navy-950/80 to-navy-950/30 absolute inset-0 bg-linear-to-t via-transparent" />
        </>
      ) : (
        <>
          {/* Fallback gradient decoratif */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #060e1a 0%, #0a1628 50%, #0d2040 100%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-55deg,transparent,transparent 40px,rgba(255,255,255,.012) 40px,rgba(255,255,255,.012) 41px)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 rounded-full"
            style={{
              width: 600,
              height: 600,
              background: 'rgba(46,114,201,.15)',
              filter: 'blur(100px)',
              transform: 'translate(30%,-40%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 rounded-full"
            style={{
              width: 400,
              height: 400,
              background: 'rgba(232,80,0,.1)',
              filter: 'blur(80px)',
              transform: 'translate(-20%,40%)',
            }}
          />
        </>
      )}

      {/* ── Konten ── */}
      <div className="container-content max-w-content relative z-10 mx-auto py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          {s.badge && (
            <div
              className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ background: 'rgba(255,255,255,.07)', borderColor: 'rgba(255,255,255,.12)' }}
            >
              <span className="animate-pulse-slow h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
              <span className="text-navy-200 text-xs font-medium">{s.badge}</span>
            </div>
          )}

          {/* Judul */}
          <h1
            className="animate-fade-up mb-5 text-3xl font-bold tracking-tight text-orange-400"
            style={{ animationDelay: '80ms' }}
          >
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="text-7xl text-slate-50">{titleLine2}</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          {s.subtitle && (
            <p
              className="animate-fade-up mb-3 text-sm font-semibold tracking-widest text-orange-400 uppercase"
              style={{ animationDelay: '120ms' }}
            >
              {s.subtitle}
            </p>
          )}

          {/* Deskripsi */}
          {s.description && (
            <p
              className="animate-fade-up mb-8 max-w-xl text-base leading-relaxed text-slate-300"
              style={{ animationDelay: '160ms' }}
            >
              {s.description}
            </p>
          )}

          {/* CTA buttons */}
          <div
            className="animate-fade-up mb-10 flex flex-wrap gap-3"
            style={{ animationDelay: '200ms' }}
          >
            {s.ctaPrimaryLabel && (
              <Link
                href={s.ctaPrimaryHref}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/40"
              >
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
        </div>
      </div>

      {/* Bottom fade ke section berikutnya */}
      <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t to-transparent" />
    </section>
  )
}
