import type { Metadata } from 'next';
import { getCompanies } from '@/lib/data';
import { CompanyCard } from '@/components/company/CompanyCard';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Imobiliárias no DDD 77 | 77Imóveis',
  description: 'Imobiliárias da região do DDD 77, na Bahia. Veja contatos e imóveis anunciados.',
  alternates: { canonical: '/imobiliarias' },
};

export default async function ImobiliariasPage() {
  const companies = await getCompanies('imobiliaria');
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Imobiliárias</h1>
      <p className="mb-5 text-muted">Imobiliárias cadastradas na região do DDD 77.</p>
      {companies.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <CompanyCard key={c.slug} {...c} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          Nenhuma imobiliária cadastrada ainda.
        </p>
      )}
    </main>
  );
}
