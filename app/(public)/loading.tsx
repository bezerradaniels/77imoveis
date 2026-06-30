import { Skeleton, PropertyCardSkeleton } from '@/components/ui/Skeleton';

// Skeleton da home enquanto os dados (cidades, tipos, destaques) carregam.
export default function HomeLoading() {
  return (
    <main className="w-full overflow-x-hidden">
      <section className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <Skeleton className="h-8 w-3/4 max-w-[560px]" />
        <Skeleton className="mt-3 h-4 w-2/3 max-w-[480px]" />
        <div className="mt-6 grid gap-4 md:grid-cols-[36%_1fr]">
          <Skeleton className="h-[320px] rounded-2xl" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-6 pb-12">
        <Skeleton className="mb-5 h-6 w-64" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
