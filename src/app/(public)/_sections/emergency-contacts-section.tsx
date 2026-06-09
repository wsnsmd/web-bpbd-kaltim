// src/app/(public)/_sections/emergency-contacts-section.tsx
import { unstable_noStore as noStore } from 'next/cache'
import { Phone, Headset, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { inArray } from 'drizzle-orm'

async function getContactSettings() {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, ['contact_emergency', 'contact_phone', 'contact_whatsapp']))
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  return {
    emergency: s.contact_emergency || '112',
    phone: s.contact_phone || '',
    whatsapp: s.contact_whatsapp || '',
  }
}

// Format nomor WA untuk tampilan: 6281234567890 → 0812-3456-7890
function formatWA(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('62') ? '0' + digits.slice(2) : digits
  // Format: 0812-XXXX-XXXX (4-4-4) atau 0541-XXX-XXXX (4-3-4)
  if (local.length === 12) return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`
  if (local.length === 11) return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`
  return local
}

// Pastikan nomor WA dimulai dengan 62 untuk link wa.me
function toWALink(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  return '62' + digits
}

export async function EmergencyContactsSection() {
  noStore()
  const { emergency, phone, whatsapp } = await getContactSettings()

  const phoneDisplay = phone || '(0541) XXX-XXXX'
  const waDisplay = whatsapp ? formatWA(whatsapp) : '0812-XXXX-XXXX'
  const phoneHref = phone ? `tel:${phone.replace(/\D/g, '')}` : '#'
  const waHref = whatsapp ? `https://wa.me/${toWALink(whatsapp)}` : '#'

  return (
    <section className="border-border border-t bg-slate-50 py-20">
      <div className="container-content mx-auto max-w-(--width-content)">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-orange-600 uppercase">
            <span className="h-0.5 w-5 rounded-full bg-orange-500" />
            Siaga 24 Jam
          </div>
          <h2 className="text-navy-800 text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold tracking-tight">
            Kontak Darurat & Unit Respons
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Hubungi kami segera dalam situasi darurat bencana di wilayah Kalimantan Timur.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* 112 — selalu tampil */}
          <a href={`tel:${emergency}`} className="group block">
            <Card className="flex items-center gap-5 rounded-2xl border-none bg-orange-500 p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
                <Phone className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-center text-[11px] font-bold tracking-widest text-white/70 uppercase">
                  Call Center Darurat
                </p>
                <p className="items text-center text-[1.65rem] leading-none font-bold tracking-tight">
                  {emergency}
                </p>
                <p className="mt-1 text-center text-[11px] font-bold text-white/70">
                  Gratis 24 Jam / 7 Hari
                </p>
              </div>
            </Card>
          </a>

          {/* Pusdalops / telepon kantor */}
          <a href={phoneHref} className="group block">
            <Card className="bg-navy-700 flex items-center gap-5 rounded-2xl border-none p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
                <Headset className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-center text-[11px] font-bold tracking-widest text-white/70 uppercase">
                  Pusdalops-PB Kaltim
                </p>
                <p className="text-center text-[1.65rem] leading-none font-bold">{phoneDisplay}</p>
                <p className="mt-1 text-center text-[11px] font-bold text-white/70">
                  Siaga 24 Jam Non-Stop
                </p>
              </div>
            </Card>
          </a>

          {/* WhatsApp */}
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="group block">
            <Card className="flex items-center gap-5 rounded-2xl border-none bg-[#25d366] p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-center text-[11px] font-bold tracking-widest text-white/70 uppercase">
                  WhatsApp Laporan
                </p>
                <p className="text-center text-[1.65rem] leading-none font-bold">{waDisplay}</p>
                <p className="mt-1 text-center text-[11px] font-bold text-white/70">
                  Kirim Laporan Foto & Video
                </p>
              </div>
            </Card>
          </a>
        </div>
      </div>
    </section>
  )
}
