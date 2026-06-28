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

type Search = { [k: string]: string | string[] | undefined };

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
  return `${what}${negSuffix} no DDD 77`;
}

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const types = await getPropertyTypes();
  const type = (types as any[]).find((t) => t.slug === str(searchParams.tipo));
  const negotiations = list(searchParams.modalidade).filter((m): m is Negotiation => NEGOS.includes(m as Negotiation));
  const h = heading(type?.name, negotiations);
  return {
    title: `${h} | 77Imóveis`,
    description: `Veja ${h.toLowerCase()} em todas as cidades da região do DDD 77. Anúncios de imobiliárias, corretores e particulares.`,
    alternates: { canonical: `${SITE}/imoveis` },
  };
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
          {items.map((p) => (
            <PropertyRow key={p.slug} {...p} />
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

export default async function ImoveisPage({ searchParams }: { searchParams: Search }) {
  const negotiations = list(searchParams.modalidade).filter((m): m is Negotiation => NEGOS.includes(m as Negotiation));
  const acceptsExchange = exchangeText(searchParams.troca) || exchangeText(searchParams.permuta);
  const page = num(searchParams.pagina) ?? 1;
  const sort = (str(searchParams.ordem) as any) || 'recentes';

  const [cities, types] = await Promise.all([getCitiesAll(), getPropertyTypes()]);
  const city = (cities as any[]).find((c) => c.slug === str(searchParams.cidade));
  const type = (types as any[]).find((t) => t.slug === str(searchParams.tipo));
  const neighborhoods = city ? await getNeighborhoods(city.id) : [];
  const bairroSlug = str(searchParams.bairro);
  const neighborhoodId = bairroSlug ? (neighborhoods as any[]).find((n) => n.slug === bairroSlug)?.id : undefined;

  const { items, total } = await searchProperties({
    cityId: city?.id,
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
  const h1 = `${heading(type?.name, negotiations)}${acceptsExchange ? ' que aceitam troca' : ''}`;

  const pageHref = (n: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const s = str(v);
      if (s && k !== 'pagina') sp.set(k, s);
    }
    sp.set('pagina', String(n));
    return `/imoveis?${sp.toString()}`;
  };

  return (
    <main className="bg-slate-50 dark:bg-bg">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Início', url: SITE },
          { name: 'Imóveis', url: `${SITE}/imoveis` },
        ])}
      />
      {!!items.length && (
        <JsonLd data={itemListLd(items.map((p) => ({ name: p.title, url: `${SITE}/imovel/${p.slug}` })))} />
      )}

      <section className="mx-auto max-w-[1200px] px-6 pb-3 pt-5">
        <h1 className="text-xl font-bold leading-tight text-text sm:text-2xl">{h1}</h1>
        <p className="mt-1 text-sm text-muted">
          {total
            ? `${total} imóve${total > 1 ? 'is' : 'l'} encontrado${total > 1 ? 's' : ''} em toda a região do DDD 77`
            : 'Nenhum imóvel encontrado com esses filtros ainda'}
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] gap-6 px-6 pb-14 lg:grid lg:grid-cols-[280px_1fr]">
        <aside>
          <FilterBar
            cities={(cities as any[]).map((c) => ({ value: c.slug, label: c.name }))}
            types={(types as any[]).map((t) => ({ value: t.slug, label: plural(t.name) }))}
            neighborhoods={(neighborhoods as any[]).map((n) => ({ value: n.slug, label: n.name }))}
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
