// database/seed.ts
import { db } from '@lib/db'
import { users, roles, userRoles } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding database...')

  // Seed roles
  const defaultRoles = [
    { id: 1, name: 'Super Admin', slug: 'super_admin' },
    { id: 2, name: 'Administrator', slug: 'administrator' },
    { id: 3, name: 'Editor', slug: 'editor' },
    { id: 4, name: 'Operator', slug: 'operator' },
  ]

  for (const role of defaultRoles) {
    const existingRole = await db.select().from(roles).where(eq(roles.id, role.id))
    if (existingRole.length === 0) {
      await db.insert(roles).values(role)
    }
  }

  // Seed super admin
  const hashedPassword = await bcrypt.hash('Admin@BPBD2026', 12)
  const adminId = crypto.randomUUID()

  const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@bpbd.go.id'))
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      id: adminId,
      name: 'Super Administrator',
      email: 'admin@bpbd.go.id',
      password: hashedPassword,
      isActive: true,
    })
  }

  // Assign role to super admin
  const adminUser = await db.select().from(users).where(eq(users.email, 'admin@bpbd.go.id'))
  const adminRole = await db.select().from(roles).where(eq(roles.slug, 'super_admin'))

  if (adminUser.length > 0 && adminRole.length > 0) {
    const existingAssignment = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, adminUser[0].id))

    if (existingAssignment.length === 0) {
      await db.insert(userRoles).values({
        userId: adminUser[0].id,
        roleId: adminRole[0].id,
      })
    }
  }

  console.log('Seeding completed!')
}

seed().catch(console.error)
