// database/schema/incidents.ts
import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  datetime,
  date,
  time,
  mysqlEnum,
  decimal,
  index,
} from 'drizzle-orm/mysql-core'
import { sql, relations } from 'drizzle-orm'
import { users } from './users'

// ─────────────────────────────────────────────────────────────
// 1. MASTER JENIS BENCANA (dinamis — bisa tambah/kurang di DB)
// ─────────────────────────────────────────────────────────────
export const disasterTypes = mysqlTable('disaster_types', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(), // "Banjir", "Kebakaran"
  category: mysqlEnum('category', ['alam', 'non_alam']).notNull().default('alam'),
  icon: varchar('icon', { length: 10 }).default('⚠️'), // emoji
  color: varchar('color', { length: 7 }).default('#6b7592'), // hex
  isActive: boolean('is_active').default(true),
  sortOrder: int('sort_order').default(0),
})

// ─────────────────────────────────────────────────────────────
// 2. MASTER PENYEBAB (dinamis)
// ─────────────────────────────────────────────────────────────
export const disasterCauses = mysqlTable('disaster_causes', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
})

// ─────────────────────────────────────────────────────────────
// 3. MASTER WILAYAH (hierarki Prov → Kab/Kota → Kecamatan)
// ─────────────────────────────────────────────────────────────
export const regions = mysqlTable(
  'regions',
  {
    id: varchar('id', { length: 10 }).primaryKey(), // kode BPS: 64, 6471, 647107, 64710701
    name: varchar('name', { length: 100 }).notNull(),
    level: mysqlEnum('level', ['provinsi', 'kabkota', 'kecamatan', 'kelurahan']).notNull(),
    parentId: varchar('parent_id', { length: 10 }),
  },
  (t) => ({
    parentIdx: index('regions_parent_idx').on(t.parentId),
    levelIdx: index('regions_level_idx').on(t.level),
  })
)

// ─────────────────────────────────────────────────────────────
// 4. TABEL UTAMA KEJADIAN BENCANA
// ─────────────────────────────────────────────────────────────
export const incidents = mysqlTable(
  'incidents',
  {
    id: int('id').primaryKey().autoincrement(),

    // Identitas
    title: varchar('title', { length: 255 }).notNull(),
    disasterTypeId: int('disaster_type_id').references(() => disasterTypes.id, {
      onDelete: 'set null',
    }),
    causeId: int('cause_id').references(() => disasterCauses.id, { onDelete: 'set null' }),
    causeDetail: varchar('cause_detail', { length: 255 }), // detail bebas jika "lainnya"
    description: text('description'), // kronologis
    source: varchar('source', { length: 255 }), // BPBD/BMKG/Disdamkar

    // Waktu
    occurredDate: date('occurred_date').notNull(),
    occurredTime: time('occurred_time'),

    // Lokasi administratif (FK ke regions)
    provinceId: varchar('province_id', { length: 10 }).default('64'),
    regencyId: varchar('regency_id', { length: 10 }),
    districtId: varchar('district_id', { length: 10 }),
    villageId: varchar('village_id', { length: 10 }).references(() => regions.id, {
      onDelete: 'set null',
    }),
    villageName: varchar('village_name', { length: 100 }), // desa/kelurahan (teks bebas)
    addressDetail: varchar('address_detail', { length: 500 }), // alamat rinci

    // Koordinat GPS — WAJIB untuk peta
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),

    // Status & kondisi terkini
    status: mysqlEnum('status', ['aktif', 'ditangani', 'selesai']).default('aktif'),
    currentCondition: varchar('current_condition', { length: 255 }), // kondisi mutakhir
    currentEffort: text('current_effort'), // upaya terkini

    // Publikasi
    isPublished: boolean('is_published').default(true),
    reportedBy: varchar('reported_by', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: datetime('created_at').default(sql`NOW()`),
    updatedAt: datetime('updated_at').default(sql`NOW()`),
  },
  (t) => ({
    typeIdx: index('incidents_type_idx').on(t.disasterTypeId),
    statusIdx: index('incidents_status_idx').on(t.status),
    regencyIdx: index('incidents_regency_idx').on(t.regencyId),
    villageIdx: index('incidents_village_idx').on(t.villageId),
    dateIdx: index('incidents_date_idx').on(t.occurredDate),
  })
)

// ─────────────────────────────────────────────────────────────
// 5. TABEL KORBAN (normalisasi per kategori dampak × usia × gender)
// ─────────────────────────────────────────────────────────────
export const incidentVictims = mysqlTable(
  'incident_victims',
  {
    id: int('id').primaryKey().autoincrement(),
    incidentId: int('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    impactType: mysqlEnum('impact_type', [
      'meninggal',
      'hilang',
      'luka_sakit',
      'menderita',
      'mengungsi',
    ]).notNull(),
    ageGroup: mysqlEnum('age_group', ['anak', 'dewasa', 'lansia', 'tidak_diketahui']).default(
      'tidak_diketahui'
    ),
    countMale: int('count_male').default(0),
    countFemale: int('count_female').default(0),
    countTotal: int('count_total').default(0), // auto = male + female
    notes: varchar('notes', { length: 255 }),
  },
  (t) => ({
    incidentIdx: index('victims_incident_idx').on(t.incidentId),
  })
)

// ─────────────────────────────────────────────────────────────
// 6. TABEL KERUGIAN MATERIAL
// ─────────────────────────────────────────────────────────────
export const incidentDamages = mysqlTable(
  'incident_damages',
  {
    id: int('id').primaryKey().autoincrement(),
    incidentId: int('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    assetName: varchar('asset_name', { length: 100 }).notNull(), // Rumah, Jembatan, Sekolah
    heavyDamage: int('heavy_damage').default(0), // Rusak Berat
    moderateDamage: int('moderate_damage').default(0), // Rusak Sedang
    lightDamage: int('light_damage').default(0), // Rusak Ringan
    estimatedLoss: decimal('estimated_loss', { precision: 15, scale: 2 }).default('0'), // Taksiran kerugian Rp
    notes: varchar('notes', { length: 255 }),
  },
  (t) => ({
    incidentIdx: index('damages_incident_idx').on(t.incidentId),
  })
)

// ─────────────────────────────────────────────────────────────
// 7. TABEL TIMELINE / HISTORY PENANGANAN
// ─────────────────────────────────────────────────────────────
export const incidentTimelines = mysqlTable(
  'incident_timelines',
  {
    id: int('id').primaryKey().autoincrement(),
    incidentId: int('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    loggedAt: datetime('logged_at')
      .notNull()
      .default(sql`NOW()`),
    eventType: mysqlEnum('event_type', [
      'laporan_awal', // Laporan pertama masuk
      'verifikasi', // Data diverifikasi
      'pengerahan', // Tim/sumber daya dikerahkan
      'penanganan', // Update penanganan
      'kondisi_update', // Update kondisi lapangan
      'korban_update', // Update data korban
      'selesai', // Dinyatakan selesai
      'catatan', // Catatan umum
    ]).default('catatan'),
    title: varchar('title', { length: 255 }).notNull(), // Ringkasan event
    description: text('description'), // Detail narasi
    statusBefore: mysqlEnum('status_before', ['aktif', 'ditangani', 'selesai']),
    statusAfter: mysqlEnum('status_after', ['aktif', 'ditangani', 'selesai']),
    createdBy: varchar('created_by', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: datetime('created_at').default(sql`NOW()`),
  },
  (t) => ({
    incidentIdx: index('timelines_incident_idx').on(t.incidentId),
    loggedIdx: index('timelines_logged_idx').on(t.loggedAt),
  })
)

// ─────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────
export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  disasterType: one(disasterTypes, {
    fields: [incidents.disasterTypeId],
    references: [disasterTypes.id],
  }),
  cause: one(disasterCauses, { fields: [incidents.causeId], references: [disasterCauses.id] }),
  regency: one(regions, { fields: [incidents.regencyId], references: [regions.id] }),
  village: one(regions, { fields: [incidents.villageId], references: [regions.id] }),
  reporter: one(users, { fields: [incidents.reportedBy], references: [users.id] }),
  victims: many(incidentVictims),
  damages: many(incidentDamages),
  timelines: many(incidentTimelines),
}))

export const incidentVictimsRelations = relations(incidentVictims, ({ one }) => ({
  incident: one(incidents, { fields: [incidentVictims.incidentId], references: [incidents.id] }),
}))

export const incidentDamagesRelations = relations(incidentDamages, ({ one }) => ({
  incident: one(incidents, { fields: [incidentDamages.incidentId], references: [incidents.id] }),
}))

export const incidentTimelinesRelations = relations(incidentTimelines, ({ one }) => ({
  incident: one(incidents, { fields: [incidentTimelines.incidentId], references: [incidents.id] }),
  creator: one(users, { fields: [incidentTimelines.createdBy], references: [users.id] }),
}))

export const disasterTypesRelations = relations(disasterTypes, ({ many }) => ({
  incidents: many(incidents),
}))

export const regionsRelations = relations(regions, ({ one, many }) => ({
  parent: one(regions, { fields: [regions.parentId], references: [regions.id] }),
  children: many(regions),
}))

// ─────────────────────────────────────────────────────────────
// SEED DATA — Jenis Bencana default (jalankan sekali)
// ─────────────────────────────────────────────────────────────
export const DEFAULT_DISASTER_TYPES = [
  { name: 'Banjir', category: 'alam' as const, icon: '🌊', color: '#2e72c9', sortOrder: 1 },
  { name: 'Tanah Longsor', category: 'alam' as const, icon: '⛰️', color: '#8b5e3c', sortOrder: 2 },
  { name: 'Gempa Bumi', category: 'alam' as const, icon: '🏚️', color: '#c98b00', sortOrder: 3 },
  { name: 'Cuaca Ekstrem', category: 'alam' as const, icon: '⛈️', color: '#6b7592', sortOrder: 4 },
  { name: 'Karhutla', category: 'alam' as const, icon: '🌫️', color: '#f46a1a', sortOrder: 5 },
  {
    name: 'Gelombang Tinggi/Abrasi',
    category: 'alam' as const,
    icon: '🌊',
    color: '#1b7fc4',
    sortOrder: 6,
  },
  { name: 'Kekeringan', category: 'alam' as const, icon: '☀️', color: '#e5aa0d', sortOrder: 7 },
  { name: 'Kebakaran', category: 'non_alam' as const, icon: '🔥', color: '#e85000', sortOrder: 8 },
  { name: 'Lain-Lain', category: 'non_alam' as const, icon: '⚠️', color: '#6b7592', sortOrder: 9 },
]

export const DEFAULT_DISASTER_CAUSES = [
  { name: 'Hujan Sedang - Lebat' },
  { name: 'Hujan Sedang - Lebat & Angin Kencang' },
  { name: 'Angin Kencang' },
  { name: 'Gempa Tektonik' },
  { name: 'Pembakaran Lahan' },
  { name: 'Konsleting Listrik' },
  { name: 'Kompor Terbakar' },
  { name: 'Kebakaran Genset' },
  { name: 'Diterkam Buaya' },
  { name: 'Terjatuh dari Kapal' },
  { name: 'Kelebihan Kapasitas' },
  { name: 'Dalam Penyelidikan' },
  { name: 'Lainnya' },
]

export const DEFAULT_KABKOTA_KALTIM = [
  { id: '6401', name: 'Paser', level: 'kabkota' as const, parentId: '64' },
  { id: '6402', name: 'Kutai Barat', level: 'kabkota' as const, parentId: '64' },
  { id: '6403', name: 'Kutai Kartanegara', level: 'kabkota' as const, parentId: '64' },
  { id: '6404', name: 'Kutai Timur', level: 'kabkota' as const, parentId: '64' },
  { id: '6405', name: 'Berau', level: 'kabkota' as const, parentId: '64' },
  { id: '6409', name: 'Penajam Paser Utara', level: 'kabkota' as const, parentId: '64' },
  { id: '6411', name: 'Mahakam Ulu', level: 'kabkota' as const, parentId: '64' },
  { id: '6471', name: 'Samarinda', level: 'kabkota' as const, parentId: '64' },
  { id: '6472', name: 'Balikpapan', level: 'kabkota' as const, parentId: '64' },
  { id: '6474', name: 'Bontang', level: 'kabkota' as const, parentId: '64' },
]
