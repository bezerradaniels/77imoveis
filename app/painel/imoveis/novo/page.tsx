import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPropertyTypes, getCitiesAll, getFeaturesAll } from '@/lib/data';
import { PropertyForm } from '@/components/painel/PropertyForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Novo anúncio', robots: { index: false } };

export default async function NovoImovelPage() {
  const [types, cities, features] = await Promise.all([
    getPropertyTypes(),
    getCitiesAll(),
    getFeaturesAll(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/painel/imoveis" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Meus imóveis
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Novo anúncio</h1>
      <PropertyForm types={types as any} cities={cities as any} features={features as any} />
    </main>
  );
}
