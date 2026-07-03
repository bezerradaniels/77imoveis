'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroAd } from '@/lib/hero-ads';
import { cn } from '@/lib/cn';

// Carrossel de publicidade do hero.
// Implementação leve: CSS scroll-snap nativo + estado só para o indicador.
// 6 slots clicáveis em 16:9, navegação por setas/teclado e indicadores (dots).
export function AdCarousel({ ads }: { ads: HeroAd[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const last = ads.length - 1;

  const go = (i: number) => {
    const t = trackRef.current;
    const n = Math.max(0, Math.min(last, i));
    if (t) t.scrollTo({ left: n * t.clientWidth, behavior: 'smooth' });
    setIdx(n);
  };

  const onScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    if (i !== idx) setIdx(i);
  };

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Anúncios em destaque"
    >
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[18px]"
        >
          {ads.map((ad, i) => {
            const ext = ad.external ? { target: '_blank', rel: 'noopener noreferrer sponsored' } : {};
            return (
              <a
                key={i}
                href={ad.href}
                aria-label={ad.aria}
                {...ext}
                className="relative block aspect-[16/9] w-full shrink-0 snap-start overflow-hidden no-underline outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
              >
                <Image
                  src={ad.img}
                  alt={ad.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(8,22,16,.74) 0%, rgba(8,22,16,.18) 42%, transparent 65%)',
                  }}
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold tracking-[.02em] text-[#13201b]">
                  {ad.tag}
                </span>
                <span className="absolute inset-x-3.5 bottom-3 block">
                  <span className="block text-[16px] font-bold leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,.3)]">
                    {ad.title}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-medium text-white/90">{ad.sub}</span>
                </span>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Anúncio anterior"
          onClick={() => go(idx - 1)}
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-[#13201b] outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/30 sm:left-2.5"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Próximo anúncio"
          onClick={() => go(idx + 1)}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-[#13201b] outline-none transition-colors hover:border-primary hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/30 sm:right-2.5"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div role="tablist" aria-label="Selecionar anúncio" className="flex items-center justify-center gap-[7px] px-0 pb-[5px] pt-[11px]">
        {ads.map((_, i) => {
          const active = i === idx;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Ir para anúncio ${i + 1}`}
              onClick={() => go(i)}
              className="flex h-8 w-8 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <span
                className={cn(
                  'h-[7px] rounded-full transition-all',
                  active ? 'w-[22px] bg-primary' : 'w-[7px] bg-[#d3dad6]',
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
