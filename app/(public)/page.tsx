import Link from 'next/link';
import {
  ArrowRight, Building2, Home, Trees, Store, Sparkles,
  HardHat, Handshake, Megaphone, PlusCircle, ChevronRight,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getFeaturedCities, getPropertyTypes, getFeaturedProperties, getCityCounts, getNeighborhoodsByCity } from '@/lib/data';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeHero } from '@/components/home/HomeHero';
import { ScrollRail } from '@/components/home/ScrollRail';
import { cityImageFor } from '@/lib/constants';

export const revalidate = 300;

// Canonical da home. Título/descrição vêm do layout raiz (default).
export const metadata: Metadata = { alternates: { canonical: '/' } };

// Padrão de pontos sutil para fundos de seção (GEO/mapa discreto).
const dotPattern = {
  backgroundImage: 'radial-gradient(circle, rgba(14,165,233,.10) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

const categorias = [
  { Icon: Home, label: 'Casas', sub: 'Para morar com a família', href: '/imoveis/casa' },
  { Icon: Building2, label: 'Apartamentos', sub: 'Praticidade e localização', href: '/imoveis/apartamento' },
  { Icon: Trees, label: 'Terrenos', sub: 'Construa do seu jeito', href: '/imoveis/terreno' },
  { Icon: Store, label: 'Imóveis comerciais', sub: 'Salas, lojas e galpões', href: '/imoveis/sala-comercial' },
  { Icon: Sparkles, label: 'Lançamentos', sub: 'Novos empreendimentos', href: '/imoveis/lancamento' },
];

const profissionais = [
  { Icon: Building2, label: 'Imobiliárias', desc: 'Agências completas para comprar, vender e alugar com segurança.', href: '/profissionais/imobiliaria' },
  { Icon: HardHat, label: 'Construtoras', desc: 'Empreendimentos e lançamentos das principais construtoras da região.', href: '/profissionais/construtora' },
  { Icon: Handshake, label: 'Corretores', desc: 'Corretores credenciados para te ajudar em cada etapa da negociação.', href: '/profissionais/corretor_autonomo' },
];

const seoChips = [
  { label: 'Casas à venda', href: '/imoveis/casa/venda' },
  { label: 'Apartamentos para alugar', href: '/imoveis/apartamento/aluguel' },
  { label: 'Terrenos à venda', href: '/imoveis/terreno/venda' },
];

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="mb-1 text-[clamp(19px,2.1vw,23px)] font-extrabold tracking-tight text-text">{title}</h2>
      <p className="text-[13.5px] leading-snug text-muted">{sub}</p>
    </div>
  );
}

const citySequence = [
  { slug: 'bom-jesus-da-lapa', name: 'Bom Jesus da Lapa' },
  { slug: 'vitoria-da-conquista', name: 'Vitória da Conquista' },
  { slug: 'barreiras', name: 'Barreiras' },
  { slug: 'luis-eduardo-magalhaes', name: 'Luís Eduardo Magalhães' },
  { slug: 'guanambi', name: 'Guanambi' },
  { slug: 'brumado', name: 'Brumado' },
  { slug: 'santa-maria-da-vitoria', name: 'Santa Maria da Vitória' },
];

export default async function HomePage() {
  const [cities, types, venda, counts, neighborhoods] = await Promise.all([
    getFeaturedCities(),
    getPropertyTypes(),
    getFeaturedProperties('venda', 8),
    getCityCounts(),
    getNeighborhoodsByCity(),
  ]);
  const cityOpts = cities.map((c) => ({ value: c.slug, label: c.name }));
  const typeOpts = types.map((t) => ({ value: t.slug, label: t.name }));
  const cityCards = citySequence.map((item) => cities.find((city) => city.slug === item.slug) ?? item);

  return (
    <main className="w-full overflow-x-hidden">
      {/* HERO */}
      <HomeHero cities={cityOpts} types={typeOpts} neighborhoods={neighborhoods} />

      {/* CIDADES */}
      <section className="relative overflow-hidden bg-white py-[clamp(40px,5.5vw,68px)] dark:bg-bg">
        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mb-5">
            <SectionTitle title="Encontre imóveis por cidade" sub="Cobertura nas principais cidades do sudoeste e oeste da Bahia." />
          </div>
          <ScrollRail count={cityCards.length} className="md:grid md:grid-cols-4 md:gap-4 md:overflow-visible lg:grid-cols-7">
            {cityCards.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="group relative block w-[150px] shrink-0 snap-start overflow-hidden rounded-2xl outline-none ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary md:w-auto"
              >
                <span
                  aria-hidden
                  className="block aspect-[3/4] bg-slate-200 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url("${cityImageFor(c.slug)}")` }}
                />
                <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(6,11,9,0) 40%,rgba(6,11,9,.82) 100%)' }} />
                <span className="absolute inset-x-0 bottom-0 p-3">
                  <span className="block truncate text-[14px] font-bold leading-tight text-white">{c.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-white/85">
                    {counts[c.slug] ? `${counts[c.slug]} ${counts[c.slug] === 1 ? 'imóvel' : 'imóveis'}` : 'Ver imóveis'}
                    <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            ))}
          </ScrollRail>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(40px,5.5vw,68px)]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <SectionTitle title="Imóveis em destaque" sub="Seleção de oportunidades recentes no Oeste da Bahia." />
            <Link href="/imoveis" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-link hover:text-link-hover">
              Ver todos os imóveis <ArrowRight size={15} />
            </Link>
          </div>
          {venda.length ? (
            <ScrollRail count={venda.length} className="md:grid md:gap-5 md:overflow-visible md:[grid-template-columns:repeat(auto-fill,200px)]">
              {venda.map((p) => (
                <div key={p.slug} className="shrink-0 snap-start">
                  <PropertyCard {...p} />
                </div>
              ))}
            </ScrollRail>
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-[#f7f9f8] p-12 text-center text-[14px] text-muted dark:bg-bg">
              Em breve, imóveis em destaque aqui.
            </p>
          )}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="relative overflow-hidden bg-[#f7f9f8] dark:bg-bg">
        <div aria-hidden className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-[clamp(40px,5.5vw,68px)]">
          <div className="mb-5">
            <SectionTitle title="Explore por tipo de imóvel" sub="Encontre o imóvel certo para comprar ou alugar na sua cidade." />
          </div>
          <ScrollRail count={categorias.length} className="md:grid md:overflow-visible md:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            {categorias.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="flex w-[210px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-surface p-5 outline-none transition-all hover:-translate-y-1 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary md:w-auto"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-primary-soft">
                  <c.Icon size={22} className="text-link" />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-text">{c.label}</span>
                  <span className="mt-0.5 block text-[13px] text-muted">{c.sub}</span>
                </span>
              </Link>
            ))}
          </ScrollRail>
        </div>
      </section>

      {/* PROFISSIONAIS */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(40px,5.5vw,68px)]">
          <div className="mb-5">
            <SectionTitle title="Profissionais e empresas da região" sub="Conecte-se com imobiliárias, construtoras e corretores do Oeste da Bahia." />
          </div>
          <ScrollRail count={profissionais.length} className="md:grid md:overflow-visible md:[grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
            {profissionais.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="flex w-[250px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-surface p-5 outline-none transition-all hover:-translate-y-1 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary md:w-auto"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary-soft">
                  <p.Icon size={24} className="text-link" />
                </span>
                <span className="text-[15px] font-bold text-text">{p.label}</span>
                <span className="text-[13px] leading-relaxed text-muted">{p.desc}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-bold text-link">
                  Ver {p.label.toLowerCase()} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </ScrollRail>
        </div>
      </section>

      {/* CTA ANUNCIANTE */}
      <section id="anunciar" className="relative overflow-hidden bg-primary">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-7 px-6 py-[clamp(40px,5.5vw,64px)] md:flex-row md:items-center">
          <div className="max-w-[620px]">
            <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.08em] text-white/75">
              <Megaphone size={16} /> Para anunciantes
            </div>
            <h2 className="m-0 mb-3 text-[clamp(20px,2.6vw,28px)] font-extrabold leading-[1.12] tracking-tight text-on-primary">
              Anuncie seu imóvel ou sua empresa
            </h2>
            <p className="m-0 text-[14px] leading-relaxed text-white/85 md:text-[15px]">
              Proprietários particulares anunciam <strong className="text-on-primary">grátis</strong>. Corretores autônomos, imobiliárias e construtoras contam com planos para destacar seus imóveis e captar mais clientes no Oeste da Bahia.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[240px]">
            <Link href="/anunciar" className="flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-extrabold text-link shadow-[0_14px_30px_-12px_rgba(0,0,0,.22)] transition-transform hover:-translate-y-0.5 hover:text-link-hover">
              <PlusCircle size={18} /> Anunciar grátis
            </Link>
            <Link href="/planos-e-precos" className="flex items-center justify-center gap-2 rounded-xl border border-white/45 bg-white/10 px-7 py-3.5 text-[15px] font-bold text-on-primary transition-colors hover:bg-white/20">
              Ver planos para empresas
            </Link>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section id="sobre" className="scroll-mt-24 bg-[#f7f9f8] dark:bg-bg">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(40px,5.5vw,64px)]">
          <h2 className="mb-3 text-[clamp(19px,2.1vw,23px)] font-extrabold tracking-tight text-text">Imóveis no Oeste da Bahia</h2>
          <p className="mb-4 max-w-[920px] text-[14px] leading-relaxed text-[#46514a] dark:text-muted">
            O <strong>77imóveis</strong> é o portal imobiliário regional que reúne casas, apartamentos, terrenos e imóveis comerciais nas principais cidades do sudoeste e oeste da Bahia. Pesquise para comprar ou alugar com filtros de cidade, tipo e número de quartos, e fale diretamente com imobiliárias, construtoras e corretores da sua região.
          </p>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="rounded-full bg-primary-soft px-3.5 py-1.5 text-[12.5px] font-semibold text-link transition-colors hover:bg-primary-soft-hover hover:text-link-hover">
                Imóveis em {c.name}
              </Link>
            ))}
            {seoChips.map((chip) => (
              <Link key={chip.label} href={chip.href} className="rounded-full bg-primary-soft px-3.5 py-1.5 text-[12.5px] font-semibold text-link transition-colors hover:bg-primary-soft-hover hover:text-link-hover">
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
