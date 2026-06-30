import { adminListSubscriptions } from '@/lib/data';

export const dynamic = 'force-dynamic';

const statusColor: Record<string, string> = {
  ativa:        'bg-success/15 text-success',
  trial:        'bg-primary/10 text-primary',
  pendente:     'bg-warning/15 text-warning',
  inadimplente: 'bg-danger/15 text-danger',
  cancelada:    'bg-border text-muted',
};

export default async function AdminPlanos() {
  const subs = await adminListSubscriptions();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{subs.length} assinatura{subs.length !== 1 ? 's' : ''}</p>
      <ul className="space-y-2">
        {subs.map((s: any) => (
          <li key={s.id} className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">{s.companies?.trade_name ?? '—'}</p>
              <p className="text-xs text-muted">
                {s.plans?.name ?? '—'}
                {s.plans?.price > 0 ? ` · R$ ${Number(s.plans.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/${s.plans.interval}` : ' · Gratuito'}
                {s.current_period_end ? ` · vence ${new Date(s.current_period_end).toLocaleDateString('pt-BR')}` : ''}
                {s.cancel_at_period_end ? ' · cancelará no fim do período' : ''}
              </p>
            </div>
            <span className={`self-start rounded-full px-2 py-0.5 text-xs font-medium sm:self-auto ${statusColor[s.status] ?? 'bg-border text-muted'}`}>
              {s.status}
            </span>
          </li>
        ))}
        {!subs.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhuma assinatura ainda.</p>}
      </ul>
    </div>
  );
}
