// src/components/shared/news-card.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@components/ui/badge'
import { formatDate } from '@lib/utils'
import { cn } from '@lib/utils'
import type { BadgeProps } from '@components/ui/badge'

// Map slug kategori ke variant Badge
const CATEGORY_VARIANT: Record<string, BadgeProps['variant']> = {
  kegiatan: 'kegiatan',
  mitigasi: 'mitigasi',
  informasi: 'informasi',
  darurat: 'darurat',
  edukasi: 'edukasi',
}

interface NewsCardProps {
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: string | null
  categoryName?: string | null
  categorySlug?: string | null
  authorName?: string | null
  publishedAt?: Date | string | null
  featured?: boolean // card besar di grid
  className?: string
}

export function NewsCard({
  title,
  slug,
  excerpt,
  featuredImage,
  categoryName,
  categorySlug,
  authorName,
  publishedAt,
  // featured = false,
  className,
}: NewsCardProps) {
  const badgeVariant = CATEGORY_VARIANT[categorySlug ?? ''] ?? 'default'

  return (
    <Link
      href={`/berita/${slug}`}
      className={cn(
        'group border-border bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-2xl border',
        'hover:border-navy-300 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {/* Container Gambar: Sekarang akan menempel rapat ke batas atas */}
      <div className={cn('bg-muted relative h-60 w-full shrink-0 overflow-hidden')}>
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="from-navy-100 to-navy-200 absolute inset-0 bg-linear-to-br" />
        )}

        {/* Overlay gradient untuk memastikan Badge / teks tetap terbaca */}
        <div className="from-navy-950/70 absolute inset-0 bg-linear-to-t via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badge Kategori */}
        {categoryName && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant={badgeVariant} className="font-semibold tracking-wide shadow-sm">
              {categoryName}
            </Badge>
          </div>
        )}
      </div>

      {/* Konten Teks: `grow` akan mengisi ruang sisa sehingga Footer terdorong mentok ke bawah */}
      <div className="flex grow flex-col p-5">
        <h3
          className={cn(
            'text-foreground group-hover:text-navy-600 mb-2 line-clamp-2 text-sm leading-snug font-bold transition-colors'
          )}
        >
          {title}
        </h3>

        {excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-2 text-xs leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Footer (Penulis & Tanggal): `mt-auto` memastikannya selalu rata sejajar dengan kartu lain */}
        <div className="border-border text-muted-foreground mt-auto flex items-center justify-between border-t pt-4 text-[11px]">
          {authorName && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="bg-navy-100 text-navy-600 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold">
                {authorName.charAt(0).toUpperCase()}
              </span>
              {authorName}
            </span>
          )}
          {publishedAt && <span className="font-medium">{formatDate(publishedAt)}</span>}
        </div>
      </div>
    </Link>
  )
}
