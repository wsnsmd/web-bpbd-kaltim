// src/app/admin/(dashboard)/page.tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { news, users, incidents, incidentVictims, incidentDamages, disasterTypes } from '@db/schema'
import { eq, count, sum, desc, gte, ne, and } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { regions } from '@db/schema'
import Link from 'next/link'
import {
  Newspaper,
  Users,
  Flame,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Eye,
  FileText,
  CheckCircle,
  Activity,
  Home,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function fmtNum(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}
function fmtRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} Jt`
  return `Rp ${fmtNum(n)}`
}
function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(d))
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const currentYear = new Date().getFullYear()
  const startYear = new Date(`${currentYear}-01-01`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const regencyAlias = alias(regions, 'regency_r')

  const [
    // Berita
    [totalNews],
    [publishedNews],
    [draftNews],
    // Users
    [totalUsers],
    // Incidents semua
    [totalIncidents],
    [aktifCount],
    [ditanganiCount],
    [selesaiCount],
    // Incidents tahun ini
    [yearIncidents],
    // Incidents hari ini
    [todayIncidents],
    // Korban
    korbanAgg,
    // Kerugian
    [kerugianAgg],
    // Incidents terbaru
    recentIncidents,
    // Per jenis tahun ini
    perJenis,
  ] = await Promise.all([
    db.select({ count: count() }).from(news),
    db.select({ count: count() }).from(news).where(eq(news.status, 'published')),
    db.select({ count: count() }).from(news).where(eq(news.status, 'draft')),

    db.select({ count: count() }).from(users),

    db.select({ count: count() }).from(incidents),
    db.select({ count: count() }).from(incidents).where(eq(incidents.status, 'aktif')),
    db.select({ count: count() }).from(incidents).where(eq(incidents.status, 'ditangani')),
    db.select({ count: count() }).from(incidents).where(eq(incidents.status, 'selesai')),

    db.select({ count: count() }).from(incidents).where(gte(incidents.occurredDate, startYear)),
    db.select({ count: count() }).from(incidents).where(gte(incidents.occurredDate, today)),

    db
      .select({
        impactType: incidentVictims.impactType,
        total: sum(incidentVictims.countTotal),
      })
      .from(incidentVictims)
      .groupBy(incidentVictims.impactType),

    db.select({ total: sum(incidentDamages.estimatedLoss) }).from(incidentDamages),

    db
      .select({
        id: incidents.id,
        title: incidents.title,
        typeIcon: disasterTypes.icon,
        typeName: disasterTypes.name,
        typeColor: disasterTypes.color,
        regencyName: regencyAlias.name,
        occurredDate: incidents.occurredDate,
        status: incidents.status,
      })
      .from(incidents)
      .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
      .leftJoin(regencyAlias, eq(incidents.regencyId, regencyAlias.id))
      .orderBy(desc(incidents.occurredDate))
      .limit(6),

    db
      .select({
        name: disasterTypes.name,
        icon: disasterTypes.icon,
        color: disasterTypes.color,
        total: count(incidents.id),
      })
      .from(incidents)
      .leftJoin(disasterTypes, eq(incidents.disasterTypeId, disasterTypes.id))
      .where(gte(incidents.occurredDate, startYear))
      .groupBy(
        incidents.disasterTypeId,
        disasterTypes.name,
        disasterTypes.icon,
        disasterTypes.color
      )
      .orderBy(desc(count(incidents.id)))
      .limit(5),
  ])

  const getVictim = (type: string) =>
    Number(korbanAgg.find((k) => k.impactType === type)?.total ?? 0)

  const STATUS_CONFIG = {
    aktif: {
      label: 'Aktif',
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500 animate-pulse',
    },
    ditangani: {
      label: 'Ditangani',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    selesai: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  }

  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Selamat datang, <strong>{session?.user.name}</strong> · {now}
          </p>
        </div>
        {todayIncidents.count > 0 && (
          <Link
            href="/admin/incidents"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            {todayIncidents.count} kejadian hari ini
          </Link>
        )}
      </div>

      {/* ── Kejadian bencana stats ── */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
          Kejadian Bencana
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {
              label: 'Total',
              val: totalIncidents.count,
              color: 'text-navy-800',
              bg: 'bg-navy-50',
              icon: Activity,
            },
            {
              label: 'Tahun Ini',
              val: yearIncidents.count,
              color: 'text-blue-700',
              bg: 'bg-blue-50',
              icon: TrendingUp,
            },
            {
              label: 'Hari Ini',
              val: todayIncidents.count,
              color: 'text-purple-700',
              bg: 'bg-purple-50',
              icon: Clock,
            },
            {
              label: 'Aktif',
              val: aktifCount.count,
              color: 'text-red-700',
              bg: 'bg-red-50',
              icon: Flame,
            },
            {
              label: 'Ditangani',
              val: ditanganiCount.count,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              icon: AlertTriangle,
            },
            {
              label: 'Selesai',
              val: selesaiCount.count,
              color: 'text-green-700',
              bg: 'bg-green-50',
              icon: CheckCircle,
            },
          ].map(({ label, val, color, bg, icon: Icon }) => (
            <Link key={label} href="/admin/incidents">
              <Card className={`${bg} cursor-pointer border-0 transition hover:shadow-md`}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <Icon className={`h-4 w-4 ${color} opacity-70`} />
                  </div>
                  <p className={`text-2xl font-black ${color}`}>{fmtNum(val)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Korban & Kerugian ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            label: 'Meninggal',
            val: getVictim('meninggal'),
            color: 'text-red-800',
            bg: 'bg-red-100',
          },
          {
            label: 'Hilang',
            val: getVictim('hilang'),
            color: 'text-orange-800',
            bg: 'bg-orange-100',
          },
          {
            label: 'Luka/Sakit',
            val: getVictim('luka_sakit'),
            color: 'text-yellow-800',
            bg: 'bg-yellow-100',
          },
          {
            label: 'Menderita',
            val: getVictim('menderita'),
            color: 'text-blue-800',
            bg: 'bg-blue-100',
          },
          {
            label: 'Mengungsi',
            val: getVictim('mengungsi'),
            color: 'text-purple-800',
            bg: 'bg-purple-100',
          },
          {
            label: 'Taksiran Kerugian',
            val: null,
            valStr: fmtRp(Number(kerugianAgg.total ?? 0)),
            color: 'text-slate-800',
            bg: 'bg-slate-100',
          },
        ].map(({ label, val, valStr, color, bg }) => (
          <div key={label} className={`rounded-xl ${bg} px-4 py-3`}>
            <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {label}
            </p>
            <p className={`text-lg font-black ${color}`}>
              {valStr ?? fmtNum(val ?? 0)}
              {val !== null && val !== undefined && (
                <span className="ml-0.5 text-xs font-normal">jiwa</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* ── 2 kolom: Terbaru + Jenis ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        {/* Kejadian terbaru */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-navy-800 text-sm font-bold">Kejadian Terbaru</CardTitle>
            <Link
              href="/admin/incidents"
              className="text-navy-600 text-xs font-semibold hover:underline"
            >
              Lihat semua →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentIncidents.map((inc) => {
                const st =
                  STATUS_CONFIG[inc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.selesai
                return (
                  <Link
                    key={inc.id}
                    href={`/admin/incidents`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                      style={{ background: `${inc.typeColor ?? '#6b7592'}18` }}
                    >
                      {inc.typeIcon ?? '⚠️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-navy-800 truncate text-sm font-semibold">{inc.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-2.5 w-2.5" />
                        {inc.regencyName ?? '—'} · {fmtDate(inc.occurredDate)}
                      </p>
                    </div>
                    <div
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 ${st.bg}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      <span className={`text-[10px] font-bold ${st.text}`}>{st.label}</span>
                    </div>
                  </Link>
                )
              })}
              {recentIncidents.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">Belum ada data kejadian</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Per jenis + berita */}
        <div className="space-y-4">
          {/* Per jenis tahun ini */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-navy-800 text-sm font-bold">
                Jenis Bencana {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {perJenis.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada data</p>
              ) : (
                perJenis.map((j) => {
                  const maxVal = Number(perJenis[0]?.total ?? 1)
                  const pct = (Number(j.total) / maxVal) * 100
                  return (
                    <div key={j.name} className="flex items-center gap-2 text-xs">
                      <span className="w-5 shrink-0 text-base">{j.icon ?? '⚠️'}</span>
                      <span className="flex-1 truncate text-slate-600">{j.name ?? '—'}</span>
                      <div className="h-1.5 w-20 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${pct}%`, background: j.color ?? '#6b7592' }}
                        />
                      </div>
                      <span className="text-navy-800 w-5 text-right font-bold">{j.total}</span>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Berita stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-navy-800 text-sm font-bold">Konten Berita</CardTitle>
              <Link
                href="/admin/news"
                className="text-navy-600 text-xs font-semibold hover:underline"
              >
                Kelola →
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  label: 'Total Berita',
                  val: totalNews.count,
                  icon: Newspaper,
                  color: 'text-navy-700',
                },
                {
                  label: 'Dipublikasi',
                  val: publishedNews.count,
                  icon: Eye,
                  color: 'text-green-600',
                },
                { label: 'Draft', val: draftNews.count, icon: FileText, color: 'text-amber-600' },
                {
                  label: 'Total Admin',
                  val: totalUsers.count,
                  icon: Users,
                  color: 'text-blue-600',
                },
              ].map(({ label, val, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-slate-50 py-1.5 last:border-0"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    {label}
                  </div>
                  <span className="text-navy-800 text-sm font-bold">{fmtNum(val)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">Aksi Cepat</p>
        <div className="flex flex-wrap gap-2">
          {[
            {
              href: '/admin/incidents',
              label: '+ Tambah Kejadian',
              icon: Flame,
              bg: 'bg-red-600 hover:bg-red-700 text-white',
            },
            {
              href: '/admin/news/create',
              label: '+ Tulis Berita',
              icon: Newspaper,
              bg: 'bg-navy-700 hover:bg-navy-800 text-white',
            },
            {
              href: '/admin/master-data',
              label: 'Master Data',
              icon: Activity,
              bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
            },
            {
              href: '/admin/settings',
              label: 'Pengaturan',
              icon: Home,
              bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
            },
          ].map(({ href, label, icon: Icon, bg }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${bg}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
