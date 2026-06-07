// src/app/admin/(dashboard)/pages/page.tsx
import Link from 'next/link'
import { db } from '@/lib/db'
import { pages, users } from '@db/schema'
import { desc, eq, like, and, SQL } from 'drizzle-orm'
import { Plus, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PAGE_TEMPLATES } from '@db/schema/pages'
import { PageDeleteButton } from './_components/page-delete-button'

const STATUS_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  published: { label: 'Dipublikasi', variant: 'default' },
  draft: { label: 'Draft', variant: 'secondary' },
  archived: { label: 'Diarsipkan', variant: 'outline' },
}

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>
}

export const metadata = { title: 'Halaman Statis' }

export default async function PagesListPage({ searchParams }: PageProps) {
  const { status, q } = await searchParams

  const conditions: SQL[] = []
  if (status && status !== 'all') conditions.push(eq(pages.status, status as any))
  if (q) conditions.push(like(pages.title, `%${q}%`))

  const rows = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      status: pages.status,
      template: pages.template,
      showInNav: pages.showInNav,
      publishedAt: pages.publishedAt,
      authorName: users.name,
    })
    .from(pages)
    .leftJoin(users, eq(users.id, pages.authorId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(pages.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Halaman Statis</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Kelola halaman konten statis seperti Tentang, Kontak, dan Profil
          </p>
        </div>
        <Button variant="accent" asChild>
          <Link href="/admin/pages/create">
            <Plus className="h-4 w-4" />
            Tambah Halaman
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <form method="GET" className="flex flex-wrap gap-2">
            <Input
              name="q"
              placeholder="Cari judul halaman..."
              defaultValue={q}
              className="max-w-xs"
            />
            <Select name="status" defaultValue={status ?? 'all'}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Dipublikasi</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Diarsipkan</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              Cari
            </Button>
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Judul</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Navigasi</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
                    Tidak ada halaman ditemukan.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => {
                const statusInfo = STATUS_BADGE[row.status ?? 'draft']
                const templateLabel =
                  PAGE_TEMPLATES.find((t) => t.value === row.template)?.label ?? row.template
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{row.title}</span>
                        <span className="text-muted-foreground font-mono text-xs">/{row.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {templateLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.showInNav ? (
                        <Badge variant="default" className="bg-navy-600 text-xs text-white">
                          Di Nav
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.authorName ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {row.status === 'published' && (
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link href={`/${row.slug}`} target="_blank">
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/admin/pages/${row.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <PageDeleteButton id={row.id} title={row.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
