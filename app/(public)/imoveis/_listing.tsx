import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getCitiesAll,
  getNeighborhoods,
  getPropertyTypes,
  searchProperties,
  type CardProperty,
  type Negotiation,
} from '@/lib/data';
import { plural } from '@/lib/format';
import { PropertyRow } from '@/components/property/PropertyRow';
import { FilterBar } from '@/components/property/FilterBar';
import { SortDropdown } from '@/components/property/SortDropdown';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd, itemListLd } from '@/lib/seo/jsonld';
import { pageMetadata, REGION } from '@/lib/seo/meta';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';
const PER_PAGE = 12;

export const IMOVEIS_NEGOTIATIONS: Negotiation[] = ['venda', 'aluguel', 'temporada', 'romaria', 'lancamento'];
export const IMOVEIS_TYPE_SLUGS = [
  'casa',
  'apartamento',
  'cobertura',
  'kitnet',
  'condominio',
  'sala-comercial',
  'loja',
  'galpao',
  'terreno',
  'lote',
  'chacara',
  'fazenda',
] as const;

const negoText: Record<Negotiation, string> = {
  venda: 'à venda',
  aluguel: 'para alugar',
  temporada: 'por temporada',
  romaria: 'para romaria',
  lancamento: 'em lançamento',
};

export type Search = { [k: string]: string | string[] | undefined };
export type ImoveisPreset = {
  typeSlug?: string;
  negotiation?: Negotiation;
  path: string;
};

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const list = (v: string | string[] | undefined) => (str(v) ?? '').split(',').filter(Boolean);

function exchangeText(value: string | string[] | undefined) {
  const normalized = str(value)?.toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'sim';
}

function heading(typeName: string | undefined, negs: Negotiation[] = []) {
  const what = typeName ? plural(typeName) : 'Imóveis';
  const negSuffix = negs.length ? ` ${negs.map((n) => negoText[n]).join(' ou ')}` : '';
  return `${what}${negSuffix} no ${REGION}`;
}

function buildPath(typeSlug?: string, negotiation?: Negotiation) {
  if (typeSlug && negotiation) return `/imoveis/${typeSlug}/${negotiation}`;
  if (typeSlug) return `/imoveis/${typeSlug}`;
  if (negotiation) return `/imoveis/${negotiation}`;
  return '/imoveis';
}

export function imoveisPrettyPath(typeSlug?: string, negotiation?: Negotiation) {
  return buildPath(typeSlug, negotiation);
}

const FILTER_KEYS = ['cidade', 'tipo', 'bairro', 'modalidade', 'quartos', 'banheiros', 'vagas', 'min', 'max', 'busca', 'troca', 'permuta'];
function hasActiveFilters(sp: Search) {
  if (FILTER_KEYS.some((k) => str(sp[k]))) return true;
  return (num(sp.pagina) ?? 1) > 1;
}

function routeSearch(searchParams: Search, preset?: ImoveisPreset) {
  const queryTypes = list(searchParams.tipo);
  const queryNegos = list(searchParams.modalidade).filter((m): m is Negotiation => IMOVEIS_NEGOTIATIONS.includes(m as Negotiation));
  return {
    typeSlugs: preset?.typeSlug ? [preset.typeSlug] : queryTypes,
    negotiations: preset?.negotiation ? [preset.negotiation] : queryNegos,
  };
}

export async function queryRedirectForImoveis(searchParams: Search) {
  const typeSlugs = list(searchParams.tipo);
  const negotiations = list(searchParams.modalidade).filter((m): m is Negotiation => IMOVEIS_NEGOTIATIONS.includes(m as Negotiation));
  if (typeSlugs.length > 1 || negotiations.length > 1) return null;
  if (!typeSlugs.length && !negotiations.length) return null;

  const typeSlug = typeSlugs[0];
  const negotiation = negotiations[0];
  if (typeSlug && !IMOVEIS_TYPE_SLUGS.includes(typeSlug as any)) return null;

  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const value = str(v);
    if (value && k !== 'tipo' && k !== 'modalidade') next.set(k, value);
  }
  const qs = next.toString();
  return `${buildPath(typeSlug, negotiation)}${qs ? `?${qs}` : ''}`;
}

export async function createImoveisMetadata({
  searchParams,
  preset,
}: {
  searchParams: Search;
  preset?: ImoveisPreset;
}): Promise<Metadata> {
  const types = await getPropertyTypes();
  const { typeSlugs, negotiations } = routeSearch(searchParams, preset);
  const type = typeSlugs.length === 1 ? (types as any[]).find((t) => t.slug === typeSlugs[0]) : undefined;
  const busca = str(searchParams.busca)?.trim();
  const what = type?.name ? plural(type.name) : 'Imóveis';
  const negTxt = negotiations.length ? ` ${negotiations.map((n) => negoText[n]).join(' ou ')}` : '';
  const title = busca ? `Busca por “${busca}”` : heading(type?.name, negotiations);
  const description = busca
    ? `Resultados de imóveis para “${busca}” no ${REGION}. Compare preços, veja fotos e fale direto com os anunciantes.`
    : `Encontre ${what.toLowerCase()}${negTxt} em todas as cidades do ${REGION}. Anúncios de imobiliárias, corretores e particulares com fotos, preços e contato.`;

  return pageMetadata({
    title,
    description,
    path: preset?.path ?? '/imoveis',
    noindex: hasActiveFilters(searchParams),
  });
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
              className={n === page ? 'rounded-lg bg-primary px-3 py-2 text-sm text-on-primary' : 'rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-bg'}
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

export async function ImoveisListingPage({
  searchParams,
  preset,
}: {
  searchParams: Search;
  preset?: ImoveisPreset;
}) {
  const { typeSlugs, negotiations } = routeSearch(searchParams, preset);
  const acceptsExchange = exchangeText(searchParams.troca) || exchangeText(searchParams.permuta);
  const busca = str(searchParams.busca)?.trim();
  const page = num(searchParams.pagina) ?? 1;
  const sort = (str(searchParams.ordem) as any) || 'recentes';
  const path = preset?.path ?? '/imoveis';

  const [cities, types] = await Promise.all([getCitiesAll(), getPropertyTypes()]);
  const city = (cities as any[]).find((c) => c.slug === str(searchParams.cidade));
  const typeIds = (types as any[]).filter((t) => typeSlugs.includes(t.slug)).map((t) => t.id);
  const type = typeSlugs.length === 1 ? (types as any[]).find((t) => t.slug === typeSlugs[0]) : undefined;
  const neighborhoods = city ? await getNeighborhoods(city.id) : [];
  const bairroSlug = str(searchParams.bairro);
  const neighborhoodId = bairroSlug ? (neighborhoods as any[]).find((n) => n.slug === bairroSlug)?.id : undefined;

  const { items, total } = await searchProperties({
    cityId: city?.id,
    typeIds,
    neighborhoodId,
    negotiations,
    acceptsExchange,
    text: busca,
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
  const h1 = busca
    ? `Resultados para “${busca}”`
    : `${heading(type?.name, negotiations)}${acceptsExchange ? ' que aceitam troca' : ''}`;

  const pageHref = (n: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const s = str(v);
      if (!s || k === 'pagina' || k === 'tipo' || k === 'modalidade') continue;
      sp.set(k, s);
    }
    sp.set('pagina', String(n));
    return `${path}?${sp.toString()}`;
  };

  return (
    <main className="bg-internal dark:bg-bg">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Início', url: SITE },
          { name: 'Imóveis', url: `${SITE}/imoveis` },
          ...(type ? [{ name: plural(type.name), url: `${SITE}${buildPath(type.slug)}` }] : []),
          ...(negotiations.length === 1 ? [{ name: negoText[negotiations[0]], url: `${SITE}${path}` }] : []),
        ])}
      />
      {!!items.length && (
        <JsonLd data={itemListLd(items.map((p) => ({ name: p.title, url: `${SITE}/imovel/${p.slug}` })))} />
      )}

      <section className="mx-auto max-w-[1200px] px-6 pb-3 pt-5">
        <h1 className="text-xl font-bold leading-tight text-text sm:text-2xl">{h1}</h1>
        <p className="mt-1 text-sm text-muted">
          {total
            ? `${total} imóve${total > 1 ? 'is' : 'l'} encontrado${total > 1 ? 's' : ''} em todo o ${REGION}`
            : 'Nenhum imóvel encontrado com esses filtros ainda'}
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] gap-6 px-6 pb-14 lg:grid lg:grid-cols-[280px_1fr]">
        <aside>
          <FilterBar
            cities={(cities as any[]).map((c) => ({ value: c.slug, label: c.name }))}
            types={(types as any[]).map((t) => ({ value: t.slug, label: plural(t.name) }))}
            neighborhoods={(neighborhoods as any[]).map((n) => ({ value: n.slug, label: n.name }))}
            currentType={typeSlugs.length === 1 ? typeSlugs[0] : undefined}
            currentModalidades={negotiations}
            prettyImoveisRoutes
          />
        </aside>

        <div className="mt-3 lg:mt-0">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted">{total} resultado{total === 1 ? '' : 's'}</span>
            <SortDropdown value={sort} />
          </div>
          <Results items={items} pages={pages} page={page} pageHref={pageHref} />
        </div>
      </section>
    </main>
  );
}
