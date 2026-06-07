// src/app/(public)/kontak/page.tsx
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { ChevronRight, MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink } from 'lucide-react'
import { SiFacebook, SiInstagram, SiYoutube, SiX } from 'react-icons/si'
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
      label: 'X / Twitter',
      href: s.social_twitter,
      color: 'hover:bg-black hover:text-white hover:border-black',
    },
  ].filter((item) => item.href)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Peta Full Width ── */}
      <div className="relative w-full" style={{ height: '65vh', minHeight: '500px' }}>
        <ContactMap
          token={mapToken}
          latitude={mapLat}
          longitude={mapLng}
          zoom={mapZoom}
          popupName={siteName}
          popupAddress={address}
          className="h-full w-full"
        />

        {/* Breadcrumb di atas peta */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-1.5 text-xs text-white backdrop-blur-sm">
            <Link href="/" className="transition hover:text-orange-300">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span>Kontak</span>
          </div>
        </div>

        {/* Badge lokasi di atas peta */}
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-400" />
            <span className="max-w-xs truncate">{address}</span>
          </div>
        </div>
      </div>

      {/* ── Konten bawah peta ── */}
      <div className="container-content mx-auto max-w-(--width-content) px-4 py-12">
        {/* Judul */}
        <div className="mb-10 text-center">
          <p className="mb-1 text-[11px] font-bold tracking-widest text-orange-500 uppercase">
            Hubungi Kami
          </p>
          <h1 className="text-navy-800 text-3xl font-black tracking-tight md:text-4xl">
            Kontak & Informasi Kantor
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">
            Kami siap melayani 24 jam untuk kedaruratan. Untuk pertanyaan umum hubungi pada jam
            operasional.
          </p>
        </div>

        {/* ── Darurat CTA ── */}
        <div className="mb-10 overflow-hidden rounded-2xl bg-red-600 shadow-lg shadow-red-200">
          <div className="flex flex-col items-center justify-between gap-4 px-8 py-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold tracking-widest text-red-200 uppercase">
                Kedaruratan
              </p>
              <p className="mt-1 text-2xl font-black text-white">Butuh Bantuan Darurat?</p>
              <p className="mt-1 text-sm text-red-200">
                Hubungi Pusdalops kami 24 jam, 7 hari seminggu
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:112"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-black text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Phone className="h-5 w-5" />
                112 — Darurat
              </a>
              {s.contact_whatsapp && (
                <a
                  href={`https://wa.me/${s.contact_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Grid kontak ── */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: MapPin,
              label: 'Alamat Kantor',
              value: address,
              href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
              iconBg: 'bg-orange-100 text-orange-600',
              linkLabel: 'Buka di Google Maps',
            },
            {
              icon: Phone,
              label: 'Telepon Kantor',
              value: s.contact_phone || '(0541) XXX-XXXX',
              href: `tel:${s.contact_phone}`,
              iconBg: 'bg-blue-100 text-blue-600',
              linkLabel: 'Hubungi Sekarang',
            },
            {
              icon: Mail,
              label: 'Email',
              value: s.contact_email || 'pusdalops@bpbd.kaltimprov.go.id',
              href: `mailto:${s.contact_email}`,
              iconBg: 'bg-emerald-100 text-emerald-600',
              linkLabel: 'Kirim Email',
            },
            {
              icon: MessageCircle,
              label: 'WhatsApp Pusdalops',
              value: `+${s.contact_whatsapp || '62812XXXXXXXX'}`,
              href: `https://wa.me/${s.contact_whatsapp}`,
              iconBg: 'bg-green-100 text-green-600',
              linkLabel: 'Chat WhatsApp',
            },
            {
              icon: Clock,
              label: 'Jam Operasional',
              value: s.office_hours || 'Senin – Jumat, 08.00 – 16.30 WITA',
              iconBg: 'bg-slate-100 text-slate-600',
              linkLabel: null,
            },
            {
              icon: Phone,
              label: 'Pusdalops (24 Jam)',
              value: '112 — Gratis dari semua operator',
              href: 'tel:112',
              iconBg: 'bg-red-100 text-red-600',
              linkLabel: 'Hubungi 112',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  {item.label}
                </p>
                <p className="text-navy-800 mt-1 text-sm leading-snug font-semibold">
                  {item.value}
                </p>
              </div>
              {item.href && item.linkLabel && (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="text-navy-600 inline-flex items-center gap-1 text-xs font-bold transition hover:text-orange-600"
                >
                  {item.linkLabel}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* ── Sosial media ── */}
        {socials.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-navy-800 mb-4 text-sm font-bold">Ikuti Kami di Media Sosial</p>
            <div className="flex flex-wrap gap-3">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition ${item.color}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
