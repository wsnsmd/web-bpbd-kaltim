// database/schema/pages.ts
import {
  mysqlTable,
  varchar,
  text,
  datetime,
  mysqlEnum,
  boolean,
  index,
} from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'

export const pages = mysqlTable(
  'pages',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 600 }).notNull().unique(),
    content: text('content').notNull(),
    excerpt: text('excerpt'),
    featuredImage: varchar('featured_image', { length: 500 }),
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft'),
    template: varchar('template', { length: 100 }).default('default'),
    authorId: varchar('author_id', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    showInNav: boolean('show_in_nav').default(false),
    navOrder: varchar('nav_order', { length: 10 }).default('0'),
    parentId: varchar('parent_id', { length: 36 }),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: varchar('seo_description', { length: 500 }),
    publishedAt: datetime('published_at'),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    slugIdx: index('pages_slug_idx').on(t.slug),
    statusIdx: index('pages_status_idx').on(t.status),
    authorIdx: index('pages_author_idx').on(t.authorId),
  })
)

export const pagesRelations = relations(pages, ({ one }) => ({
  author: one(users, { fields: [pages.authorId], references: [users.id] }),
  parent: one(pages, { fields: [pages.parentId], references: [pages.id] }),
}))

// Template yang tersedia
export const PAGE_TEMPLATES = [
  { value: 'default', label: 'Default' },
  { value: 'full', label: 'Full Width' },
  { value: 'sidebar', label: 'Dengan Sidebar' },
  { value: 'contact', label: 'Halaman Kontak' },
  { value: 'profile', label: 'Profil Organisasi' },
]
