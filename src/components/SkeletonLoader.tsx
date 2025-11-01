import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader = ({ className, count = 1 }: SkeletonLoaderProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse bg-muted rounded-lg",
            className
          )}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-card border rounded-xl p-6 space-y-4 animate-fade-in">
      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-muted rounded w-full animate-pulse" />
      <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
      <div className="flex items-center gap-4 mt-4">
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
      </div>
    </div>
  );
};

export const InsightSkeleton = () => {
  return (
    <div className="bg-card border rounded-xl overflow-hidden animate-fade-in">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
