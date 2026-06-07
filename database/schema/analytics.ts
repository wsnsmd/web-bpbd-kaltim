// database/schema/analytics.ts
import { mysqlTable, varchar, text, int, datetime, index } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const pageViews = mysqlTable(
  'page_views',
  {
    id: int('id').primaryKey().autoincrement(),
    // Halaman
    path: varchar('path', { length: 500 }).notNull(),
    title: varchar('title', { length: 500 }),
    referrer: varchar('referrer', { length: 500 }),
    // Device
    userAgent: text('user_agent'),
    browser: varchar('browser', { length: 100 }),
    os: varchar('os', { length: 100 }),
    device: varchar('device', { length: 50 }), // desktop | mobile | tablet
    // Lokasi (via IP)
    ip: varchar('ip', { length: 50 }),
    country: varchar('country', { length: 100 }),
    city: varchar('city', { length: 100 }),
    // Session
    sessionId: varchar('session_id', { length: 100 }),
    // Waktu
    createdAt: datetime('created_at')
      .default(sql`NOW()`)
      .notNull(),
  },
  (table) => ({
    pathIdx: index('path_idx').on(table.path),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
    sessionIdx: index('session_idx').on(table.sessionId),
  })
)

export const dailySummary = mysqlTable('analytics_daily_summary', {
  id: int('id').primaryKey().autoincrement(),
  date: varchar('date', { length: 10 }).notNull().unique(), // YYYY-MM-DD
  totalViews: int('total_views').default(0),
  uniqueSessions: int('unique_sessions').default(0),
  updatedAt: datetime('updated_at').default(sql`NOW()`),
})
