// src/app/(public)/profil/_components/profil-nav-link.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  href: string
  label: string
}

export function ProfilNavLink({ href, label }: Props) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
        active ? 'bg-navy-800 text-white' : 'hover:text-navy-800 text-slate-600 hover:bg-slate-50'
      )}
    >
      <span>{label}</span>
      {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
    </Link>
  )
}
