// src/proxy.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { hasPermission, ROUTE_PERMISSIONS } from '@/lib/permissions'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRoles = (req.auth?.user?.roles as string[]) ?? []

  // ── 1. Redirect ke login jika belum auth ────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // ── 2. Cek permission per route ──────────────────────────
    for (const { pattern, permission } of ROUTE_PERMISSIONS) {
      if (pattern.test(pathname)) {
        if (!hasPermission(userRoles, permission)) {
          // Redirect ke dashboard dengan pesan akses ditolak
          const url = new URL('/admin/forbidden', req.url)
          return NextResponse.redirect(url)
        }
        break
      }
    }
  }

  // ── 3. Redirect jika sudah login tapi akses login page ──────
  if (pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
