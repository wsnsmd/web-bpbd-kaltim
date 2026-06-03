// src/app/admin/(dashboard)/homepage/services/page.tsx
import { db } from '@/lib/db'
import { services } from '@db/schema'
import { asc } from 'drizzle-orm'
import { ServicesPanel } from './_components/services-panel'

export const metadata = { title: 'Layanan — Beranda' }

export default async function ServicesPage() {
  const items = await db.select().from(services).orderBy(asc(services.order))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Layanan & Informasi</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola kartu layanan yang tampil di section homepage
        </p>
      </div>
      <ServicesPanel initialItems={items} />
    </div>
  )
}
