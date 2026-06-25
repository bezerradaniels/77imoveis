import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMyCompany, getCitiesAll, getSpecialties } from '@/lib/data';
import { CompanyForm } from '@/components/painel/CompanyForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Minha empresa', robots: { index: false } };

export default async function EmpresaPage() {
  const [company, cities, specialties] = await Promise.all([
    getMyCompany(),
    getCitiesAll(),
    getSpecialties(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{company ? 'Minha empresa' : 'Tornar-se profissional'}</h1>
      <p className="mb-6 text-sm text-muted">
        {company
          ? 'Atualize os dados da sua empresa e o perfil público.'
          : 'Crie o perfil da sua empresa para anunciar como profissional (mais imóveis, página própria e vitrine).'}
      </p>
      <CompanyForm cities={cities as any} specialties={specialties as any} initial={company} />
    </main>
  );
}
