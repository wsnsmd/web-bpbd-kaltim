// src/app/(public)/kontak/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { ChevronRight, MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink } from 'lucide-react'
import { SiFacebook, SiInstagram, SiYoutube, SiX } from 'react-icons/si'
import { Card, CardContent } from '@/components/ui/card'
import { ContactMap } from './_components/contact-map'

export const metadata = {
  title: 'Kontak — BPBD Kaltim',
  description:
    'Hubungi BPBD Provinsi Kalimantan Timur. Alamat, telepon, email, dan peta lokasi kantor.',
}

export default async function KontakPage() {
  noStore()

  const rows = await db.select().from(siteSettings)
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))

  const mapToken = s.mapbox_token ?? ''
  const mapLat = parseFloat(s.map_latitude ?? '-0.5022')
  const mapLng = parseFloat(s.map_longitude ?? '117.1364')
  const mapZoom = parseFloat(s.map_zoom ?? '15')
  const siteName = s.site_name ?? 'BPBD Provinsi Kalimantan Timur'
  const address = s.contact_address ?? 'Jl. Tengkawang No. 1, Samarinda, Kalimantan Timur'

  const contacts = [
    {
      icon: MapPin,
      label: 'Alamat Kantor',
      value: address,
      href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Phone,
      label: 'Telepon',
      value: s.contact_phone || '(0541) XXX-XXXX',
      href: `tel:${s.contact_phone}`,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Phone,
      label: 'Call Center Darurat',
      value: `${s.contact_emergency || '112'} (Gratis · 24 Jam)`,
      href: `tel:${s.contact_emergency || '112'}`,
      color: 'bg-red-50 text-red-600',
      highlight: true,
    },
    {
      icon: Mail,
      label: 'Email',
      value: s.contact_email || 'pusdalops@bpbd.kaltimprov.go.id',
      href: `mailto:${s.contact_email}`,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp Pusdalops',
      value: `+${s.contact_whatsapp || '62812XXXXXXXX'}`,
      href: `https://wa.me/${s.contact_whatsapp}`,
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Clock,
      label: 'Jam Operasional',
      value: s.office_hours || 'Senin – Jumat, 08.00 – 16.30 WITA',
      color: 'bg-slate-50 text-slate-600',
    },
  ]

  const socials = [
    {
      icon: SiFacebook,
      label: 'Facebook',
      href: s.social_facebook,
      color: 'hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2]',
    },
    {
      icon: SiInstagram,
      label: 'Instagram',
      href: s.social_instagram,
      color: 'hover:bg-[#e1306c] hover:text-white hover:border-[#e1306c]',
    },
    {
      icon: SiYoutube,
      label: 'YouTube',
      href: s.social_youtube,
      color: 'hover:bg-[#ff0000] hover:text-white hover:border-[#ff0000]',
    },
    {
      icon: SiX,
      label: 'X',
      href: s.social_twitter,
      color: 'hover:bg-black hover:text-white hover:border-black',
    },
  ].filter((s) => s.href)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="container-content max-w-content relative z-10 mx-auto py-12">
          <div className="text-navy-400 mb-4 flex items-center gap-2 text-xs">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Kontak</span>
          </div>
          <p className="mb-2 text-[11px] font-bold tracking-widest text-orange-400 uppercase">
            Hubungi Kami
          </p>
          <h1 className="mb-2 text-3xl leading-none font-black tracking-tight text-white md:text-4xl">
            Kontak & Lokasi
          </h1>
          <p className="text-navy-300 max-w-lg text-sm">
            Kami siap melayani 24 jam untuk kedaruratan. Untuk pertanyaan umum, hubungi pada jam
            operasional.
          </p>
        </div>
      </div>

      <div className="container-content max-w-content mx-auto py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* ── Kiri: Peta ── */}
          <div className="space-y-6">
            <Card className="gap-0 overflow-hidden rounded-lg p-0">
              <div className="bg-navy-800 flex items-center gap-2 px-5 py-3.5">
                <MapPin className="h-4 w-4 text-orange-400" />
                <p className="text-sm font-semibold text-white">Lokasi Kantor</p>
              </div>
              <ContactMap
                token={mapToken}
                latitude={mapLat}
                longitude={mapLng}
                zoom={mapZoom}
                popupName={siteName}
                popupAddress={address}
              />
            </Card>

            {/* Info tambahan */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Telepon Kantor',
                  value: s.contact_phone || '(0541) XXX-XXXX',
                  href: `tel:${s.contact_phone}`,
                  icon: Phone,
                  color: 'text-blue-600 bg-blue-50',
                },
                {
                  label: 'Email',
                  value: s.contact_email || 'pusdalops@bpbd.kaltimprov.go.id',
                  href: `mailto:${s.contact_email}`,
                  icon: Mail,
                  color: 'text-emerald-600 bg-emerald-50',
                },
                {
                  label: 'WhatsApp',
                  value: `+${s.contact_whatsapp || '62812XXXXXXXX'}`,
                  href: `https://wa.me/${s.contact_whatsapp}`,
                  icon: MessageCircle,
                  color: 'text-green-600 bg-green-50',
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href?.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-lg bg-white p-4 ring-1 ring-black/6 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-[11px]">{item.label}</p>
                    <p className="text-navy-800 truncate text-sm font-semibold">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Kanan: Sidebar sticky ── */}
          <aside className="space-y-4 lg:sticky lg:top-8">
            {/* Info kontak lengkap */}
            <Card className="gap-0 overflow-hidden rounded-lg p-0">
              <div className="bg-navy-800 px-5 py-3.5">
                <p className="text-sm font-semibold text-white">Informasi Kontak</p>
              </div>
              <div className="divide-y divide-slate-100">
                {contacts.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 px-5 py-4 ${c.highlight ? 'bg-red-50' : ''}`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.color}`}
                    >
                      <c.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground mb-0.5 text-xs">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className={`text-sm font-semibold transition hover:underline ${c.highlight ? 'text-red-600' : 'text-navy-800 hover:text-navy-600'}`}
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-navy-800 text-sm font-medium">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sosial */}
            {socials.length > 0 && (
              <Card className="gap-0 rounded-lg p-5">
                <p className="text-navy-800 mb-3 text-sm font-bold">Ikuti Kami</p>
                <div className="flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition ${s.color}`}
                    >
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
