// src/components/ui/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils' // Pastikan path import sesuai dengan alias Anda (@/ atau @lib/)

const buttonVariants = cva(
  // Base style: Ditambahkan 'duration-300 ease-out' untuk transisi glow/glass yang halus
  // serta 'active:scale-[0.98]' untuk efek ditekan
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Navy — Glow effect
        default:
          'bg-navy-700 text-white shadow-sm hover:bg-navy-600 hover:shadow-[0_0_20px_var(--color-navy-400)] hover:-translate-y-0.5',

        // Orange — Glow effect
        accent:
          'bg-orange-500 text-white shadow-sm hover:bg-orange-400 hover:shadow-[0_0_20px_var(--color-orange-400)] hover:-translate-y-0.5',

        // Emergency — Pulse animation akan berhenti saat hover, diganti dengan glow kuat
        emergency:
          'bg-orange-600 text-white uppercase tracking-wide shadow-md animate-pulse-slow hover:bg-orange-500 hover:shadow-[0_0_25px_var(--color-orange-500)] hover:-translate-y-0.5 hover:animate-none',

        // 🆕 Glassmorphism — Cocok di atas Peta atau Hero Image
        glass:
          'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:-translate-y-0.5',

        // 🆕 Glass Dark — Versi gelap untuk background terang
        'glass-dark':
          'bg-navy-900/5 backdrop-blur-md border border-navy-900/10 text-navy-900 hover:bg-navy-900/10 hover:shadow-[0_8px_32px_rgba(10,22,40,0.1)] hover:-translate-y-0.5',

        // Secondary
        secondary:
          'bg-navy-50 text-navy-700 border border-navy-200 hover:bg-navy-100 hover:shadow-md hover:-translate-y-0.5',

        // Ghost — Ditambahkan sedikit efek glass saat hover
        ghost: 'text-navy-700 hover:bg-navy-500/10 hover:backdrop-blur-sm',

        // Outline
        outline:
          'border border-border bg-background text-foreground hover:bg-muted hover:shadow-sm',

        // Gold — Glow effect
        gold: 'bg-gold-400 text-gold-950 shadow-sm hover:bg-gold-300 hover:shadow-[0_0_15px_var(--color-gold-400)] hover:-translate-y-0.5',

        // Destructive
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-[0_0_15px_var(--color-destructive)] hover:-translate-y-0.5',

        // Link
        link: 'text-navy-600 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-9 px-4 py-2',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
