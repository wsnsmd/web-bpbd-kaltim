// database/seeds/news.ts
import { db } from '@/lib/db'
import { users, roles, userRoles, newsCategories, news } from '@db/schema'
import { eq, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function seedNews() {
  console.log('🌱 Seeding...')

  // ── 1. Roles ─────────────────────────────────────────────
  await db
    .insert(roles)
    .values([
      {
        id: 1,
        name: 'Super Admin',
        slug: 'super_admin',
        description: 'Akses penuh ke semua fitur',
      },
      {
        id: 2,
        name: 'Administrator',
        slug: 'administrator',
        description: 'Kelola konten dan pengguna',
      },
      { id: 3, name: 'Editor', slug: 'editor', description: 'Buat dan edit konten' },
      { id: 4, name: 'Operator', slug: 'operator', description: 'Input data operasional' },
    ])
    .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } })

  console.log('✅ Roles seeded')

  // ── 2. Users ─────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@BPBD2026', 12)

  const seedUsers = [
    { name: 'Super Admin BPBD', email: 'admin@bpbd.kaltimprov.go.id', roleId: 1 },
    { name: 'Editor Konten', email: 'editor@bpbd.kaltimprov.go.id', roleId: 3 },
    { name: 'Operator Pusdalops', email: 'pusdalops@bpbd.kaltimprov.go.id', roleId: 4 },
  ]

  for (const u of seedUsers) {
    await db
      .insert(users)
      .values({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        isActive: true,
      })
      .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } })
  }

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@bpbd.kaltimprov.go.id'))
  const [editorUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'editor@bpbd.kaltimprov.go.id'))
  const [operatorUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'pusdalops@bpbd.kaltimprov.go.id'))

  await db
    .insert(userRoles)
    .values([
      { userId: adminUser.id, roleId: 1 },
      { userId: editorUser.id, roleId: 3 },
      { userId: operatorUser.id, roleId: 4 },
    ])
    .onDuplicateKeyUpdate({ set: { assignedAt: sql`VALUES(assigned_at)` } })

  console.log('✅ Users seeded')

  // ── 3. Categories ─────────────────────────────────────────
  await db
    .insert(newsCategories)
    .values([
      {
        id: 1,
        name: 'Kegiatan',
        slug: 'kegiatan',
        color: '#e5aa0d',
        description: 'Kegiatan dan agenda BPBD Kaltim',
      },
      {
        id: 2,
        name: 'Mitigasi',
        slug: 'mitigasi',
        color: '#e85000',
        description: 'Program mitigasi dan pengurangan risiko bencana',
      },
      {
        id: 3,
        name: 'Informasi',
        slug: 'informasi',
        color: '#1b56a8',
        description: 'Informasi umum kebencanaan',
      },
      {
        id: 4,
        name: 'Darurat',
        slug: 'darurat',
        color: '#dc2626',
        description: 'Laporan kejadian darurat',
      },
      {
        id: 5,
        name: 'Edukasi',
        slug: 'edukasi',
        color: '#0f2d5c',
        description: 'Edukasi dan literasi bencana',
      },
    ])
    .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } })

  console.log('✅ Categories seeded')

  // ── 4. News ───────────────────────────────────────────────
  const newsData = [
    {
      title:
        'BPBD Kaltim Gelar Koordinasi Persiapan Expo Ketangguhan Bencana Regional Kalimantan 2026',
      slug: 'koordinasi-expo-ketangguhan-bencana-regional-kalimantan-2026',
      excerpt:
        'Rapat koordinasi dipimpin langsung oleh Kepala Pelaksana untuk memantapkan kesiapan logistik, akomodasi, dan skenario simulasi bencana.',
      content:
        '<p>SAMARINDA — Badan Penanggulangan Bencana Daerah (BPBD) Provinsi Kalimantan Timur menggelar rapat koordinasi intensif dalam rangka persiapan Expo Ketangguhan Bencana Regional Kalimantan 2026.</p>',
      authorId: adminUser.id,
      categoryId: 1,
      status: 'published' as const,
      isFeatured: true,
      publishedAt: new Date('2026-05-26T08:00:00'),
      seoTitle: 'BPBD Kaltim Siapkan Expo Ketangguhan Bencana Regional 2026',
      seoDescription:
        'BPBD Kaltim gelar koordinasi persiapan Expo Ketangguhan Bencana Regional Kalimantan 2026.',
    },
    {
      title: 'Penyuluhan Pembentukan Destana di 12 Desa Kutai Kartanegara',
      slug: 'destana-12-desa-kutai-kartanegara-2026',
      excerpt:
        '480 warga lokal berhasil dilatih melakukan evakuasi mandiri dan teknik mitigasi dasar.',
      content:
        '<p>TENGGARONG — Program Desa Tangguh Bencana (Destana) di Kabupaten Kutai Kartanegara memasuki babak baru dengan keberhasilan penyuluhan di 12 desa sekaligus.</p>',
      authorId: editorUser.id,
      categoryId: 2,
      status: 'published' as const,
      isFeatured: false,
      publishedAt: new Date('2026-05-24T09:00:00'),
      seoTitle: 'Destana 12 Desa Kutai Kartanegara',
      seoDescription:
        '480 warga Kutai Kartanegara dilatih kesiapsiagaan bencana dalam program Destana BPBD Kaltim.',
    },
    {
      title: 'Peningkatan Dashboard Logistik SIBEKAL Terintegrasi',
      slug: 'peningkatan-dashboard-sibekal-2026',
      excerpt:
        'Fitur pemetaan spasial dan manajemen stok kini terintegrasi melalui pembaruan sistem SIBEKAL.',
      content:
        '<p>SAMARINDA — Sistem Informasi Bekal (SIBEKAL) BPBD Kaltim resmi mendapatkan pembaruan mayor.</p>',
      authorId: operatorUser.id,
      categoryId: 3,
      status: 'published' as const,
      isFeatured: false,
      publishedAt: new Date('2026-05-20T10:00:00'),
      seoTitle: 'Update SIBEKAL: Dashboard Logistik BPBD Kaltim Terintegrasi',
      seoDescription: 'BPBD Kaltim perbarui sistem SIBEKAL dengan fitur pemetaan spasial.',
    },
    {
      title: 'Waspada Karhutla: BPBD Kaltim Tetapkan Status Siaga di 5 Kabupaten',
      slug: 'siaga-karhutla-5-kabupaten-kaltim-2026',
      excerpt:
        'Memasuki musim kemarau, BPBD Kaltim menetapkan status siaga karhutla di 5 kabupaten.',
      content:
        '<p>SAMARINDA — Menjelang puncak musim kemarau, BPBD Provinsi Kalimantan Timur resmi menetapkan status siaga kebakaran hutan dan lahan di lima kabupaten.</p>',
      authorId: adminUser.id,
      categoryId: 4,
      status: 'published' as const,
      isFeatured: true,
      publishedAt: new Date('2026-05-18T07:00:00'),
      seoTitle: 'Siaga Karhutla 5 Kabupaten Kaltim',
      seoDescription:
        'BPBD Kaltim tetapkan status siaga karhutla di 5 kabupaten memasuki musim kemarau 2026.',
    },
    {
      title: 'Pelatihan Trauma Healing untuk Relawan BPBD Kaltim Angkatan III',
      slug: 'pelatihan-trauma-healing-relawan-bpbd-kaltim-2026',
      excerpt:
        '60 relawan mengikuti pelatihan trauma healing dan dukungan psikososial untuk korban bencana.',
      content:
        '<p>SAMARINDA — BPBD Provinsi Kalimantan Timur bersama Dinas Kesehatan Kaltim menyelenggarakan Pelatihan Trauma Healing Angkatan III.</p>',
      authorId: editorUser.id,
      categoryId: 5,
      status: 'published' as const,
      isFeatured: false,
      publishedAt: new Date('2026-05-15T08:30:00'),
      seoTitle: 'Pelatihan Trauma Healing Relawan BPBD Kaltim 2026',
      seoDescription: '60 relawan BPBD Kaltim ikuti pelatihan trauma healing.',
    },
    {
      title: 'Draft: Rencana Pemasangan Early Warning System Banjir di DAS Mahakam',
      slug: 'draft-ews-banjir-das-mahakam-2026',
      excerpt: 'BPBD Kaltim merencanakan pemasangan 12 unit sensor peringatan dini banjir.',
      content: '<p>Ini adalah draft artikel yang belum dipublikasikan.</p>',
      authorId: adminUser.id,
      categoryId: 3,
      status: 'draft' as const,
      isFeatured: false,
      publishedAt: null,
      seoTitle: null,
      seoDescription: null,
    },
  ]

  for (const item of newsData) {
    await db
      .insert(news)
      .values(item)
      .onDuplicateKeyUpdate({ set: { title: sql`VALUES(title)` } })
  }

  console.log('✅ News seeded')
  console.log('🎉 Seeding selesai!')
}

seedNews().catch((e) => {
  console.error('❌ Seed error:', e)
  process.exit(1)
})
