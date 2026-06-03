// src/components/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@components/ui/sonner'
import { TooltipProvider } from '@components/ui/tooltip'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 menit
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'bg-card border border-border text-foreground',
            success: 'text-green-700',
            error: 'text-destructive',
          },
        }}
      />
    </QueryClientProvider>
  )
}
