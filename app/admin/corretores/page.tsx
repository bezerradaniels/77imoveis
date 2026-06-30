import Link from 'next/link';
import { adminListBrokers, adminListCompanies, getCitiesAll } from '@/lib/data';
import { BrokerAdmin } from '@/components/admin/BrokerAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminCorretores({ searchParams }: { searchParams: { q?: string; status?: string; city?: string; company?: string } }) {
  const [brokers, companies, cities] = await Promise.all([
    adminListBrokers({ text: searchParams.q, status: searchParams.status, cityId: searchParams.city, companyId: searchParams.company }),
    adminListCompanies(),
    getCitiesAll(),
  ]);

  return (
    <div>
      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_150px_180px_180px_auto]">
        <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Buscar corretor, e-mail ou CRECI" className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <select name="status" defaultValue={searchParams.status ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          <option value="">Todos status</option>
          {['ativo', 'pendente', 'aprovado', 'reprovado', 'inativo', 'arquivado', 'removido'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
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

      <ul className="space-y-2">
        {brokers.map((b: any) => {
          const company = Array.isArray(b.companies) ? b.companies[0] : b.companies;
          return (
            <li key={b.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{b.name}</p>
                  <span className="rounded bg-bg px-1.5 py-0.5 text-xs">{b.status ?? 'ativo'}</span>
                </div>
                <p className="text-xs text-muted">{b.email ?? b.phone ?? b.whatsapp ?? 'sem contato'} · CRECI {b.creci ?? '—'}</p>
                <p className="mt-1 text-xs text-muted">
                  Empresa: {company?.slug ? <Link href={`/empresa/${company.slug}`} className="text-link">{company.trade_name}</Link> : company?.trade_name ?? '—'} · Cidade: {company?.cities?.name ?? '—'} · Imóveis: {b.properties?.[0]?.count ?? 0}
                </p>
              </div>
              <BrokerAdmin broker={b} />
            </li>
          );
        })}
        {!brokers.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum corretor.</p>}
      </ul>
    </div>
  );
}
