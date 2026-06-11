// src/proxy.ts — update: tambah pengecekan maintenance mode
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { hasPermission, ROUTE_PERMISSIONS } from '@/lib/permissions'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { eq } from 'drizzle-orm'

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRoles = (req.auth?.user?.roles as string[]) ?? []

  // ── 1. Cek maintenance mode ────────────────────────────────
  // Skip untuk: /admin, /maintenance, /_next, /api, /favicon
  const isAdminPath = pathname.startsWith('/admin')
  const isSystemPath =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/uploads') || // file statis upload — jangan di-redirect
    pathname.startsWith('/images') || // folder images statis
    pathname.startsWith('/icons') || // folder icons
    pathname === '/maintenance'

  if (!isAdminPath && !isSystemPath) {
    try {
      const [row] = await db
        .select({ value: siteSettings.value })
        .from(siteSettings)
        .where(eq(siteSettings.key, 'maintenance_mode'))
        .limit(1)

      if (row?.value === 'true') {
        // Admin yang sudah login tetap bisa akses halaman publik
        // Cukup cek isLoggedIn — semua user yang login dianggap internal
        if (isLoggedIn) {
          // Tambah header penanda agar bisa ditampilkan banner maintenance
          const res = NextResponse.next()
          res.headers.set('x-maintenance-preview', '1')
          return res
        }
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    } catch {
      // Jika DB error, biarkan lanjut — jangan block semua akses
    }
  }

  // ── 2. Auth guard untuk /admin ────────────────────────────
  if (isAdminPath && pathname !== '/admin/login') {
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // ── 3. Cek permission per route ──────────────────────────
    for (const { pattern, permission } of ROUTE_PERMISSIONS) {
      if (pattern.test(pathname)) {
        if (!hasPermission(userRoles, permission)) {
          return NextResponse.redirect(new URL('/admin/forbidden', req.url))
        }
        break
      }
    }
  }

  // ── 4. Redirect jika sudah login tapi buka login page ─────
  if (pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|images|icons|maintenance).*)'],
}
