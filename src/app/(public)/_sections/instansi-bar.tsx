// src/app/(public)/_sections/instansi-bar.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import * as LucideIcons from 'lucide-react'
import { Building2 } from 'lucide-react'
import { getMenuItems } from '@/lib/menu'

// Render icon Lucide dari nama string — fallback ke Building2
function DynamicIcon({ name, className }: { name: string | null; className?: string }) {
  if (!name) return <Building2 className={className} />
   
  const Icon = (LucideIcons as any)[name]
  if (!Icon) return <Building2 className={className} />
  return <Icon className={className} />
}

export async function InstansiBar() {
  const items = await getMenuItems('instansi_bar')

  if (items.length === 0) return null

  return (
    <section className="border-border border-b bg-white py-7">
      <div className="max-w-content mx-auto px-6">
        <p className="text-muted-foreground mb-5 text-center text-[11px] font-bold tracking-widest uppercase">
          Instansi & Jaringan Terkait
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item) => (
            <Button key={item.id} variant="outline" size="sm" asChild>
              <Link href={item.url} target={item.target ?? '_blank'} rel="noopener noreferrer">
                <DynamicIcon name={item.icon} className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
