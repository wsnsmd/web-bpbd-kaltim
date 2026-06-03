// src/app/admin/(dashboard)/settings/profile/page.tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from './_components/profile-form'
import { PasswordForm } from './_components/password-form'

export const metadata = { title: 'Profil Saya' }

export default async function ProfilePage() {
  const session = await auth()
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, session!.user.id))

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola informasi akun dan keamanan Anda
        </p>
      </div>

      {/* Informasi profil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Akun</CardTitle>
          <CardDescription>Perbarui nama dan email akun Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Separator />

      {/* Ganti password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ganti Password</CardTitle>
          <CardDescription>
            Gunakan password yang kuat dan unik untuk keamanan akun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
