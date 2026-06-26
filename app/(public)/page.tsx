import Link from 'next/link';
import { ArrowRight, Plus, Building2, User, HardHat, Ruler, PencilRuler, Compass, Sun, Store } from 'lucide-react';
import { getFeaturedCities, getPropertyTypes, getHomeProperties } from '@/lib/data';
import { cityEmojiFor, tileColors, typeEmojiFor } from '@/lib/constants';
import { PropertyCard } from '@/components/property/PropertyCard';
import { SearchBar } from '@/components/home/SearchBar';

export const dynamic = 'force-dynamic';

const profissionais = [
  { label: 'Corretores', slug: 'corretor_autonomo', Icon: User },
  { label: 'Imobiliárias', slug: 'imobiliaria', Icon: Building2 },
  { label: 'Construtoras', slug: 'construtora', Icon: HardHat },
  { label: 'Engenheiros', slug: 'engenharia_civil', Icon: Ruler },
  { label: 'Arquitetos', slug: 'arquitetura', Icon: PencilRuler },
  { label: 'Topógrafos', slug: 'topografia', Icon: Compass },
  { label: 'Energia solar', slug: 'energia_solar', Icon: Sun },
  { label: 'Materiais', slug: 'material_construcao', Icon: Store },
];

// Faixa reservada para banner de publicidade (gerenciado no admin).
function Banner({ slot }: { slot: string }) {
  return (
    <div className="flex h-[70px] items-center justify-center rounded-lg border border-dashed border-border bg-surface text-xs text-muted">
      Espaço publicitário ({slot})
    </div>
  );
}

function SectionHead({ title, href, icon }: { title: string; href: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="flex items-center gap-2 text-xl font-semibold">{icon}{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-primary">
        Ver todos <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function Row({ items, empty }: { items: any[]; empty: string }) {
  if (!items.length)
    return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">{empty}</p>;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((p) => <PropertyCard key={p.slug} {...p} />)}
    </div>
  );
}

export default async function HomePage() {
  const [cities, types, properties] = await Promise.all([
    getFeaturedCities(),
    getPropertyTypes(),
    getHomeProperties(),
  ]);

  const cityOpts = cities.map((c) => ({ value: c.slug, label: c.name }));
  const typeOpts = types.map((t) => ({ value: t.slug, label: t.name }));

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-6">
      {/* No desktop a busca fica no header; no mobile, aqui. */}
      <section className="md:hidden">
        <h1 className="mb-3 text-xl font-semibold">Encontre seu imóvel no DDD 77</h1>
        <SearchBar cities={cityOpts} types={typeOpts} />
      </section>

      <Banner slot="home_topo" />

      <section>
        <p className="mb-3 text-sm font-medium">📍 Cidades em destaque</p>
        <div className="flex flex-wrap gap-2.5">
          {cities.map((c, i) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-base transition-transform group-hover:scale-110"
                style={{ background: tileColors[i % tileColors.length] }}
              >
                {cityEmojiFor(c.slug)}
              </span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="🏠 Imóveis recentes" href="/vitoria-da-conquista" />
        <Row items={properties} empty="Em breve, imóveis publicados aqui." />
      </section>

      <Banner slot="home_meio" />

      <section>
        <SectionHead title="👷 Profissionais e empresas" href="/profissionais" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {profissionais.map(({ label, slug, Icon }) => (
            <Link key={slug} href={`/profissionais/${slug}`} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <Icon size={22} className="text-primary" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">🏠 Tipos de imóvel</h2>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <Link key={t.slug} href={`/vitoria-da-conquista/${t.slug}s`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-bg">
              <span className="text-base">{typeEmojiFor(t.slug)}</span>{t.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 p-5">
        <div>
          <h2 className="text-lg font-semibold">Tem um imóvel para vender ou alugar?</h2>
          <p className="text-sm text-primary">Anuncie grátis. Particular: 1 imóvel sem custo. Imobiliária: até 10.</p>
        </div>
        <Link href="/anunciar" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-white">
          <Plus size={18} /> Anunciar grátis
        </Link>
      </section>
    </main>
  );
}
