import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BackgroundCardSkeletonProps {
  className?: string;
}

const BackgroundCardSkeleton: React.FC<BackgroundCardSkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-surface-base overflow-hidden aspect-video",
        className
      )}
    >
      {/* Image area skeleton */}
      <Skeleton className="w-full h-full rounded-none bg-surface-active" />

      {/* Overlay controls skeleton - matches BackgroundCard layout */}
      <div className="absolute inset-0 flex justify-between items-start p-2 pointer-events-none">
        <Skeleton className="size-6 rounded-full bg-surface-selected shrink-0" />
        <Skeleton className="size-7 rounded-full bg-surface-selected shrink-0" />
      </div>
    </div>
  );
};

export default BackgroundCardSkeleton;
