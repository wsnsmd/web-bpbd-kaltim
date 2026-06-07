// src/app/admin/(dashboard)/_components/forbidden-banner.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'

export function ForbiddenBanner() {
  const params = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (params.get('error') === 'forbidden') {
      setShow(true)
      // Bersihkan query param dari URL tanpa reload
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [params])

  if (!show) return null

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700">Akses Ditolak</p>
        <p className="mt-0.5 text-xs text-red-600">
          Anda tidak memiliki izin untuk mengakses halaman tersebut. Hubungi Super Admin jika
          membutuhkan akses.
        </p>
      </div>
      <button onClick={() => setShow(false)} className="text-red-400 transition hover:text-red-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
