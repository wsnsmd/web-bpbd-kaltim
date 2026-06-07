// src/components/layout/header.tsx
import Link from 'next/link'
import { Phone, MapPin, Clock, ShieldAlert } from 'lucide-react'
import { SiInstagram, SiFacebook, SiYoutube, SiX } from 'react-icons/si'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { getSiteSettings } from '@/lib/site-settings'
import { getMenuItems, buildMenuTree } from '@/lib/menu'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { GlobalSearch } from '@/components/layout/global-search'
import Image from 'next/image'

export default async function Header() {
  const [s, rawNav] = await Promise.all([getSiteSettings(), getMenuItems('main_nav')])
  const navTree = buildMenuTree(rawNav)

  const socialLinks = [
    { icon: SiFacebook, href: s.social_facebook, label: 'Facebook' },
    { icon: SiInstagram, href: s.social_instagram, label: 'Instagram' },
    { icon: SiYoutube, href: s.social_youtube, label: 'YouTube' },
    { icon: SiX, href: s.social_twitter, label: 'X' },
  ].filter((l) => l.href)

  const emergencyNumber = s.contact_emergency || '112'

  return (
    <>
      {/* Top Strip */}
      <div className="bg-navy-950 text-navy-300 hidden border-b border-white/5 py-1.5 text-xs md:block">
        <div className="container-content max-w-content mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-5">
            {s.contact_address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {s.contact_address.split(',').slice(0, 2).join(',')}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0" />
              Pusdalops: 24 Jam / 7 Hari
            </span>
          </div>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-6 w-6 items-center justify-center rounded bg-white/5 transition-colors hover:bg-orange-500"
                >
                  <Icon className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="border-border bg-background sticky top-0 z-50 border-b shadow-sm">
        <div className="container-content max-w-content mx-auto flex items-center justify-between gap-4 px-6 py-3">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            {s.site_logo ? (
              <Image
                src={s.site_logo}
                alt={s.site_name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <div className="bg-navy-700 flex h-10 w-10 items-center justify-center rounded-lg">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <div className="text-foreground text-base leading-none font-bold tracking-tight">
                BPBD <span className="text-muted-foreground font-normal">Prov. Kaltim</span>
              </div>
              <div className="text-muted-foreground mt-0.5 text-[10px] tracking-widest uppercase">
                {s.site_tagline || 'Badan Penanggulangan Bencana Daerah'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {navTree.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <NavigationMenuItem key={item.id}>
                      <NavigationMenuTrigger className="hover:bg-navy-50 hover:text-navy-700 rounded-lg text-[13px] font-medium text-slate-600">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="w-52 p-2">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.url}
                                  target={child.target ?? '_self'}
                                  className="hover:bg-navy-50 hover:text-navy-700 block rounded-md px-3 py-2 text-sm text-slate-600 transition-colors"
                                >
                                  {child.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.id}>
                      <Link
                        href={item.url}
                        target={item.target ?? '_self'}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'hover:bg-navy-50 hover:text-navy-700 rounded-lg text-[13px] font-medium text-slate-600'
                        )}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Right side actions */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Global Search */}
            <GlobalSearch />

            {/* Emergency CTA */}
            <Button
              asChild
              className="hidden rounded-full bg-orange-500 px-4 py-2 text-[11px] font-bold tracking-wide text-white uppercase hover:bg-orange-600 lg:flex"
            >
              <a href={`tel:${emergencyNumber}`}>
                <Phone className="mr-2 h-3 w-3" /> {emergencyNumber} — Darurat
              </a>
            </Button>

            {/* Mobile Menu */}
            <MobileMenu navTree={navTree} emergencyNumber={emergencyNumber} />
          </div>
        </div>
      </header>
    </>
  )
}
