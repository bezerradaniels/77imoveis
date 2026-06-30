'use client';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminBulkToggleStorefronts } from '@/app/admin/actions';
import { StorefrontToggle } from './StorefrontAdmin';

export function StorefrontBulkList({ vitrines }: { vitrines: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();
  const ids = useMemo(() => vitrines.map((item) => item.id), [vitrines]);
  const allSelected = ids.length > 0 && selected.length === ids.length;
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const run = () => start(async () => {
    setMessage('');
    const r = await adminBulkToggleStorefronts(selected, action === 'active');
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
          <option value="active">Ativar</option>
          <option value="expired">Desativar</option>
        </select>
        <button disabled={pending || !selected.length || !action} onClick={run} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-on-primary disabled:opacity-50">Aplicar</button>
        {message && <p className={message === 'Ação aplicada.' ? 'text-sm text-success' : 'text-sm text-danger'}>{message}</p>}
      </div>

      <ul className="space-y-2">
        {vitrines.map((v) => (
          <li key={v.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <input aria-label={`Selecionar ${v.companies?.trade_name ?? v.slug}`} type="checkbox" checked={selected.includes(v.id)} onChange={() => toggle(v.id)} className="mt-1" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/vitrine/${v.slug}`} className="text-sm font-medium hover:text-link-hover">
                    {v.companies?.trade_name ?? v.slug}
                  </Link>
                  <span className={`rounded px-1.5 py-0.5 text-xs ${v.status === 'ativo' ? 'bg-success/15 text-success' : 'bg-border text-muted'}`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-muted">/vitrine/{v.slug}{v.expires_at ? ` · expira ${new Date(v.expires_at).toLocaleDateString('pt-BR')}` : ' · sem expiração'} · {v.views_count} visualizações</p>
              </div>
            </div>
            <StorefrontToggle id={v.id} status={v.status} />
          </li>
        ))}
        {!vitrines.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhuma vitrine cadastrada.</p>}
      </ul>
    </div>
  );
}
