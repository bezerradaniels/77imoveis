import { adminListCities } from '@/lib/data';
import { AddCity, CityFeatured, AddNeighborhood } from '@/components/admin/CityAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminCidades() {
  const cities = await adminListCities();
  const cityOpts = cities.map((c: any) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Adicionar</h2>
        <AddCity />
        <AddNeighborhood cities={cityOpts} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Cidades ({cities.length})</h2>
        <ul className="space-y-2">
          {cities.map((c: any) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted">
                  /{c.slug} · {c.neighborhoods?.[0]?.count ?? 0} bairros
                  {c.population ? ` · ${c.population.toLocaleString('pt-BR')} hab.` : ''}
                </p>
              </div>
              <CityFeatured id={c.id} featured={c.is_featured} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
