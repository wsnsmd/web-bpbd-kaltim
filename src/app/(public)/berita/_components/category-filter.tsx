// src/app/(public)/berita/_components/category-filter.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  slug: string
  color: string | null
}

interface Props {
  categories: Category[]
  activeSlug?: string
}

export function CategoryFilter({ categories, activeSlug }: Props) {
  if (categories.length === 0) return null

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link
        href="/berita"
        className={cn(
          'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
          !activeSlug
            ? 'border-navy-600 bg-navy-600 text-white'
            : 'border-border text-muted-foreground hover:border-navy-300 hover:text-navy-700'
        )}
      >
        Semua
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/berita?kategori=${cat.slug}`}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            activeSlug === cat.slug
              ? 'border-transparent text-white'
              : 'border-border text-muted-foreground hover:text-navy-700'
          )}
          style={
            activeSlug === cat.slug
              ? { background: cat.color ?? '#1b56a8', borderColor: cat.color ?? '#1b56a8' }
              : {}
          }
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
