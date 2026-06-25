import Link from 'next/link';
import { adminListCompanies } from '@/lib/data';
import { companyTypeLabel } from '@/lib/constants';
import { CompanyAdmin } from '@/components/admin/CompanyAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminEmpresas() {
  const items = await adminListCompanies();
  return (
    <ul className="space-y-2">
      {items.map((c: any) => (
        <li key={c.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href={`/empresa/${c.slug}`} className="text-sm font-medium hover:text-primary">{c.trade_name}</Link>
            <p className="text-xs text-muted">{companyTypeLabel(c.type)} · {c.cities?.name ?? '—'} · {c.status}</p>
          </div>
          <CompanyAdmin id={c.id} status={c.status} verified={c.is_verified} featured={c.is_featured} />
        </li>
      ))}
      {!items.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhuma empresa.</p>}
    </ul>
  );
}
