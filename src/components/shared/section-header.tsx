// src/components/shared/section-header.tsx
import { cn } from '@lib/utils'

interface SectionHeaderProps {
  kicker?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  dark?: boolean // untuk section gelap (navy background)
}

export function SectionHeader({
  kicker,
  title,
  description,
  align = 'center',
  className,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-10', align === 'center' && 'text-center', className)}>
      {kicker && (
        <div
          className={cn(
            'mb-2 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase',
            dark ? 'text-gold-300' : 'text-brand-600'
          )}
        >
          <span className={cn('h-0.5 w-5 rounded-full', dark ? 'bg-gold-400' : 'bg-brand-500')} />
          {kicker}
        </div>
      )}
      <h2
        className={cn(
          'text-2xl leading-tight font-bold tracking-tight md:text-[1.75rem]',
          dark ? 'text-white' : 'text-navy-800'
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-2 max-w-lg text-sm leading-relaxed',
            align === 'center' && 'mx-auto',
            dark ? 'text-navy-400' : 'text-muted-foreground'
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
