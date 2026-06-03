// database/schema/news.ts
import {
  mysqlTable,
  varchar,
  text,
  datetime,
  int,
  mysqlEnum,
  boolean,
  bigint,
  index,
} from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'

export const newsCategories = mysqlTable('news_categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 30 }).default('#1b56a8'),
  createdAt: datetime('created_at').default(sql`NOW()`),
  updatedAt: datetime('updated_at')
    .default(sql`NOW()`)
    .default(sql`NOW()`),
})

export const news = mysqlTable(
  'news',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 600 }).notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    featuredImage: varchar('featured_image', { length: 500 }),
    authorId: varchar('author_id', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    categoryId: int('category_id').references(() => newsCategories.id, {
      onDelete: 'set null',
    }),
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft'),
    isFeatured: boolean('is_featured').default(false),
    publishedAt: datetime('published_at'),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: varchar('seo_description', { length: 500 }),
    viewCount: bigint('view_count', { mode: 'number' }).default(0),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    slugIdx: index('news_slug_idx').on(t.slug),
    statusIdx: index('news_status_idx').on(t.status),
    publishIdx: index('news_publish_idx').on(t.publishedAt),
    authorIdx: index('news_author_idx').on(t.authorId),
    categoryIdx: index('news_category_idx').on(t.categoryId),
  })
)

export const newsRelations = relations(news, ({ one, many }) => ({
  author: one(users, { fields: [news.authorId], references: [users.id] }),
  category: one(newsCategories, {
    fields: [news.categoryId],
    references: [newsCategories.id],
  }),
}))

export const newsCategoriesRelations = relations(newsCategories, ({ many }) => ({
  news: many(news),
}))
