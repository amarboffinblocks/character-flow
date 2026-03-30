import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CharacterCardSkeletonProps {
  className?: string;
}

const CharacterCardSkeleton: React.FC<CharacterCardSkeletonProps> = ({ className }) => {
  return (
    <Card
      className={cn(
        "group rounded-2xl w-full overflow-hidden bg-surface-base border border-border",
        "flex min-h-[220px] flex-col sm:flex-row",
        className
      )}
    >
      <div className="p-0 m-0 relative shrink-0 h-40 sm:h-auto sm:w-[38%] sm:min-w-[38%] self-stretch overflow-hidden border-b sm:border-b-0 sm:border-r border-border">
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          {/* Checkbox placeholder */}
          <Skeleton className="size-6 rounded-full bg-surface-active" />
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          {/* Favourite + menu placeholders */}
          <Skeleton className="size-7 rounded-full bg-surface-selected" />
          <Skeleton className="size-7 rounded-full bg-surface-selected" />
        </div>

        {/* Image area */}
        <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-surface-active" />
      </div>

      {/* Right: Content + Footer */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Content */}
        <div className="space-y-2.5 py-4 px-5 flex-1">
          {/* Title + tokens + rating badge */}
          <div className="flex justify-between items-start gap-2">
            <Skeleton className="h-5 w-32 bg-surface-active rounded" />
            <div className="flex items-center gap-1.5 shrink-0">
              <Skeleton className="h-3.5 w-16 bg-surface-active rounded" />
              <Skeleton className="h-4 w-10 bg-surface-active rounded" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-16 bg-surface-active rounded" />
            <Skeleton className="h-3 w-14 bg-surface-active rounded" />
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap">
            <Skeleton className="h-5 w-14 bg-surface-active rounded-full" />
            <Skeleton className="h-5 w-16 bg-surface-active rounded-full" />
            <Skeleton className="h-5 w-12 bg-surface-active rounded-full" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full bg-surface-active rounded" />
            <Skeleton className="h-3.5 w-full bg-surface-active rounded" />
            <Skeleton className="h-3.5 w-[80%] bg-surface-active rounded" />
          </div>

          {/* Visibility + Chat button */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 bg-surface-active rounded" />
            <Skeleton className="h-7 w-20 bg-surface-active rounded-full" />
          </div>
        </div>

        {/* Footer (Created / Updated) */}
        <div className="flex justify-between items-center px-5 py-2 border-t border-border gap-2">
          <Skeleton className="h-3 w-24 bg-surface-active rounded" />
          <Skeleton className="h-3 w-24 bg-surface-active rounded" />
        </div>
      </div>
    </Card>
  );
};

export default CharacterCardSkeleton;
