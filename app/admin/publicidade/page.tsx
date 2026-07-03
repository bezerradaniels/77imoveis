import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { adminListAdContracts, adminListCompaniesForSelect, adminListCities } from '@/lib/data';
import { AdContractForm } from '@/components/admin/AdContractForm';
import { AdLifecycle } from '@/components/admin/AdLifecycle';
import { StatusBadge, PaymentBadge, paymentMethodLabel, fmtDate } from '@/components/admin/contract-ui';

export const dynamic = 'force-dynamic';

type SP = { status?: string; paymentStatus?: string; cityId?: string; q?: string; tab?: string };

const tabs: { key: string; label: string; params: Partial<SP> }[] = [
  { key: 'todos', label: 'Todos', params: {} },
  { key: 'ativos', label: 'Ativos', params: { status: 'ativo' } },
  { key: 'pausados', label: 'Pausados', params: { status: 'pausado' } },
  { key: 'expirados', label: 'Expirados', params: { status: 'expirado' } },
  { key: 'regional', label: 'Regionais (home)', params: { cityId: 'regional' } },
  { key: 'pgto', label: 'Pgto pendente', params: { paymentStatus: 'pendente' } },
];

const qs = (p: Partial<SP>) => {
  const s = new URLSearchParams(p as Record<string, string>).toString();
  return s ? `?${s}` : '';
};

export default async function AdminPublicidade({ searchParams }: { searchParams: SP }) {
  const [ads, companies, cities] = await Promise.all([
    adminListAdContracts({ status: searchParams.status, paymentStatus: searchParams.paymentStatus, cityId: searchParams.cityId, text: searchParams.q }),
    adminListCompaniesForSelect(),
    adminListCities(),
  ]);
  const cityOpts = (cities as any[]).map((c) => ({ id: c.id, name: c.name }));
  const companyOpts = (companies as any[]).map((c) => ({ id: c.id, trade_name: c.trade_name }));
  const activeTab = searchParams.tab ?? 'todos';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Publicidade — carrossel da home</h1>
          <p className="text-sm text-muted">Contratos de banner vendidos e pagos diretamente pelo admin. Regionais aparecem na home; por cidade, na página da cidade.</p>
        </div>
        <AdContractForm companies={companyOpts} cities={cityOpts} mode="create" />
      </div>

      <nav className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <Link key={t.key} href={`/admin/publicidade${qs({ ...t.params, tab: t.key })}`}
              className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold transition ${active ? 'bg-primary text-on-primary' : 'border border-border bg-surface text-muted hover:text-text'}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>

      <form className="flex gap-2" action="/admin/publicidade">
        {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        {searchParams.paymentStatus && <input type="hidden" name="paymentStatus" value={searchParams.paymentStatus} />}
        {searchParams.cityId && <input type="hidden" name="cityId" value={searchParams.cityId} />}
        {searchParams.tab && <input type="hidden" name="tab" value={searchParams.tab} />}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Buscar por nome, cliente, cidade, ID…"
            className="h-11 w-full rounded-[10px] border border-border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="submit" className="inline-flex h-11 items-center rounded-[10px] bg-primary px-4 text-sm font-bold text-on-primary">Buscar</button>
      </form>

      <p className="text-sm text-muted">{ads.length} anúncio{ads.length !== 1 ? 's' : ''}</p>

      <ul className="space-y-2">
        {ads.map((a: any) => (
          <li key={a.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-3">
                {a.image_url && <Image src={a.image_url} alt={a.internal_name ?? ''} width={112} height={63} className="h-16 w-28 shrink-0 rounded object-cover" />}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/publicidade/${a.id}`} className="font-bold text-link hover:underline">{a.internal_name || a.title || '(sem nome)'}</Link>
                    <StatusBadge status={a.effectiveStatus} />
                    <PaymentBadge status={a.payment_status} />
                    {a.auto_renew && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Auto-renovação</span>}
                  </div>
                  <p className="mt-1 text-sm">
                    {a.cities?.name ? `Cidade: ${a.cities.name}` : 'Regional (home)'}
                    {a.companies?.trade_name ? ` · ${a.companies.trade_name}` : ''} · prioridade {a.priority}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {fmtDate(a.starts_at)} → {fmtDate(a.ends_at)}
                    {a.remainingDays != null && a.effectiveStatus === 'ativo' ? ` · faltam ${a.remainingDays} dia${a.remainingDays === 1 ? '' : 's'}` : ''}
                    {' · '}{a.payment_method ? paymentMethodLabel[a.payment_method] ?? a.payment_method : '—'}
                    {a.amount ? ` · R$ ${Number(a.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <AdLifecycle id={a.id} status={a.effectiveStatus} />
                <div className="flex gap-2">
                  <AdContractForm mode="edit" ad={a} cities={cityOpts} triggerClassName="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold text-muted hover:text-text" />
                  <Link href={`/admin/publicidade/${a.id}`} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-semibold text-muted hover:text-text">Detalhes</Link>
                </div>
              </div>
            </div>
          </li>
        ))}
        {!ads.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum anúncio encontrado.</p>}
      </ul>
    </div>
  );
}
