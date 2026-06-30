import Link from 'next/link';
import { adminListStorefronts } from '@/lib/data';
import { StorefrontToggle } from '@/components/admin/StorefrontAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminVitrines() {
  const vitrines = await adminListStorefronts();
  return (
    <ul className="space-y-2">
      {vitrines.map((v: any) => (
        <li key={v.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/vitrine/${v.slug}`} className="text-sm font-medium hover:text-link-hover">
                {v.companies?.trade_name ?? v.slug}
              </Link>
              <span className={`rounded px-1.5 py-0.5 text-xs ${v.status === 'ativo' ? 'bg-success/15 text-success' : 'bg-border text-muted'}`}>
                {v.status}
              </span>
            </div>
            <p className="text-xs text-muted">
              /vitrine/{v.slug}
              {v.expires_at ? ` · expira ${new Date(v.expires_at).toLocaleDateString('pt-BR')}` : ' · sem expiração'}
              {' · '}{v.views_count} visualizações
            </p>
          </div>
          <StorefrontToggle id={v.id} status={v.status} />
        </li>
      ))}
      {!vitrines.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhuma vitrine cadastrada.</p>}
    </ul>
  );
}
