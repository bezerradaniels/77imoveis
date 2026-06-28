import type { Metadata } from 'next';
import { getCompanies } from '@/lib/data';
import { CompanyCard } from '@/components/company/CompanyCard';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Corretores no DDD 77 | 77Imóveis',
  description: 'Corretores autônomos da região do DDD 77, na Bahia. Veja contatos e imóveis anunciados.',
  alternates: { canonical: '/corretores' },
};

export default async function CorretoresPage() {
  const companies = await getCompanies('corretor_autonomo');
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Corretores</h1>
      <p className="mb-5 text-muted">Corretores autônomos cadastrados na região do DDD 77.</p>
      {companies.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <CompanyCard key={c.slug} {...c} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          Nenhum corretor cadastrado ainda.
        </p>
      )}
    </main>
  );
}
