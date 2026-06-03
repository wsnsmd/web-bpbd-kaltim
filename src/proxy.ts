// src/proxy.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Proteksi semua route /admin kecuali /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Hanya super_admin yang boleh akses /admin/users
    if (pathname.startsWith('/admin/users')) {
      const roles = req.auth?.user?.roles ?? []
      if (!roles.includes('super_admin')) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }
  }

  // Redirect ke /admin jika sudah login tapi akses /admin/login
  if (pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
