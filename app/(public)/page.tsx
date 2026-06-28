import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, ArrowRight, Building2, Home, Trees, Store, Sparkles,
  HardHat, Compass, Handshake, Megaphone, PlusCircle, Users, ChevronRight,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getFeaturedCities, getPropertyTypes, getFeaturedProperties, getCityCounts } from '@/lib/data';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HeroSearch } from '@/components/home/HeroSearch';
import { cityImageFor } from '@/lib/constants';

export const revalidate = 300;

// Canonical da home. Título/descrição vêm do layout raiz (default).
export const metadata: Metadata = { alternates: { canonical: '/' } };

// Padrão de pontos sutil para fundos de seção (GEO/mapa discreto).
const dotPattern = {
  backgroundImage: 'radial-gradient(circle, rgba(14,157,116,.06) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

const categorias = [
  { Icon: Home, label: 'Casas', sub: 'Para morar com a família', href: '/imoveis?tipo=casa' },
  { Icon: Building2, label: 'Apartamentos', sub: 'Praticidade e localização', href: '/imoveis?tipo=apartamento' },
  { Icon: Trees, label: 'Terrenos', sub: 'Construa do seu jeito', href: '/imoveis?tipo=terreno' },
  { Icon: Store, label: 'Imóveis comerciais', sub: 'Salas, lojas e galpões', href: '/imoveis?tipo=sala-comercial' },
  { Icon: Sparkles, label: 'Lançamentos', sub: 'Novos empreendimentos', href: '/imoveis?modalidade=lancamento' },
];

const profissionais = [
  { Icon: Building2, label: 'Imobiliárias', desc: 'Agências completas para comprar, vender e alugar com segurança.', href: '/profissionais/imobiliaria' },
  { Icon: HardHat, label: 'Construtoras', desc: 'Empreendimentos e lançamentos das principais construtoras da região.', href: '/profissionais/construtora' },
  { Icon: Compass, label: 'Engenheiros civis', desc: 'Projetos, laudos e acompanhamento de obra com profissionais habilitados.', href: '/profissionais/engenharia_civil' },
  { Icon: Handshake, label: 'Corretores', desc: 'Corretores credenciados para te ajudar em cada etapa da negociação.', href: '/profissionais/corretor_autonomo' },
];

const seoChips = [
  { label: 'Casas à venda', href: '/imoveis?tipo=casa&modalidade=venda' },
  { label: 'Apartamentos para alugar', href: '/imoveis?tipo=apartamento&modalidade=aluguel' },
  { label: 'Terrenos à venda', href: '/imoveis?tipo=terreno&modalidade=venda' },
];

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="mb-1 text-[clamp(19px,2.1vw,23px)] font-extrabold tracking-tight text-text">{title}</h2>
      <p className="text-[13.5px] leading-snug text-muted">{sub}</p>
    </div>
  );
}

// Trilho: carrossel horizontal no mobile, vira grade no desktop (CSS scroll-snap, sem JS).
const rail = 'no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scroll-padding-left:1.5rem]';

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
  const [cities, types, venda, counts] = await Promise.all([
    getFeaturedCities(),
    getPropertyTypes(),
    getFeaturedProperties('venda', 8),
    getCityCounts(),
  ]);
  const cityOpts = cities.map((c) => ({ value: c.slug, label: c.name }));
  const typeOpts = types.map((t) => ({ value: t.slug, label: t.name }));
  const cityCards = citySequence.map((item) => cities.find((city) => city.slug === item.slug) ?? item);

  return (
    <main className="w-full overflow-x-hidden">
      {/* HERO */}
      <section className="relative flex min-h-[480px] items-center overflow-hidden py-10 md:min-h-[clamp(480px,56vh,580px)]">
        <Image
          src="/hero-family-moving.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_32%] md:object-[center_34%]"
        />
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(6,11,9,.88) 0%,rgba(6,11,9,.62) 42%,rgba(6,11,9,.2) 100%),linear-gradient(180deg,rgba(6,11,9,.12) 0%,rgba(6,11,9,.6) 100%)' }} />
        <div className="relative z-[2] mx-auto w-full max-w-[1200px] px-6">
          <div className="mx-auto flex max-w-[440px] flex-col items-center text-center text-white md:mx-0 md:block md:rounded-[26px] md:border md:border-white/70 md:bg-white/95 md:p-6 md:text-left md:text-slate-900 md:shadow-[0_24px_55px_-26px_rgba(15,23,42,.55)] md:backdrop-blur-sm">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-white backdrop-blur-sm md:hidden">
              <Sparkles size={12} /> Portal imobiliário regional
            </span>
            <h1 className="mb-1.5 text-[22px] font-extrabold leading-[1.12] tracking-tight sm:text-[24px] md:text-[26px] md:text-slate-900">
              Encontre o imóvel ideal no Oeste da Bahia
            </h1>
            <p className="mb-4 max-w-[340px] text-[13.5px] leading-snug text-white/85 md:max-w-none md:text-slate-500">
              Casas, apartamentos, terrenos e imóveis comerciais nas principais cidades da região.
            </p>
            <HeroSearch cities={cityOpts} types={typeOpts} />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section id="busca" className="border-b border-border/70 bg-surface">
        <div className="mx-auto max-w-[1100px] px-6 py-6">
          <div className="flex flex-wrap justify-center gap-x-[clamp(20px,5vw,56px)] gap-y-3">
            {[
              { Icon: Building2, strong: '+3.000', rest: 'imóveis anunciados' },
              { Icon: MapPin, strong: '10 cidades', rest: 'do Oeste da Bahia' },
              { Icon: Users, strong: '+200', rest: 'profissionais e empresas' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[#3a463f] dark:text-muted">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f4ef] dark:bg-primary/15">
                  <t.Icon size={18} className="text-primary" />
                </span>
                <span className="text-[13.5px]"><strong className="font-extrabold text-text">{t.strong}</strong> {t.rest}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CIDADES */}
      <section className="relative overflow-hidden bg-[#f7f9f8] py-[clamp(40px,5.5vw,68px)] dark:bg-bg">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={dotPattern} />
        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mb-5">
            <SectionTitle title="Encontre imóveis por cidade" sub="Cobertura nas principais cidades do sudoeste e oeste da Bahia." />
          </div>
          <div className={`${rail} md:grid md:grid-cols-4 md:gap-4 md:overflow-visible lg:grid-cols-7`}>
            {cityCards.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="group relative block w-[150px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-[0_14px_30px_-22px_rgba(8,30,22,.5)] outline-none ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary md:w-auto"
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
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(40px,5.5vw,68px)]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <SectionTitle title="Imóveis em destaque" sub="Seleção de oportunidades recentes no Oeste da Bahia." />
            <Link href="/imoveis" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-primary hover:text-primary-hover">
              Ver todos os imóveis <ArrowRight size={15} />
            </Link>
          </div>
          {venda.length ? (
            <div className={`${rail} md:grid md:gap-5 md:overflow-visible md:[grid-template-columns:repeat(auto-fill,200px)]`}>
              {venda.map((p) => (
                <div key={p.slug} className="shrink-0 snap-start">
                  <PropertyCard {...p} />
                </div>
              ))}
            </div>
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
          <div className={`${rail} md:grid md:overflow-visible md:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]`}>
            {categorias.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="flex w-[210px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-surface p-5 outline-none transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_34px_-22px_rgba(8,30,22,.45)] focus-visible:ring-2 focus-visible:ring-primary md:w-auto"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#e6f4ef] dark:bg-primary/15">
                  <c.Icon size={22} className="text-primary" />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-text">{c.label}</span>
                  <span className="mt-0.5 block text-[13px] text-muted">{c.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROFISSIONAIS */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(40px,5.5vw,68px)]">
          <div className="mb-5">
            <SectionTitle title="Profissionais e empresas da região" sub="Conecte-se com imobiliárias, construtoras, engenheiros e corretores do Oeste da Bahia." />
          </div>
          <div className={`${rail} md:grid md:overflow-visible md:[grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]`}>
            {profissionais.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="flex w-[250px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-surface p-5 outline-none transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_34px_-22px_rgba(8,30,22,.45)] focus-visible:ring-2 focus-visible:ring-primary md:w-auto"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#e6f4ef] dark:bg-primary/15">
                  <p.Icon size={24} className="text-primary" />
                </span>
                <span className="text-[15px] font-bold text-text">{p.label}</span>
                <span className="text-[13px] leading-relaxed text-muted">{p.desc}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-bold text-primary">
                  Ver {p.label.toLowerCase()} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA ANUNCIANTE */}
      <section id="anunciar" className="relative overflow-hidden" style={{ background: 'linear-gradient(120deg,#0c5a44 0%,#0e9d74 60%,#16b387 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-7 px-6 py-[clamp(40px,5.5vw,64px)] md:flex-row md:items-center">
          <div className="max-w-[620px]">
            <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.08em] text-[#bdf3e2]">
              <Megaphone size={16} /> Para anunciantes
            </div>
            <h2 className="m-0 mb-3 text-[clamp(20px,2.6vw,28px)] font-extrabold leading-[1.12] tracking-tight text-white">
              Anuncie seu imóvel ou sua empresa
            </h2>
            <p className="m-0 text-[14px] leading-relaxed text-white/90 md:text-[15px]">
              Proprietários particulares anunciam <strong className="text-white">grátis</strong>. Imobiliárias, construtoras e profissionais contam com planos para destacar seus imóveis e captar mais clientes no Oeste da Bahia.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[240px]">
            <Link href="/anunciar" className="flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-extrabold text-[#0c5a44] shadow-[0_14px_30px_-12px_rgba(0,0,0,.4)] transition-transform hover:-translate-y-0.5">
              <PlusCircle size={18} /> Anunciar grátis
            </Link>
            <Link href="/anunciar" className="flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/10 px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/20">
              Ver planos para empresas
            </Link>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section id="sobre" className="scroll-mt-24 bg-[#f7f9f8] dark:bg-bg">
        <div className="mx-auto max-w-[920px] px-6 py-[clamp(40px,5.5vw,64px)]">
          <h2 className="mb-3 text-[clamp(19px,2.1vw,23px)] font-extrabold tracking-tight text-text">Imóveis no Oeste da Bahia</h2>
          <p className="mb-4 text-[14px] leading-relaxed text-[#46514a] dark:text-muted">
            O <strong>77imóveis</strong> é o portal imobiliário regional que reúne casas, apartamentos, terrenos e imóveis comerciais nas principais cidades do sudoeste e oeste da Bahia. Pesquise para comprar ou alugar com filtros de cidade, tipo e número de quartos, e fale diretamente com imobiliárias, construtoras, engenheiros civis e corretores da sua região.
          </p>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="rounded-full bg-[#e6f4ef] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#28433a] transition-colors hover:bg-[#d3ecdf] dark:bg-primary/15 dark:text-primary">
                Imóveis em {c.name}
              </Link>
            ))}
            {seoChips.map((chip) => (
              <Link key={chip.label} href={chip.href} className="rounded-full bg-[#e6f4ef] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#28433a] transition-colors hover:bg-[#d3ecdf] dark:bg-primary/15 dark:text-primary">
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
