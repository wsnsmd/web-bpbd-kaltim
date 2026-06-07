// src/app/admin/(dashboard)/news/page.tsx
import Link from 'next/link'
import { db } from '@/lib/db'
import { news, newsCategories, users } from '@db/schema'
import { desc, eq, like, and, SQL } from 'drizzle-orm'
import { Plus, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { NewsDeleteButton } from './_components/news-delete-button'

const STATUS_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  published: { label: 'Dipublikasi', variant: 'default' },
  draft: { label: 'Draft', variant: 'secondary' },
  archived: { label: 'Diarsipkan', variant: 'outline' },
}

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}

const PER_PAGE = 15

export default async function NewsListPage({ searchParams }: PageProps) {
  const { status, q, page } = await searchParams
  const currentPage = Number(page ?? 1)
  const offset = (currentPage - 1) * PER_PAGE

  // Build where conditions
  const conditions: SQL[] = []
  if (status && status !== 'all') conditions.push(eq(news.status, status as any))
  if (q) conditions.push(like(news.title, `%${q}%`))

  const rows = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      status: news.status,
      isFeatured: news.isFeatured,
      publishedAt: news.publishedAt,
      viewCount: news.viewCount,
      categoryName: newsCategories.name,
      authorName: users.name,
    })
    .from(news)
    .leftJoin(newsCategories, eq(newsCategories.id, news.categoryId))
    .leftJoin(users, eq(users.id, news.authorId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(news.createdAt))
    .limit(PER_PAGE)
    .offset(offset)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Berita</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Kelola semua artikel berita</p>
        </div>
        <Button variant="accent" asChild>
          <Link href="/admin/news/create">
            <Plus className="h-4 w-4" />
            Tambah Berita
          </Link>
        </Button>
      </div>

      <Card>
        {/* Filter bar */}
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form method="GET" className="flex flex-1 gap-2">
              <Input
                name="q"
                placeholder="Cari judul berita..."
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
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Dilihat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
                    Tidak ada berita ditemukan.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => {
                const statusInfo = STATUS_BADGE[row.status ?? 'draft']
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="line-clamp-1 text-sm font-medium">{row.title}</span>
                        <span className="text-muted-foreground text-xs">{row.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.categoryName ? (
                        <Badge variant="outline" className="text-xs">
                          {row.categoryName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                      {row.isFeatured && (
                        <Badge
                          variant="outline"
                          className="border-gold-400 text-gold-600 ml-1 text-xs"
                        >
                          Unggulan
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.authorName ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.viewCount?.toLocaleString('id') ?? 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/berita/${row.slug}`} target="_blank">
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/admin/news/${row.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <NewsDeleteButton id={row.id} title={row.title} />
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
