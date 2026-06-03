// src/components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-border flex h-10 w-full min-w-0 border-b bg-transparent px-3 py-1 text-base transition-all outline-none',
        'placeholder:text-muted-foreground file:text-sm file:font-medium',
        'focus-visible:border-b-navy-700 focus-visible:ring-0',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-b-destructive aria-invalid:focus-visible:border-b-destructive',
        'md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Input }
