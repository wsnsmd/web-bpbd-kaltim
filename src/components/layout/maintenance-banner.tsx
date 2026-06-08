// src/components/layout/maintenance-banner.tsx
// Tampil di halaman publik saat admin preview mode maintenance
// Dibaca dari header x-maintenance-preview yang di-set proxy.ts
import { headers } from 'next/headers'
import Link from 'next/link'
import { Eye, Settings } from 'lucide-react'

export async function MaintenanceBanner() {
  const headerList = await headers()
  const isPreview = headerList.get('x-maintenance-preview') === '1'

  if (!isPreview) return null

  return (
    <div className="sticky top-0 z-9998 flex items-center justify-between gap-3 bg-amber-500 px-4 py-2.5">
      <div className="flex items-center gap-2 text-amber-950">
        <Eye className="h-4 w-4 shrink-0" />
        <p className="text-xs font-bold">
          Mode Maintenance Aktif — Anda melihat preview sebagai Admin. Pengunjung biasa melihat
          halaman maintenance.
        </p>
      </div>
      <Link
        href="/admin/settings?tab=maintenance"
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-950/15 px-3 py-1 text-xs font-bold text-amber-950 transition hover:bg-amber-950/25"
      >
        <Settings className="h-3.5 w-3.5" />
        Kelola
      </Link>
    </div>
  )
}
