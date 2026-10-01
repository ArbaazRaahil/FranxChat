import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-zinc-800 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

export const FeedPostSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-[480px] mx-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 mb-6 shadow-sm">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-28 h-3.5 rounded" />
          <Skeleton className="w-16 h-2.5 rounded" />
        </div>
      </div>

      {/* Media Skeleton */}
      <Skeleton className="w-full aspect-square rounded-xl mb-3" />

      {/* Actions Skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
        <Skeleton className="w-7 h-7 rounded-full" />
      </div>

      {/* Caption Skeleton */}
      <div className="space-y-2">
        <Skeleton className="w-24 h-3 rounded" />
        <Skeleton className="w-full h-3 rounded" />
        <Skeleton className="w-3/4 h-3 rounded" />
      </div>
    </div>
  );
};
