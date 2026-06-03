// src/components/ui/card.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  // Base style: Ditambahkan transisi agar efek hover halus
  'group/card flex flex-col gap-8 overflow-hidden py-8 text-sm text-card-foreground shadow-sm ring-1 ring-foreground/5 has-[>img:first-child]:pt-0 data-[size=sm]:gap-5 data-[size=sm]:py-5 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        // Default: Kartu standar dengan efek angkat (elevate) ringan
        default: 'bg-card hover:shadow-md hover:-translate-y-1 hover:ring-foreground/15',

        // Glow Navy: Pendaran biru saat di-hover (cocok untuk dashboard utama)
        'glow-navy':
          'bg-card hover:shadow-[0_0_30px_var(--color-navy-400)] hover:ring-navy-400/50 hover:-translate-y-1',

        // Glow Orange: Pendaran oranye untuk kartu peringatan / darurat
        'glow-orange':
          'bg-card hover:shadow-[0_0_30px_var(--color-orange-500)] hover:ring-orange-500/50 hover:-translate-y-1',

        // Glass: Efek kaca transparan (sangat cocok jika diletakkan di atas Leaflet/Google Maps)
        glass:
          'bg-white/10 backdrop-blur-md ring-white/20 text-white hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:-translate-y-1',

        // Glass Dark: Versi gelap untuk background terang
        'glass-dark':
          'bg-navy-900/5 backdrop-blur-md ring-navy-900/10 text-navy-900 hover:bg-navy-900/10 hover:shadow-[0_8px_32px_rgba(10,22,40,0.1)] hover:-translate-y-1',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface CardProps extends React.ComponentProps<'div'>, VariantProps<typeof cardVariants> {
  size?: 'default' | 'sm'
}

function Card({ className, size = 'default', variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-none px-8 group-data-[size=sm]/card:px-5 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-8 group-data-[size=sm]/card:[.border-b]:pb-5',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // Menambahkan transisi agar warna teks bisa berubah mulus jika diperlukan saat hover
        'font-heading text-lg font-semibold tracking-wider uppercase transition-colors duration-300',
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'text-muted-foreground text-sm leading-relaxed transition-colors duration-300',
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-8 group-data-[size=sm]/card:px-5', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center px-8 group-data-[size=sm]/card:px-5 [.border-t]:pt-8 group-data-[size=sm]/card:[.border-t]:pt-5',
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
