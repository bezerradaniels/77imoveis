'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { heroAds } from '@/lib/hero-ads';
import { HeroSearchForm } from './HeroSearchForm';
import { AdCarousel } from './AdCarousel';

// Padrão de pontos sutil (GEO/mapa discreto) reaproveitado do restante da home.
const dotPattern = {
  backgroundImage: 'radial-gradient(circle, rgba(14,165,233,.10) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

// HERO da home.
//   Desktop: duas colunas em card — formulário (~36%) à esquerda · carrossel (~64%) à direita.
//   Mobile: título → subtítulo → botão "Buscar imóveis" (abre o form num bottom sheet) → carrossel.
export function HomeHero({
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
    <section aria-label="Buscar imóveis no Oeste da Bahia" className="relative z-10 overflow-hidden bg-bg pt-6 pb-8 md:overflow-visible md:py-10">
      {/* Fundo claro com leve degradê (oculto no escuro) + pontos sutis */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{ background: 'linear-gradient(155deg,#eef7fb 0%,#fbfcfb 46%,#f3f9fc 100%)' }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={dotPattern} />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-[340px] w-[340px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-[1] mx-auto w-full max-w-[1200px] px-6">
        <h1 className="m-0 max-w-[620px] text-[22px] font-extrabold leading-[1.12] tracking-tight text-text sm:text-[24px] md:text-[30px]">
          Encontre o imóvel ideal no Oeste da Bahia
        </h1>
        <p className="mb-0 mt-2 max-w-[580px] text-[14px] leading-relaxed text-muted md:text-[15.5px]">
          Busque casas, apartamentos, terrenos e imóveis comerciais nas principais cidades da região.
        </p>

        {/* Botão que abre o formulário num bottom sheet (mobile) */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-[18px] flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[13px] bg-[#69f1cf] text-[15.5px] font-bold text-[#04231b] transition-colors hover:bg-[#54ecc4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#69f1cf]/40 md:hidden"
        >
          <Search size={19} /> Buscar imóveis
        </button>

        <div className="mt-4 flex flex-col items-stretch gap-3.5 md:mt-6 md:flex-row md:gap-[18px]">
          {/* Card do formulário (~36%) — só no desktop; no mobile vai pro bottom sheet */}
          <div className="hidden min-w-0 md:block md:basis-[36%] md:shrink-0 md:grow-0">
            <HeroSearchForm cities={cities} types={types} neighborhoods={neighborhoods} />
          </div>

          {/* Card do carrossel (~64%) — sempre visível */}
          <div className="min-w-0 md:flex-1">
            <AdCarousel ads={heroAds} />
          </div>
        </div>
      </div>

      {/* Bottom sheet (mobile) — em portal no body para escapar de containing blocks. */}
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
    </section>
  );
}
