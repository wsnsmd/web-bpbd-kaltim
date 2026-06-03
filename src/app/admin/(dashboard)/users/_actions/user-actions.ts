// src/app/admin/(dashboard)/users/_actions/user-actions.ts
'use server'

import { db } from '@/lib/db'
import { users, userRoles, roles } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const createSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  roleId: z.number({ error: 'Role harus dipilih' }),
})

const editSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8).optional().or(z.literal('')),
  roleId: z.number({ error: 'Role harus dipilih' }),
})

export type UserCreateValues = z.infer<typeof createSchema>
export type UserEditValues = z.infer<typeof editSchema>

export async function createUserAction(values: UserCreateValues) {
  const session = await auth()
  if (!session?.user.roles.includes('super_admin')) return { success: false, error: 'Unauthorized' }

  const parsed = createSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { data } = parsed
  const hashed = await bcrypt.hash(data.password, 12)

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    password: hashed,
    isActive: true,
  })

  const [created] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email))

  await db.insert(userRoles).values({ userId: created.id, roleId: data.roleId })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserAction(id: string, values: UserEditValues) {
  const session = await auth()
  if (!session?.user.roles.includes('super_admin')) return { success: false, error: 'Unauthorized' }

  const parsed = editSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { data } = parsed
  const updateData: Record<string, any> = { name: data.name, email: data.email }
  if (data.password) updateData.password = await bcrypt.hash(data.password, 12)

  await db.update(users).set(updateData).where(eq(users.id, id))

  // Update role: hapus lama, insert baru
  await db.delete(userRoles).where(eq(userRoles.userId, id))
  await db.insert(userRoles).values({ userId: id, roleId: data.roleId })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserActiveAction(id: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user.roles.includes('super_admin')) return { success: false, error: 'Unauthorized' }

  await db.update(users).set({ isActive }).where(eq(users.id, id))
  revalidatePath('/admin/users')
  return { success: true }
}

export async function getRolesAction() {
  return db.select({ id: roles.id, name: roles.name, slug: roles.slug }).from(roles)
}
