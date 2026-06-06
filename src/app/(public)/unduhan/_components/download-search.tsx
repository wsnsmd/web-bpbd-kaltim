// src/app/(public)/unduhan/_components/download-search.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  defaultValue?: string
  compact?: boolean // mode compact untuk filter bar
}

export function DownloadSearch({ defaultValue, compact }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue ?? '')
  const [, startTransition] = useTransition()

  function handleSearch(val: string) {
    setValue(val)
    startTransition(() => {
      const params = new URLSearchParams()
      if (val.trim()) params.set('q', val.trim())
      router.push(`/unduhan?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <Search
        className={cn(
          'absolute top-1/2 left-3 -translate-y-1/2 text-slate-400',
          compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
        )}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Cari dokumen..."
        className={cn(
          'bg-slate-100 pr-8 pl-8 text-sm transition outline-none',
          'focus:ring-navy-200 placeholder:text-slate-400 focus:bg-white focus:ring-2',
          compact
            ? 'w-44 rounded-full border-0 py-1.5 text-xs focus:w-56'
            : 'border-border focus:border-navy-400 w-full rounded-lg border bg-white py-2.5 shadow-sm'
        )}
      />
      {value && (
        <button
          onClick={() => handleSearch('')}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
