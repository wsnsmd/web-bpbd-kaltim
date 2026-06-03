// src/app/admin/(dashboard)/page.tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { news, users } from '@db/schema'
import { eq, count } from 'drizzle-orm'
import { Newspaper, Users, Eye, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getStats() {
  const [totalNews] = await db.select({ count: count() }).from(news)
  const [publishedNews] = await db
    .select({ count: count() })
    .from(news)
    .where(eq(news.status, 'published'))
  const [draftNews] = await db.select({ count: count() }).from(news).where(eq(news.status, 'draft'))
  const [totalUsers] = await db.select({ count: count() }).from(users)

  return {
    totalNews: totalNews.count,
    publishedNews: publishedNews.count,
    draftNews: draftNews.count,
    totalUsers: totalUsers.count,
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const stats = await getStats()

  const STATS = [
    { title: 'Total Berita', value: stats.totalNews, icon: Newspaper, desc: 'Semua status' },
    {
      title: 'Berita Dipublikasi',
      value: stats.publishedNews,
      icon: Eye,
      desc: 'Aktif & terindeks',
    },
    { title: 'Draft', value: stats.draftNews, icon: FileText, desc: 'Belum dipublikasi' },
    { title: 'Total Pengguna', value: stats.totalUsers, icon: Users, desc: 'Akun terdaftar' },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Selamat datang, {session?.user.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ title, value, icon: Icon, desc }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
              <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-navy-800 text-2xl font-bold">{value}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
