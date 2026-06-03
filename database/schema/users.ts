// database/schema/users.ts
import {
  mysqlTable,
  varchar,
  boolean,
  datetime,
  int,
  primaryKey,
  index,
  timestamp,
} from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }),
    avatar: varchar('avatar', { length: 500 }),
    isActive: boolean('is_active').default(true),
    lastLoginAt: datetime('last_login_at'),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
    // Atau gunakan timestamp untuk auto-update:
    // createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    // updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (t) => ({
    emailIdx: index('users_email_idx').on(t.email),
  })
)

export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: datetime('created_at').default(sql`NOW()`),
  updatedAt: datetime('updated_at').default(sql`NOW()`),
})

export const userRoles = mysqlTable(
  'user_roles',
  {
    userId: varchar('user_id', { length: 36 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    roleId: int('role_id').references(() => roles.id, { onDelete: 'cascade' }),
    assignedAt: datetime('assigned_at').default(sql`NOW()`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
    userRoleIdx: index('user_role_idx').on(t.userId, t.roleId),
  })
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}))

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}))
