// src/app/(public)/profil/page.tsx
// Redirect ke halaman pertama yang tersedia
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { pages } from '@db/schema'
import { eq, and, asc } from 'drizzle-orm'

export default async function ProfilPage() {
  // Cari halaman profil pertama dari DB
  const dbPages = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(and(eq(pages.status, 'published'), eq(pages.showInNav, true)))
    .orderBy(asc(pages.navOrder))

  const first = dbPages.find((p) => p.slug.startsWith('profil/'))
  redirect(first ? `/${first.slug}` : '/profil/visi-misi')
}
