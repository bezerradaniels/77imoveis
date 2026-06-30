import { adminListCompanies, getCitiesAll } from '@/lib/data';
import { CompanyBulkList } from '@/components/admin/CompanyBulkList';

export const dynamic = 'force-dynamic';

export default async function AdminEmpresas({ searchParams }: { searchParams: { q?: string; status?: string; city?: string } }) {
  const [items, cities] = await Promise.all([
    adminListCompanies({ text: searchParams.q, status: searchParams.status, cityId: searchParams.city }),
    getCitiesAll(),
  ]);
  return (
    <div>
      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_160px_180px_auto]">
        <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Buscar empresa, razão social ou e-mail" className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <select name="status" defaultValue={searchParams.status ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          <option value="">Todos status</option>
          {['ativo', 'pendente', 'pausado', 'bloqueado', 'arquivado', 'removido'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="city" defaultValue={searchParams.city ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          <option value="">Todas cidades</option>
          {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="rounded-lg bg-primary px-4 text-sm font-medium text-on-primary">Filtrar</button>
      </form>
      <CompanyBulkList items={items as any} />
    </div>
  );
}
