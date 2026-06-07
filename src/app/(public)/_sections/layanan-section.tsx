// src/app/(public)/_sections/layanan-section.tsx
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { db } from '@/lib/db'
import { services } from '@db/schema'
import { asc, eq } from 'drizzle-orm'
import { cache } from 'react'

const getServices = cache(async () => {
  return db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.order))
})

function DynamicIcon({ name, className }: { name: string; className?: string }) {
   
  const Icon = (LucideIcons as any)[name]
  if (!Icon) return <LucideIcons.Circle className={className} />
  return <Icon className={className} />
}

export async function LayananSection() {
  const items = await getServices()

  if (items.length === 0) return null

  return (
    <section id="layanan" className="bg-navy-800 py-16 lg:py-20">
      <div className="container-content mx-auto max-w-(--width-content)">
        <div className="mb-12 text-center">
          <div className="text-gold-300 mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <span className="bg-gold-400 h-0.5 w-5 shrink-0 rounded-full" />
            Layanan Publik
          </div>
          <h2 className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold tracking-tight text-white">
            Layanan & Informasi BPBD Kaltim
          </h2>
          <p className="text-navy-200 mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Akses cepat seluruh layanan publik dan informasi kebencanaan Provinsi Kalimantan Timur.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="group block">
              <Card
                variant="glass"
                className={cn(
                  'flex h-38 flex-col items-center justify-center gap-0 rounded-xl p-4 text-center transition-all duration-300',
                  'group-hover:-translate-y-1 group-hover:bg-white/15 group-hover:ring-orange-500'
                )}
              >
                <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition-colors duration-300 group-hover:bg-orange-500">
                  <DynamicIcon
                    name={item.icon}
                    className="text-gold-300 h-5 w-5 transition-colors duration-300 group-hover:text-white"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <p className="mb-1 text-[13px] font-bold tracking-wide text-white">
                    {item.label}
                  </p>
                  <p className="text-navy-200 text-[11px] leading-snug">{item.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
