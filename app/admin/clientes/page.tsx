import Link from 'next/link';
import { Search } from 'lucide-react';
import { adminListCustomerSituations, adminListCities } from '@/lib/data';
import { ManualContractForm } from '@/components/admin/ManualContractForm';
import { SituationBadge, situationLabel, fmtDate } from '@/components/admin/contract-ui';

export const dynamic = 'force-dynamic';

type SP = { situation?: string; cityId?: string; q?: string };

const companyTypeLabel: Record<string, string> = {
  corretor_autonomo: 'Corretor autônomo',
  imobiliaria: 'Imobiliária',
  construtora: 'Construtora',
  incorporadora: 'Incorporadora',
};

const situationFilters = ['manual_ativo', 'agendado', 'pausado', 'expirado', 'trial', 'assinatura_ativa', 'pendente', 'inadimplente', 'sem_plano'];

export default async function AdminClientes({ searchParams }: { searchParams: SP }) {
  const [rows, cities] = await Promise.all([
    adminListCustomerSituations({ situation: searchParams.situation, cityId: searchParams.cityId, text: searchParams.q }),
    adminListCities(),
  ]);
  const cityOpts = (cities as any[]).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Clientes — situação comercial</h1>
        <p className="text-sm text-muted">Situação de cada cliente profissional: assinatura automática, plano manual, teste, pausado, expirado…</p>
      </div>

      {/* Filtros + busca (GET) */}
      <form className="flex flex-wrap gap-2" action="/admin/clientes">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Nome, empresa, e-mail, telefone, cidade…"
            className="h-11 w-full rounded-[10px] border border-border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select name="situation" defaultValue={searchParams.situation ?? ''} className="h-11 rounded-[10px] border border-border bg-white px-3 text-sm">
          <option value="">Todas as situações</option>
          {situationFilters.map((s) => <option key={s} value={s}>{situationLabel[s]}</option>)}
        </select>
        <select name="cityId" defaultValue={searchParams.cityId ?? ''} className="h-11 rounded-[10px] border border-border bg-white px-3 text-sm">
          <option value="">Todas as cidades</option>
          {cityOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="inline-flex h-11 items-center rounded-[10px] bg-primary px-4 text-sm font-bold text-on-primary">Filtrar</button>
      </form>

      <p className="text-sm text-muted">{rows.length} cliente{rows.length !== 1 ? 's' : ''}</p>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{r.trade_name}</p>
                <SituationBadge situation={r.situation} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {companyTypeLabel[r.type] ?? r.type}
                {r.owner_name ? ` · ${r.owner_name}` : ''}
                {r.city_name ? ` · ${r.city_name}` : ''}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {r.planName ? `Plano: ${r.planName}` : 'Sem plano ativo'}
                {r.endsAt ? ` · até ${fmtDate(r.endsAt)}` : ''}
                {r.remainingDays != null && ['manual_ativo', 'agendado', 'trial', 'assinatura_ativa'].includes(r.situation)
                  ? ` · faltam ${r.remainingDays} dia${r.remainingDays === 1 ? '' : 's'}`
                  : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {r.contractId && (
                <Link href={`/admin/contratos/${r.contractId}`} className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-semibold text-muted hover:text-text">
                  Ver contrato
                </Link>
              )}
              <ManualContractForm
                mode="create"
                presetCompanyId={r.id}
                triggerLabel="Novo contrato"
                triggerClassName="inline-flex h-9 items-center gap-1 rounded-full bg-action px-4 text-sm font-bold text-on-action hover:bg-action-hover"
              />
            </div>
          </li>
        ))}
        {!rows.length && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum cliente encontrado.</p>
        )}
      </ul>
    </div>
  );
}
