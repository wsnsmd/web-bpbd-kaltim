// database/seeds/profil-pages.ts
// Jalankan sekali untuk membuat halaman profil awal di DB
import { db } from '@/lib/db'
import { pages } from '@db/schema'

const PROFIL_PAGES = [
  {
    id: crypto.randomUUID(),
    title: 'Visi & Misi',
    slug: 'profil/visi-misi',
    content:
      '<h2>Visi</h2><p>Terwujudnya masyarakat Kalimantan Timur yang tangguh dalam menghadapi bencana.</p><h2>Misi</h2><ul><li>Melindungi masyarakat dari ancaman bencana melalui pengurangan risiko bencana</li><li>Membangun sistem penanggulangan bencana yang handal</li><li>Menyelenggarakan penanggulangan bencana secara terencana, terpadu, terkoordinasi, dan menyeluruh</li></ul>',
    excerpt: 'Visi dan misi BPBD Provinsi Kalimantan Timur dalam penanggulangan bencana daerah.',
    status: 'published' as const,
    template: 'profile',
    showInNav: true,
    navOrder: '1',
    publishedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Tugas & Fungsi',
    slug: 'profil/tugas-fungsi',
    content:
      '<h2>Tugas Pokok</h2><p>BPBD Provinsi Kalimantan Timur mempunyai tugas mengkoordinasikan perumusan dan pelaksanaan kebijakan penanggulangan bencana secara terencana, terpadu, dan menyeluruh.</p><h2>Fungsi</h2><ul><li>Perumusan dan penetapan kebijakan penanggulangan bencana</li><li>Pengkoordinasian pelaksanaan kegiatan penanggulangan bencana</li><li>Komando pelaksanaan dalam penanganan darurat bencana</li><li>Pelaksanaan fungsi lain yang diberikan oleh Gubernur</li></ul>',
    excerpt:
      'Tugas pokok dan fungsi BPBD Provinsi Kalimantan Timur berdasarkan peraturan perundang-undangan.',
    status: 'published' as const,
    template: 'profile',
    showInNav: true,
    navOrder: '2',
    publishedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Sejarah',
    slug: 'profil/sejarah',
    content:
      '<p>BPBD Provinsi Kalimantan Timur dibentuk berdasarkan Peraturan Daerah Provinsi Kalimantan Timur dalam rangka pelaksanaan Undang-Undang Nomor 24 Tahun 2007 tentang Penanggulangan Bencana.</p><p>Sebelum terbentuknya BPBD, penanganan bencana di Kalimantan Timur dilaksanakan oleh Satuan Koordinasi Pelaksana Penanganan Bencana dan Pengungsi (Satkorlak PBP).</p>',
    excerpt: 'Sejarah pembentukan dan perkembangan BPBD Provinsi Kalimantan Timur.',
    status: 'published' as const,
    template: 'profile',
    showInNav: true,
    navOrder: '3',
    publishedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Profil Pimpinan',
    slug: 'profil/profil-pimpinan',
    content:
      '<p>Informasi profil pimpinan BPBD Provinsi Kalimantan Timur akan segera tersedia.</p>',
    excerpt: 'Profil pimpinan dan pejabat struktural BPBD Provinsi Kalimantan Timur.',
    status: 'published' as const,
    template: 'profile',
    showInNav: true,
    navOrder: '4',
    publishedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Struktur Organisasi',
    slug: 'profil/struktur-organisasi',
    content: '',
    excerpt: 'Struktur organisasi BPBD Provinsi Kalimantan Timur.',
    status: 'published' as const,
    template: 'profile',
    showInNav: true,
    navOrder: '5',
    publishedAt: new Date(),
  },
]

export async function seedProfilPages() {
  for (const page of PROFIL_PAGES) {
    await db
      .insert(pages)
      .values(page)
      .onDuplicateKeyUpdate({ set: { title: page.title, updatedAt: new Date() } })
  }
  console.log('✓ Profil pages seeded')
}

seedProfilPages().catch(console.error)
