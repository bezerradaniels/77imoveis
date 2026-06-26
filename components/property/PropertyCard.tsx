import Link from 'next/link';
import { BedDouble, Bath, Ruler, Car, MapPin, Heart } from 'lucide-react';
import { priceLabel } from '@/lib/format';
import type { CardProperty } from '@/lib/data';

const negoLabel: Record<string, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  temporada: 'Temporada',
  romaria: 'Romaria',
  lancamento: 'Lançamento',
};

// Card de imóvel (handoff): imagem com badges + dados e specs com divisória.
export function PropertyCard(p: CardProperty) {
  const specs = [
    p.bedrooms && { Icon: BedDouble, label: `${p.bedrooms} quartos` },
    p.bathrooms && { Icon: Bath, label: `${p.bathrooms} banh.` },
    p.garages && { Icon: Car, label: `${p.garages} vagas` },
    p.builtArea && { Icon: Ruler, label: `${p.builtArea} m²` },
  ].filter(Boolean) as { Icon: any; label: string }[];

  return (
    <Link
      href={`/imovel/${p.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-24px_rgba(8,30,22,.4)]"
    >
      <div className="relative h-[190px] overflow-hidden bg-subtle">
        <img
          src={p.coverUrl}
          alt={p.title}
          loading="lazy"
          width={400}
          height={190}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {p.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
            Destaque
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90" aria-hidden>
          <Heart size={17} className="text-[#3a463f]" />
        </span>
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
          {negoLabel[p.negotiation] ?? p.negotiation}
        </span>
      </div>
      <div className="px-[18px] pb-[18px] pt-4">
        <div className="text-xl font-extrabold tracking-tight text-text">{priceLabel(p)}</div>
        <div className="mt-1.5 line-clamp-1 text-[15px] font-semibold text-[#28332d] dark:text-text">{p.title}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
          <MapPin size={14} />
          <span className="line-clamp-1">{p.neighborhoodName ? `${p.neighborhoodName}, ` : ''}{p.cityName}</span>
        </div>
        {!!specs.length && (
          <div className="mt-3.5 flex flex-wrap gap-4 border-t border-border pt-3.5 text-[13px] text-[#3a463f] dark:text-muted">
            {specs.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <s.Icon size={17} className="text-primary" /> {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
