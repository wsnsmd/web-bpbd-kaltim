// src/components/analytics-provider.tsx
'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'bpbd_sid'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = generateSessionId()
    sessionStorage.setItem(key, sid)
  }
  return sid
}

// Cek apakah user agent adalah bot/crawler
function isBot(): boolean {
  if (typeof navigator === 'undefined') return true
  const ua = navigator.userAgent.toLowerCase()
  return /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|facebookexternalhit|linkedinbot|twitterbot|whatsapp|telegram|curl|wget|python|java|go-http/.test(
    ua
  )
}

const COOLDOWN_MS = 3000 // 3 detik cooldown per path — cegah spam refresh

export function AnalyticsProvider() {
  const pathname = usePathname()
  const lastPath = useRef<string>('')
  const lastTime = useRef<Record<string, number>>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Skip bot
    if (isBot()) return

    // Skip admin
    if (pathname.startsWith('/admin')) return

    const now = Date.now()
    const lastTracked = lastTime.current[pathname] ?? 0

    // Cegah double-track path yang sama dalam COOLDOWN_MS
    if (pathname === lastPath.current && now - lastTracked < COOLDOWN_MS) return

    // Debounce 300ms — cegah React StrictMode double-mount
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      lastPath.current = pathname
      lastTime.current[pathname] = Date.now()

      const sessionId = getSessionId()
      const referrer = document.referrer || ''
      const title = document.title || ''

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, title, referrer, sessionId }),
      }).catch(() => {
        /* silent fail */
      })
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  return null
}
