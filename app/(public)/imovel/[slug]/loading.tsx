import { Skeleton } from '@/components/ui/Skeleton';

// Skeleton da página de imóvel.
export default function ImovelLoading() {
  return (
    <main className="pb-28 lg:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Skeleton className="mb-4 h-4 w-64" />
        <Skeleton className="aspect-[16/10] w-full rounded-xl lg:aspect-[16/8]" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
