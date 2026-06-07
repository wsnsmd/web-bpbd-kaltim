// src/app/admin/(dashboard)/navigation/page.tsx
import { db } from '@/lib/db'
import { menuItems } from '@db/schema'
import { asc } from 'drizzle-orm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MENU_LOCATIONS } from '@db/schema/navigation'
import { MenuLocationPanel } from './_components/menu-location-panel'

export const metadata = { title: 'Manajemen Navigasi' }

export default async function NavigationPage() {
  const allItems = await db.select().from(menuItems).orderBy(asc(menuItems.order))

  const byLocation = {
    main_nav: allItems.filter((i) => i.location === 'main_nav'),
    instansi_bar: allItems.filter((i) => i.location === 'instansi_bar'),
    footer_quick: allItems.filter((i) => i.location === 'footer_quick'),
    footer_instansi: allItems.filter((i) => i.location === 'footer_instansi'),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Manajemen Navigasi</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola menu navigasi, tautan cepat, dan instansi terkait
        </p>
      </div>

      <Tabs defaultValue="main_nav">
        <TabsList className="mb-6 h-auto flex-wrap gap-1">
          {(Object.entries(MENU_LOCATIONS) as [keyof typeof MENU_LOCATIONS, string][]).map(
            ([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {label}
              </TabsTrigger>
            )
          )}
        </TabsList>

        {(Object.keys(MENU_LOCATIONS) as (keyof typeof MENU_LOCATIONS)[]).map((loc) => (
          <TabsContent key={loc} value={loc}>
            <MenuLocationPanel location={loc} items={byLocation[loc]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
