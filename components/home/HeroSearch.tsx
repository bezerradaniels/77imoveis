'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { HomeSearch } from './HomeSearch';

// Hero: no desktop o formulário fica aberto; no mobile vira um botão que abre
// um bottom sheet com o form (mesmo padrão da página do imóvel).
export function HeroSearch({ cities, types }: { cities: Option[]; types: Option[] }) {
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
      {/* Desktop: formulário aberto */}
      <div className="hidden md:block">
        <HomeSearch cities={cities} types={types} variant="hero" />
      </div>

      {/* Mobile: botão que abre o bottom sheet */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto flex h-12 w-full max-w-[300px] items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 text-[15px] font-bold text-link transition-colors hover:bg-primary/10 md:hidden"
      >
        <Search size={18} /> Buscar imóveis
      </button>

      {/* Bottom sheet (mobile) — em portal no body para escapar do containing
          block criado pelo backdrop-filter do card do hero. */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        >
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
            <HomeSearch cities={cities} types={types} variant="hero" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
