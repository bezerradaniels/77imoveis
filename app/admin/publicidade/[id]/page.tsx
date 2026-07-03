import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminGetAdContract, adminListCities } from '@/lib/data';
import { AdContractForm } from '@/components/admin/AdContractForm';
import { AdLifecycle } from '@/components/admin/AdLifecycle';
import { ContractHistory } from '@/components/admin/ContractHistory';
import { StatusBadge, PaymentBadge, paymentMethodLabel, fmtDate } from '@/components/admin/contract-ui';

export const dynamic = 'force-dynamic';

export default async function AdDetail({ params }: { params: { id: string } }) {
  const [ad, cities] = await Promise.all([adminGetAdContract(params.id), adminListCities()]);
  if (!ad) notFound();
  const a = ad as any;
  const cityOpts = (cities as any[]).map((c) => ({ id: c.id, name: c.name }));

  const facts: [string, string][] = [
    ['Cliente', a.companies?.trade_name ?? '— sem vínculo —'],
    ['Cidade', a.cities?.name ?? 'Regional (home)'],
    ['Prioridade', String(a.priority)],
    ['Início', fmtDate(a.starts_at)],
    ['Término', fmtDate(a.ends_at)],
    ['Dias restantes', a.remainingDays != null ? String(a.remainingDays) : '—'],
    ['Duração', a.duration_days ? `${a.duration_days} dias` : '—'],
    ['Forma de pagamento', a.payment_method ? paymentMethodLabel[a.payment_method] ?? a.payment_method : '—'],
    ['Valor', a.amount ? `R$ ${Number(a.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'],
    ['Renovação automática', a.auto_renew ? 'Sim' : 'Não'],
    ['Impressões / cliques', `${a.impressions ?? 0} / ${a.clicks ?? 0}`],
    ['No carrossel agora', a.is_active ? 'Sim' : 'Não'],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/publicidade" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Publicidade
      </Link>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3">
            {a.image_url && <Image src={a.image_url} alt={a.internal_name ?? ''} width={160} height={90} className="h-20 w-36 rounded object-cover" />}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{a.internal_name || a.title || 'Anúncio'}</h1>
                <StatusBadge status={a.effectiveStatus} />
                <PaymentBadge status={a.payment_status} />
              </div>
              <a href={a.target_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-link hover:underline">{a.target_url}</a>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <AdLifecycle id={a.id} status={a.effectiveStatus} allowDelete />
            <AdContractForm mode="edit" ad={a} cities={cityOpts} triggerClassName="inline-flex h-9 items-center gap-1 rounded-full border border-border px-4 text-sm font-semibold text-muted hover:text-text" />
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

        {a.internal_notes && (
          <div className="mt-5">
            <p className="text-xs text-muted">Observações internas</p>
            <p className="whitespace-pre-wrap rounded-lg bg-bg p-3 text-sm">{a.internal_notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold">Histórico</h2>
        <ContractHistory history={a.history} />
      </div>
    </div>
  );
}
