import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton-shimmer', className)} />
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      <Skeleton className="aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="container-custom py-8 space-y-8">
      {/* Hero */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-video rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-full max-w-md" />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}