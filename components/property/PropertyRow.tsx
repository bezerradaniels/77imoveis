import Image from 'next/image';
import Link from 'next/link';
import { Bath, BedDouble, Heart, Ruler } from 'lucide-react';
import { priceLabel } from '@/lib/format';
import type { CardProperty } from '@/lib/data';

const negoLabel: Record<string, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  temporada: 'Temporada',
  romaria: 'Romaria',
  lancamento: 'Lançamento',
};

const shouldUnoptimize = (src: string) =>
  src.endsWith('.svg') || (/^https?:\/\//.test(src) && !src.includes('.supabase.co'));

// Card de resultado em linha (imagem à esquerda, dados à direita) — usado na
// lista de busca/listagem. Para grades de destaque, use PropertyCard.
export function PropertyRow(p: CardProperty) {
  const specs = [
    p.bedrooms && { Icon: BedDouble, value: `${p.bedrooms} qto${p.bedrooms > 1 ? 's' : ''}` },
    p.bathrooms && { Icon: Bath, value: `${p.bathrooms} banh.` },
    p.builtArea && { Icon: Ruler, value: `${p.builtArea} m²` },
  ].filter(Boolean) as { Icon: typeof BedDouble; value: string }[];
  const advertiser = p.advertiserName || 'Anunciante particular';
  const location = [p.neighborhoodName, p.cityName].filter(Boolean).join(', ');

  return (
    <Link
      href={`/imovel/${p.slug}`}
      className="group flex gap-3 rounded-xl bg-surface p-2.5 outline-none transition hover:shadow-md focus-visible:ring-4 focus-visible:ring-primary/15 sm:gap-4 sm:p-3"
    >
      <div className="relative h-[92px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:h-[140px] sm:w-[200px] sm:rounded-xl">
        <Image
          src={p.coverUrl}
          alt={p.title}
          fill
          sizes="(min-width: 640px) 200px, 120px"
          unoptimized={shouldUnoptimize(p.coverUrl)}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {p.isFeatured && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-900 backdrop-blur sm:left-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[11px]">
            Destaque
          </span>
        )}
        <span className="absolute right-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white sm:right-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[11px]">
          {negoLabel[p.negotiation] ?? p.negotiation}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="line-clamp-1 text-[13px] font-medium leading-4 text-slate-900 dark:text-white sm:text-sm">{location || 'Região'}</div>
            <div className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-[1.15] text-text sm:text-base">{p.title}</div>
          </div>
          <Heart size={17} className="mt-0.5 shrink-0 text-muted" aria-hidden />
        </div>

        {!!specs.length && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-medium text-slate-900 dark:text-white sm:text-[13px]">
            {specs.map(({ Icon, value }, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <Icon size={13} className="text-primary" />
                {value}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-1.5 text-[15px] font-bold leading-5 text-text sm:text-[17px]">{priceLabel(p)}</div>
        <div className="line-clamp-1 text-[11px] font-medium text-slate-900 dark:text-white sm:text-[12px]">{advertiser}</div>
      </div>
    </Link>
  );
}
