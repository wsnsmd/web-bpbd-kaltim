// src/components/scroll-to-top.tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll ke atas"
      className={cn(
        'fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center',
        'rounded-full bg-orange-500 text-white shadow-lg',
        'transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400',
        'animate-in zoom-in-50 fade-in-0 shadow-[0_4px_16px_rgba(232,80,0,0.4)]',
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <ChevronUp className="h-6 w-6 stroke-3" />
    </button>
  )
}
