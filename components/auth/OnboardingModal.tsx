import Link from 'next/link';
import { Home } from 'lucide-react';
import { OnboardingFlow } from './OnboardingFlow';

type City = { id: string; name: string; slug: string };

export function OnboardingModal({ cities }: { cities: City[] }) {
  return (
    <main
      data-painel-shell
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[60] min-h-screen overflow-y-auto bg-internal px-4 py-5 text-text dark:bg-bg sm:px-6 lg:px-10"
    >
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col pt-2 pb-8 sm:pt-4 lg:pt-6">
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="mx-auto mb-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-muted transition hover:text-link sm:hidden"
          >
            <Home size={16} />
            Voltar para a home
          </Link>
          <p className="mb-5 hidden text-2xl font-normal tracking-tight sm:block">
            <span className="text-link">77</span>
            <span className="text-text">imóveis</span>
          </p>
          <h1 id="onboarding-title" className="mx-auto mb-2 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">
            Como você quer usar o 77Imóveis?
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted">
            Você pode mudar isso depois — escolha o que faz mais sentido agora.
          </p>
        </div>

        <OnboardingFlow cities={cities} />
      </div>
    </main>
  );
}
