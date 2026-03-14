import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function ShipmentsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Tabs */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <Skeleton className="h-4 w-48" />

      {/* Table */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {/* Table Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
