// src/app/admin/(dashboard)/announcements/page.tsx
import { getTickerItemsAction, getTickerSpeedAction } from './_actions/announcements-actions'
import { TickerPanel } from './_components/ticker-panel'

export const metadata = { title: 'Ticker & Pengumuman' }

export default async function AnnouncementsPage() {
  const [items, speed] = await Promise.all([getTickerItemsAction(), getTickerSpeedAction()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Ticker & Pengumuman</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola teks berjalan yang tampil di bagian atas halaman publik
        </p>
      </div>
      <TickerPanel initialItems={items} initialSpeed={speed} />
    </div>
  )
}
