// database/schema/settings.ts
import { mysqlTable, varchar, text, datetime } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const siteSettings = mysqlTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value'),
  updatedAt: datetime('updated_at').default(sql`NOW()`),
})

// ── Tambahkan ke database/schema/index.ts ─────────────────
// export * from './settings'

// ── Default values untuk seed ─────────────────────────────
export const DEFAULT_SETTINGS = {
  // Umum
  site_name: 'BPBD Provinsi Kalimantan Timur',
  site_tagline: 'Tanggap, Tangguh, Cepat',
  site_description: 'Portal resmi Badan Penanggulangan Bencana Daerah Provinsi Kalimantan Timur.',
  site_logo: '',
  site_favicon: '',

  // Kontak (sesuai footer)
  contact_address:
    'Jl. Tengkawang No. 1, Kel. Karang Anyar, Kec. Sungai Kunjang, Kota Samarinda 75127, Kalimantan Timur',
  contact_phone: '(0541) XXX-XXXX',
  contact_emergency: '112',
  contact_email: 'pusdalops@bpbd.kaltimprov.go.id',
  contact_whatsapp: '62812XXXXXXXX',
  office_hours: 'Senin – Jumat, 08.00 – 16.30 WITA',

  // Sosial media (sesuai header top strip)
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  social_twitter: '',

  // SEO
  seo_title: 'BPBD Provinsi Kalimantan Timur',
  seo_description: 'Portal resmi penanggulangan bencana Provinsi Kalimantan Timur.',
  seo_keywords: 'BPBD, Kalimantan Timur, bencana, penanggulangan',
  google_analytics: '',

  // Media
  upload_max_size_mb: '5',
  upload_allowed_types: 'image/jpeg,image/png,image/webp,image/gif',

  mapbox_token: '',
  map_latitude: '-0.5022',
  map_longitude: '117.1364',
  map_zoom: '15',
}
