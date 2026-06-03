// src/components/shared/stat-card.tsx
import { cn } from '@lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon?: LucideIcon
  accentColor?: 'navy' | 'orange' | 'gold' | 'green'
  pill?: { text: string; variant: 'good' | 'warn' | 'info' }
  className?: string
}

const ACCENT = {
  navy: { border: 'border-navy-700', icon: 'bg-navy-50 text-navy-600' },
  orange: { border: 'border-brand-500', icon: 'bg-brand-50 text-brand-600' },
  gold: { border: 'border-gold-400', icon: 'bg-gold-50 text-gold-600' },
  green: { border: 'border-green-500', icon: 'bg-green-50 text-green-600' },
}

const PILL_STYLE = {
  good: 'bg-[var(--safe-light)] text-[var(--safe-text)]',
  warn: 'bg-[var(--warning-light)] text-[var(--warning-text)]',
  info: 'bg-[var(--caution-light)] text-[var(--caution-text)]',
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accentColor = 'navy',
  pill,
  className,
}: StatCardProps) {
  const accent = ACCENT[accentColor]
  return (
    <div
      className={cn(
        'bg-card border-border rounded-xl border border-l-4 p-5',
        accent.border,
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
          {label}
        </p>
        {Icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accent.icon)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="text-navy-800 mb-1 text-3xl leading-none font-bold tracking-tight">{value}</p>
      {description && (
        <p className="text-muted-foreground mt-1 text-xs">
          {description}
          {pill && (
            <span
              className={cn(
                'ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold',
                PILL_STYLE[pill.variant]
              )}
            >
              {pill.text}
            </span>
          )}
        </p>
      )}
    </div>
  )
}
