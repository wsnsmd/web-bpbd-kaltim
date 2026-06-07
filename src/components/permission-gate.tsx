// src/components/permission-gate.tsx
// Komponen untuk sembunyikan UI berdasarkan role — dipakai di Server Component

import { auth } from '@/lib/auth'
import { hasPermission, hasAnyPermission, type Permission } from '@/lib/permissions'

interface Props {
  permission?: Permission
  permissions?: Permission[] // salah satu harus terpenuhi
  fallback?: React.ReactNode
  children: React.ReactNode
}

// ── Server Component version ──────────────────────────────────
export async function PermissionGate({ permission, permissions, fallback, children }: Props) {
  const session = await auth()
  const userRoles = (session?.user?.roles as string[]) ?? []

  let allowed = false
  if (permission) allowed = hasPermission(userRoles, permission)
  if (permissions) allowed = hasAnyPermission(userRoles, permissions)

  if (!allowed) return fallback ? <>{fallback}</> : null
  return <>{children}</>
}

// ── Hook untuk Client Component ───────────────────────────────
// Gunakan ini di Client Component untuk kondisional UI
export function usePermissions() {
  // Untuk client component, gunakan useSession dari next-auth
  // Import di file yang membutuhkan:
  // import { useSession } from 'next-auth/react'
  // const { data: session } = useSession()
  // const roles = session?.user?.roles ?? []
  // hasPermission(roles, 'incidents.create')
}
