// database/seed/roles.ts
// Jalankan: bun run db:seed:roles
import { db } from '@/lib/db'
import { roles } from '@db/schema'

// ── Definisi role BPBD Kaltim ──────────────────────────────────
// super_admin  : akses penuh semua fitur + manajemen user
// admin        : akses semua fitur KECUALI manajemen user & pengaturan sistem
// operator     : hanya input kejadian bencana & timeline
// editor       : hanya kelola berita, unduhan, galeri, konten
// viewer       : hanya lihat data, tidak bisa edit

export const ROLES = [
  {
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'Akses penuh ke seluruh sistem termasuk manajemen pengguna dan pengaturan',
  },
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Akses semua fitur kecuali manajemen pengguna dan pengaturan sistem',
  },
  {
    name: 'Operator',
    slug: 'operator',
    description: 'Input dan kelola data kejadian bencana, timeline, dan master data',
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Kelola konten: berita, unduhan, galeri, FAQ, pengumuman',
  },
  {
    name: 'Viewer',
    slug: 'viewer',
    description: 'Hanya dapat melihat data, tidak dapat melakukan perubahan',
  },
] as const

async function seedRoles() {
  console.log('Seeding roles...')
  for (const role of ROLES) {
    await db
      .insert(roles)
      .values(role)
      .onDuplicateKeyUpdate({ set: { name: role.name, description: role.description } })
    console.log(`  ✓ ${role.name}`)
  }
  console.log('Done.')
  process.exit(0)
}

seedRoles().catch((e) => {
  console.error(e)
  process.exit(1)
})
