import { getPropertyTypes, getCitiesAll, getFeaturesAll } from '@/lib/data';
import { PropertyForm } from '@/components/painel/PropertyForm';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

// TEMP: rota de verificação visual do wizard (remover depois).
export default async function PreviewWizardPage() {
  const [types, cities, features] = await Promise.all([getPropertyTypes(), getCitiesAll(), getFeaturesAll()]);
  return <PropertyForm types={types as any} cities={cities as any} features={features as any} ownerType="particular" />;
}
