import { Skeleton, PropertyRowSkeleton } from '@/components/ui/Skeleton';

// Skeleton da lista "Meus imóveis" do painel.
export default function PainelImoveisLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <PropertyRowSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
