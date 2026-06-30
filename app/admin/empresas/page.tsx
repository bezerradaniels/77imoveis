import Link from 'next/link';
import { adminListCompanies, getCitiesAll } from '@/lib/data';
import { companyTypeLabel } from '@/lib/constants';
import { CompanyAdmin } from '@/components/admin/CompanyAdmin';

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
      <ul className="space-y-2">
        {items.map((c: any) => (
          <li key={c.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/empresa/${c.slug}`} className="text-sm font-medium hover:text-link-hover">{c.trade_name}</Link>
                <span className="rounded bg-bg px-1.5 py-0.5 text-xs">{c.status}</span>
              </div>
              <p className="text-xs text-muted">{companyTypeLabel(c.type)} · {c.cities?.name ?? '—'} · {c.email ?? c.phone ?? 'sem contato'}</p>
              <p className="mt-1 text-xs text-muted">Corretores: {c.brokers?.[0]?.count ?? 0} · Imóveis: {c.properties?.[0]?.count ?? 0}</p>
            </div>
            <CompanyAdmin company={c} />
          </li>
        ))}
        {!items.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhuma empresa.</p>}
      </ul>
    </div>
  );
}
