// src/lib/auth.ts — update: tambah verifikasi Turnstile di authorize()
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users, userRoles, roles } from '@db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { verifyTurnstile } from '@/lib/verify-turnstile'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  turnstileToken: z.string().optional(),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password, turnstileToken } = parsed.data

        // ── Verifikasi Turnstile ──────────────────────────────
        if (process.env.TURNSTILE_SECRET_KEY) {
          if (!turnstileToken) {
            throw new Error('Token verifikasi keamanan tidak ditemukan.')
          }
          const valid = await verifyTurnstile(turnstileToken)
          if (!valid) {
            throw new Error('Verifikasi keamanan gagal. Silakan coba lagi.')
          }
        }

        // ── Cek user & roles ──────────────────────────────────
        const user = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            password: users.password,
            avatar: users.avatar,
            isActive: users.isActive,
            roleSlug: roles.slug,
          })
          .from(users)
          .leftJoin(userRoles, eq(userRoles.userId, users.id))
          .leftJoin(roles, eq(roles.id, userRoles.roleId))
          .where(eq(users.email, email))
          .then((rows) => {
            if (rows.length === 0) return null
            const base = rows[0]
            const rolesList = rows.filter((r) => r.roleSlug).map((r) => r.roleSlug as string)
            return { ...base, roles: rolesList }
          })

        if (!user || !user.password) return null
        if (!user.isActive) throw new Error('Akun tidak aktif.')

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          roles: user.roles,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = (user as any).roles ?? []
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.roles = token.roles as string[]
      return session
    },
  },
  pages: { signIn: '/admin/login', error: '/admin/login' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
})
