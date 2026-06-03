// src/app/(public)/_sections/emergency-contacts-section.tsx
import { Phone, Headset, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function EmergencyContactsSection() {
  return (
    <section className="border-border border-t bg-slate-50 py-20">
      <div className="container-content mx-auto max-w-(--width-content)">
        {/* Header Section */}
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
          {/* Card 112 */}
          <a href="tel:112" className="group block">
            <Card className="flex items-center gap-5 rounded-2xl border-none bg-orange-500 p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
                <Phone className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-[10px] font-bold tracking-widest text-white/70 uppercase">
                  Call Center Darurat
                </p>
                <p className="text-[1.65rem] leading-none font-bold tracking-tight">112</p>
                <p className="mt-1 text-[11px] text-white/70">Gratis 24 Jam / 7 Hari</p>
              </div>
            </Card>
          </a>

          {/* Card Pusdalops */}
          <a href="tel:05411234567" className="group block">
            <Card className="bg-navy-700 flex items-center gap-5 rounded-2xl border-none p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
                <Headset className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-[10px] font-bold tracking-widest text-white/70 uppercase">
                  Pusdalops-PB Kaltim
                </p>
                <p className="text-[1.25rem] leading-none font-bold">(0541) XXX-XXXX</p>
                <p className="mt-1 text-[11px] text-white/70">Siaga 24 Jam Non-Stop</p>
              </div>
            </Card>
          </a>

          {/* Card WhatsApp */}
          <a href="https://wa.me/62812XXXXXXXX" className="group block">
            <Card className="flex items-center gap-5 rounded-2xl border-none bg-[#25d366] p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-[10px] font-bold tracking-widest text-white/70 uppercase">
                  WhatsApp Laporan
                </p>
                <p className="text-[1.25rem] leading-none font-bold">0812-XXXX-XXXX</p>
                <p className="mt-1 text-[11px] text-white/70">Kirim Laporan Foto & Video</p>
              </div>
            </Card>
          </a>
        </div>
      </div>
    </section>
  )
}
