'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  children: React.ReactNode;
  className?: string;
  count: number;
};

export function ScrollRail({ children, className, count }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || count <= 1) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const cards = Array.from(rail.children) as HTMLElement[];
      const railLeft = rail.getBoundingClientRect().left;
      const next = cards.reduce(
        (best, card, index) => {
          const distance = Math.abs(card.getBoundingClientRect().left - railLeft);
          return distance < best.distance ? { index, distance } : best;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY },
      );
      setActive(next.index);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Sem chamada síncrona no mount: o índice ativo já começa em 0, que é
    // a posição inicial correta do rail — evita reflow forçado durante o LCP.
    rail.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      rail.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <>
      <div ref={railRef} className={cn('no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scroll-padding-left:1.5rem]', className)}>
        {children}
      </div>
      {count > 1 && (
        <div className="mt-4 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                i === active ? 'w-6 bg-primary' : 'w-2.5 bg-slate-300 dark:bg-border',
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}
