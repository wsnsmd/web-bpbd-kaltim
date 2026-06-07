// src/app/(public)/_sections/download-section.tsx
import Link from 'next/link'
import { ArrowRight, FileText, Download } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { db } from '@/lib/db'
import { downloads } from '@db/schema'
import { asc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { DOWNLOAD_COLOR_SCHEMES } from '@db/schema/downloads'

const getDownloads = cache(async () => {
  return db
    .select()
    .from(downloads)
    .where(eq(downloads.isActive, true))
    .orderBy(asc(downloads.order))
    .limit(4)
})

function DynamicIcon({ name, className }: { name: string | null; className?: string }) {
   
  const Icon = (LucideIcons as any)[name ?? 'FileText'] ?? LucideIcons.FileText
  return <Icon className={className} />
}

export async function DownloadSection() {
  const items = await getDownloads()

  if (items.length === 0) return null

  return (
    <section className="bg-background border-border border-b py-20">
      <div className="container-content max-w-content mx-auto">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-orange-600 uppercase">
              <span className="h-0.5 w-5 rounded-full bg-orange-500" />
              Unduhan Publik
            </div>
            <h2 className="text-foreground text-[clamp(1.35rem,2.5vw,1.875rem)] font-bold tracking-tight">
              Download Center
            </h2>
          </div>
          <Button
            variant="link"
            asChild
            className="text-navy-600 hidden text-xs font-semibold sm:flex"
          >
            <Link href="/unduhan">
              Semua Dokumen <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((dl) => {
            const scheme =
              DOWNLOAD_COLOR_SCHEMES.find((s) => s.value === dl.colorScheme) ??
              DOWNLOAD_COLOR_SCHEMES[4]

            return (
              <Link
                key={dl.id}
                href={dl.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full"
              >
                <Card className="border-border bg-card hover:border-navy-300 flex h-full flex-col gap-0 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex grow flex-col px-5">
                    <div
                      className={cn(
                        'mb-4 flex h-11 w-11 items-center justify-center rounded-xl',
                        scheme.bg
                      )}
                    >
                      <DynamicIcon name={dl.icon} className={cn('h-5 w-5', scheme.text)} />
                    </div>
                    <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-wider uppercase">
                      {dl.category}
                    </p>
                    <p className="text-foreground mb-4 flex-1 text-sm leading-snug font-semibold">
                      {dl.title}
                    </p>
                    <div className="border-border text-muted-foreground mt-auto flex items-center justify-between border-t pt-4 text-[11px]">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {dl.fileSize ?? '—'} · {dl.fileType ?? 'PDF'}
                      </span>
                      <span className="text-navy-600 flex items-center gap-1 font-semibold">
                        <Download className="h-3 w-3" /> Unduh
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
