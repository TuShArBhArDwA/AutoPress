export function ArticleCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/1] rounded-t-xl loading-skeleton" />
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded loading-skeleton" />
          <div className="h-5 w-20 rounded loading-skeleton" />
        </div>
        <div className="space-y-2">
          <div className="h-8 rounded loading-skeleton" />
          <div className="h-8 w-3/4 rounded loading-skeleton" />
        </div>
        <div className="space-y-2">
          <div className="h-4 rounded loading-skeleton" />
          <div className="h-4 rounded loading-skeleton" />
          <div className="h-4 w-2/3 rounded loading-skeleton" />
        </div>
      </div>
    </div>
  );
}

export function ArticleListSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 rounded-lg loading-skeleton" />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/1] rounded-xl loading-skeleton mb-8" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 rounded-lg loading-skeleton" />
        <div className="h-64 rounded-lg loading-skeleton" />
      </div>
    </div>
  );
}
