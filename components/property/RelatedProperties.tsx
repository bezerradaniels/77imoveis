import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import type { CardProperty } from '@/lib/data';

// Imóveis parecidos: incentiva a continuar navegando. Carrossel horizontal de
// PropertyCard (reaproveita o componente da home), com snap e rolagem touch.
export function RelatedProperties({
  items,
  cityName,
  citySlug,
}: {
  items: CardProperty[];
  cityName?: string;
  citySlug?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight">
          Imóveis parecidos{cityName ? ` em ${cityName}` : ''}
        </h2>
        {citySlug && (
          <Link
            href={`/${citySlug}`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => (
          <div key={p.slug} className="shrink-0 snap-start">
            <PropertyCard {...p} />
          </div>
        ))}
      </div>
    </section>
  );
}
