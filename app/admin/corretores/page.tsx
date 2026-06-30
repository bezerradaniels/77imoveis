import { adminListBrokers, adminListCompanies, getCitiesAll } from '@/lib/data';
import { BrokerBulkList } from '@/components/admin/BrokerBulkList';

export const dynamic = 'force-dynamic';

export default async function AdminCorretores({ searchParams }: { searchParams: { q?: string; city?: string; company?: string } }) {
  const [brokers, companies, cities] = await Promise.all([
    adminListBrokers({ text: searchParams.q, cityId: searchParams.city, companyId: searchParams.company }),
    adminListCompanies(),
    getCitiesAll(),
  ]);

  return (
    <div>
      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px_180px_auto]">
        <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Buscar corretor, e-mail ou CRECI" className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <select name="city" defaultValue={searchParams.city ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          <option value="">Todas cidades</option>
          {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="company" defaultValue={searchParams.company ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          <option value="">Todas empresas</option>
          {companies.map((c: any) => <option key={c.id} value={c.id}>{c.trade_name}</option>)}
        </select>
        <button className="rounded-lg bg-primary px-4 text-sm font-medium text-on-primary">Filtrar</button>
      </form>

      <BrokerBulkList brokers={brokers as any} />
    </div>
  );
}
