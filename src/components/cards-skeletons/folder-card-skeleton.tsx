import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FolderCardSkeletonProps {
  className?: string;
}

/**
 * Skeleton for FolderCard (Realm) — matches the folder tab + card body layout:
 * tab on top with checkbox + "Realm", then main card with title, tags, description, members.
 */
const FolderCardSkeleton: React.FC<FolderCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("group relative rounded-3xl transition-all duration-300", className)}>
      {/* Folder Tab — same as FolderCard */}
      <div className="absolute -top-8 left-0 h-10 w-32 bg-surface-subtle border-t border-x border-border rounded-t-2xl flex items-center px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-full bg-surface-active" />
          <Skeleton className="h-3 w-12 bg-surface-active rounded" />
        </div>
      </div>

      {/* Main Card Body — same structure as FolderCard */}
      <Card className="relative overflow-hidden p-6 rounded-none rounded-b-3xl rounded-tr-3xl border border-border bg-surface-base">
        <div className="absolute -right-20 -top-20 size-40 bg-surface-subtle rounded-full pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 size-40 bg-surface-subtle rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header: title + tags + dropdown */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1 flex-1">
              <Skeleton className="h-6 w-40 bg-surface-active rounded" />
              <div className="flex gap-1.5 flex-wrap">
                <Skeleton className="h-5 w-14 bg-surface-active rounded-full" />
                <Skeleton className="h-5 w-16 bg-surface-active rounded-full" />
                <Skeleton className="h-5 w-12 bg-surface-active rounded-full" />
              </div>
            </div>
            <Skeleton className="size-8 rounded-full bg-surface-selected shrink-0" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full bg-surface-active rounded" />
            <Skeleton className="h-3.5 w-full bg-surface-active rounded" />
            <Skeleton className="h-3.5 w-[80%] bg-surface-active rounded" />
          </div>

          {/* Members section placeholder */}
          <div className="pt-2 border-t border-border">
            <Skeleton className="h-3 w-16 bg-surface-active rounded mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full bg-surface-active rounded-xl" />
              <Skeleton className="h-12 w-full bg-surface-active rounded-xl" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FolderCardSkeleton;
