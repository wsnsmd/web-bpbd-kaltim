// database/schema/media.ts
import { mysqlTable, varchar, int, bigint, datetime, index } from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'

export const media = mysqlTable(
  'media',
  {
    id: int('id').primaryKey().autoincrement(),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    width: int('width'),
    height: int('height'),
    url: varchar('url', { length: 500 }).notNull(),
    uploadedBy: varchar('uploaded_by', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: datetime('created_at').default(sql`NOW()`),
  },
  (t) => ({
    uploadedByIdx: index('media_uploaded_by_idx').on(t.uploadedBy),
    createdAtIdx: index('media_created_at_idx').on(t.createdAt),
  })
)

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] }),
}))
