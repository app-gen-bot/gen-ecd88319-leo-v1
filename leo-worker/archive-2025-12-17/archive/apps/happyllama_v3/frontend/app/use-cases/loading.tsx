import { Skeleton } from "@/components/ui/skeleton"

export default function UseCasesLoading() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="flex gap-4 lg:gap-8">
        {/* Filter sidebar skeleton */}
        <div className="hidden w-64 lg:block">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}