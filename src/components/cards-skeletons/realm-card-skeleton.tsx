import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RealmCardSkeletonProps {
  className?: string;
}

const RealmCardSkeleton: React.FC<RealmCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("group relative", className)}>
      <div className="relative w-[288px]" style={{ perspective: "1200px" }}>
        <div
          className="relative z-0 rounded-2xl border border-white/10 bg-surface-base"
          style={{ height: "224px" }}
        >
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-0 -translate-x-[118px] translate-y-4 -rotate-12">
              <Skeleton className="h-[186px] w-[118px] rounded-xl bg-white/10" />
            </div>
            <div className="absolute left-1/2 top-0 -translate-x-[66px] translate-y-2 -rotate-6">
              <Skeleton className="h-[186px] w-[118px] rounded-xl bg-white/12" />
            </div>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2">
              <Skeleton className="h-[186px] w-[118px] rounded-xl bg-white/15" />
            </div>
            <div className="absolute left-1/2 top-0 translate-x-[6px] translate-y-2 rotate-6">
              <Skeleton className="h-[186px] w-[118px] rounded-xl bg-white/12" />
            </div>
            <div className="absolute left-1/2 top-0 translate-x-[58px] translate-y-4 rotate-12">
              <Skeleton className="h-[186px] w-[118px] rounded-xl bg-white/10" />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md"
        >
          <div className="px-4 py-4 min-h-11">
            <Skeleton className="h-6 w-52 bg-white/15" />
          </div>
          <div className="relative h-12">
            <div className="absolute inset-x-0 top-0 h-px bg-white/8" />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <Skeleton className="h-4 w-16 bg-white/12" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28 bg-white/12" />
                <Skeleton className="h-7 w-7 rounded-md bg-white/12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealmCardSkeleton;

