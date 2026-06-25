import Link from 'next/link';
import { ArrowRight, Tag, Key, Plus, Building2, User, HardHat, Ruler, PencilRuler, Compass, Sun, Store } from 'lucide-react';
import { getFeaturedCities, getPropertyTypes, getFeaturedProperties } from '@/lib/data';
import { PropertyCard } from '@/components/property/PropertyCard';
import { SearchBar } from '@/components/home/SearchBar';

export const revalidate = 300; // recarrega os dados a cada 5 min

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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((p) => <PropertyCard key={p.slug} {...p} />)}
    </div>
  );
}

export default async function HomePage() {
  const [cities, types, venda, aluguel] = await Promise.all([
    getFeaturedCities(),
    getPropertyTypes(),
    getFeaturedProperties('venda'),
    getFeaturedProperties('aluguel'),
  ]);

  const cityOpts = cities.map((c) => ({ value: c.slug, label: c.name }));
  const typeOpts = types.map((t) => ({ value: t.slug, label: t.name }));

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <section>
        <h1 className="mb-1 text-3xl font-bold">Encontre seu imóvel na região do DDD 77</h1>
        <p className="mb-5 text-muted">Casas, apartamentos, terrenos e imóveis rurais no oeste e sudoeste da Bahia.</p>
        <SearchBar cities={cityOpts} types={typeOpts} />
      </section>

      <Banner slot="home_topo" />

      <section>
        <p className="mb-3 text-sm text-muted">Cidades em destaque</p>
        <div className="flex flex-wrap gap-2">
          {cities.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:bg-bg">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="À venda em destaque" href="/vitoria-da-conquista/casas" icon={<Tag size={18} className="text-primary" />} />
        <Row items={venda} empty="Em breve, imóveis à venda aqui." />
      </section>

      <section>
        <SectionHead title="Para alugar em destaque" href="/vitoria-da-conquista/casas?modalidade=aluguel" icon={<Key size={18} className="text-primary" />} />
        <Row items={aluguel} empty="Em breve, imóveis para alugar aqui." />
      </section>

      <Banner slot="home_meio" />

      <section>
        <SectionHead title="Profissionais e empresas" href="/profissionais" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {profissionais.map(({ label, slug, Icon }) => (
            <Link key={slug} href={`/profissionais/${slug}`} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-sm hover:bg-bg">
              <Icon size={22} className="text-primary" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Tipos de imóvel</h2>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <Link key={t.slug} href={`/vitoria-da-conquista/${t.slug}s`} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-bg">
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 p-5">
        <div>
          <h2 className="text-lg font-semibold">Tem um imóvel para vender ou alugar?</h2>
          <p className="text-sm text-primary">Anuncie grátis. Particular: 1 imóvel sem custo. Imobiliária: até 10.</p>
        </div>
        <Link href="/anunciar" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white">
          <Plus size={18} /> Anunciar grátis
        </Link>
      </section>
    </main>
  );
}
