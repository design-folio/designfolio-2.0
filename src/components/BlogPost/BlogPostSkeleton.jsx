import { Skeleton } from "@/components/ui/skeleton";

export function BlogPostSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-6 w-32 mb-8" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="w-full aspect-[16/9] rounded-xl mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
