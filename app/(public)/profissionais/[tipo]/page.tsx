import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompanies } from '@/lib/data';
import { companyTypes, companyTypeLabel } from '@/lib/constants';
import { Directory } from '@/components/company/Directory';

export const revalidate = 300;

export function generateStaticParams() {
  return companyTypes.map((t) => ({ tipo: t.value }));
}

export function generateMetadata({ params }: { params: { tipo: string } }): Metadata {
  const label = companyTypeLabel(params.tipo);
  return {
    title: `${label} no DDD 77`,
    description: `${label} na região do DDD 77, na Bahia. Veja contatos e imóveis.`,
    alternates: { canonical: `/profissionais/${params.tipo}` },
  };
}

export default async function ProfissionaisTipoPage({ params }: { params: { tipo: string } }) {
  if (!companyTypes.some((t) => t.value === params.tipo)) notFound();
  const companies = await getCompanies(params.tipo);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">{companyTypeLabel(params.tipo)}</h1>
      <p className="mb-5 text-muted">Profissionais da categoria na região do DDD 77.</p>
      <Directory companies={companies} activeType={params.tipo} />
    </main>
  );
}
