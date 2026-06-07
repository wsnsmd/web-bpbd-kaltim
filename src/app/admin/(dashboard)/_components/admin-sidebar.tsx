// src/app/admin/(dashboard)/_components/admin-sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Download,
  Bell,
  MapPin,
  Settings,
  Shield,
  ChevronRight,
  FileText,
  Menu,
  LayoutGrid,
  Images,
  ImageIcon,
  HelpCircle,
  LayoutTemplate,
  Database,
  BarChart2,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { signOut } from 'next-auth/react'

const NAV_MAIN = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Konten',
    icon: Newspaper,
    children: [
      { title: 'Semua Berita', href: '/admin/news' },
      { title: 'Tambah Berita', href: '/admin/news/create' },
      { title: 'Kategori', href: '/admin/news/categories' },
    ],
  },
  { title: 'Halaman', href: '/admin/pages', icon: FileText },
  { title: 'Media', href: '/admin/media', icon: ImageIcon },
  { title: 'Layanan', href: '/admin/services', icon: LayoutGrid },
  { title: 'Galeri', href: '/admin/gallery', icon: Images },
  { title: 'Pengumuman', href: '/admin/announcements', icon: Bell },
  { title: 'Unduhan', href: '/admin/downloads', icon: Download },
  { title: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  { title: 'Peta & Kejadian', href: '/admin/incidents', icon: MapPin },
  { title: 'Master Data', href: '/admin/master-data', icon: Database },
  { title: 'Statistik Pengunjung', href: '/admin/analytics', icon: BarChart2 },
]

const NAV_SYSTEM = [
  { title: 'Hero Section', href: '/admin/hero', icon: LayoutTemplate },
  { title: 'Navigasi', href: '/admin/navigation', icon: Menu },
  { title: 'Pengguna', href: '/admin/users', icon: Users },
  { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    roles: string[]
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'AD'

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-sm font-semibold">BPBD Kaltim</span>
                  <span className="text-muted-foreground text-xs">Portal Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_MAIN.map((item) =>
              item.children ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.children.some((c) => pathname.startsWith(c.href))}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname.startsWith(child.href)}
                            >
                              <Link href={child.href}>{child.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(item.href))
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.href!}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistem</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_SYSTEM.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
                    <AvatarFallback className="bg-navy-700 rounded-lg text-xs text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 text-left leading-none">
                    <span className="truncate text-sm font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4 -rotate-90" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="top" align="end" sideOffset={4}>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings/profile">Profil Saya</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                >
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
