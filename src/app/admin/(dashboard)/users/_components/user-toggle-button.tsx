// src/app/admin/(dashboard)/users/_components/user-toggle-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, UserX, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { toggleUserActiveAction } from '../_actions/user-actions'

interface Props {
  id: string
  name: string
  isActive: boolean
  isSelf: boolean
}

export function UserToggleButton({ id, name, isActive, isSelf }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const res = await toggleUserActiveAction(id, !isActive)
    setLoading(false)
    if (res.success) {
      toast.success(isActive ? `${name} dinonaktifkan` : `${name} diaktifkan`)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Gagal mengubah status')
    }
  }

  if (isSelf) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button variant="ghost" size="icon-sm" disabled>
              <UserCheck className="h-3.5 w-3.5" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Tidak dapat menonaktifkan akun sendiri</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleToggle}
          disabled={loading}
          className={
            isActive
              ? 'text-destructive hover:text-destructive'
              : 'text-green-600 hover:text-green-700'
          }
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isActive ? (
            <UserX className="h-3.5 w-3.5" />
          ) : (
            <UserCheck className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isActive ? 'Nonaktifkan pengguna' : 'Aktifkan pengguna'}</TooltipContent>
    </Tooltip>
  )
}
