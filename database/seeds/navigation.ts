// database/seeds/navigation.ts
import { db } from '@/lib/db'
import { menuItems } from '@db/schema'
import { sql } from 'drizzle-orm'

export async function seedNavigation() {
  console.log('🌱 Seeding navigation...')

  // ── 1. Main Nav ───────────────────────────────────────────
  // Insert parent items dulu, lalu ambil ID-nya untuk submenu
  const mainNavParents = [
    { label: 'Beranda', url: '/', order: 1, hasChildren: false },
    { label: 'Profil', url: '#', order: 2, hasChildren: true },
    { label: 'Informasi Bencana', url: '#', order: 3, hasChildren: true },
    { label: 'Logistik & SIBEKAL', url: '/logistik', order: 4, hasChildren: false },
    { label: 'Pusdalops', url: '/pusdalops', order: 5, hasChildren: false },
    { label: 'PPID', url: '#', order: 6, hasChildren: true },
    { label: 'Kontak', url: '/kontak', order: 7, hasChildren: false },
  ]

  for (const item of mainNavParents) {
    await db
      .insert(menuItems)
      .values({
        location: 'main_nav',
        label: item.label,
        url: item.url,
        target: '_self',
        order: item.order,
        isActive: true,
      })
      .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
  }

  // Ambil ID parent untuk assign submenu
  const allMainNav = await db
    .select()
    .from(menuItems)
    .then((rows) => rows.filter((r) => r.location === 'main_nav' && !r.parentId))

  const getParentId = (label: string) => allMainNav.find((i) => i.label === label)?.id ?? null

  // Submenu Profil
  const profilId = getParentId('Profil')
  if (profilId) {
    const profilChildren = [
      { label: 'Tentang BPBD Kaltim', url: '/profil', order: 1 },
      { label: 'Visi & Misi', url: '/profil/visi-misi', order: 2 },
      { label: 'Struktur Organisasi', url: '/profil/struktur', order: 3 },
      { label: 'Tupoksi', url: '/profil/tupoksi', order: 4 },
      { label: 'Kepala Pelaksana', url: '/profil/pimpinan', order: 5 },
    ]
    for (const child of profilChildren) {
      await db
        .insert(menuItems)
        .values({
          location: 'main_nav',
          label: child.label,
          url: child.url,
          target: '_self',
          order: child.order,
          isActive: true,
          parentId: profilId,
        })
        .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
    }
  }

  // Submenu Informasi Bencana
  const infoId = getParentId('Informasi Bencana')
  if (infoId) {
    const infoChildren = [
      { label: 'Peringatan Dini', url: '/informasi/peringatan-dini', order: 1 },
      { label: 'Data Kejadian', url: '/informasi/data', order: 2 },
      { label: 'Peta Bencana', url: '/informasi/peta', order: 3 },
      { label: 'Statistik Bencana', url: '/informasi/statistik', order: 4 },
      { label: 'Edukasi & Mitigasi', url: '/informasi/edukasi', order: 5 },
    ]
    for (const child of infoChildren) {
      await db
        .insert(menuItems)
        .values({
          location: 'main_nav',
          label: child.label,
          url: child.url,
          target: '_self',
          order: child.order,
          isActive: true,
          parentId: infoId,
        })
        .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
    }
  }

  // Submenu PPID
  const ppidId = getParentId('PPID')
  if (ppidId) {
    const ppidChildren = [
      { label: 'Profil PPID', url: '/ppid', order: 1 },
      { label: 'Regulasi & Aturan', url: '/ppid/regulasi', order: 2 },
      { label: 'Daftar Informasi', url: '/ppid/informasi', order: 3 },
      { label: 'Permohonan Informasi', url: '/ppid/permohonan', order: 4 },
    ]
    for (const child of ppidChildren) {
      await db
        .insert(menuItems)
        .values({
          location: 'main_nav',
          label: child.label,
          url: child.url,
          target: '_self',
          order: child.order,
          isActive: true,
          parentId: ppidId,
        })
        .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
    }
  }

  console.log('✅ Main nav seeded')

  // ── 2. Instansi Bar ───────────────────────────────────────
  const instansiBar = [
    { label: 'Pemprov Kaltim', url: 'https://kaltimprov.go.id', icon: 'Building2', order: 1 },
    { label: 'BNPB Pusat', url: 'https://bnpb.go.id', icon: 'ShieldAlert', order: 2 },
    { label: 'BMKG Kaltim', url: 'https://bmkg.go.id', icon: 'Cloud', order: 3 },
    { label: 'Basarnas Kaltim', url: 'https://basarnas.go.id', icon: 'Helicopter', order: 4 },
    { label: 'Dinkes Kaltim', url: '#', icon: 'Activity', order: 5 },
    { label: 'Balai Sungai', url: '#', icon: 'Waves', order: 6 },
    { label: 'Pusdalops-PB', url: '/pusdalops', icon: 'Radio', order: 7 },
    {
      label: 'BPSDM Kaltim',
      url: 'https://bpsdm.kaltimprov.go.id',
      icon: 'GraduationCap',
      order: 8,
    },
  ]

  for (const item of instansiBar) {
    await db
      .insert(menuItems)
      .values({
        location: 'instansi_bar',
        label: item.label,
        url: item.url,
        icon: item.icon,
        target: item.url.startsWith('http') ? '_blank' : '_self',
        order: item.order,
        isActive: true,
      })
      .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
  }

  console.log('✅ Instansi bar seeded')

  // ── 3. Footer Quick Links ─────────────────────────────────
  const footerQuick = [
    { label: 'Profil Lembaga', url: '/profil', order: 1 },
    { label: 'Struktur Organisasi', url: '/profil/struktur', order: 2 },
    { label: 'Data Bencana', url: '/informasi/data', order: 3 },
    { label: 'Regulasi & Aturan', url: '/ppid/regulasi', order: 4 },
    { label: 'Download Center', url: '/unduhan', order: 5 },
    { label: 'Agenda & Kegiatan', url: '/kegiatan', order: 6 },
    { label: 'FAQ', url: '/faq', order: 7 },
    { label: 'Peta Situs', url: '/sitemap', order: 8 },
  ]

  for (const item of footerQuick) {
    await db
      .insert(menuItems)
      .values({
        location: 'footer_quick',
        label: item.label,
        url: item.url,
        target: '_self',
        order: item.order,
        isActive: true,
      })
      .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
  }

  console.log('✅ Footer quick links seeded')

  // ── 4. Footer Instansi ────────────────────────────────────
  const footerInstansi = [
    { label: 'BNPB Pusat', url: 'https://bnpb.go.id', order: 1 },
    { label: 'Pemprov Kaltim', url: 'https://kaltimprov.go.id', order: 2 },
    { label: 'BMKG Kaltim', url: 'https://bmkg.go.id', order: 3 },
    { label: 'Basarnas Kaltim', url: 'https://basarnas.go.id', order: 4 },
    { label: 'Kementerian PUPR', url: 'https://pu.go.id', order: 5 },
    { label: 'BPSDM Kaltim', url: 'https://bpsdm.kaltimprov.go.id', order: 6 },
    { label: 'Dinkes Kaltim', url: '#', order: 7 },
    { label: 'BPKAD Kaltim', url: '#', order: 8 },
  ]

  for (const item of footerInstansi) {
    await db
      .insert(menuItems)
      .values({
        location: 'footer_instansi',
        label: item.label,
        url: item.url,
        target: item.url.startsWith('http') ? '_blank' : '_self',
        order: item.order,
        isActive: true,
      })
      .onDuplicateKeyUpdate({ set: { label: sql`VALUES(label)` } })
  }

  console.log('✅ Footer instansi seeded')
  console.log('🎉 Navigation seeding selesai!')
}

seedNavigation().catch((e) => {
  console.error('❌ Seed error:', e)
  process.exit(1)
})
