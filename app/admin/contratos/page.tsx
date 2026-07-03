import Link from 'next/link';
import { Search } from 'lucide-react';
import { adminListManualContracts, adminListCompaniesForSelect, adminListCities } from '@/lib/data';
import { ManualContractForm } from '@/components/admin/ManualContractForm';
import { ContractLifecycle } from '@/components/admin/ContractLifecycle';
import {
  StatusBadge,
  PaymentBadge,
  paymentMethodLabel,
  fmtDate,
} from '@/components/admin/contract-ui';

export const dynamic = 'force-dynamic';

type SP = { status?: string; paymentStatus?: string; expiring?: '7' | '15' | '30'; q?: string; tab?: string };

const tabs: { key: string; label: string; params: Partial<SP> }[] = [
  { key: 'todos', label: 'Todos', params: {} },
  { key: 'ativos', label: 'Ativos', params: { status: 'ativo' } },
  { key: 'exp7', label: 'Expira em 7d', params: { expiring: '7' } },
  { key: 'exp15', label: 'Expira em 15d', params: { expiring: '15' } },
  { key: 'exp30', label: 'Expira em 30d', params: { expiring: '30' } },
  { key: 'pausados', label: 'Pausados', params: { status: 'pausado' } },
  { key: 'pgto', label: 'Pgto pendente', params: { paymentStatus: 'pendente' } },
  { key: 'expirados', label: 'Expirados', params: { status: 'expirado' } },
];

const qs = (p: Partial<SP>) => {
  const s = new URLSearchParams(p as Record<string, string>).toString();
  return s ? `?${s}` : '';
};

export default async function AdminContratos({ searchParams }: { searchParams: SP }) {
  const [contracts, companies, cities] = await Promise.all([
    adminListManualContracts({
      status: searchParams.status,
      paymentStatus: searchParams.paymentStatus,
      expiring: searchParams.expiring,
      text: searchParams.q,
    }),
    adminListCompaniesForSelect(),
    adminListCities(),
  ]);
  const cityOpts = (cities as any[]).map((c) => ({ id: c.id, name: c.name }));
  const activeTab = searchParams.tab ?? 'todos';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Contratos manuais</h1>
          <p className="text-sm text-muted">Planos personalizados vendidos e pagos diretamente pelo admin.</p>
        </div>
        <ManualContractForm companies={companies as any} cities={cityOpts} mode="create" />
      </div>

      {/* Seções rápidas */}
      <nav className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/contratos${qs({ ...t.params, tab: t.key })}`}
              className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                active ? 'bg-primary text-on-primary' : 'border border-border bg-surface text-muted hover:text-text'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {/* Busca */}
      <form className="flex gap-2" action="/admin/contratos">
        {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        {searchParams.paymentStatus && <input type="hidden" name="paymentStatus" value={searchParams.paymentStatus} />}
        {searchParams.expiring && <input type="hidden" name="expiring" value={searchParams.expiring} />}
        {searchParams.tab && <input type="hidden" name="tab" value={searchParams.tab} />}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Buscar por cliente, plano, e-mail, telefone, cidade, ID…"
            className="h-11 w-full rounded-[10px] border border-border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button type="submit" className="inline-flex h-11 items-center rounded-[10px] bg-primary px-4 text-sm font-bold text-on-primary">Buscar</button>
      </form>

      <p className="text-sm text-muted">{contracts.length} contrato{contracts.length !== 1 ? 's' : ''}</p>

      <ul className="space-y-2">
        {contracts.map((c: any) => (
          <li key={c.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/contratos/${c.id}`} className="font-bold text-link hover:underline">
                    {c.companies?.trade_name ?? '—'}
                  </Link>
                  <StatusBadge status={c.effectiveStatus} />
                  <PaymentBadge status={c.payment_status} />
                  {c.auto_renew && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Auto-renovação</span>}
                </div>
                <p className="mt-1 text-sm">
                  {c.plan_name} · {c.max_active_listings} imóveis · {c.included_featured} destaques
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {fmtDate(c.starts_at)} → {fmtDate(c.ends_at)}
                  {c.remainingDays != null && (c.effectiveStatus === 'ativo' || c.effectiveStatus === 'agendado')
                    ? ` · faltam ${c.remainingDays} dia${c.remainingDays === 1 ? '' : 's'}`
                    : ''}
                  {' · '}{paymentMethodLabel[c.payment_method] ?? c.payment_method}
                  {c.amount ? ` · R$ ${Number(c.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <ContractLifecycle id={c.id} status={c.effectiveStatus} />
                <div className="flex gap-2">
                  <ManualContractForm
                    mode="edit"
                    contract={c}
                    triggerClassName="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold text-muted hover:text-text"
                  />
                  <Link href={`/admin/contratos/${c.id}`} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-semibold text-muted hover:text-text">
                    Detalhes
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
        {!contracts.length && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum contrato encontrado.</p>
        )}
      </ul>
    </div>
  );
}
