import type { Option } from '@/components/ui/Dropdown';
import { heroAds, type HeroAd } from '@/lib/hero-ads';
import { HeroSearchForm } from './HeroSearchForm';
import { AdCarousel } from './AdCarousel';
import { HomeGreeting } from './HomeGreeting';
import { MobileSearchSheet } from './MobileSearchSheet';

// HERO da home (Server Component). Só o bottom-sheet mobile é client (MobileSearchSheet);
// carrossel, formulário desktop e saudação renderizam no servidor.
//   Desktop: duas colunas em card — formulário (~36%) à esquerda · carrossel (~64%) à direita.
//   Mobile: título → subtítulo → botão "Buscar imóveis" (abre o form num bottom sheet) → carrossel.
export function HomeHero({
  cities,
  types,
  neighborhoods,
  ads,
}: {
  cities: Option[];
  types: Option[];
  neighborhoods: Record<string, Option[]>;
  // Anúncios do carrossel vindos do banco; vazio => fallback estático (demo).
  ads?: HeroAd[];
}) {
  const carouselAds = ads && ads.length ? ads : heroAds;
  return (
    <section aria-label="Buscar imóveis no Oeste da Bahia" className="relative z-10 overflow-hidden bg-[#f8f9fa] pt-6 pb-8 dark:bg-bg md:overflow-visible md:py-10">
      <div className="relative z-[1] mx-auto w-full max-w-[1200px] px-6">
        <HomeGreeting />

        {/* Botão + bottom sheet (mobile) — único trecho interativo */}
        <MobileSearchSheet cities={cities} types={types} neighborhoods={neighborhoods} />

        <div className="mt-4 flex flex-col items-stretch gap-3.5 pb-[52px] md:mt-6 md:flex-row md:gap-[18px]">
          {/* Card do formulário (~36%) — só no desktop; no mobile vai pro bottom sheet */}
          <div className="hidden min-w-0 md:flex md:basis-[36%] md:shrink-0 md:grow-0">
            <HeroSearchForm cities={cities} types={types} neighborhoods={neighborhoods} />
          </div>

          {/* Card do carrossel (~64%) — sempre visível */}
          <div className="min-w-0 md:flex-1">
            <AdCarousel ads={carouselAds} />
          </div>
        </div>
      </div>
    </section>
  );
}
