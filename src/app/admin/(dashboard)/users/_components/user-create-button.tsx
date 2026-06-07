// src/app/admin/(dashboard)/users/_components/user-create-button.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
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
import { createUserAction, getRolesAction } from '../_actions/user-actions'

export function UserCreateButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    if (open && roles.length === 0) {
      getRolesAction().then(setRoles)
    }
  }, [open, roles.length])

  async function handleSubmit(values: any) {
    const res = await createUserAction(values)
    if (res.success) {
      toast.success('Pengguna berhasil dibuat')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna</DialogTitle>
        </DialogHeader>
        <UserForm mode="create" roles={roles} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
