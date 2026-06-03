// src/components/layout/footer.tsx
import Link from 'next/link'
import { Shield, MapPin, Phone, Mail, Clock, ExternalLink, ChevronRight } from 'lucide-react'
import { SiInstagram, SiFacebook, SiYoutube, SiX, SiWhatsapp } from 'react-icons/si'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { getSiteSettings } from '@/lib/site-settings'
import { getMenuItems } from '@/lib/menu'

export default async function Footer() {
  const [s, footerQuick, footerInstansi] = await Promise.all([
    getSiteSettings(),
    getMenuItems('footer_quick'),
    getMenuItems('footer_instansi'),
  ])

  const emergencyNumber = s.contact_emergency || '112'
  const whatsappNumber = s.contact_whatsapp || ''

  const socialLinks = [
    { icon: SiFacebook, href: s.social_facebook, label: 'Facebook BPBD Kaltim' },
    { icon: SiInstagram, href: s.social_instagram, label: 'Instagram BPBD Kaltim' },
    { icon: SiYoutube, href: s.social_youtube, label: 'YouTube BPBD Kaltim' },
    { icon: SiX, href: s.social_twitter, label: 'X BPBD Kaltim' },
  ].filter((l) => l.href)

  return (
    <footer className="bg-navy-950 text-navy-300 border-t-[3px] border-orange-500">
      {/* Emergency Banner */}
      <div className="bg-navy-900 border-b border-white/5">
        <div className="container-content max-w-content mx-auto px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                <Phone className="h-4 w-4 text-orange-300" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-white uppercase">
                  Butuh Bantuan Darurat?
                </p>
                <p className="text-navy-400 mt-0.5 text-xs">
                  Hubungi kami 24 jam sehari, 7 hari seminggu
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="bg-orange-500 font-bold hover:bg-orange-600">
                <a href={`tel:${emergencyNumber}`}>
                  <Phone className="mr-2 h-3.5 w-3.5" /> {emergencyNumber} — Darurat
                </a>
              </Button>
              {whatsappNumber && (
                <Button asChild className="bg-[#25d366] font-bold hover:bg-[#1ebe5d]">
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SiWhatsapp className="mr-2 h-3.5 w-3.5" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container-content max-w-content mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-navy-800 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10">
                <Shield className="text-gold-300 h-5 w-5" />
              </div>
              <div>
                <p className="text-base leading-none font-bold tracking-tight text-white">BPBD</p>
                <p className="text-navy-400 mt-0.5 text-[11px] font-bold tracking-widest uppercase">
                  Prov. Kalimantan Timur
                </p>
              </div>
            </div>
            <p className="text-navy-400 text-xs leading-relaxed">
              {s.site_description ||
                'Lembaga pemerintah yang mengkoordinasikan perumusan dan pelaksanaan kebijakan penanggulangan bencana di Provinsi Kalimantan Timur.'}
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Shield className="text-gold-400 h-3.5 w-3.5" />
              <span className="text-[11px] font-bold tracking-widest text-white uppercase">
                Kaltim Tangguh Bencana
              </span>
            </div>
            {socialLinks.length > 0 && (
              <div>
                <p className="text-navy-500 mb-2.5 text-[10px] font-bold tracking-widest uppercase">
                  Ikuti Kami
                </p>
                <div className="flex gap-2">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-white/5 transition-all duration-300 hover:scale-105 hover:bg-orange-500"
                      asChild
                    >
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kolom 2: Kontak */}
          <div>
            <h3 className="mb-5 border-b border-white/10 pb-2.5 text-sm font-bold tracking-widest text-white uppercase">
              Hubungi Kami
            </h3>
            <ul className="text-navy-400 space-y-4 text-xs">
              {s.contact_address && (
                <li className="flex gap-3">
                  <MapPin className="text-gold-400 mt-0.5 h-4 w-4 shrink-0" />
                  {s.contact_address}
                </li>
              )}
              {s.contact_phone && (
                <li className="flex gap-3">
                  <Phone className="text-gold-400 mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <a href={`tel:${s.contact_phone}`} className="block hover:text-white">
                      {s.contact_phone}
                    </a>
                    <span className="text-navy-500 text-[11px]">Kantor Utama</span>
                  </div>
                </li>
              )}
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <div>
                  <a
                    href={`tel:${emergencyNumber}`}
                    className="block font-semibold text-orange-300 hover:text-white"
                  >
                    {emergencyNumber}
                  </a>
                  <span className="text-navy-500 text-[11px]">Pusdalops — 24 Jam</span>
                </div>
              </li>
              {s.contact_email && (
                <li className="flex gap-3">
                  <Mail className="text-gold-400 mt-0.5 h-4 w-4 shrink-0" />
                  <a href={`mailto:${s.contact_email}`} className="break-all hover:text-white">
                    {s.contact_email}
                  </a>
                </li>
              )}
              {s.office_hours && (
                <li className="flex gap-3">
                  <Clock className="text-gold-400 mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    {s.office_hours.split(',').map((line, i) => (
                      <p key={i}>{line.trim()}</p>
                    ))}
                    <p className="text-navy-500 mt-0.5">(Pusdalops operasional 24/7)</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 3: Tautan Cepat dari DB */}
          <div>
            <h3 className="mb-5 border-b border-white/10 pb-2.5 text-sm font-bold tracking-widest text-white uppercase">
              Tautan Cepat
            </h3>
            <ul className="space-y-1.5">
              {footerQuick.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    target={link.target ?? '_self'}
                    className="group text-navy-400 flex items-center text-xs transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    <ChevronRight className="mr-2 h-3 w-3 text-orange-600" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Instansi Terkait dari DB */}
          <div>
            <h3 className="mb-5 border-b border-white/10 pb-2.5 text-sm font-bold tracking-widest text-white uppercase">
              Instansi Terkait
            </h3>
            <ul className="space-y-1.5">
              {footerInstansi.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    target={link.target ?? '_blank'}
                    className="group text-navy-400 flex items-center text-xs transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    <ExternalLink className="mr-2 h-3 w-3 text-orange-600" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="mx-auto max-w-(--width-content) bg-white/10" />

      {/* Bottom Bar */}
      <div className="container-content max-w-content text-navy-500 mx-auto flex flex-col items-center justify-between gap-3 px-6 py-5 text-[11px] sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {s.site_name}. All Rights Reserved.
        </p>
        <div className="flex items-center gap-4">
          {['Privasi', 'Syarat', 'Aksesibilitas', 'Sitemap'].map((i) => (
            <Link key={i} href="#" className="hover:text-navy-300">
              {i}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
