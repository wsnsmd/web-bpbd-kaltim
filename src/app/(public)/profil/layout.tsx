// src/app/(public)/profil/layout.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { db } from '@/lib/db'
import { pages } from '@db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { ChevronRight } from 'lucide-react'
import { ProfilNavLink } from './_components/profil-nav-link'

const DEFAULT_PROFIL_PAGES = [
  { title: 'Visi & Misi', slug: 'profil/visi-misi' },
  { title: 'Tugas & Fungsi', slug: 'profil/tugas-fungsi' },
  { title: 'Sejarah', slug: 'profil/sejarah' },
  { title: 'Profil Pimpinan', slug: 'profil/profil-pimpinan' },
  { title: 'Struktur Organisasi', slug: 'profil/struktur-organisasi' },
]

export default async function ProfilLayout({ children }: { children: React.ReactNode }) {
  noStore()

  const dbPages = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      navOrder: pages.navOrder,
    })
    .from(pages)
    .where(and(eq(pages.status, 'published'), eq(pages.showInNav, true)))
    .orderBy(asc(pages.navOrder))

  const profilPages = dbPages.filter((p) => p.slug.startsWith('profil/'))
  const navItems = profilPages.length > 0 ? profilPages : DEFAULT_PROFIL_PAGES

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="container-content max-w-content relative z-10 mx-auto py-10">
          <div className="text-navy-400 mb-3 flex items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Profil</span>
          </div>
          <p className="mb-1.5 text-[11px] font-bold tracking-widest text-orange-400 uppercase">
            Tentang Kami
          </p>
          <h1 className="text-2xl leading-none font-black tracking-tight text-white md:text-3xl">
            Profil
          </h1>
          <p className="text-navy-300 mt-2 text-sm">BPBD Provinsi Kalimantan Timur</p>
        </div>
      </div>

      <div className="container-content max-w-content mx-auto py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-lg bg-white ring-1 ring-black/6">
              <div className="bg-navy-800 px-5 py-3.5">
                <p className="text-navy-200 text-[11px] font-bold tracking-widest uppercase">
                  Profil
                </p>
              </div>
              <nav className="p-2">
                {navItems.map((item) => (
                  <ProfilNavLink key={item.slug} href={`/${item.slug}`} label={item.title} />
                ))}
              </nav>
            </div>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
