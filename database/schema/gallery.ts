// database/schema/gallery.ts
import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  datetime,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core'
import { sql, relations } from 'drizzle-orm'
import { users } from './users'

// ── Tabel Album ───────────────────────────────────────────────
export const galleryAlbums = mysqlTable(
  'gallery_albums',
  {
    id: int('id').primaryKey().autoincrement(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    coverUrl: varchar('cover_url', { length: 500 }), // thumbnail album
    type: mysqlEnum('type', ['photo', 'video', 'mixed']).default('photo'),
    order: int('order').default(0),
    isActive: boolean('is_active').default(true),
    createdBy: varchar('created_by', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    orderIdx: index('gallery_albums_order_idx').on(t.order),
    typeIdx: index('gallery_albums_type_idx').on(t.type),
  })
)

// ── Tabel Item (foto/video di dalam album) ────────────────────
export const galleryItems = mysqlTable(
  'gallery_items',
  {
    id: int('id').primaryKey().autoincrement(),
    albumId: int('album_id')
      .notNull()
      .references(() => galleryAlbums.id, { onDelete: 'cascade' }),
    type: mysqlEnum('type', ['photo', 'video']).notNull().default('photo'),
    title: varchar('title', { length: 255 }).notNull(),
    caption: text('caption'),
    thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
    videoUrl: varchar('video_url', { length: 500 }), // YouTube/embed
    order: int('order').default(0),
    isActive: boolean('is_active').default(true),
    uploadedBy: varchar('uploaded_by', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    albumIdx: index('gallery_items_album_idx').on(t.albumId),
    orderIdx: index('gallery_items_order_idx').on(t.order),
    typeIdx: index('gallery_items_type_idx').on(t.type),
  })
)

// ── Relations ─────────────────────────────────────────────────
export const galleryAlbumsRelations = relations(galleryAlbums, ({ one, many }) => ({
  createdBy: one(users, { fields: [galleryAlbums.createdBy], references: [users.id] }),
  items: many(galleryItems),
}))

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  album: one(galleryAlbums, { fields: [galleryItems.albumId], references: [galleryAlbums.id] }),
  uploader: one(users, { fields: [galleryItems.uploadedBy], references: [users.id] }),
}))
