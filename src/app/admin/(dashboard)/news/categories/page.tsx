// src/app/admin/(dashboard)/news/categories/page.tsx
import { db } from '@/lib/db'
import { newsCategories, news } from '@db/schema'
import { count, eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CategoryCreateButton } from './_components/category-create-button'
import { CategoryEditButton } from './_components/category-edit-button'
import { CategoryDeleteButton } from './_components/category-delete-button'

export const metadata = { title: 'Kategori Berita' }

export default async function CategoriesPage() {
  const rows = await db
    .select({
      id: newsCategories.id,
      name: newsCategories.name,
      slug: newsCategories.slug,
      color: newsCategories.color,
      description: newsCategories.description,
      newsCount: count(news.id),
    })
    .from(newsCategories)
    .leftJoin(news, eq(news.categoryId, newsCategories.id))
    .groupBy(newsCategories.id)
    .orderBy(newsCategories.name)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-navy-800 text-2xl font-bold">Kategori Berita</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Kelola kategori artikel berita</p>
        </div>
        <CategoryCreateButton />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-center">Jumlah Berita</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                    Belum ada kategori.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ background: row.color ?? '#1b56a8' }}
                      />
                      <span className="text-sm font-medium">{row.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {row.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                    {row.description ?? '—'}
                  </TableCell>
                  <TableCell className="text-center text-sm">{row.newsCount}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <CategoryEditButton category={row} />
                      <CategoryDeleteButton
                        id={row.id}
                        name={row.name}
                        disabled={row.newsCount > 0}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
