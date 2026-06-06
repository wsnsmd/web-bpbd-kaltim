// src/app/(public)/berita/[slug]/_components/reading-progress.tsx
'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="fixed top-0 left-0 z-9999 h-0.5 w-full bg-transparent">
      <div
        className="h-full bg-orange-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
