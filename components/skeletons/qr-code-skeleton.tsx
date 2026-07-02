import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Skeleton for a QR code card in the grid
 */
export function QRCodeCardSkeleton() {
  return (
    <Card className="flex flex-col border-none md:mx-0 mx-4">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* QR Code image skeleton */}
        <div className="flex justify-center">
          <Skeleton className="w-[150px] h-[150px]" />
        </div>

        {/* Title and URL */}
        <div className="flex-1 min-w-0 items-center justify-center text-center space-y-2">
          <Skeleton className="h-5 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full mx-auto" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-between pt-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of QR code card skeletons
 */
export function QRCodeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <QRCodeCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for QR code table rows
 */
export function QRCodeTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}
