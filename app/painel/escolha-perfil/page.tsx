import type { Metadata } from 'next';
import { getFeaturedCities } from '@/lib/data';
import { OnboardingFlow } from '@/components/auth/OnboardingFlow';

export const metadata: Metadata = { title: 'Como você quer usar o 77Imóveis?', robots: { index: false } };

export default async function EscolhaPerfilPage() {
  const cities = await getFeaturedCities();

  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="mb-1 text-2xl font-bold">Como você quer usar o 77Imóveis?</h1>
      <p className="mb-6 text-sm text-muted">
        Você pode mudar isso depois — escolha o que faz mais sentido agora.
      </p>
      <OnboardingFlow cities={cities} />
    </main>
  );
}
