import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMyCompany, getCitiesAll, getSpecialties } from '@/lib/data';
import { CompanyForm } from '@/components/painel/CompanyForm';
import { OnboardingWizard } from '@/components/painel/OnboardingWizard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Perfil profissional', robots: { index: false } };

export default async function EmpresaPage({ searchParams }: { searchParams?: { nova?: string } }) {
  const [activeCompany, cities, specialties] = await Promise.all([
    getMyCompany(),
    getCitiesAll(),
    getSpecialties(),
  ]);

  // ?nova=1 força o fluxo de criação de uma nova empresa, mesmo já tendo outra ativa.
  const creating = searchParams?.nova === '1' || !activeCompany;
  const company = creating ? null : activeCompany;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{company ? 'Perfil profissional' : 'Criar empresa'}</h1>
      <p className="mb-6 text-sm text-muted">
        {company
          ? 'Atualize os dados exibidos no seu perfil público.'
          : 'Crie um perfil profissional: corretor autônomo, imobiliária, construtora ou incorporadora.'}
      </p>
      {company ? (
        <CompanyForm cities={cities as any} specialties={specialties as any} initial={company} />
      ) : (
        <OnboardingWizard cities={cities as any} specialties={specialties as any} />
      )}
    </main>
  );
}
