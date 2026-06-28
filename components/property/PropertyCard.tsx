import Image from 'next/image';
import Link from 'next/link';
import { Bath, BedDouble, Heart, Ruler, Wallet } from 'lucide-react';
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

export function PropertyCard(p: CardProperty) {
  const specs = [
    p.bedrooms && { Icon: BedDouble, value: p.bedrooms },
    p.bathrooms && { Icon: Bath, value: p.bathrooms },
    p.builtArea && { Icon: Ruler, value: `${p.builtArea} m²` },
  ].filter(Boolean) as { Icon: typeof BedDouble; value: string | number }[];
  const advertiser = p.advertiserName || 'Anunciante particular';

  return (
    <Link
      href={`/imovel/${p.slug}`}
      className="group block w-[200px] rounded-[20px] outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-primary/15"
    >
      <div className="relative h-[200px] w-[200px] overflow-hidden rounded-[20px] bg-slate-200">
        <Image
          src={p.coverUrl}
          alt={p.title}
          fill
          sizes="200px"
          unoptimized={shouldUnoptimize(p.coverUrl)}
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
        {p.isFeatured && (
          <span className="absolute left-3 top-3 max-w-[132px] rounded-[14px] bg-white/90 px-3 py-2 text-[12px] font-bold leading-none text-slate-900 shadow-[0_10px_24px_-16px_rgba(15,23,42,.55)] backdrop-blur">
            Destaque
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-[0_10px_24px_-16px_rgba(15,23,42,.55)] backdrop-blur transition-colors hover:bg-white" aria-hidden>
          <Heart size={18} className="text-slate-800 transition-colors group-hover:text-link-hover" />
        </span>
        <span className="absolute left-2.5 top-2.5 rounded-lg bg-black/70 px-3 py-1.5 text-[12px] font-semibold leading-none text-white shadow-[0_10px_24px_-16px_rgba(0,0,0,.7)]">
          {negoLabel[p.negotiation] ?? p.negotiation}
        </span>
      </div>
      <div className="pt-3">
        <div className="line-clamp-1 text-[15px] font-semibold leading-5 text-slate-950 dark:text-text">{advertiser}</div>
        <div className="mt-0.5 line-clamp-1 text-[15px] font-medium leading-5 text-slate-900 dark:text-text">{p.title}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold leading-5 text-slate-900 dark:text-text">
          <Wallet size={14} className="shrink-0 text-link" />
          <span className="line-clamp-1">{priceLabel(p)}</span>
        </div>
        {p.cityName && (
          <div className="mt-0.5 line-clamp-1 text-[12px] font-medium leading-5 text-slate-500 dark:text-muted">
            {p.cityName}
          </div>
        )}
        {p.neighborhoodName && (
          <div className="mt-0.5 line-clamp-1 text-[12px] font-medium leading-5 text-slate-500 dark:text-muted">
            Bairro: {p.neighborhoodName}
          </div>
        )}
        {!!specs.length && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium leading-5 text-slate-600 dark:text-muted">
            {specs.map(({ Icon, value }, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <Icon size={14} className="text-link" />
                {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
