import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCityBySlug,
  getTypeByUrlSlug,
  getPropertyTypes,
  searchProperties,
  type Negotiation,
} from '@/lib/data';
import { plural } from '@/lib/format';
import { PropertyCard } from '@/components/property/PropertyCard';
import { FilterBar } from '@/components/property/FilterBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd, itemListLd } from '@/lib/seo/jsonld';

export const revalidate = 300;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';
const PER_PAGE = 12;

const NEGOS: Negotiation[] = ['venda', 'aluguel', 'temporada', 'romaria', 'lancamento'];
const negoText: Record<Negotiation, string> = {
  venda: 'à venda',
  aluguel: 'para alugar',
  temporada: 'para temporada',
  romaria: 'para romaria',
  lancamento: 'em lançamento',
};

type Params = { cidade: string; rest?: string[] };
type Search = { [k: string]: string | string[] | undefined };
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// Consultas memoizadas por requisição (evita repetir em metadata + página).
const loadCity = cache((slug: string) => getCityBySlug(slug));
const loadType = cache((slug: string) => getTypeByUrlSlug(slug));

// Carrega cidade + tipo da URL (ou 404).
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

  const { items, total } = await searchProperties({
    cityId: city.id,
    typeId: type?.id,
    negotiation,
    bedrooms: num(searchParams.quartos),
    minPrice: num(searchParams.min),
    maxPrice: num(searchParams.max),
    sort,
    page,
    perPage: PER_PAGE,
  });

  const types = await getPropertyTypes();
  const pages = Math.ceil(total / PER_PAGE);
  const h1 = heading(city, type, negotiation);
  const path = type ? `/${city.slug}/${params.rest![0]}` : `/${city.slug}`;

  // Mantém os filtros ativos ao paginar.
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
    <main className="mx-auto max-w-6xl px-4 py-6">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Início', url: SITE },
          { name: city.name, url: `${SITE}/${city.slug}` },
          ...(type ? [{ name: plural(type.name), url: `${SITE}${path}` }] : []),
        ])}
      />
      {!!items.length && (
        <JsonLd
          data={itemListLd(items.map((p) => ({ name: p.title, url: `${SITE}/imovel/${p.slug}` })))}
        />
      )}

      <nav aria-label="trilha" className="mb-3 text-sm text-muted">
        <Link href="/">Início</Link> ›{' '}
        <Link href={`/${city.slug}`}>{city.name}</Link>
        {type && <> › {plural(type.name)}</>}
      </nav>

      <h1 className="text-2xl font-bold">{h1}</h1>
      <p className="mb-4 mt-1 text-sm text-muted">
        {total} {total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
      </p>

      {/* Atalhos por tipo (navegação e SEO interno) */}
      <div className="mb-4 flex flex-wrap gap-2">
        {types.map((t) => {
          const active = type?.slug === t.slug;
          return (
            <Link
              key={t.slug}
              href={`/${city.slug}/${t.slug}s`}
              className={
                active
                  ? 'rounded-full bg-primary px-3 py-1 text-sm text-white'
                  : 'rounded-full border border-border bg-surface px-3 py-1 text-sm hover:bg-bg'
              }
            >
              {plural(t.name)}
            </Link>
          );
        })}
      </div>

      <FilterBar />

      {items.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <PropertyCard key={p.slug} {...p} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-border p-10 text-center text-muted">
          Nenhum imóvel encontrado com esses filtros. Tente ampliar a busca.
        </p>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="paginação">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              className={
                n === page
                  ? 'rounded-lg bg-primary px-3 py-2 text-sm text-white'
                  : 'rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-bg'
              }
            >
              {n}
            </Link>
          ))}
        </nav>
      )}

      {/* Texto de autoridade tópica (GEO) na página da cidade */}
      {!type && city.intro_text && (
        <section className="mt-10 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
          <h2 className="mb-2 text-base font-semibold text-text">Sobre o mercado em {city.name}</h2>
          <p>{city.intro_text}</p>
        </section>
      )}
    </main>
  );
}
