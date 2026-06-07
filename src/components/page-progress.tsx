// src/components/page-progress.tsx
'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function PageProgressInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = useRef(false)

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function start() {
    clear()
    doneRef.current = false
    setProgress(0)
    setVisible(true)

    // Naik cepat ke 15% lalu lambat sampai 85%
    let current = 0
    intervalRef.current = setInterval(() => {
      if (doneRef.current) return
      current += current < 15 ? 6 : current < 50 ? 2.5 : current < 75 ? 1 : 0.3
      if (current >= 85) current = 85
      setProgress(current)
    }, 80)
  }

  function finish() {
    clear()
    doneRef.current = true
    setProgress(100)
    // Sembunyikan setelah animasi selesai
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 500)
  }

  // Trigger saat path berubah
  useEffect(() => {
    start()
    // Anggap halaman selesai load setelah sedikit delay
    timerRef.current = setTimeout(finish, 400)
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <>
      {/* ── Progress bar utama ── */}
      <div
        className="fixed top-0 right-0 left-0 z-[9999] h-[3px]"
        style={{ pointerEvents: 'none' }}
      >
        {/* Track */}
        <div className="absolute inset-0 bg-orange-500/10" />

        {/* Bar */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: `${progress}%`,
            transition:
              progress === 100 ? 'width 0.2s ease, opacity 0.3s ease 0.2s' : 'width 0.08s linear',
            opacity: progress === 100 ? 0 : 1,
            background: 'linear-gradient(90deg, #e85000, #f46a1a, #fbbf24)',
            boxShadow: '0 0 12px 2px rgba(232,80,0,0.6), 0 0 4px 0 rgba(251,191,36,0.4)',
          }}
        >
          {/* Leading glow dot */}
          <div
            className="absolute top-1/2 right-0 h-[10px] w-[10px] -translate-y-1/2 rounded-full"
            style={{
              background: '#fbbf24',
              boxShadow: '0 0 10px 3px rgba(251,191,36,0.8), 0 0 20px 6px rgba(232,80,0,0.4)',
              transform: 'translateY(-50%) translateX(50%)',
            }}
          />
        </div>
      </div>
    </>
  )
}

// Wrapper dengan Suspense — wajib karena useSearchParams()
export function PageProgress() {
  return (
    <Suspense fallback={null}>
      <PageProgressInner />
    </Suspense>
  )
}
