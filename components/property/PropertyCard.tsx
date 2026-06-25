import Link from 'next/link';
import { BedDouble, Bath, Car, Ruler, Star } from 'lucide-react';

export type PropertyCardData = {
  slug: string;
  title: string;
  coverUrl: string;
  citySlug: string;
  cityName: string;
  neighborhoodName?: string | null;
  negotiation: 'venda' | 'aluguel' | 'temporada' | 'lancamento';
  price: number | null;
  priceVisibility: 'publico' | 'sob_consulta';
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  builtArea?: number | null;
  isFeatured?: boolean;
};

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function PropertyCard(p: PropertyCardData) {
  const priceLabel =
    p.priceVisibility === 'sob_consulta' || p.price == null
      ? 'Consultar valor'
      : `${brl(p.price)}${p.negotiation === 'aluguel' ? '/mês' : ''}`;

  return (
    <Link
      href={`/imovel/${p.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface shadow-card transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-border">
        <img
          src={p.coverUrl}
          alt={p.title}
          loading="lazy"
          width={400}
          height={300}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {p.isFeatured && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-white">
            <Star size={12} /> Destaque
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-lg font-bold tabular-nums text-text">{priceLabel}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-text">{p.title}</h3>
        <p className="text-sm text-muted">
          {p.neighborhoodName ? `${p.neighborhoodName}, ` : ''}
          {p.cityName}
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-sm text-muted">
          {!!p.bedrooms && <span className="inline-flex items-center gap-1"><BedDouble size={15} />{p.bedrooms}</span>}
          {!!p.bathrooms && <span className="inline-flex items-center gap-1"><Bath size={15} />{p.bathrooms}</span>}
          {!!p.garages && <span className="inline-flex items-center gap-1"><Car size={15} />{p.garages}</span>}
          {!!p.builtArea && <span className="inline-flex items-center gap-1"><Ruler size={15} />{p.builtArea} m²</span>}
        </div>
      </div>
    </Link>
  );
}
