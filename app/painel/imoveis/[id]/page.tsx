import { notFound } from 'next/navigation';
import { getPropertyTypes, getCitiesAll, getFeaturesAll, getPropertyForEdit } from '@/lib/data';
import { getProfile } from '@/lib/auth';
import { PropertyForm } from '@/components/painel/PropertyForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar anúncio', robots: { index: false } };

export default async function EditarImovelPage({ params }: { params: { id: string } }) {
  const [types, cities, features, property, profile] = await Promise.all([
    getPropertyTypes(),
    getCitiesAll(),
    getFeaturesAll(),
    getPropertyForEdit(params.id),
    getProfile(),
  ]);
  if (!property) notFound();
  // Corretores da empresa DONA do imóvel (não da empresa ativa no seletor).
  const companyBrokers = (property as any).companies?.brokers ?? [];

  return (
    <PropertyForm
      types={types as any}
      cities={cities as any}
      features={features as any}
      initial={property}
      defaults={{ name: profile?.full_name ?? '', whatsapp: profile?.whatsapp ?? profile?.phone ?? '', email: profile?.email ?? '' }}
      ownerType={profile?.role ?? 'particular'}
      brokers={companyBrokers.map((b: any) => ({ id: b.id, name: b.name, email: b.email ?? '', whatsapp: b.whatsapp ?? '', phone: b.phone ?? '' }))}
    />
  );
}
