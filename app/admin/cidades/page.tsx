import { adminListCities, adminListNeighborhoods } from '@/lib/data';
import { AddCity, AddNeighborhood } from '@/components/admin/CityAdmin';
import { CityNeighborhoodBulkList } from '@/components/admin/CityNeighborhoodBulkList';

export const dynamic = 'force-dynamic';

export default async function AdminCidades() {
  const [cities, neighborhoods] = await Promise.all([adminListCities(), adminListNeighborhoods()]);
  const cityOpts = cities.map((c: any) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Adicionar</h2>
        <AddCity />
        <AddNeighborhood cities={cityOpts} />
      </section>

      <CityNeighborhoodBulkList cities={cities as any} neighborhoods={neighborhoods as any} />
    </div>
  );
}
