// src/app/admin/login/page.tsx
import { Suspense } from 'react'
import { LoginForm } from './_components/login-form'
import { Shield } from 'lucide-react'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { inArray, eq, and, gte, count } from 'drizzle-orm'
import Image from 'next/image'
import { incidents } from '@db/schema'

export const metadata = { title: 'Login' }

export default async function LoginPage() {
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(`${currentYear}-01-01`)

  const [rows, activeCount, yearCount] = await Promise.all([
    db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, ['site_logo', 'site_name'])),
    db
      .select({ total: count() })
      .from(incidents)
      .where(and(eq(incidents.isPublished, true), eq(incidents.status, 'aktif'))),
    db
      .select({ total: count() })
      .from(incidents)
      .where(and(eq(incidents.isPublished, true), gte(incidents.occurredDate, startOfYear))),
  ])

  const s = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  const logo = s.site_logo || ''
  const siteName = s.site_name || 'BPBD Kaltim'
  const activeIncidents = Number(activeCount[0]?.total ?? 0)
  const yearIncidents = Number(yearCount[0]?.total ?? 0)
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? ''

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: '#080f1a' }}>
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-10%',
          left: '-8%',
          width: '52%',
          height: '130%',
          background: 'linear-gradient(135deg, #e85000 0%, #c44000 60%, #7a2800 100%)',
          transform: 'skewX(-6deg)',
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-10%',
          left: '-8%',
          width: '52%',
          height: '130%',
          background:
            'linear-gradient(180deg, rgba(8,15,26,0.55) 0%, rgba(8,15,26,0.2) 50%, rgba(8,15,26,0.6) 100%)',
          transform: 'skewX(-6deg)',
          zIndex: 1,
        }}
      />
      <div
        className="pointer-events-none absolute hidden lg:block"
        style={{
          top: '-10%',
          left: 'calc(44% - 3px)',
          width: '6px',
          height: '130%',
          background: 'rgba(255,255,255,0.08)',
          transform: 'skewX(-6deg)',
          zIndex: 2,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
          opacity: 0.04,
          mixBlendMode: 'overlay',
          zIndex: 3,
        }}
      />

      <div className="relative z-10 flex w-full">
        {/* Panel Kiri */}
        <div
          className="hidden w-[44%] flex-col justify-between p-14 lg:flex"
          style={{ animation: 'revealLeft 0.7s cubic-bezier(.22,1,.36,1) both' }}
        >
          <div className="flex items-center gap-3">
            {logo ? (
              <Image
                src={logo}
                alt={siteName}
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-contain drop-shadow-lg"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <p className="text-[13px] font-black tracking-widest text-white uppercase drop-shadow">
                {siteName}
              </p>
              <p className="text-[10px] tracking-[0.2em] text-white/60 uppercase">Portal Admin</p>
            </div>
          </div>

          <div>
            <div
              className="mb-6 leading-none font-black text-white/5 select-none"
              style={{ fontSize: 'clamp(5rem, 12vw, 9rem)', letterSpacing: '-0.05em' }}
              aria-hidden
            >
              24/7
            </div>
            <div className="mb-3 inline-block border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-[10px] font-bold tracking-[0.18em] text-white uppercase">
                Pusat Kendali Aktif
              </span>
            </div>
            <h1 className="mb-5 text-[clamp(1.8rem,3.2vw,2.8rem)] leading-[1.05] font-black tracking-tight text-white drop-shadow-md">
              Badan
              <br />
              Penanggulangan
              <br />
              Bencana
              <br />
              Daerah
              <br />
              <span className="text-white/50">Kalimantan Timur</span>
            </h1>
            <p className="max-w-xs text-[13px] leading-relaxed text-white/55">
              Sistem informasi terpadu untuk koordinasi, pemantauan, dan pengelolaan kebencanaan
              Provinsi Kalimantan Timur.
            </p>
          </div>

          <div>
            <div className="mb-4 h-px bg-white/15" />
            <div className="grid grid-cols-3 gap-0">
              {[
                { val: String(activeIncidents), label: 'Kejadian Aktif' },
                { val: String(yearIncidents), label: `Kejadian ${currentYear}` },
                { val: '10', label: 'Kab/Kota Terpantau' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="py-3"
                  style={{
                    borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                    paddingLeft: i > 0 ? 20 : 0,
                  }}
                >
                  <p className="text-xl leading-none font-black text-white">{item.val}</p>
                  <p className="mt-0.5 text-[10px] tracking-wider text-white/45 uppercase">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 text-[10px] text-white/25">
              &copy; {new Date().getFullYear()} BPBD Provinsi Kalimantan Timur
            </div>
          </div>
        </div>

        {/* Panel Kanan */}
        <div
          className="flex flex-1 items-center justify-center px-6 py-12 lg:px-14"
          style={{ animation: 'revealRight 0.7s 0.12s cubic-bezier(.22,1,.36,1) both', opacity: 0 }}
        >
          <div className="w-full max-w-90">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              {logo ? (
                <Image
                  src={logo}
                  alt={siteName}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{siteName}</p>
                <p className="text-[11px] text-white/30">Portal Admin</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-[11px] font-black tracking-[0.15em] text-orange-400 uppercase">
                  Masuk ke Sistem
                </span>
              </div>
            </div>

            <div
              className="bg-white p-8 shadow-2xl"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
            >
              <Suspense fallback={null}>
                {/* Pass siteKey ke LoginForm untuk render Turnstile widget */}
                <LoginForm siteKey={siteKey} />
              </Suspense>
            </div>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-white/20">
              Hanya personel berwenang yang dapat mengakses sistem ini.
              <br />
              Seluruh aktivitas tercatat dan diawasi.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes revealLeft {
          from { opacity:0; transform:translateX(-32px) skewX(2deg); }
          to   { opacity:1; transform:translateX(0) skewX(0deg); }
        }
        @keyframes revealRight {
          from { opacity:0; transform:translateX(24px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </div>
  )
}
