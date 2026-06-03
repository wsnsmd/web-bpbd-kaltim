// src/app/(public)/_sections/status-bar.tsx
import { Shield, CloudRain, ClipboardList } from 'lucide-react'

export function StatusBar() {
  return (
    <section className="relative z-10 -mt-7 px-6 pb-10">
      <div className="bg-card border-border mx-auto max-w-6xl overflow-hidden rounded-2xl border shadow-[0_6px_40px_rgba(11,32,64,.1)]">
        {/* Menggunakan fitur divide Tailwind dengan warna border dari shadcn */}
        <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Status Wilayah */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--safe-light)">
              <Shield className="h-5 w-5 text-(--safe-dark)" />
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Status Wilayah
              </p>
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-(--safe-text)">
                {/* Memanggil class animasi kustom yang ada di css */}
                <span className="animate-pulse-slow h-1.5 w-1.5 shrink-0 rounded-full bg-(--safe)" />
                Kondisi Normal / Aman
              </p>
            </div>
          </div>

          {/* Info Cuaca */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--warning-light)">
              <CloudRain className="h-5 w-5 text-(--warning-dark)" />
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Info Cuaca BMKG
              </p>
              <p className="text-foreground text-[13px] font-semibold">
                Cerah Berawan — Potensi Hujan Ringan
              </p>
            </div>
          </div>

          {/* Laporan Hari Ini */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--navy-50)">
              <ClipboardList className="h-5 w-5 text-(--navy-600)" />
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Laporan Hari Ini
              </p>
              <p className="text-foreground text-[13px] font-semibold">
                0 Kejadian Bencana Terlaporkan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
