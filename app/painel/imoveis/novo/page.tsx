import { redirect } from 'next/navigation';
import { getPropertyTypes, getCitiesAll, getFeaturesAll, getMyCompany } from '@/lib/data';
import { getProfile } from '@/lib/auth';
import { PropertyForm } from '@/components/painel/PropertyForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Publicar imóvel', robots: { index: false } };

export default async function NovoImovelPage() {
  const [types, cities, features, profile, company] = await Promise.all([
    getPropertyTypes(),
    getCitiesAll(),
    getFeaturesAll(),
    getProfile(),
    getMyCompany(),
  ]);

  if (profile?.role_intent === 'profissional' && !company) redirect('/painel/empresa');

  return (
    <PropertyForm
      types={types as any}
      cities={cities as any}
      features={features as any}
      defaults={{ name: profile?.full_name ?? '', whatsapp: profile?.whatsapp ?? profile?.phone ?? '', email: profile?.email ?? '' }}
      ownerType={profile?.role ?? 'particular'}
    />
  );
}
