// src/app/admin/(dashboard)/settings/profile/_actions/profile-actions.ts
'use server'

import { db } from '@/lib/db'
import { users } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export async function updateProfileAction(values: z.infer<typeof profileSchema>) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = profileSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await db
    .update(users)
    .set({ name: parsed.data.name, email: parsed.data.email })
    .where(eq(users.id, session.user.id))

  revalidatePath('/admin/settings/profile')
  return { success: true }
}

export async function updatePasswordAction(values: z.infer<typeof passwordSchema>) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = passwordSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  // Ambil password saat ini dari DB
  const [user] = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, session.user.id))

  if (!user?.password) return { success: false, error: 'Akun tidak memiliki password' }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!valid) return { success: false, error: 'Password saat ini tidak sesuai' }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.update(users).set({ password: hashed }).where(eq(users.id, session.user.id))

  return { success: true }
}
