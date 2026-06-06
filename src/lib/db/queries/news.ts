// lib/queries/news.ts
import { db } from '@lib/db'
import { news, users, newsCategories } from '@db/schema'
import { eq, desc, and } from 'drizzle-orm'

export async function getPublishedNews(limit?: number) {
  const query = db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      content: news.content,
      featuredImage: news.featuredImage,
      status: news.status,
      isFeatured: news.isFeatured,
      publishedAt: news.publishedAt,
      viewCount: news.viewCount,
      seoTitle: news.seoTitle,
      seoDescription: news.seoDescription,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      authorId: users.id,
      authorName: users.name,
      authorEmail: users.email,
      authorAvatar: users.avatar,
      categoryId: newsCategories.id,
      categoryName: newsCategories.name,
      categorySlug: newsCategories.slug,
      categoryColor: newsCategories.color,
      categoryDescription: newsCategories.description,
    })
    .from(news)
    .leftJoin(users, eq(news.authorId, users.id))
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(eq(news.status, 'published'))
    .orderBy(desc(news.publishedAt))

  if (limit) {
    query.limit(limit)
  }

  const results = await query

  // Format hasil
  return results.map((result) => ({
    ...result,
    author: result.authorId
      ? {
          id: result.authorId,
          name: result.authorName,
          email: result.authorEmail,
          avatar: result.authorAvatar,
        }
      : null,
    category: result.categoryId
      ? {
          id: result.categoryId,
          name: result.categoryName,
          slug: result.categorySlug,
          color: result.categoryColor,
          description: result.categoryDescription,
        }
      : null,
  }))
}

export async function getNewsBySlug(slug: string) {
  const results = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      content: news.content,
      featuredImage: news.featuredImage,
      status: news.status,
      isFeatured: news.isFeatured,
      publishedAt: news.publishedAt,
      viewCount: news.viewCount,
      seoTitle: news.seoTitle,
      seoDescription: news.seoDescription,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      authorId: users.id,
      authorName: users.name,
      authorEmail: users.email,
      authorAvatar: users.avatar,
      categoryId: newsCategories.id,
      categoryName: newsCategories.name,
      categorySlug: newsCategories.slug,
      categoryColor: newsCategories.color,
    })
    .from(news)
    .leftJoin(users, eq(news.authorId, users.id))
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(and(eq(news.status, 'published'), eq(news.slug, slug)))
    .limit(1)

  if (results.length === 0) return null

  const result = results[0]
  return {
    ...result,
    author: result.authorId
      ? {
          id: result.authorId,
          name: result.authorName,
          email: result.authorEmail,
          avatar: result.authorAvatar,
        }
      : null,
    category: result.categoryId
      ? {
          id: result.categoryId,
          name: result.categoryName,
          slug: result.categorySlug,
          color: result.categoryColor,
        }
      : null,
  }
}
