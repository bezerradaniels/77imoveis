'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { HeroSearchForm } from './HeroSearchForm';

// Único trecho interativo do hero (estado + portal). Mantido isolado para que o
// HomeHero permaneça Server Component (carrossel/greeting fora do bundle client).
export function MobileSearchSheet({
  cities,
  types,
  neighborhoods,
}: {
  cities: Option[];
  types: Option[];
  neighborhoods: Record<string, Option[]>;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-[18px] flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[13px] bg-primary text-[15.5px] font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 md:hidden"
      >
        <Search size={19} /> Buscar imóveis
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-end bg-black/40 md:hidden" onClick={() => setOpen(false)}>
            <div
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-bg px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 text-text"
              style={{ animation: 'sheetUp .32s cubic-bezier(.32,.72,0,1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[17px] font-bold text-text">Buscar imóveis</p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface transition hover:bg-bg"
                >
                  <X size={20} />
                </button>
              </div>
              <HeroSearchForm cities={cities} types={types} neighborhoods={neighborhoods} bare />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
