import { adminListCompanies, getCitiesAll } from '@/lib/data';
import { CompanyBulkList } from '@/components/admin/CompanyBulkList';

export const dynamic = 'force-dynamic';

const statusOpts = [
  ['', 'Status visíveis'],
  ['ativo', 'Ativas'],
  ['pendente', 'Pendentes'],
  ['pausado', 'Pausadas'],
  ['bloqueado', 'Bloqueadas'],
  ['arquivado', 'Arquivadas'],
  ['removido', 'Removidas'],
];

export default async function AdminEmpresas({ searchParams }: { searchParams: { q?: string; city?: string; status?: string } }) {
  const [items, cities] = await Promise.all([
    adminListCompanies({ text: searchParams.q, cityId: searchParams.city, status: searchParams.status }),
    getCitiesAll(),
  ]);
  return (
    <div>
      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px_160px_auto]">
        <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Buscar empresa, razão social ou e-mail" className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <select name="city" defaultValue={searchParams.city ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          <option value="">Todas cidades</option>
          {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="status" defaultValue={searchParams.status ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          {statusOpts.map(([v, l]) => <option key={v || 'visible'} value={v}>{l}</option>)}
        </select>
        <button className="rounded-lg bg-primary px-4 text-sm font-medium text-on-primary">Filtrar</button>
      </form>
      <CompanyBulkList items={items as any} />
    </div>
  );
}
