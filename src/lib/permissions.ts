// src/lib/permissions.ts
// Definisi permission per role dan helper functions

export type Role = 'super_admin' | 'admin' | 'operator' | 'editor' | 'viewer'

// ── Permission matrix ─────────────────────────────────────────
// true = boleh, false = tidak boleh
export const PERMISSIONS = {
  // Dashboard
  'dashboard.view': ['super_admin', 'admin', 'operator', 'editor', 'viewer'],

  // Kejadian Bencana
  'incidents.view': ['super_admin', 'admin', 'operator', 'viewer'],
  'incidents.create': ['super_admin', 'admin', 'operator'],
  'incidents.edit': ['super_admin', 'admin', 'operator'],
  'incidents.delete': ['super_admin', 'admin'],
  'incidents.publish': ['super_admin', 'admin', 'operator'],
  'incidents.timeline': ['super_admin', 'admin', 'operator'],

  // Master Data
  'master_data.view': ['super_admin', 'admin', 'operator'],
  'master_data.manage': ['super_admin', 'admin'],

  // Berita & Konten
  'news.view': ['super_admin', 'admin', 'editor', 'viewer'],
  'news.create': ['super_admin', 'admin', 'editor'],
  'news.edit': ['super_admin', 'admin', 'editor'],
  'news.delete': ['super_admin', 'admin'],
  'news.publish': ['super_admin', 'admin', 'editor'],

  // Media
  'media.view': ['super_admin', 'admin', 'editor'],
  'media.upload': ['super_admin', 'admin', 'editor'],
  'media.delete': ['super_admin', 'admin'],

  // Unduhan
  'downloads.view': ['super_admin', 'admin', 'editor', 'viewer'],
  'downloads.manage': ['super_admin', 'admin', 'editor'],

  // Galeri
  'gallery.view': ['super_admin', 'admin', 'editor', 'viewer'],
  'gallery.manage': ['super_admin', 'admin', 'editor'],

  // Layanan, FAQ, Pengumuman
  'services.manage': ['super_admin', 'admin', 'editor'],
  'faq.manage': ['super_admin', 'admin', 'editor'],
  'announcements.manage': ['super_admin', 'admin', 'editor'],

  // Halaman Statis
  'pages.view': ['super_admin', 'admin', 'editor'],
  'pages.manage': ['super_admin', 'admin', 'editor'],

  // Navigasi
  'navigation.manage': ['super_admin', 'admin'],

  // Hero Section
  'hero.manage': ['super_admin', 'admin'],

  // Statistik Pengunjung
  'analytics.view': ['super_admin', 'admin'],

  // Pengaturan Situs
  'settings.view': ['super_admin'],
  'settings.manage': ['super_admin'],

  // Manajemen Pengguna
  'users.view': ['super_admin'],
  'users.create': ['super_admin'],
  'users.edit': ['super_admin'],
  'users.delete': ['super_admin'],
  'users.assign_roles': ['super_admin'],
} as const

export type Permission = keyof typeof PERMISSIONS

// ── Helper: cek apakah user punya permission ──────────────────
export function hasPermission(userRoles: string[], permission: Permission): boolean {
  const allowed = PERMISSIONS[permission] as readonly string[]
  return userRoles.some((role) => allowed.includes(role))
}

// ── Helper: cek apakah user punya salah satu dari banyak permission ──
export function hasAnyPermission(userRoles: string[], permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(userRoles, p))
}

// ── Helper: cek role langsung ────────────────────────────────
export function hasRole(userRoles: string[], role: Role): boolean {
  return userRoles.includes(role)
}

export function isSuperAdmin(userRoles: string[]): boolean {
  return userRoles.includes('super_admin')
}

// ── Route permission map (untuk middleware) ───────────────────
export const ROUTE_PERMISSIONS: { pattern: RegExp; permission: Permission }[] = [
  { pattern: /^\/admin\/users/, permission: 'users.view' },
  { pattern: /^\/admin\/settings/, permission: 'settings.view' },
  { pattern: /^\/admin\/analytics/, permission: 'analytics.view' },
  { pattern: /^\/admin\/navigation/, permission: 'navigation.manage' },
  { pattern: /^\/admin\/hero/, permission: 'hero.manage' },
  { pattern: /^\/admin\/incidents/, permission: 'incidents.view' },
  { pattern: /^\/admin\/master-data/, permission: 'master_data.view' },
  { pattern: /^\/admin\/news/, permission: 'news.view' },
  { pattern: /^\/admin\/media/, permission: 'media.view' },
  { pattern: /^\/admin\/downloads/, permission: 'downloads.view' },
  { pattern: /^\/admin\/gallery/, permission: 'gallery.view' },
  { pattern: /^\/admin\/services/, permission: 'services.manage' },
  { pattern: /^\/admin\/faq/, permission: 'faq.manage' },
  { pattern: /^\/admin\/announcements/, permission: 'announcements.manage' },
  { pattern: /^\/admin\/pages/, permission: 'pages.view' },
]
