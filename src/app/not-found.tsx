// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-navy-950 relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ── Animated background grid ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Radial glow blobs ── */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-orange-500/10 blur-[120px]" />
      <div
        className="bg-navy-500/20 pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full blur-[120px]"
        style={{ animation: 'pulse 4s ease-in-out 1s infinite' }}
      />

      {/* ── Big 404 background text ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span
          className="text-[clamp(180px,35vw,320px)] leading-none font-black tracking-tighter"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.04)',
            fontFamily: 'system-ui, sans-serif',
            animation: 'fadeInScale 0.8s ease both',
          }}
        >
          404
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
        {/* Icon animasi */}
        <div
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center"
          style={{ animation: 'floatUpDown 3s ease-in-out infinite' }}
        >
          <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="text-4xl">🗺️</span>
            {/* Ring animasi */}
            <div
              className="absolute -inset-1 rounded-2xl border border-orange-400/30"
              style={{ animation: 'pingRing 2s ease-out infinite' }}
            />
          </div>
        </div>

        {/* Label */}
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5"
          style={{ animation: 'fadeInUp 0.5s 0.1s ease both', opacity: 0 }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
          <span className="text-[11px] font-bold tracking-widest text-orange-400 uppercase">
            Error 404
          </span>
        </div>

        <h1
          className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl"
          style={{ animation: 'fadeInUp 0.5s 0.2s ease both', opacity: 0 }}
        >
          Halaman Tidak <span className="text-orange-400">Ditemukan</span>
        </h1>

        <p
          className="text-navy-300 mb-10 text-base leading-relaxed"
          style={{ animation: 'fadeInUp 0.5s 0.3s ease both', opacity: 0 }}
        >
          Halaman yang Anda cari tidak ada atau telah dipindahkan. Mungkin URL salah ketik atau
          tautan sudah tidak berlaku.
        </p>

        {/* Action buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-3"
          style={{ animation: 'fadeInUp 0.5s 0.4s ease both', opacity: 0 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/40"
          >
            <svg
              className="h-4 w-4 transition group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Beranda
          </Link>
          <Link
            href="/data-kejadian"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            Data Kejadian
          </Link>
        </div>

        {/* Quick links */}
        <div
          className="mt-10 border-t border-white/10 pt-8"
          style={{ animation: 'fadeInUp 0.5s 0.5s ease both', opacity: 0 }}
        >
          <p className="text-navy-500 mb-4 text-xs font-semibold tracking-widest uppercase">
            Halaman Populer
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Peta Bencana', href: '/peta-bencana' },
              { label: 'Peringatan Dini', href: '/peringatan-dini' },
              { label: 'Statistik', href: '/statistik-bencana' },
              { label: 'Kontak', href: '/kontak' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-navy-300 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1);   }
        }
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px);   }
          50%      { transform: translateY(-10px);  }
        }
        @keyframes pingRing {
          0%   { transform: scale(1);    opacity: 0.8; }
          100% { transform: scale(1.35); opacity: 0;   }
        }
      `}</style>
    </div>
  )
}
