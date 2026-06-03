// src/app/admin/(dashboard)/users/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, userRoles, roles } from '@db/schema'
import { desc, eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserCreateButton } from './_components/user-create-button'
import { UserEditButton } from './_components/user-edit-button'
import { UserToggleButton } from './_components/user-toggle-button'

export const metadata = { title: 'Manajemen Pengguna' }

export default async function UsersPage() {
  const session = await auth()
  // Hanya super_admin
  if (!session?.user.roles.includes('super_admin')) redirect('/admin')

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      isActive: users.isActive,
      roleName: roles.name,
      roleSlug: roles.slug,
    })
    .from(users)
    .leftJoin(userRoles, eq(userRoles.userId, users.id))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .orderBy(desc(users.createdAt))

  // Gabungkan rows per user (karena bisa punya banyak role)
  const userMap = new Map<string, (typeof rows)[0] & { roles: string[] }>()
  for (const row of rows) {
    if (!userMap.has(row.id)) {
      userMap.set(row.id, { ...row, roles: [] })
    }
    if (row.roleName) userMap.get(row.id)!.roles.push(row.roleName)
  }
  const userList = Array.from(userMap.values())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Pengguna</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Kelola akun pengguna sistem</p>
        </div>
        <UserCreateButton />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-12 text-center">
                    Tidak ada pengguna.
                  </TableCell>
                </TableRow>
              )}
              {userList.map((user) => {
                const initials = user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar ?? ''} />
                          <AvatarFallback className="bg-navy-700 text-xs text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'outline'} className="text-xs">
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <UserEditButton user={user} />
                        <UserToggleButton
                          id={user.id}
                          name={user.name}
                          isActive={user.isActive ?? true}
                          isSelf={user.id === session.user.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
