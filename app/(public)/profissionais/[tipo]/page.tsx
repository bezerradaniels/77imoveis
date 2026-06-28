import { notFound } from 'next/navigation';
import { getCompanies } from '@/lib/data';
import { companyTypes, companyTypeLabel } from '@/lib/constants';
import { Directory } from '@/components/company/Directory';
import { pageMetadata, REGION } from '@/lib/seo/meta';

export const revalidate = 300;

export function generateStaticParams() {
  return companyTypes.map((t) => ({ tipo: t.value }));
}

export function generateMetadata({ params }: { params: { tipo: string } }) {
  const valid = companyTypes.some((t) => t.value === params.tipo);
  const label = companyTypeLabel(params.tipo);
  return pageMetadata({
    title: `${label} no ${REGION}`,
    description: `${label} no ${REGION}, na Bahia: veja contatos, especialidades, cidades de atuação e imóveis anunciados.`,
    path: `/profissionais/${params.tipo}`,
    noindex: !valid,
  });
}

export default async function ProfissionaisTipoPage({ params }: { params: { tipo: string } }) {
  if (!companyTypes.some((t) => t.value === params.tipo)) notFound();
  const companies = await getCompanies(params.tipo);
  const label = companyTypeLabel(params.tipo);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">{label} no {REGION}</h1>
      <p className="mb-5 text-muted">{label} que atuam no {REGION}, na Bahia. Veja contatos e imóveis anunciados.</p>
      <Directory companies={companies} activeType={params.tipo} />
    </main>
  );
}
