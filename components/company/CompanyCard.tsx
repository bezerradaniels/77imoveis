import Link from 'next/link';
import { BadgeCheck, Building2 } from 'lucide-react';
import { companyTypeLabel } from '@/lib/constants';

// Card de empresa/profissional no diretório.
export function CompanyCard(c: any) {
  return (
    <Link
      href={`/empresa/${c.slug}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition hover:-translate-y-0.5"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg">
        {c.logo_url ? (
          <img src={c.logo_url} alt={c.trade_name} className="h-full w-full object-cover" />
        ) : (
          <Building2 size={22} className="text-muted" />
        )}
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1 truncate font-medium">
          {c.trade_name}
          {c.is_verified && <BadgeCheck size={15} className="text-primary" />}
        </p>
        <p className="text-sm text-muted">{companyTypeLabel(c.type)}</p>
        {c.cities?.name && <p className="text-xs text-muted">{c.cities.name}</p>}
      </div>
    </Link>
  );
}
