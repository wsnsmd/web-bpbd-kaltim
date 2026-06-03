// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '@db/schema'

const globalForDb = globalThis as unknown as {
  connection: mysql.Pool | undefined
}

const connection =
  globalForDb.connection ??
  mysql.createPool({
    uri: process.env.DATABASE_URL!,
    connectionLimit: 10,
    charset: 'utf8mb4',
    timezone: '+08:00', // WITA
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.connection = connection
}

export const db = drizzle(connection, { schema, mode: 'default' })
export type DB = typeof db
