// src/components/shared/news-card-skeleton.tsx
import { Skeleton } from '@components/ui/skeleton'

export function NewsCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border">
      <Skeleton className={featured ? 'h-56' : 'h-44'} />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="border-border flex justify-between border-t pt-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export function NewsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <NewsCardSkeleton featured />
      <NewsCardSkeleton />
      <NewsCardSkeleton />
    </div>
  )
}
