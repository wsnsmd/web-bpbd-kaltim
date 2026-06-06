// database/schema/services.ts
import { mysqlTable, varchar, int, boolean, datetime, index } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const services = mysqlTable(
  'services',
  {
    id: int('id').primaryKey().autoincrement(),
    label: varchar('label', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }),
    icon: varchar('icon', { length: 100 }).notNull().default('Circle'),
    href: varchar('href', { length: 500 }).notNull(),
    color: varchar('color', { length: 30 }).default('gold'),
    order: int('order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    orderIdx: index('services_order_idx').on(t.order),
  })
)

export const DEFAULT_SERVICES = [
  {
    label: 'Profil',
    description: 'Visi, Misi & Struktur',
    icon: 'UserCircle',
    href: '/profil',
    order: 1,
  },
  {
    label: 'Publikasi',
    description: 'Berita & Pengumuman',
    icon: 'Newspaper',
    href: '/berita',
    order: 2,
  },
  {
    label: 'Perpustakaan',
    description: 'Dokumen & Regulasi',
    icon: 'BookOpen',
    href: '/unduhan',
    order: 3,
  },
  { label: 'PPID', description: 'Informasi Publik', icon: 'LockOpen', href: '/ppid', order: 4 },
  { label: 'LAPOR', description: 'Pengaduan Masyarakat', icon: 'Flag', href: '/lapor', order: 5 },
  { label: 'Kontak', description: 'Hubungi Kami', icon: 'PhoneCall', href: '/kontak', order: 6 },
]
