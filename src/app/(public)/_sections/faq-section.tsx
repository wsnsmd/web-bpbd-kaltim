// src/app/(public)/_sections/faq-section.tsx
import { unstable_noStore as noStore } from 'next/cache'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { eq } from 'drizzle-orm'

// Definisikan tipe untuk FAQ item
interface FaqItem {
  id?: string | number
  q: string
  a: string
  isActive?: boolean
  order?: number
}

export async function FaqSection() {
  noStore() // Selalu fetch fresh, tidak pakai Data Cache

  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'faq_items'))

  const faqs: FaqItem[] = (() => {
    if (!row?.value) return []
    try {
      const parsed = JSON.parse(row.value) as FaqItem[]
      return parsed
        .filter((i) => i.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    } catch {
      return []
    }
  })()

  if (faqs.length === 0) return null

  return (
    <section className="border-border bg-background border-t py-20">
      <div className="container-content max-w-content mx-auto">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-orange-600 uppercase">
            <span className="h-0.5 w-5 rounded-full bg-orange-500" />
            Pertanyaan Umum
          </div>
          <h2 className="text-navy-800 text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold tracking-tight">
            FAQ — Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Jawaban atas pertanyaan umum seputar layanan dan informasi BPBD Kaltim.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Accordion type="single" collapsible className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.id ?? i}
                value={String(faq.id ?? `item-${i}`)}
                className="border-border bg-card hover:border-navy-300 rounded-xl border px-4 transition-all"
              >
                <AccordionTrigger className="text-navy-800 data-[state=open]:text-navy-600 py-4 text-[13px] font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-0 pb-4 text-[13px] leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
