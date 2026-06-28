import { getCompanies } from '@/lib/data';
import { Directory } from '@/components/company/Directory';
import { pageMetadata, REGION } from '@/lib/seo/meta';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: `Profissionais e empresas no ${REGION}`,
  description: `Imobiliárias, corretores, construtoras, engenheiros e profissionais da construção no ${REGION}, na Bahia. Veja contatos, especialidades e imóveis anunciados.`,
  path: '/profissionais',
});

export default async function ProfissionaisPage() {
  const companies = await getCompanies();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Profissionais e empresas no {REGION}</h1>
      <p className="mb-5 text-muted">
        Encontre imobiliárias, corretores, construtoras e profissionais da construção que atuam no {REGION}, na Bahia.
      </p>
      <Directory companies={companies} />
    </main>
  );
}
