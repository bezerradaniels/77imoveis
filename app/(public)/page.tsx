import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, ArrowRight, Building2, Home, Trees, Store, Sparkles,
  HardHat, Compass, Handshake, Megaphone, PlusCircle, Users,
} from 'lucide-react';
import { getFeaturedCities, getPropertyTypes, getFeaturedProperties, getCityCounts } from '@/lib/data';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from '@/components/home/HomeSearch';
import { cityImageFor } from '@/lib/constants';

export const revalidate = 300;

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

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="mb-1 text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-tight text-text">{title}</h2>
      <p className="text-[15px] text-muted">{sub}</p>
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
  const [cities, types, venda, counts] = await Promise.all([
    getFeaturedCities(),
    getPropertyTypes(),
    getFeaturedProperties('venda', 6),
    getCityCounts(),
  ]);
  const cityOpts = cities.map((c) => ({ value: c.slug, label: c.name }));
  const typeOpts = types.map((t) => ({ value: t.slug, label: t.name }));
  const cityCards = citySequence.map((item) => cities.find((city) => city.slug === item.slug) ?? item);

  return (
    <main className="w-full overflow-x-hidden">
      {/* HERO */}
      <section className="relative flex min-h-[496px] items-center overflow-hidden px-0 py-10 md:min-h-[clamp(496px,58vh,608px)] md:py-10">
        <Image
          src="/hero-family-moving.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_32%] md:object-[center_34%]"
        />
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(6,11,9,.86) 0%,rgba(6,11,9,.62) 42%,rgba(6,11,9,.22) 100%),linear-gradient(180deg,rgba(6,11,9,.14) 0%,rgba(6,11,9,.62) 100%)' }} />
        <div className="relative z-[2] mx-auto w-full max-w-[1200px] px-6">
          <div className="max-w-[440px] rounded-[30px] bg-white p-5 text-slate-900 shadow-[0_20px_45px_-24px_rgba(15,23,42,.45)] sm:p-6">
            <h1 className="mb-5 text-4xl font-extrabold leading-[1] text-slate-900">
              O imóvel dos seus sonhos está aqui
            </h1>
            <HomeSearch cities={cityOpts} types={typeOpts} variant="hero" />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section id="busca" className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="flex flex-wrap justify-center gap-x-[clamp(20px,5vw,56px)] gap-y-3">
          {[
            { Icon: Building2, strong: '+3.000', rest: 'imóveis anunciados' },
            { Icon: MapPin, strong: '10 cidades', rest: 'da região 77' },
            { Icon: Users, strong: '+200', rest: 'profissionais e empresas' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[#3a463f] dark:text-muted">
              <t.Icon size={22} className="text-primary" />
              <span className="text-sm"><strong className="font-extrabold text-text">{t.strong}</strong> {t.rest}</span>
            </div>
          ))}
        </div>
      </section>

            {/* CIDADES */}
      <section className="bg-[#fafafa] py-[clamp(48px,6vw,72px)]">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-6">
            <SectionTitle title="Encontre imóveis por cidade" sub="Cobertura nas principais cidades do sudoeste e oeste da Bahia." />
          </div>
          <div className="no-scrollbar snap-x snap-mandatory overflow-x-auto pb-2">
            <div className="grid grid-flow-col auto-cols-[180px] gap-5">
              {cityCards.map((c) => (
                <Link key={c.slug} href={`/${c.slug}`} className="group block snap-start">
                  <span
                    aria-hidden
                    className="block h-[180px] w-[180px] overflow-hidden rounded-2xl bg-slate-200 bg-cover bg-center transition-transform duration-200 group-hover:scale-[1.015]"
                    style={{
                      backgroundImage: `url("${cityImageFor(c.slug)}")`,
                    }}
                  />
                  <span className="block pt-3">
                    <span className="block truncate text-[14px] font-semibold leading-5 text-slate-950">{c.name}</span>
                    <span className="mt-0.5 block text-[14px] font-semibold leading-5 text-slate-500">
                      {counts[c.slug] ? `${counts[c.slug]} imóveis` : 'Ver imóveis'}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(48px,6vw,72px)]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <SectionTitle title="Imóveis em destaque" sub="Seleção de oportunidades recentes na região 77." />
            <Link href="/imoveis" className="inline-flex items-center gap-1.5 text-[15px] font-bold text-primary">
              Ver todos os imóveis <ArrowRight size={15} />
            </Link>
          </div>
          {venda.length ? (
            <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,200px)]">
              {venda.map((p) => <PropertyCard key={p.slug} {...p} />)}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted">
              Em breve, imóveis em destaque aqui.
            </p>
          )}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(48px,6vw,72px)]">
          <SectionTitle title="Explore por tipo de imóvel" sub="Encontre o imóvel certo para comprar ou alugar na região 77." />
          <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            {categorias.map((c) => (
              <Link key={c.label} href={c.href} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-white p-[22px] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_34px_-22px_rgba(8,30,22,.45)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-[#e6f4ef] dark:bg-primary/15">
                  <c.Icon size={24} className="text-primary" />
                </span>
                <span>
                  <span className="block text-base font-bold text-text">{c.label}</span>
                  <span className="mt-0.5 block text-[13px] text-muted">{c.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* PROFISSIONAIS */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(48px,6vw,72px)]">
          <SectionTitle title="Profissionais e empresas da região" sub="Conecte-se com quem constrói, vende e cuida do seu imóvel no DDD 77." />
          <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
            {profissionais.map((p) => (
              <Link key={p.label} href={p.href} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_34px_-22px_rgba(8,30,22,.45)]">
                <span className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-[#e6f4ef] dark:bg-primary/15">
                  <p.Icon size={26} className="text-primary" />
                </span>
                <span className="text-[17px] font-bold text-text">{p.label}</span>
                <span className="text-[13.5px] leading-relaxed text-muted">{p.desc}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Ver {p.label.toLowerCase()} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA ANUNCIANTE */}
      <section id="anunciar" style={{ background: 'linear-gradient(120deg,#0c5a44 0%,#0e9d74 60%,#16b387 100%)' }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-7 px-6 py-[clamp(44px,6vw,68px)]">
          <div className="max-w-[620px]">
            <div className="mb-3.5 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.08em] text-[#bdf3e2]">
              <Megaphone size={17} /> Para anunciantes
            </div>
            <h2 className="m-0 mb-3 text-[clamp(24px,3vw,36px)] font-extrabold leading-[1.1] tracking-tight text-white">
              Anuncie seu imóvel ou sua empresa
            </h2>
            <p className="m-0 text-[clamp(15px,1.6vw,18px)] leading-[1.55] text-white/90">
              Proprietários particulares anunciam <strong className="text-white">grátis</strong>. Imobiliárias, construtoras e profissionais contam com planos para destacar seus imóveis e captar mais clientes na região 77.
            </p>
          </div>
          <div className="flex min-w-[240px] flex-col gap-3">
            <Link href="/anunciar" className="flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-extrabold text-[#0c5a44] shadow-[0_14px_30px_-12px_rgba(0,0,0,.4)] transition-transform hover:-translate-y-0.5">
              <PlusCircle size={19} /> Anunciar grátis
            </Link>
            <Link href="/anunciar" className="flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/10 px-7 py-4 text-base font-bold text-white transition-colors hover:bg-white/20">
              Ver planos para empresas
            </Link>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section id="sobre" className="scroll-mt-24 bg-[#fafafa]">
        <div className="mx-auto max-w-[920px] px-6 py-[clamp(48px,6vw,72px)]">
          <h2 className="mb-4 text-[clamp(20px,2.4vw,28px)] font-extrabold tracking-tight text-text">Imóveis na região do DDD 77, na Bahia</h2>
          <p className="mb-3.5 text-base leading-[1.7] text-[#46514a] dark:text-muted">
            O <strong>77imóveis</strong> é o portal imobiliário regional que reúne casas, apartamentos, terrenos e imóveis comerciais nas principais cidades do sudoeste e oeste da Bahia. Pesquise imóveis para comprar ou alugar com filtros de cidade, tipo, faixa de preço e número de quartos, e fale diretamente com imobiliárias, construtoras, engenheiros civis e corretores da sua região.
          </p>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="rounded-full bg-[#e6f4ef] px-3.5 py-1.5 text-[13px] font-semibold text-[#28433a] transition-colors hover:bg-[#d3ecdf] dark:bg-primary/15 dark:text-primary">
                Imóveis em {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
