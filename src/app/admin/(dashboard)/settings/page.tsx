// src/app/admin/(dashboard)/settings/page.tsx
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralSettingsForm } from './_components/general-settings-form'
import { ContactSettingsForm } from './_components/contact-settings-form'
import { SeoSettingsForm } from './_components/seo-settings-form'
import { MediaSettingsForm } from './_components/media-settings-form'
import { OperationalSettingsForm } from './_components/operational-settings-form'
import { DEFAULT_SETTINGS } from '@db/schema/settings'

export const metadata = { title: 'Pengaturan Situs' }

export default async function SettingsPage() {
  const rows = await db.select().from(siteSettings)
  const saved = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  const settings = { ...DEFAULT_SETTINGS, ...saved }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Pengaturan Situs</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola konfigurasi global situs BPBD Kaltim
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="contact">Kontak & Sosial</TabsTrigger>
          <TabsTrigger value="operational">Operasional</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Umum</CardTitle>
              <CardDescription>
                Nama situs, tagline, deskripsi, dan logo yang tampil di header dan footer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettingsForm settings={settings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontak & Media Sosial</CardTitle>
              <CardDescription>
                Informasi kontak yang tampil di header, footer, dan halaman kontak.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactSettingsForm settings={settings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pengaturan Operasional</CardTitle>
              <CardDescription>
                Status kondisi wilayah dan konfigurasi data cuaca BMKG yang tampil di status bar
                beranda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OperationalSettingsForm settings={settings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO & Analitik</CardTitle>
              <CardDescription>Meta tag default dan integrasi Google Analytics.</CardDescription>
            </CardHeader>
            <CardContent>
              <SeoSettingsForm settings={settings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pengaturan Media</CardTitle>
              <CardDescription>Batas ukuran upload dan format file yang diizinkan.</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaSettingsForm settings={settings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
