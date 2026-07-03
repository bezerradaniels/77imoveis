import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminGetContract } from '@/lib/data';
import { ManualContractForm } from '@/components/admin/ManualContractForm';
import { ContractLifecycle } from '@/components/admin/ContractLifecycle';
import { ContractHistory } from '@/components/admin/ContractHistory';
import { ContractNotes } from '@/components/admin/ContractNotes';
import { StatusBadge, PaymentBadge, paymentMethodLabel, fmtDate } from '@/components/admin/contract-ui';

export const dynamic = 'force-dynamic';

export default async function ContractDetail({ params }: { params: { id: string } }) {
  const contract = await adminGetContract(params.id);
  if (!contract) notFound();
  const c = contract as any;
  const co = c.companies;

  const facts: [string, string][] = [
    ['Cliente', co?.trade_name ?? '—'],
    ['Responsável', co?.profiles?.full_name ?? '—'],
    ['Contato', co?.email ?? co?.profiles?.email ?? co?.phone ?? '—'],
    ['Cidade', co?.cities?.name ?? '—'],
    ['Plano', c.plan_name],
    ['Tipo', c.plan_type ?? '—'],
    ['Limite de imóveis', String(c.max_active_listings)],
    ['Destaques inclusos', String(c.included_featured)],
    ['Início', fmtDate(c.starts_at)],
    ['Término', fmtDate(c.ends_at)],
    ['Dias restantes', c.remainingDays != null ? String(c.remainingDays) : '—'],
    ['Duração', `${c.duration_days} dias`],
    ['Forma de pagamento', paymentMethodLabel[c.payment_method] ?? c.payment_method],
    ['Valor', c.amount ? `R$ ${Number(c.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'],
    ['Renovação automática', c.auto_renew ? 'Sim' : 'Não'],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/contratos" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Contratos
      </Link>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{co?.trade_name ?? 'Contrato'}</h1>
              <StatusBadge status={c.effectiveStatus} />
              <PaymentBadge status={c.payment_status} />
            </div>
            <p className="mt-1 text-sm text-muted">{c.plan_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ContractLifecycle id={c.id} status={c.effectiveStatus} />
            <ManualContractForm
              mode="edit"
              contract={c}
              triggerClassName="inline-flex h-9 items-center gap-1 rounded-full border border-border px-4 text-sm font-semibold text-muted hover:text-text"
            />
          </div>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {(c.internal_notes || c.public_notes) && (
          <div className="mt-5 space-y-3">
            {c.public_notes && (
              <div>
                <p className="text-xs text-muted">Observação pública</p>
                <p className="whitespace-pre-wrap text-sm">{c.public_notes}</p>
              </div>
            )}
            {c.internal_notes && (
              <div>
                <p className="text-xs text-muted">Observações internas</p>
                <p className="whitespace-pre-wrap rounded-lg bg-bg p-3 text-sm">{c.internal_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <ContractNotes id={c.id} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-bold">Histórico</h2>
          <ContractHistory history={c.history} />
        </div>
      </div>
    </div>
  );
}
