import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getCityBySlug,
  getCitySearchInsights,
  getPropertyTypes,
  getTypeByUrlSlug,
  searchProperties,
  type CardProperty,
  type Negotiation,
} from '@/lib/data';
import { cityEmojiFor, cityTaglineFor } from '@/lib/constants';
import { plural } from '@/lib/format';
import { PropertyRow } from '@/components/property/PropertyRow';
import { FilterBar } from '@/components/property/FilterBar';
import { SortDropdown } from '@/components/property/SortDropdown';
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
const list = (v: string | string[] | undefined) => (str(v) ?? '').split(',').filter(Boolean);

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

function heading(city: { name: string }, type: { name: string } | null, negs: Negotiation[] = []) {
  const what = type ? plural(type.name) : 'Imóveis';
  const negSuffix = negs.length ? ` ${negs.map((n) => negoText[n]).join(' ou ')}` : '';
  return `${what}${negSuffix} em ${city.name}`;
}

function exchangeText(value: string | string[] | undefined) {
  const normalized = str(value)?.toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'sim';
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
    <>
      {items.length ? (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {items.map((p, i) => (
            <PropertyRow key={p.slug} {...p} priority={i === 0} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-muted">
          Nenhum imóvel encontrado com esses filtros. Tente ampliar a busca.
        </p>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex flex-wrap justify-center gap-2" aria-label="paginação">
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
    </>
  );
}

function Neighborhoods({ cityName, citySlug, neighborhoods }: { cityName: string; citySlug: string; neighborhoods: { name: string; slug: string }[] }) {
  if (!neighborhoods.length) return null;
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-12">
      <h2 className="mb-5 text-lg font-bold">Principais bairros de {cityName}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {neighborhoods.slice(0, 6).map((n) => (
          <Link key={n.slug} href={`?bairro=${n.slug}`} className="rounded-lg border border-border bg-surface p-4 transition hover:border-primary/50 hover:bg-bg">
            <h3 className="text-sm font-semibold">{n.name}</h3>
            <p className="mt-1 text-sm text-muted">Veja imóveis próximos nesta região</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Destinations({ cities }: { cities: { name: string; slug: string }[] }) {
  if (!cities.length) return null;
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12">
      <h2 className="mb-4 text-lg font-bold">Destinos para conhecer</h2>
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

  const negotiations = list(searchParams.modalidade).filter((m): m is Negotiation => NEGOS.includes(m as Negotiation));
  const acceptsExchange = exchangeText(searchParams.troca) || exchangeText(searchParams.permuta);
  const page = num(searchParams.pagina) ?? 1;
  const sort = (str(searchParams.ordem) as any) || 'recentes';
  const bairroSlug = str(searchParams.bairro);

  const [types, insights] = await Promise.all([getPropertyTypes(), getCitySearchInsights(city.id, city.slug)]);
  const neighborhoodId = bairroSlug ? insights.neighborhoods.find((n) => n.slug === bairroSlug)?.id : undefined;

  const { items, total } = await searchProperties({
    cityId: city.id,
    typeId: type?.id,
    neighborhoodId,
    negotiations,
    acceptsExchange,
    bedrooms: list(searchParams.quartos),
    bathrooms: list(searchParams.banheiros),
    garages: list(searchParams.vagas),
    minPrice: num(searchParams.min),
    maxPrice: num(searchParams.max),
    sort,
    page,
    perPage: PER_PAGE,
  });

  const pages = Math.ceil(total / PER_PAGE);
  const h1 = `${heading(city, type, negotiations)}${acceptsExchange ? ' que aceitam troca' : ''}`;
  const path = type ? `/${city.slug}/${params.rest![0]}` : `/${city.slug}`;

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
    <main className="bg-slate-50 dark:bg-bg">
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

      <section className="mx-auto max-w-[1200px] px-6 pb-3 pt-5">
        <h1 className="text-xl font-bold leading-tight text-text sm:text-2xl">{h1}</h1>
        <p className="mt-1 text-sm text-muted">
          {total ? `${total} imóve${total > 1 ? 'is' : 'l'} encontrado${total > 1 ? 's' : ''} em ${city.name}` : `Nenhum imóvel encontrado em ${city.name} ainda`}
        </p>

        <div className="mt-3">
          <CityHeroSearchPanel
            city={city}
            path={path}
            cities={[{ value: city.slug, label: city.name }, ...insights.cities.map((c) => ({ value: c.slug, label: c.name }))]}
            types={(types as PropertyType[]).map((t) => ({ value: t.slug, label: plural(t.name) }))}
            neighborhoods={insights.neighborhoods.map((n) => ({ value: n.slug, label: n.name }))}
            currentTypeSlug={type?.slug}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] gap-6 px-6 pb-14 lg:grid lg:grid-cols-[280px_1fr]">
        <aside>
          <FilterBar hideNeighborhoods />
        </aside>

        <div className="mt-3 lg:mt-0">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted">{total} resultado{total === 1 ? '' : 's'}</span>
            <SortDropdown value={sort} />
          </div>
          <Results items={items} pages={pages} page={page} pageHref={pageHref} />
        </div>
      </section>

      {!type && city.intro_text && (
        <section className="mx-auto max-w-[1200px] px-6 pb-12">
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">
            <h2 className="mb-2 text-base font-semibold text-text">Sobre o mercado em {city.name}</h2>
            <p>{city.intro_text}</p>
          </div>
        </section>
      )}

      <Neighborhoods cityName={city.name} citySlug={city.slug} neighborhoods={insights.neighborhoods} />

      {!type && (
        <section className="mx-auto max-w-[1200px] px-6 pt-12">
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
