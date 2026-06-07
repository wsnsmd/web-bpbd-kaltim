// src/app/admin/(dashboard)/master-data/page.tsx
import { db } from '@/lib/db'
import { disasterTypes, disasterCauses } from '@db/schema'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DisasterTypesPanel } from './_components/disaster-types-panel'
import { DisasterCausesPanel } from './_components/disaster-causes-panel'

export const metadata = { title: 'Master Data — Admin' }

export default async function MasterDataPage() {
  const [types, causes] = await Promise.all([
    db.select().from(disasterTypes).orderBy(disasterTypes.sortOrder),
    db.select().from(disasterCauses).orderBy(disasterCauses.name),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">Master Data</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola jenis bencana dan penyebab yang tampil di form kejadian
        </p>
      </div>

      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Jenis Bencana ({types.length})</TabsTrigger>
          <TabsTrigger value="causes">Penyebab ({causes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="mt-6">
          <DisasterTypesPanel initialItems={types} />
        </TabsContent>

        <TabsContent value="causes" className="mt-6">
          <DisasterCausesPanel initialItems={causes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
