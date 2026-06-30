'use client';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminBulkSetBrokerStatus } from '@/app/admin/actions';
import { BrokerAdmin } from './BrokerAdmin';

export function BrokerBulkList({ brokers }: { brokers: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();
  const ids = useMemo(() => brokers.map((item) => item.id), [brokers]);
  const allSelected = ids.length > 0 && selected.length === ids.length;
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const run = () => start(async () => {
    setMessage('');
    const status = action === 'approve' ? 'aprovado' : action === 'reject' ? 'reprovado' : 'removido';
    const r = await adminBulkSetBrokerStatus(selected, status);
    setMessage(r?.error || 'Ação aplicada.');
    if (!r?.error) {
      setSelected([]);
      setAction('');
      router.refresh();
    }
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={allSelected} onChange={(e) => setSelected(e.target.checked ? ids : [])} />
          {selected.length ? `${selected.length} selecionado(s)` : 'Selecionar tudo'}
        </label>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="h-9 rounded-md border border-border bg-bg px-2 text-sm">
          <option value="">Ação em lote</option>
          <option value="approve">Aprovar</option>
          <option value="reject">Rejeitar</option>
          <option value="remove">Remover</option>
        </select>
        <button disabled={pending || !selected.length || !action} onClick={run} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-on-primary disabled:opacity-50">Aplicar</button>
        {message && <p className={message === 'Ação aplicada.' ? 'text-sm text-success' : 'text-sm text-danger'}>{message}</p>}
      </div>

      <ul className="space-y-2">
        {brokers.map((b) => {
          const company = Array.isArray(b.companies) ? b.companies[0] : b.companies;
          return (
            <li key={b.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 gap-3">
                <input aria-label={`Selecionar ${b.name}`} type="checkbox" checked={selected.includes(b.id)} onChange={() => toggle(b.id)} className="mt-1" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted">{b.email ?? b.phone ?? b.whatsapp ?? 'sem contato'} · CRECI {b.creci ?? '—'}</p>
                  <p className="mt-1 text-xs text-muted">
                    Empresa: {company?.slug ? <Link href={`/empresa/${company.slug}`} className="text-link">{company.trade_name}</Link> : company?.trade_name ?? '—'} · Cidade: {company?.cities?.name ?? '—'} · Imóveis: {b.properties?.[0]?.count ?? 0}
                  </p>
                </div>
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
