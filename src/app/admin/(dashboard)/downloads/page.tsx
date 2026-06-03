// src/app/admin/(dashboard)/downloads/page.tsx
import { db } from '@/lib/db'
import { downloads, siteSettings } from '@db/schema'
import { asc, eq } from 'drizzle-orm'
import { DownloadsPanel } from './_components/downloads-panel'
import { DEFAULT_DOWNLOAD_CATEGORIES } from '@db/schema/downloads'

export const metadata = { title: 'Download Center' }

export default async function DownloadsPage() {
  const [items, categorySetting] = await Promise.all([
    db.select().from(downloads).orderBy(asc(downloads.order)),
    db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'download_categories'))
      .then((r) => r[0]),
  ])

  // Parse kategori dari settings, fallback ke default
  const categories = categorySetting?.value
    ? categorySetting.value
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : DEFAULT_DOWNLOAD_CATEGORIES

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Download Center</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola dokumen unduhan yang tampil di homepage dan halaman unduhan
        </p>
      </div>
      <DownloadsPanel initialItems={items} categories={categories} />
    </div>
  )
}
