'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroAd } from '@/lib/hero-ads';
import { cn } from '@/lib/cn';

// Carrossel de publicidade do hero.
// Fade lateral suave, navegação por setas/indicadores e autoplay.
export function AdCarousel({ ads }: { ads: HeroAd[] }) {
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const go = (i: number, dir?: 1 | -1) => {
    if (!ads.length) return;
    const n = ((i % ads.length) + ads.length) % ads.length;
    if (n === idx) return;

    setDirection(dir ?? (n > idx ? 1 : -1));
    setPrevIdx(idx);
    setIdx(n);
  };

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setPrevIdx(idx);
      setIdx((idx + 1) % ads.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [ads.length, idx]);

  useEffect(() => {
    if (prevIdx === null) return;
    const timer = window.setTimeout(() => setPrevIdx(null), 900);

    return () => window.clearTimeout(timer);
  }, [prevIdx]);

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Anúncios em destaque"
      className="relative"
    >
      <div className="relative overflow-hidden rounded-[18px] border border-border bg-surface">
        <div aria-hidden className="invisible">
          <span className="block aspect-[16/9] w-full" />
          <span className="block h-10 sm:h-11" />
        </div>
        {ads.map((ad, i) => {
          const ext = ad.external ? { target: '_blank', rel: 'noopener noreferrer sponsored' } : {};
          const active = i === idx;
          const leaving = i === prevIdx;

          return (
            <a
              key={i}
              href={ad.href}
              aria-label={ad.aria}
              {...ext}
              className={cn(
                'group absolute inset-0 flex flex-col overflow-hidden no-underline outline-none will-change-transform focus-visible:ring-4 focus-visible:ring-primary/40',
                active && 'z-20 translate-x-0 opacity-100',
                active && (direction === 1
                  ? 'animate-[adSlideInNext_900ms_cubic-bezier(.22,1,.36,1)_both]'
                  : 'animate-[adSlideInPrev_900ms_cubic-bezier(.22,1,.36,1)_both]'),
                leaving && 'z-10 pointer-events-none',
                leaving && (direction === 1
                  ? 'animate-[adSlideOutNext_900ms_cubic-bezier(.22,1,.36,1)_both]'
                  : 'animate-[adSlideOutPrev_900ms_cubic-bezier(.22,1,.36,1)_both]'),
                !active && !leaving && 'pointer-events-none z-0 opacity-0',
              )}
            >
              <span className="relative block aspect-[16/9] w-full overflow-hidden">
                {ad.imgMobile ? (
                  // Art-direction (imagem mobile própria): <picture> com <img> nativo.
                  // eslint-disable-next-line @next/next/no-img-element
                  <picture>
                    <source media="(max-width: 767px)" srcSet={ad.imgMobile} />
                    <img
                      src={ad.img}
                      alt={ad.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    />
                  </picture>
                ) : (
                  <Image
                    src={ad.img}
                    alt={ad.alt}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.025]"
                  />
                )}
              </span>
              <span className="flex h-10 items-center justify-between bg-primary px-5 text-[14px] font-bold text-on-primary transition-colors group-hover:bg-primary-hover sm:h-11 sm:px-7">
                Ver detalhes
                <ChevronRight size={22} strokeWidth={2.4} />
              </span>
            </a>
          );
        })}
      </div>

      <div className="absolute left-0 right-0 top-full mt-3 flex items-center justify-center gap-2.5">
        <button
          type="button"
          aria-label="Anúncio anterior"
          onClick={() => go(idx - 1, -1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text outline-none transition hover:border-primary hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/25"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          role="tablist"
          aria-label="Selecionar anúncio"
          className="flex h-10 items-center justify-center gap-1 rounded-full border border-border bg-surface px-2"
        >
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
                className="group flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors hover:bg-bg focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span
                  className={cn(
                    'h-2 rounded-full transition-all duration-200',
                    active ? 'w-6 bg-primary' : 'w-2 bg-border group-hover:bg-muted/45',
                  )}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Próximo anúncio"
          onClick={() => go(idx + 1, 1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text outline-none transition hover:border-primary hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/25"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
