// database/schema/navigation.ts
import {
  mysqlTable,
  varchar,
  int,
  boolean,
  mysqlEnum,
  datetime,
  index,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

// Lokasi menu — menentukan di mana item ditampilkan
export type MenuLocation =
  | 'main_nav' // Header navigasi utama
  | 'instansi_bar' // Section instansi & jaringan di homepage
  | 'footer_quick' // Footer kolom tautan cepat
  | 'footer_instansi' // Footer kolom instansi terkait

export const menuItems = mysqlTable(
  'menu_items',
  {
    id: int('id').primaryKey().autoincrement(),
    location: mysqlEnum('location', [
      'main_nav',
      'instansi_bar',
      'footer_quick',
      'footer_instansi',
    ]).notNull(),
    label: varchar('label', { length: 100 }).notNull(),
    url: varchar('url', { length: 500 }).notNull(),
    icon: varchar('icon', { length: 100 }), // Lucide icon name atau FA class
    target: varchar('target', { length: 10 }).default('_self'), // _self | _blank
    order: int('order').default(0),
    isActive: boolean('is_active').default(true),
    parentId: int('parent_id'), // Untuk dropdown (main_nav)
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    locationIdx: index('menu_location_idx').on(t.location),
    orderIdx: index('menu_order_idx').on(t.order),
  })
)

export const MENU_LOCATIONS: Record<MenuLocation, string> = {
  main_nav: 'Navigasi Utama (Header)',
  instansi_bar: 'Instansi & Jaringan (Homepage)',
  footer_quick: 'Tautan Cepat (Footer)',
  footer_instansi: 'Instansi Terkait (Footer)',
}

// Seed default data
export const DEFAULT_MENU_ITEMS = [
  // Main Nav
  { location: 'main_nav', label: 'Beranda', url: '/', order: 1 },
  { location: 'main_nav', label: 'Profil', url: '/profil', order: 2 },
  { location: 'main_nav', label: 'Informasi Bencana', url: '/informasi', order: 3 },
  { location: 'main_nav', label: 'Logistik & SIBEKAL', url: '/logistik', order: 4 },
  { location: 'main_nav', label: 'Pusdalops', url: '/pusdalops', order: 5 },
  { location: 'main_nav', label: 'PPID', url: '/ppid', order: 6 },
  { location: 'main_nav', label: 'Kontak', url: '/kontak', order: 7 },

  // Instansi Bar
  {
    location: 'instansi_bar',
    label: 'Pemprov Kaltim',
    url: 'https://kaltimprov.go.id',
    icon: 'Building2',
    target: '_blank',
    order: 1,
  },
  {
    location: 'instansi_bar',
    label: 'BNPB Pusat',
    url: 'https://bnpb.go.id',
    icon: 'Flame',
    target: '_blank',
    order: 2,
  },
  {
    location: 'instansi_bar',
    label: 'BMKG Kaltim',
    url: 'https://bmkg.go.id',
    icon: 'Cloud',
    target: '_blank',
    order: 3,
  },
  {
    location: 'instansi_bar',
    label: 'Dinkes Kaltim',
    url: '#',
    icon: 'Hospital',
    target: '_self',
    order: 4,
  },
  {
    location: 'instansi_bar',
    label: 'Balai Sungai',
    url: '#',
    icon: 'Waves',
    target: '_self',
    order: 5,
  },
  {
    location: 'instansi_bar',
    label: 'Pusdalops-PB',
    url: '#',
    icon: 'Radio',
    target: '_self',
    order: 6,
  },
  {
    location: 'instansi_bar',
    label: 'Basarnas Kaltim',
    url: 'https://basarnas.go.id',
    icon: 'Helicopter',
    target: '_blank',
    order: 7,
  },

  // Footer Quick Links
  { location: 'footer_quick', label: 'Profil Lembaga', url: '/profil', order: 1 },
  { location: 'footer_quick', label: 'Struktur Organisasi', url: '/profil/struktur', order: 2 },
  { location: 'footer_quick', label: 'Data Bencana', url: '/informasi/data', order: 3 },
  { location: 'footer_quick', label: 'Regulasi & Aturan', url: '/ppid/regulasi', order: 4 },
  { location: 'footer_quick', label: 'Download Center', url: '/unduhan', order: 5 },
  { location: 'footer_quick', label: 'FAQ', url: '/faq', order: 6 },

  // Footer Instansi
  {
    location: 'footer_instansi',
    label: 'BNPB Pusat',
    url: 'https://bnpb.go.id',
    target: '_blank',
    order: 1,
  },
  {
    location: 'footer_instansi',
    label: 'Pemprov Kaltim',
    url: 'https://kaltimprov.go.id',
    target: '_blank',
    order: 2,
  },
  {
    location: 'footer_instansi',
    label: 'BMKG Kaltim',
    url: 'https://bmkg.go.id',
    target: '_blank',
    order: 3,
  },
  {
    location: 'footer_instansi',
    label: 'Basarnas Kaltim',
    url: 'https://basarnas.go.id',
    target: '_blank',
    order: 4,
  },
  {
    location: 'footer_instansi',
    label: 'Kementerian PUPR',
    url: 'https://pu.go.id',
    target: '_blank',
    order: 5,
  },
  {
    location: 'footer_instansi',
    label: 'BPSDM Kaltim',
    url: 'https://bpsdm.kaltimprov.go.id',
    target: '_blank',
    order: 6,
  },
]
