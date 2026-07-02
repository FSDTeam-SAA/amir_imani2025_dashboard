import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

/**
 * Skeleton for a product card in the products page grid
 */
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Image skeleton */}
      <div className="aspect-square relative bg-muted/50">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Header with title and price */}
      <CardHeader className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex justify-between items-center mt-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>

      {/* Description */}
      <CardContent className="p-4 pt-0 grow">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      {/* Footer with buttons */}
      <CardFooter className="p-4 border-t flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </CardFooter>
    </Card>
  );
}

/**
 * Grid of product card skeletons
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
