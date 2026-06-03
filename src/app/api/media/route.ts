// src/app/api/media/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { media } from '@db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.select().from(media).orderBy(desc(media.createdAt))
  return NextResponse.json({ items })
}
