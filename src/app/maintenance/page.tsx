// src/app/maintenance/page.tsx
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'

export const metadata = { title: 'Sedang Dalam Pemeliharaan' }

export default async function MaintenancePage() {
  const rows = await db.select().from(siteSettings)
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))

  const title = s.maintenance_title || 'Sedang Dalam Pemeliharaan'
  const message =
    s.maintenance_message ||
    'Website sedang dalam proses pemeliharaan untuk meningkatkan layanan. Kami akan segera kembali.'
  const estimated = s.maintenance_estimated || ''
  const siteName = s.site_name || 'BPBD Provinsi Kalimantan Timur'
  const emergency = s.contact_emergency || '112'
  const whatsapp = s.contact_whatsapp || ''

  return (
    <div className="bg-navy-950 relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #e85000 0%, transparent 70%)',
            animation: 'blob1 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #1b56a8 0%, transparent 70%)',
            animation: 'blob2 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
        {/* Animated gear icon */}
        <div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
          style={{ animation: 'floatY 3s ease-in-out infinite' }}
        >
          <svg
            className="h-12 w-12 text-orange-400"
            style={{ animation: 'spinSlow 8s linear infinite' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Site name */}
        <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-orange-400 uppercase">
          {siteName}
        </p>

        {/* Title */}
        <h1
          className="mb-4 text-3xl font-black tracking-tight text-white md:text-4xl"
          style={{ animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0 }}
        >
          {title}
        </h1>

        {/* Message */}
        <p
          className="mb-8 text-base leading-relaxed text-white/50"
          style={{ animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0 }}
        >
          {message}
        </p>

        {/* Estimated time jika ada */}
        {estimated && (
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5"
            style={{ animation: 'fadeUp 0.6s 0.3s ease both', opacity: 0 }}
          >
            <svg
              className="h-4 w-4 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-white/50">Estimasi selesai:</span>
            <span className="text-sm font-semibold text-white/80">{estimated}</span>
          </div>
        )}

        {/* Progress bar animasi */}
        <div
          className="mb-10 h-1 overflow-hidden rounded-full bg-white/5"
          style={{ animation: 'fadeUp 0.6s 0.35s ease both', opacity: 0 }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: '60%',
              background: 'linear-gradient(90deg, #e85000, #fbbf24)',
              animation: 'progressPulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Darurat section */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          style={{ animation: 'fadeUp 0.6s 0.4s ease both', opacity: 0 }}
        >
          <p className="mb-3 text-xs font-bold tracking-widest text-white/40 uppercase">
            Butuh Bantuan Darurat?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${emergency}`}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600/80 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {emergency} — Darurat
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.395 5.608L0 24l6.562-1.717A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.49-5.187-1.348l-.371-.22-3.896 1.02 1.04-3.793-.242-.389A9.938 9.938 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes spinSlow {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes progressPulse {
          0%,100% { opacity:1; }
          50%     { opacity:0.5; }
        }
        @keyframes blob1 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%     { transform:translate(40px,-30px) scale(1.1); }
        }
        @keyframes blob2 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%     { transform:translate(-30px,40px) scale(1.05); }
        }
      `}</style>
    </div>
  )
}
