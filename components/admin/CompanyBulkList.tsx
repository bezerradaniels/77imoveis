'use client';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { companyTypeLabel } from '@/lib/constants';
import { adminBulkUpdateCompanies } from '@/app/admin/actions';
import { CompanyAdmin } from './CompanyAdmin';

type Company = {
  id: string;
  trade_name: string;
  slug: string;
  type: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  free_forever?: boolean | null;
  legal_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  description?: string | null;
  cities?: { name?: string | null } | null;
  brokers?: { count: number }[];
  properties?: { count: number }[];
  [key: string]: any;
};

export function CompanyBulkList({ items }: { items: Company[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const allSelected = ids.length > 0 && selected.length === ids.length;

  const toggle = (id: string) =>
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const run = () => start(async () => {
    setMessage('');
    const patch =
      action === 'remove'
        ? { status: 'removido', is_featured: false }
        : action === 'verify'
          ? { is_verified: true }
          : action === 'unverify'
            ? { is_verified: false }
            : action === 'feature'
              ? { is_featured: true }
              : action === 'unfeature'
                ? { is_featured: false }
                : {};
    const r = await adminBulkUpdateCompanies(selected, patch as any);
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
          {selected.length ? `${selected.length} selecionada(s)` : 'Selecionar tudo'}
        </label>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="h-9 rounded-md border border-border bg-bg px-2 text-sm">
          <option value="">Ação em lote</option>
          <option value="verify">Verificar</option>
          <option value="unverify">Remover verificação</option>
          <option value="feature">Destacar</option>
          <option value="unfeature">Remover destaque</option>
          <option value="remove">Remover</option>
        </select>
        <button disabled={pending || !selected.length || !action} onClick={run} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-on-primary disabled:opacity-50">Aplicar</button>
        {message && <p className={message === 'Ação aplicada.' ? 'text-sm text-success' : 'text-sm text-danger'}>{message}</p>}
      </div>

      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 gap-3">
              <input aria-label={`Selecionar ${c.trade_name}`} type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="mt-1" />
              <div>
                <span className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/empresas/${c.id}`} className="text-sm font-medium text-link hover:underline">{c.trade_name}</Link>
                  {c.free_forever && <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-xs font-semibold text-success">Cortesia</span>}
                </span>
                <p className="text-xs text-muted">{companyTypeLabel(c.type)} · {c.cities?.name ?? '—'} · {c.email ?? c.phone ?? 'sem contato'}</p>
                <p className="mt-1 text-xs text-muted">Corretores: {c.brokers?.[0]?.count ?? 0} · Imóveis: {c.properties?.[0]?.count ?? 0}</p>
              </div>
            </div>
            <CompanyAdmin company={c} />
          </li>
        ))}
        {!items.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhuma empresa.</p>}
      </ul>
    </div>
  );
}
