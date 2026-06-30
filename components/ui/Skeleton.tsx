// Placeholder de carregamento. Server-safe (sem 'use client').
// Usa bg-subtle (mesmo placeholder de imagens do projeto) + animate-pulse.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-subtle ${className}`} />;
}

// Card de imóvel (espelha components/property/PropertyCard).
export function PropertyCardSkeleton() {
  return (
    <div className="w-[200px]">
      <Skeleton className="h-[200px] w-[200px] rounded-[20px]" />
      <div className="space-y-2 pt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Linha de imóvel para listagens em coluna (busca, painel).
export function PropertyRowSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface p-3">
      <Skeleton className="h-20 w-28 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
