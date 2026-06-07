// src/app/admin/(dashboard)/users/_components/user-edit-button.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { UserForm } from './user-form'
import { updateUserAction, getRolesAction } from '../_actions/user-actions'

interface Props {
  user: { id: string; name: string; email: string; roleSlug: string | null }
}

export function UserEditButton({ user }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    if (open && roles.length === 0) {
      getRolesAction().then((r) => {
        setRoles(r)
      })
    }
  }, [open, roles.length])

  async function handleSubmit(values: any) {
    const res = await updateUserAction(user.id, values)
    if (res.success) {
      toast.success('Pengguna berhasil diperbarui')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  const currentRole = roles.find((r) => r.slug === user.roleSlug)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
        </DialogHeader>
        <UserForm
          mode="edit"
          roles={roles}
          defaultValues={{
            name: user.name,
            email: user.email,
            roleId: currentRole?.id,
          }}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
