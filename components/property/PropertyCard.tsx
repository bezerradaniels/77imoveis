import Link from 'next/link';
import { Star } from 'lucide-react';
import { priceLabel } from '@/lib/format';
import type { CardProperty } from '@/lib/data';

// Card de imóvel (estilo Airbnb): imagem arredondada + texto abaixo, sem borda/sombra.
export function PropertyCard(p: CardProperty) {
  const specs = [
    p.bedrooms && `${p.bedrooms} quartos`,
    p.bathrooms && `${p.bathrooms} banh.`,
    p.builtArea && `${p.builtArea} m²`,
  ].filter(Boolean).join(' · ');

  return (
    <Link href={`/imovel/${p.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-subtle">
        <img
          src={p.coverUrl}
          alt={p.title}
          loading="lazy"
          width={400}
          height={300}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        {p.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium text-text">
            <Star size={12} className="mb-0.5 mr-1 inline" />Destaque
          </span>
        )}
      </div>
      <div className="pt-2.5">
        <p className="truncate font-medium">
          {p.neighborhoodName ? `${p.neighborhoodName}, ` : ''}{p.cityName}
        </p>
        {specs && <p className="truncate text-sm text-muted">{specs}</p>}
        <p className="mt-1 text-sm">
          <span className="font-medium">{priceLabel(p)}</span>
        </p>
      </div>
    </Link>
  );
}
