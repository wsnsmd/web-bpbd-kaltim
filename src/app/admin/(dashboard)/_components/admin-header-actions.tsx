// src/app/admin/(dashboard)/_components/admin-header-actions.tsx
'use client'

import Link from 'next/link'
import { Bell, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'

interface Props {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AdminHeaderActions({ user }: Props) {
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'AD'

  return (
    <div className="flex items-center gap-2">
      {/* Lihat halaman publik */}
      <Button variant="ghost" size="icon-sm" asChild>
        <Link href="/" target="_blank" title="Lihat situs publik">
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>

      {/* Notifikasi */}
      <Button variant="ghost" size="icon-sm" title="Notifikasi">
        <Bell className="h-4 w-4" />
      </Button>

      {/* User avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-full">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
              <AvatarFallback className="bg-navy-700 text-xs text-white">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/settings/profile">Profil Saya</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
