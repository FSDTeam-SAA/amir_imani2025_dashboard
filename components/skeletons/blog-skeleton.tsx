import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for a blog card in the blog grid
 */
export function BlogCardSkeleton() {
  return (
    <div className="group relative bg-background rounded-xl overflow-hidden border flex flex-col h-full">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category and date */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3 mb-2" />

        {/* Description */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/**
 * Grid of blog card skeletons
 */
export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
/**
 * Skeleton for blog table rows
 */
export function BlogTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}
