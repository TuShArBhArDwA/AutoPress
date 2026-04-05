export default function Loading() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-border rounded mb-8" />
        
        <div className="mb-8">
          <div className="h-6 w-32 bg-border rounded mb-4" />
          <div className="h-12 w-full bg-border rounded mb-3" />
          <div className="h-12 w-3/4 bg-border rounded mb-6" />
          <div className="h-6 w-full bg-border rounded mb-2" />
          <div className="h-6 w-5/6 bg-border rounded" />
        </div>
        
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="h-8 w-8 bg-border rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-border rounded" />
            <div className="h-3 w-32 bg-border rounded" />
          </div>
        </div>
        
        <div className="h-80 bg-card border border-border rounded-xl my-8" />
        
        <div className="space-y-4 mt-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-full bg-border rounded" />
              <div className="h-5 w-full bg-border rounded" />
              <div className="h-5 w-3/4 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
