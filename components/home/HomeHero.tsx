import type { Option } from '@/components/ui/Dropdown';
import { heroAds } from '@/lib/hero-ads';
import { HeroSearchForm } from './HeroSearchForm';
import { AdCarousel } from './AdCarousel';
import { HomeGreeting } from './HomeGreeting';
import { MobileSearchSheet } from './MobileSearchSheet';

// Padrão de pontos sutil (GEO/mapa discreto) reaproveitado do restante da home.
const dotPattern = {
  backgroundImage: 'radial-gradient(circle, rgba(14,165,233,.10) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

// HERO da home (Server Component). Só o bottom-sheet mobile é client (MobileSearchSheet);
// carrossel, formulário desktop e saudação renderizam no servidor.
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
        <HomeGreeting />

        {/* Botão + bottom sheet (mobile) — único trecho interativo */}
        <MobileSearchSheet cities={cities} types={types} neighborhoods={neighborhoods} />

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
    </section>
  );
}
