import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { getFeaturedCities } from '@/lib/data';
import { OnboardingModal } from '@/components/auth/OnboardingModal';

export const metadata: Metadata = { title: 'Como você quer usar o 77Imóveis?', robots: { index: false } };

export default async function EscolhaPerfilPage() {
  const profile = await getProfile();
  if (profile?.role_choice_made_at) redirect('/painel');

  const cities = await getFeaturedCities();

  return <OnboardingModal cities={cities} />;
}
