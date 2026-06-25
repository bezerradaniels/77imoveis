import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPropertyTypes, getCitiesAll, getFeaturesAll, getPropertyForEdit } from '@/lib/data';
import { PropertyForm } from '@/components/painel/PropertyForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar anúncio', robots: { index: false } };

export default async function EditarImovelPage({ params }: { params: { id: string } }) {
  const [types, cities, features, property] = await Promise.all([
    getPropertyTypes(),
    getCitiesAll(),
    getFeaturesAll(),
    getPropertyForEdit(params.id),
  ]);
  if (!property) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/painel/imoveis" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Meus imóveis
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Editar anúncio</h1>
      <PropertyForm types={types as any} cities={cities as any} features={features as any} initial={property} />
    </main>
  );
}
