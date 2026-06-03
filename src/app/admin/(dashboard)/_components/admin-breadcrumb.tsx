// src/app/admin/(dashboard)/_components/admin-breadcrumb.tsx
'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React from 'react'

// Peta path segment → label bahasa Indonesia
const LABELS: Record<string, string> = {
  admin: 'Dashboard',
  news: 'Berita',
  categories: 'Kategori',
  create: 'Tambah',
  edit: 'Edit',
  media: 'Media Library',
  users: 'Pengguna',
  settings: 'Pengaturan',
  profile: 'Profil',
  pages: 'Halaman',
  navigation: 'Navigasi',
}

function getLabel(segment: string): string {
  // Jika UUID/ID (36 char atau angka), sembunyikan
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return '...'
  return LABELS[segment] ?? segment.replace(/-/g, ' ')
}

export function AdminBreadcrumb() {
  const pathname = usePathname()

  // Contoh: /admin/news/categories → ['admin', 'news', 'categories']
  const segments = pathname.split('/').filter(Boolean)

  // Bangun item breadcrumb dengan href kumulatif
  const crumbs = segments.map((seg, i) => ({
    label: getLabel(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <Breadcrumb className="flex-1">
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="capitalize">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href} className="capitalize">
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
