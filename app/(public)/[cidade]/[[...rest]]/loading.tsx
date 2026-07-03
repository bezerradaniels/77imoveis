import { Skeleton, PropertyRowSkeleton } from '@/components/ui/Skeleton';

// Skeleton da listagem/busca (filtros + lista de imóveis).
export default function BuscaLoading() {
  return (
    <main className="bg-internal dark:bg-bg">
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Skeleton className="mb-4 h-7 w-2/3 max-w-md" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Skeleton className="hidden h-[420px] rounded-xl lg:block" />
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
