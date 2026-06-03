// src/app/admin/(dashboard)/hero/page.tsx
import { getHeroSettingsAction } from './_actions/hero-actions'
import { HeroSettingsForm } from './_components/hero-settings-form'

export const metadata = { title: 'Hero Section' }

export default async function HeroPage() {
  const settings = await getHeroSettingsAction()
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Hero Section</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola tampilan hero / banner utama halaman beranda
        </p>
      </div>
      <HeroSettingsForm settings={settings} />
    </div>
  )
}
