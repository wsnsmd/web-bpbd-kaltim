// database/schema/downloads.ts
import {
  mysqlTable,
  varchar,
  int,
  boolean,
  datetime,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core'
import { sql, relations } from 'drizzle-orm'
import { users } from './users'

export const downloads = mysqlTable(
  'downloads',
  {
    id: int('id').primaryKey().autoincrement(),
    title: varchar('title', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(), // Laporan, Regulasi, SOP, Panduan, dll
    fileUrl: varchar('file_url', { length: 500 }).notNull(),
    fileType: varchar('file_type', { length: 20 }).default('PDF'), // PDF, DOCX, XLSX, dll
    fileSize: varchar('file_size', { length: 30 }), // "4.2 MB"
    icon: varchar('icon', { length: 100 }).default('FileText'), // Lucide icon name
    colorScheme: mysqlEnum('color_scheme', [
      'danger',
      'caution',
      'warning',
      'safe',
      'navy',
    ]).default('navy'),
    downloadCount: int('download_count').default(0),
    order: int('order').default(0),
    isActive: boolean('is_active').default(true),
    uploadedBy: varchar('uploaded_by', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    categoryIdx: index('downloads_category_idx').on(t.category),
    orderIdx: index('downloads_order_idx').on(t.order),
  })
)

export const downloadsRelations = relations(downloads, ({ one }) => ({
  uploader: one(users, { fields: [downloads.uploadedBy], references: [users.id] }),
}))

export const DOWNLOAD_COLOR_SCHEMES = [
  { value: 'danger', label: 'Merah', bg: 'scheme-danger-bg', text: 'scheme-danger-text' },
  { value: 'caution', label: 'Biru', bg: 'scheme-caution-bg', text: 'scheme-caution-text' },
  { value: 'warning', label: 'Kuning', bg: 'scheme-warning-bg', text: 'scheme-warning-text' },
  { value: 'safe', label: 'Hijau', bg: 'scheme-safe-bg', text: 'scheme-safe-text' },
  { value: 'navy', label: 'Navy', bg: 'scheme-navy-bg', text: 'scheme-navy-text' },
] as const

export const DEFAULT_DOWNLOAD_CATEGORIES = [
  'Laporan',
  'Regulasi',
  'SOP',
  'Panduan',
  'Edukasi',
  'Formulir',
  'Lainnya',
]
