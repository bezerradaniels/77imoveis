import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Waves,
  Wifi,
} from 'lucide-react';
import {
  getCityBySlug,
  getCitySearchInsights,
  getPropertyTypes,
  getTypeByUrlSlug,
  searchProperties,
  type CardProperty,
  type Negotiation,
} from '@/lib/data';
import { cityEmojiFor, cityTaglineFor, typeEmojiFor } from '@/lib/constants';
import { plural } from '@/lib/format';
import { PropertyCard } from '@/components/property/PropertyCard';
import { FilterBar } from '@/components/property/FilterBar';
import { CityHeroSearchPanel } from '@/components/search/CityHeroSearchPanel';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd, faqLd, itemListLd } from '@/lib/seo/jsonld';

export const revalidate = 300;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';
const PER_PAGE = 12;

const NEGOS: Negotiation[] = ['venda', 'aluguel', 'temporada', 'romaria', 'lancamento'];
const negoText: Record<Negotiation, string> = {
  venda: 'à venda',
  aluguel: 'para alugar',
  temporada: 'por temporada',
  romaria: 'para romaria',
  lancamento: 'em lançamento',
};

type Params = { cidade: string; rest?: string[] };
type Search = { [k: string]: string | string[] | undefined };
type PropertyType = { id: string; name: string; slug: string; icon?: string | null };

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const loadCity = cache((slug: string) => getCityBySlug(slug));
const loadType = cache((slug: string) => getTypeByUrlSlug(slug));

async function resolve({ cidade, rest }: Params) {
  if (rest && rest.length > 1) notFound();
  const city = await loadCity(cidade);
  if (!city) notFound();
  const tipoUrl = rest?.[0];
  const type = tipoUrl ? await loadType(tipoUrl) : null;
  if (tipoUrl && !type) notFound();
  return { city, type };
}

function heading(city: { name: string }, type: { name: string } | null, neg?: Negotiation) {
  const what = type ? plural(type.name) : 'Imóveis';
  return `${what}${neg ? ` ${negoText[neg]}` : ''} em ${city.name}`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city, type } = await resolve(params);
  const title = `${heading(city, type)} (BA) | 77Imóveis`;
  const description =
    (type ? '' : city.seo_description) ||
    `Veja ${heading(city, type).toLowerCase()} e em toda a região do DDD 77. Anúncios de imobiliárias e corretores.`;
  const path = type ? `/${city.slug}/${params.rest![0]}` : `/${city.slug}`;
  return { title, description, alternates: { canonical: `${SITE}${path}` } };
}

function HeroImage({ items, cityName }: { items: CardProperty[]; cityName: string }) {
  const image = items.find((p) => p.coverUrl && !p.coverUrl.includes('placeholder'))?.coverUrl ?? '/search-city-hero.png';

  return (
    <div className="relative h-[calc((100vw-32px)*0.5625-4px)] max-h-[calc((1280px-32px)*0.78*0.5625-4px)] w-full overflow-hidden rounded-[24px] bg-subtle lg:h-[calc(min((100vw-32px)*0.78,998.4px)*0.5625-4px)] lg:rounded-[28px]">
      <img
        src={image}
        alt={`Imóveis em ${cityName}`}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function QuickStats({
  cityName,
  total,
  companies,
  neighborhoods,
}: {
  cityName: string;
  total: number;
  companies: number;
  neighborhoods: number;
}) {
  const stats = [
    { icon: Home, title: 'Total de imóveis', text: `${total} anúncios ativos em ${cityName}` },
    { icon: ShieldCheck, title: 'Anunciantes locais', text: `${companies} profissionais e empresas na cidade` },
    { icon: MapPin, title: 'Regiões mapeadas', text: `${neighborhoods} bairros para refinar sua busca` },
    { icon: Sparkles, title: 'Busca atualizada', text: 'Filtros por preço, quartos, tipo e modalidade' },
  ];

  return (
    <section className="mx-auto mt-8 grid max-w-6xl gap-3 px-4 sm:grid-cols-2 lg:-mt-10 lg:grid-cols-4">
      {stats.map(({ icon: Icon, title, text }) => (
        <article key={title} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <Icon size={22} className="mb-3 text-primary" />
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted">{text}</p>
        </article>
      ))}
    </section>
  );
}

function FeaturedRow({ cityName, items }: { cityName: string; items: CardProperty[] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16">
      <div className="mb-7 text-center">
        <h2 className="text-2xl font-bold">Imóveis em destaque em {cityName}</h2>
        <p className="mt-2 text-sm text-muted">Uma seleção rápida para começar a comparar localização, preço e perfil do imóvel.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <PropertyCard key={p.slug} {...p} />
        ))}
      </div>
    </section>
  );
}

function TypeTiles({ citySlug, types }: { citySlug: string; types: PropertyType[] }) {
  if (!types.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16">
      <h2 className="mb-7 text-center text-2xl font-bold">Tipos populares em {citySlug.replace(/-/g, ' ')}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {types.slice(0, 5).map((t) => (
          <Link key={t.slug} href={`/${citySlug}/${t.slug}s`} className="rounded-lg border border-border bg-surface p-5 text-center transition hover:border-primary/50 hover:bg-bg">
            <span className="block text-3xl">{typeEmojiFor(t.slug)}</span>
            <span className="mt-3 block text-sm font-semibold">{plural(t.name)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Neighborhoods({ cityName, citySlug, neighborhoods }: { cityName: string; citySlug: string; neighborhoods: { name: string; slug: string }[] }) {
  if (!neighborhoods.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16">
      <h2 className="mb-7 text-center text-2xl font-bold">Fique perto dos principais bairros de {cityName}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {neighborhoods.slice(0, 6).map((n) => (
          <Link key={n.slug} href={`/${citySlug}?bairro=${n.slug}`} className="rounded-lg border border-border bg-surface p-5 transition hover:border-primary/50 hover:bg-bg">
            <h3 className="text-sm font-semibold">{n.name}</h3>
            <p className="mt-1 text-sm text-muted">Veja imóveis próximos nesta região</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Amenities() {
  const amenities = [
    { Icon: Wifi, label: 'Boa conexão' },
    { Icon: Building2, label: 'Condomínio' },
    { Icon: Trees, label: 'Área externa' },
    { Icon: Waves, label: 'Lazer' },
    { Icon: Star, label: 'Destaques' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16">
      <h2 className="mb-7 text-center text-2xl font-bold">Comodidades buscadas na região</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {amenities.map(({ Icon, label }) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-5 text-center">
            <Icon size={28} className="mx-auto text-primary" />
            <p className="mt-3 text-sm font-semibold">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Results({
  items,
  pages,
  page,
  pageHref,
}: {
  items: CardProperty[];
  pages: number;
  page: number;
  pageHref: (n: number) => string;
}) {
  return (
    <section id="resultados" className="mx-auto max-w-6xl px-4 pt-16">
      <h2 className="mb-7 text-center text-2xl font-bold">Outros imóveis excelentes para conhecer</h2>
      {items.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <PropertyCard key={p.slug} {...p} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-muted">
          Nenhum imóvel encontrado com esses filtros. Tente ampliar a busca.
        </p>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="paginação">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface hover:bg-bg" aria-label="Página anterior">
              <ChevronLeft size={17} />
            </Link>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              className={n === page ? 'rounded-lg bg-primary px-3 py-2 text-sm text-white' : 'rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-bg'}
            >
              {n}
            </Link>
          ))}
          {page < pages && (
            <Link href={pageHref(page + 1)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface hover:bg-bg" aria-label="Próxima página">
              <ChevronRight size={17} />
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}

function SearchFiltersSection() {
  return (
    <section id="filtros" className="mx-auto max-w-6xl px-4 pt-12">
      <FilterBar />
    </section>
  );
}

function Destinations({ cities }: { cities: { name: string; slug: string }[] }) {
  if (!cities.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-4 text-xl font-bold">Destinos para conhecer</h2>
      <div className="grid gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {cities.map((c) => (
          <Link key={c.slug} href={`/${c.slug}`} className="text-sm hover:text-primary">
            <span className="block font-semibold">{cityEmojiFor(c.slug)} {c.name}</span>
            <span className="block text-muted">{cityTaglineFor(c.slug)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ListagemPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { city, type } = await resolve(params);

  const modalidade = str(searchParams.modalidade) as Negotiation | undefined;
  const negotiation = modalidade && NEGOS.includes(modalidade) ? modalidade : undefined;
  const page = num(searchParams.pagina) ?? 1;
  const sort = (str(searchParams.ordem) as any) || 'recentes';

  const [{ items, total }, types, insights] = await Promise.all([
    searchProperties({
      cityId: city.id,
      typeId: type?.id,
      negotiation,
      bedrooms: num(searchParams.quartos),
      minPrice: num(searchParams.min),
      maxPrice: num(searchParams.max),
      sort,
      page,
      perPage: PER_PAGE,
    }),
    getPropertyTypes(),
    getCitySearchInsights(city.id, city.slug),
  ]);

  const pages = Math.ceil(total / PER_PAGE);
  const h1 = heading(city, type, negotiation);
  const path = type ? `/${city.slug}/${params.rest![0]}` : `/${city.slug}`;
  const featured = [...items].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  const pageHref = (n: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const s = str(v);
      if (s && k !== 'pagina') sp.set(k, s);
    }
    sp.set('pagina', String(n));
    return `${path}?${sp.toString()}`;
  };

  return (
    <main className="bg-bg">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Início', url: SITE },
          { name: city.name, url: `${SITE}/${city.slug}` },
          ...(type ? [{ name: plural(type.name), url: `${SITE}${path}` }] : []),
        ])}
      />
      {!!items.length && (
        <JsonLd data={itemListLd(items.map((p) => ({ name: p.title, url: `${SITE}/imovel/${p.slug}` })))} />
      )}

      <section className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 md:pt-8 lg:pb-14">
        <div className="relative">
          <div className="lg:ml-auto lg:w-[78%]">
            <HeroImage items={items} cityName={city.name} />
          </div>
          <div className="relative z-10 mt-6 w-full lg:absolute lg:left-0 lg:top-1/2 lg:mt-0 lg:max-w-[480px] lg:-translate-y-1/2 lg:px-0">
            <CityHeroSearchPanel
              city={city}
              total={total}
              h1={h1}
              path={path}
              cities={[{ value: city.slug, label: city.name }, ...insights.cities.map((c) => ({ value: c.slug, label: c.name }))]}
              types={(types as PropertyType[]).map((t) => ({ value: t.slug, label: plural(t.name) }))}
              currentTypeSlug={type?.slug}
              currentNegotiation={negotiation}
            />
          </div>
        </div>
      </section>

      <QuickStats
        cityName={city.name}
        total={insights.activeProperties || total}
        companies={insights.companies}
        neighborhoods={insights.neighborhoods.length}
      />

      <FeaturedRow cityName={city.name} items={featured} />
      <TypeTiles citySlug={city.slug} types={types as PropertyType[]} />
      <SearchFiltersSection />
      <Amenities />
      <Neighborhoods cityName={city.name} citySlug={city.slug} neighborhoods={insights.neighborhoods} />
      <Results items={items} pages={pages} page={page} pageHref={pageHref} />

      {!type && city.intro_text && (
        <section className="mx-auto max-w-6xl px-4 pt-12">
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">
            <h2 className="mb-2 text-base font-semibold text-text">Sobre o mercado em {city.name}</h2>
            <p>{city.intro_text}</p>
          </div>
        </section>
      )}

      {!type && (
        <section className="mx-auto max-w-6xl px-4 pt-12">
          <JsonLd
            data={faqLd([
              { q: `Como encontrar imóveis à venda em ${city.name}?`, a: `Use os filtros de tipo, preço e número de quartos nesta página de ${city.name}. Os anúncios são atualizados por imobiliárias, corretores e particulares da região do DDD 77.` },
              { q: `Dá para alugar imóveis em ${city.name}?`, a: `Sim. Selecione a modalidade "Alugar" nos filtros para ver casas e apartamentos para locação em ${city.name}.` },
              { q: `Como anunciar meu imóvel em ${city.name}?`, a: `Crie uma conta gratuita no 77Imóveis e publique seu imóvel. Particulares têm 1 anúncio grátis; profissionais têm planos com mais anúncios.` },
            ])}
          />
          <h2 className="mb-3 text-lg font-semibold">Perguntas frequentes</h2>
          <div className="space-y-2 text-sm">
            <details className="rounded-lg border border-border bg-surface p-3">
              <summary className="cursor-pointer font-medium">Como encontrar imóveis à venda em {city.name}?</summary>
              <p className="mt-2 text-muted">Use os filtros de tipo, preço e número de quartos nesta página. Os anúncios são de imobiliárias, corretores e particulares da região.</p>
            </details>
            <details className="rounded-lg border border-border bg-surface p-3">
              <summary className="cursor-pointer font-medium">Dá para alugar imóveis em {city.name}?</summary>
              <p className="mt-2 text-muted">Sim, selecione a modalidade Alugar nos filtros para ver imóveis para locação.</p>
            </details>
            <details className="rounded-lg border border-border bg-surface p-3">
              <summary className="cursor-pointer font-medium">Como anunciar meu imóvel em {city.name}?</summary>
              <p className="mt-2 text-muted">Crie uma conta gratuita e publique. Particulares têm 1 anúncio grátis; profissionais têm planos com mais anúncios.</p>
            </details>
          </div>
        </section>
      )}

      <Destinations cities={insights.cities} />
    </main>
  );
}
