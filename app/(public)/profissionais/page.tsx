import type { Metadata } from 'next';
import { getCompanies } from '@/lib/data';
import { Directory } from '@/components/company/Directory';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Profissionais e empresas do DDD 77',
  description:
    'Imobiliárias, corretores, construtoras e profissionais da construção na região do DDD 77, na Bahia.',
  alternates: { canonical: '/profissionais' },
};

export default async function ProfissionaisPage() {
  const companies = await getCompanies();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Profissionais e empresas</h1>
      <p className="mb-5 text-muted">Encontre imobiliárias, corretores e profissionais da construção no DDD 77.</p>
      <Directory companies={companies} />
    </main>
  );
}
