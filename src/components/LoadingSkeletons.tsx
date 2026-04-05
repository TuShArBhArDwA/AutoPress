'use client';

export function SkeletonHero() {
  return (
    <div className="news-card-featured animate-pulse-slow">
      <div className="aspect-[21/9] skeleton-box animate-shimmer" />
      <div className="p-6 sm:p-8 space-y-4">
        <div className="flex gap-2">
          <div className="h-5 w-16 skeleton-box animate-shimmer" />
          <div className="h-5 w-24 skeleton-box animate-shimmer" />
        </div>
        <div className="h-10 w-3/4 skeleton-box animate-shimmer" />
        <div className="space-y-2">
          <div className="h-4 w-full skeleton-box animate-shimmer opacity-60" />
          <div className="h-4 w-full skeleton-box animate-shimmer opacity-60" />
          <div className="h-4 w-2/3 skeleton-box animate-shimmer opacity-60" />
        </div>
        <div className="pt-4 border-t border-border flex justify-between items-center">
          <div className="h-3 w-48 skeleton-box animate-shimmer opacity-40" />
          <div className="h-4 w-24 skeleton-box animate-shimmer opacity-40" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="news-card p-5 space-y-4">
      <div className="aspect-[16/7] skeleton-box animate-shimmer" />
      <div className="flex gap-2">
        <div className="h-4 w-12 skeleton-box animate-shimmer" />
        <div className="h-4 w-16 skeleton-box animate-shimmer" />
      </div>
      <div className="h-6 w-full skeleton-box animate-shimmer" />
      <div className="space-y-2">
        <div className="h-3 w-full skeleton-box animate-shimmer opacity-60" />
        <div className="h-3 w-4/5 skeleton-box animate-shimmer opacity-60" />
      </div>
      <div className="pt-4 flex justify-between">
        <div className="h-3 w-16 skeleton-box animate-shimmer opacity-40" />
        <div className="h-3 w-20 skeleton-box animate-shimmer opacity-40" />
      </div>
    </div>
  );
}

export function SkeletonWire() {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border-subtle">
      <div className="w-8 h-8 skeleton-box animate-shimmer opacity-20" />
      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <div className="h-3 w-12 skeleton-box animate-shimmer opacity-60" />
          <div className="h-3 w-16 skeleton-box animate-shimmer opacity-60" />
        </div>
        <div className="h-5 w-3/4 skeleton-box animate-shimmer" />
        <div className="h-3 w-full skeleton-box animate-shimmer opacity-40" />
      </div>
      <div className="w-16 h-16 skeleton-box animate-shimmer opacity-30" />
    </div>
  );
}

export function SkeletonSidebar() {
  return (
    <div className="glass-panel p-5 space-y-6">
      <div className="h-4 w-1/2 skeleton-box animate-shimmer" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 skeleton-box animate-shimmer opacity-40" />
        <div className="h-16 skeleton-box animate-shimmer opacity-40" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 py-2 border-b border-border-subtle last:border-0">
            <div className="w-4 h-4 skeleton-box animate-shimmer opacity-20" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-12 skeleton-box animate-shimmer opacity-40" />
              <div className="h-4 w-full skeleton-box animate-shimmer opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
