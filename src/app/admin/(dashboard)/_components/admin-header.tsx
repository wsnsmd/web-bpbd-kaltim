// src/app/admin/(dashboard)/_components/admin-header.tsx
import { auth } from '@/lib/auth'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AdminHeaderActions } from './admin-header-actions'
import { AdminBreadcrumb } from './admin-breadcrumb'

export async function AdminHeader() {
  const session = await auth()

  return (
    <header className="bg-background flex h-14 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <AdminBreadcrumb />
      <AdminHeaderActions user={session?.user} />
    </header>
  )
}
