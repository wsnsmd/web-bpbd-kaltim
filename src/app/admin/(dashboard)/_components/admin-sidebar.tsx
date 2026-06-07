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
import { Badge } from '@/components/ui/badge'
import { signOut } from 'next-auth/react'
import { hasPermission, type Permission } from '@/lib/permissions'

interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  permission?: Permission
  children?: {
    title: string
    href: string
    permission?: Permission
  }[]
}

const NAV_MAIN: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    title: 'Konten',
    icon: Newspaper,
    permission: 'news.view',
    children: [
      { title: 'Semua Berita', href: '/admin/news', permission: 'news.view' },
      { title: 'Tambah Berita', href: '/admin/news/create', permission: 'news.create' },
      { title: 'Kategori', href: '/admin/news/categories', permission: 'news.edit' },
    ],
  },
  { title: 'Halaman', href: '/admin/pages', icon: FileText, permission: 'pages.view' },
  { title: 'Media', href: '/admin/media', icon: ImageIcon, permission: 'media.view' },
  { title: 'Layanan', href: '/admin/services', icon: LayoutGrid, permission: 'services.manage' },
  { title: 'Galeri', href: '/admin/gallery', icon: Images, permission: 'gallery.view' },
  {
    title: 'Pengumuman',
    href: '/admin/announcements',
    icon: Bell,
    permission: 'announcements.manage',
  },
  { title: 'Unduhan', href: '/admin/downloads', icon: Download, permission: 'downloads.view' },
  { title: 'FAQ', href: '/admin/faq', icon: HelpCircle, permission: 'faq.manage' },
  {
    title: 'Peta & Kejadian',
    href: '/admin/incidents',
    icon: MapPin,
    permission: 'incidents.view',
  },
  {
    title: 'Master Data',
    href: '/admin/master-data',
    icon: Database,
    permission: 'master_data.view',
  },
  {
    title: 'Statistik Pengunjung',
    href: '/admin/analytics',
    icon: BarChart2,
    permission: 'analytics.view',
  },
]

const NAV_SYSTEM: NavItem[] = [
  { title: 'Hero Section', href: '/admin/hero', icon: LayoutTemplate, permission: 'hero.manage' },
  { title: 'Navigasi', href: '/admin/navigation', icon: Menu, permission: 'navigation.manage' },
  { title: 'Pengguna', href: '/admin/users', icon: Users, permission: 'users.view' },
  { title: 'Pengaturan', href: '/admin/settings', icon: Settings, permission: 'settings.view' },
]

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  super_admin: { label: 'Super Admin', className: 'bg-red-100 text-red-700 border-red-200' },
  admin: { label: 'Admin', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  operator: { label: 'Operator', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  editor: { label: 'Editor', className: 'bg-green-100 text-green-700 border-green-200' },
  viewer: { label: 'Viewer', className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

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
  const userRoles = user.roles ?? []

  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'AD'

  // Role utama untuk badge (ambil yang paling tinggi)
  const primaryRole =
    ['super_admin', 'admin', 'operator', 'editor', 'viewer'].find((r) => userRoles.includes(r)) ??
    'viewer'
  const roleBadge = ROLE_BADGE[primaryRole]

  function canSee(permission?: Permission): boolean {
    if (!permission) return true
    return hasPermission(userRoles, permission)
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_MAIN.filter((item) => canSee(item.permission)).map((item) =>
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
                        {item.children
                          .filter((c) => canSee(c.permission))
                          .map((child) => (
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
                      (item.href !== '/admin' && pathname.startsWith(item.href!))
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

        {NAV_SYSTEM.some((item) => canSee(item.permission)) && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistem</SidebarGroupLabel>
            <SidebarMenu>
              {NAV_SYSTEM.filter((item) => canSee(item.permission)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href!)}
                    tooltip={item.title}
                  >
                    <Link href={item.href!}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

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
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left leading-none">
                    <span className="truncate text-sm font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4 -rotate-90" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="top" align="end" sideOffset={4}>
                {/* Badge role */}
                <div className="px-2 py-1.5">
                  <Badge variant="outline" className={`text-[10px] ${roleBadge.className}`}>
                    {roleBadge.label}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
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
