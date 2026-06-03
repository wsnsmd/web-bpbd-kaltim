// database/seeds/services.ts
import { db } from '@/lib/db'
import { services } from '@db/schema'
import { DEFAULT_SERVICES } from '@db/schema/services'
import { sql } from 'drizzle-orm'

export async function seedServices() {
  console.log('🌱 Seeding services...')

  for (const item of DEFAULT_SERVICES) {
    await db
      .insert(services)
      .values({
        ...item,
        isActive: true,
      })
      .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
  }

  console.log('✅ Services seeded')
  console.log('🎉 Selesai!')
}

seedServices().catch((e) => {
  console.error('❌ Seed error:', e)
  process.exit(1)
})
