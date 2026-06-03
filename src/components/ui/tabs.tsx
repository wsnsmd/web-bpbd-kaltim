'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import * as TabsPrimitive from '@radix-ui/react-tabs' // Pastikan import dari @radix-ui/react-tabs

import { cn } from '@/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex flex-col gap-2', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center p-1 text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'bg-muted rounded-lg',
        line: 'gap-1 bg-transparent border-b border-[var(--color-border)] rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider whitespace-nowrap uppercase transition-all disabled:pointer-events-none disabled:opacity-50',
        // Gaya standar hover
        'hover:text-navy-700 focus-visible:ring-navy-400 text-slate-500 focus-visible:ring-2 focus-visible:outline-none',
        // Gaya saat aktif (Active State)
        'data-[state=active]:text-navy-700 data-[state=active]:font-bold',
        // Varian Line: Menggunakan border bawah warna Navy
        'group-data-[variant=line]/tabs-list:data-[state=active]:border-navy-700 group-data-[variant=line]/tabs-list:data-[state=active]:text-navy-700 group-data-[variant=line]/tabs-list:data-[state=active]:border-b-2',
        // Varian Default: Menggunakan background Navy-50
        'group-data-[variant=default]/tabs-list:data-[state=active]:bg-navy-50 group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
