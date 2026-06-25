import Link from 'next/link';
import { companyTypes } from '@/lib/constants';
import { CompanyCard } from './CompanyCard';

const chip = (active: boolean) =>
  active
    ? 'rounded-full bg-primary px-3 py-1 text-sm text-white'
    : 'rounded-full border border-border bg-surface px-3 py-1 text-sm hover:bg-bg';

// Corpo do diretório de profissionais (filtros por tipo + grade de cards).
export function Directory({ companies, activeType }: { companies: any[]; activeType?: string }) {
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/profissionais" className={chip(!activeType)}>Todos</Link>
        {companyTypes.map((t) => (
          <Link key={t.value} href={`/profissionais/${t.value}`} className={chip(activeType === t.value)}>
            {t.label}
          </Link>
        ))}
      </div>
      {companies.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => <CompanyCard key={c.slug} {...c} />)}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          Nenhum profissional cadastrado ainda nesta categoria.
        </p>
      )}
    </>
  );
}
