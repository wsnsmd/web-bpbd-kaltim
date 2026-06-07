// src/app/admin/login/page.tsx
import { Suspense } from 'react'
import { LoginForm } from './_components/login-form'
import { Shield, MapPin, Radio, AlertTriangle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Login',
}

export default function LoginPage() {
  return (
    <div className="bg-navy-950 relative flex min-h-screen overflow-hidden">
      {/* ── Kiri: Branding Panel ─────────────────────────────── */}
      <div className="relative hidden w-[55%] flex-col justify-between p-12 lg:flex">
        {/* Layered background */}
        <div className="bg-navy-900 absolute inset-0" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 20% 80%, #e8500022 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 80% at 80% 20%, #1b56a822 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-55deg,transparent,transparent 60px,rgba(255,255,255,.012) 60px,rgba(255,255,255,.012) 61px)',
          }}
        />
        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Konten */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider text-white uppercase">BPBD Kaltim</p>
              <p className="text-navy-400 text-[11px] tracking-widest uppercase">Portal Admin</p>
            </div>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10 max-w-md">
          <Badge
            variant="outline"
            className="mb-6 border-orange-500/30 bg-orange-500/10 text-orange-300"
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
            Sistem Aktif 24/7
          </Badge>

          <h1 className="mb-4 font-serif text-4xl leading-tight font-bold text-white">
            Pusat Kendali
            <br />
            <span className="text-gold-300">Penanggulangan</span>
            <br />
            Bencana Kaltim
          </h1>

          <p className="text-navy-300 mb-8 text-sm leading-relaxed">
            Sistem informasi terpadu untuk koordinasi, pemantauan, dan pengelolaan penanggulangan
            bencana Provinsi Kalimantan Timur.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6">
            {[
              { icon: MapPin, value: '10', label: 'Kab/Kota' },
              { icon: Radio, value: '24/7', label: 'Pusdalops' },
              { icon: AlertTriangle, value: '128', label: 'Relawan Aktif' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span className="text-base font-bold text-white">{value}</span>
                </div>
                <p className="text-navy-400 text-[11px]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer branding */}
        <div className="relative z-10">
          <Separator className="mb-4 bg-white/10" />
          <p className="text-navy-500 text-xs">
            &copy; {new Date().getFullYear()} Badan Penanggulangan Bencana Daerah Provinsi
            Kalimantan Timur
          </p>
        </div>
      </div>

      {/* ── Kanan: Login Panel ───────────────────────────────── */}
      <div className="bg-navy-950 relative flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Subtle background accent */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #e85000 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">BPBD Kaltim</p>
              <p className="text-navy-400 text-[11px]">Portal Admin</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="mb-1 text-2xl font-bold text-white">Selamat Datang</h2>
            <p className="text-navy-400 text-sm">Masuk untuk mengakses panel administrasi.</p>
          </div>

          {/* Form */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          {/* Divider info */}
          <div className="mt-6 flex items-center gap-3">
            <Separator className="flex-1 bg-white/10" />
            <span className="text-navy-600 text-[11px] whitespace-nowrap">Akses terbatas</span>
            <Separator className="flex-1 bg-white/10" />
          </div>

          <p className="text-navy-600 mt-4 text-center text-[11px] leading-relaxed">
            Hanya personel yang berwenang yang dapat mengakses sistem ini. Seluruh aktivitas
            tercatat dan diawasi.
          </p>
        </div>
      </div>
    </div>
  )
}
