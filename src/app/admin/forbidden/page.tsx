// src/app/admin/forbidden/page.tsx
// Juga bisa digunakan sebagai halaman 403 umum
// Render saat middleware redirect dengan ?error=forbidden
import Link from 'next/link'

export const metadata = { title: '403 — Akses Ditolak' }

export default function ForbiddenPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* ── Noise texture overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ── Diagonal stripe pattern ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-55deg, transparent, transparent 40px, rgba(220,38,38,0.015) 40px, rgba(220,38,38,0.015) 41px)',
        }}
      />

      {/* ── Glow blobs ── */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/4 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-[100px]"
        style={{ animation: 'breatheBlob 5s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-60 w-60 rounded-full bg-slate-700/30 blur-[80px]"
        style={{ animation: 'breatheBlob 5s ease-in-out 2s infinite' }}
      />

      {/* ── Big 403 background text ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden
      >
        <span
          className="text-[clamp(160px,32vw,300px)] leading-none font-black tracking-tighter"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1px rgba(220,38,38,0.08)',
            animation: 'fadeInScale 1s ease both',
          }}
        >
          403
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
        {/* Shield icon dengan animasi */}
        <div
          className="relative mx-auto mb-8 w-fit"
          style={{ animation: 'slideDown 0.6s ease both' }}
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-red-800/40 bg-red-950/50 backdrop-blur-sm">
            <svg
              className="h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animation: 'shieldPulse 2s ease-in-out infinite' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          {/* Rotating ring */}
          <div
            className="absolute -inset-3 rounded-[28px] border border-red-500/20"
            style={{ animation: 'rotateSlow 8s linear infinite' }}
          />
          <div
            className="absolute -inset-6 rounded-[36px] border border-red-500/10"
            style={{ animation: 'rotateSlow 12s linear infinite reverse' }}
          />
        </div>

        {/* Label */}
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5"
          style={{ animation: 'fadeInUp 0.5s 0.2s ease both', opacity: 0 }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          <span className="text-[11px] font-bold tracking-widest text-red-400 uppercase">
            Error 403 — Forbidden
          </span>
        </div>

        <h1
          className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl"
          style={{ animation: 'fadeInUp 0.5s 0.3s ease both', opacity: 0 }}
        >
          Akses <span className="text-red-400">Ditolak</span>
        </h1>

        <p
          className="mb-8 text-base leading-relaxed text-slate-400"
          style={{ animation: 'fadeInUp 0.5s 0.4s ease both', opacity: 0 }}
        >
          Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi Super Admin jika Anda
          membutuhkan akses ke fitur tersebut.
        </p>

        {/* Info box */}
        <div
          className="mb-8 rounded-2xl border border-red-900/40 bg-red-950/30 p-5 text-left backdrop-blur-sm"
          style={{ animation: 'fadeInUp 0.5s 0.45s ease both', opacity: 0 }}
        >
          <p className="mb-2 text-xs font-bold tracking-widest text-red-400 uppercase">
            Mengapa ini terjadi?
          </p>
          <ul className="space-y-1.5 text-sm text-slate-400">
            {[
              'Role Anda tidak memiliki akses ke fitur ini',
              'Sesi login Anda mungkin sudah berakhir',
              'Halaman ini memerlukan hak akses khusus',
            ].map((txt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                {txt}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div
          className="flex flex-wrap items-center justify-center gap-3"
          style={{ animation: 'fadeInUp 0.5s 0.5s ease both', opacity: 0 }}
        >
          <Link
            href="/admin"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
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
            Kembali ke Dashboard
          </Link>
          <a
            href="mailto:admin@bpbd.kaltimprov.go.id"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            Hubungi Admin
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        @keyframes shieldPulse {
          0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 0px rgba(248,113,113,0)); }
          50%      { transform: scale(1.05); filter: drop-shadow(0 0 12px rgba(248,113,113,0.5)); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes breatheBlob {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%      { transform: scale(1.15); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
