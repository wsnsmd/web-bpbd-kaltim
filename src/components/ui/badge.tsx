// src/components/ui/badge.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // ── Kategori berita ──────────────────────────────────────────
        // Pakai token yang terdaftar di @theme: navy-*, orange-*, gold-*
        kegiatan: 'bg-gold-100 text-gold-800',
        mitigasi: 'bg-orange-50 text-orange-800',
        informasi: 'bg-navy-50 text-navy-700',
        darurat: 'bg-red-50 text-red-700',
        edukasi: 'bg-navy-100 text-navy-800',

        // ── Status bencana — CSS var langsung ────────────────────────
        // (CSS custom properties tidak bisa dipakai sebagai Tailwind token
        //  kecuali didaftarkan di @theme, jadi pakai arbitrary value)
        danger: 'bg-[var(--danger-light)]  text-[var(--danger-text)]',
        warning: 'bg-[var(--warning-light)] text-[var(--warning-text)]',
        caution: 'bg-[var(--caution-light)] text-[var(--caution-text)]',
        safe: 'bg-[var(--safe-light)]    text-[var(--safe-text)]',

        // ── Generic shadcn ───────────────────────────────────────────
        default: 'bg-secondary text-secondary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        outline: 'border border-border text-foreground bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
