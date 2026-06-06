// database/seeds/master-data-seed.ts
// Jalankan: bun run database/seeds/master-data-seed.ts

import { db } from '@/lib/db'
import { disasterTypes, disasterCauses } from '@db/schema'

async function seed() {
  console.log('Seeding disaster types...')
  const types = [
    { name: 'Banjir', category: 'alam' as const, icon: '🌊', color: '#2e72c9', sortOrder: 1 },
    {
      name: 'Tanah Longsor',
      category: 'alam' as const,
      icon: '⛰️',
      color: '#8b5e3c',
      sortOrder: 2,
    },
    { name: 'Gempa Bumi', category: 'alam' as const, icon: '🏚️', color: '#c98b00', sortOrder: 3 },
    {
      name: 'Cuaca Ekstrem',
      category: 'alam' as const,
      icon: '⛈️',
      color: '#6b7592',
      sortOrder: 4,
    },
    { name: 'Karhutla', category: 'alam' as const, icon: '🌫️', color: '#f46a1a', sortOrder: 5 },
    {
      name: 'Gelombang Tinggi/Abrasi',
      category: 'alam' as const,
      icon: '🌊',
      color: '#1b7fc4',
      sortOrder: 6,
    },
    { name: 'Kekeringan', category: 'alam' as const, icon: '☀️', color: '#e5aa0d', sortOrder: 7 },
    {
      name: 'Kebakaran',
      category: 'non_alam' as const,
      icon: '🔥',
      color: '#e85000',
      sortOrder: 8,
    },
    {
      name: 'Lain-Lain',
      category: 'non_alam' as const,
      icon: '⚠️',
      color: '#6b7592',
      sortOrder: 9,
    },
  ]

  for (const t of types) {
    await db
      .insert(disasterTypes)
      .values(t)
      .onDuplicateKeyUpdate({ set: { name: t.name, color: t.color, sortOrder: t.sortOrder } })
  }
  console.log(`  ✓ ${types.length} jenis bencana`)

  console.log('Seeding disaster causes...')
  const causes = [
    { name: 'Hujan Sedang - Lebat' },
    { name: 'Hujan Sedang - Lebat & Angin Kencang' },
    { name: 'Angin Kencang' },
    { name: 'Gempa Tektonik' },
    { name: 'Pembakaran Lahan' },
    { name: 'Konsleting Listrik' },
    { name: 'Kompor Terbakar' },
    { name: 'Kebakaran Genset' },
    { name: 'Diterkam Buaya' },
    { name: 'Terjatuh dari Kapal' },
    { name: 'Kelebihan Kapasitas' },
    { name: 'Dalam Penyelidikan' },
    { name: 'Lainnya' },
  ]

  for (const c of causes) {
    await db
      .insert(disasterCauses)
      .values(c)
      .onDuplicateKeyUpdate({ set: { name: c.name } })
  }
  console.log(`  ✓ ${causes.length} penyebab bencana`)

  console.log('✓ Seed selesai')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
