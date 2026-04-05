import { SkeletonHero, SkeletonCard, SkeletonWire, SkeletonSidebar } from "@/components/LoadingSkeletons";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse-slow">
      {/* Skeleton Breaking Banner */}
      <div className="h-10 w-full skeleton-box animate-shimmer mb-6 opacity-20" />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-0.5 h-6 rounded-full bg-border" />
            <div className="h-7 w-48 skeleton-box animate-shimmer" />
            <div className="h-4 w-32 skeleton-box animate-shimmer ml-auto opacity-40" />
          </div>

          <SkeletonHero />

          <div className="grid sm:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="glass-panel p-5 space-y-4">
            <div className="h-5 w-32 skeleton-box animate-shimmer mb-4" />
            <SkeletonWire />
            <SkeletonWire />
            <SkeletonWire />
            <SkeletonWire />
          </div>
        </div>

        {/* Sidebar Skeletons */}
        <div className="space-y-6">
          <SkeletonSidebar />
          <div className="glass-panel p-5 space-y-4">
            <div className="h-4 w-1/2 skeleton-box animate-shimmer" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-full skeleton-box animate-shimmer opacity-30" />
              ))}
            </div>
          </div>
          <div className="glass-panel p-5 h-64 skeleton-box animate-shimmer opacity-10" />
        </div>
      </div>
    </div>
  );
}
