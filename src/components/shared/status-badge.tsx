// src/components/shared/status-badge.tsx
import { cn } from '@lib/utils'

type StatusLevel = 'safe' | 'caution' | 'warning' | 'danger'

const STATUS_CONFIG: Record<StatusLevel, { label: string; dot: string; bg: string; text: string }> =
  {
    safe: {
      label: 'Normal / Aman',
      dot: 'bg-green-500',
      bg: 'bg-[var(--safe-light)]',
      text: 'text-[var(--safe-text)]',
    },
    caution: {
      label: 'Siaga',
      dot: 'bg-blue-500',
      bg: 'bg-[var(--caution-light)]',
      text: 'text-[var(--caution-text)]',
    },
    warning: {
      label: 'Waspada',
      dot: 'bg-amber-500',
      bg: 'bg-[var(--warning-light)]',
      text: 'text-[var(--warning-text)]',
    },
    danger: {
      label: 'Awas / Darurat',
      dot: 'bg-red-500',
      bg: 'bg-[var(--danger-light)]',
      text: 'text-[var(--danger-text)]',
    },
  }

interface StatusBadgeProps {
  level: StatusLevel
  className?: string
  showDot?: boolean
}

export function StatusBadge({ level, className, showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        config.bg,
        config.text,
        className
      )}
    >
      {showDot && (
        <span className={cn('animate-pulse-slow h-1.5 w-1.5 rounded-full', config.dot)} />
      )}
      {config.label}
    </span>
  )
}
