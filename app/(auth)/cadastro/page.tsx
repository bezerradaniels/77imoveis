import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = { title: 'Criar conta', robots: { index: false } };

export default function CadastroPage() {
  return (
    <main className="bg-slate-100 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-sm">
        <h1 className="mb-1 text-2xl font-bold">Criar conta grátis</h1>
        <p className="mb-6 text-sm text-muted">
          Anuncie seu imóvel em minutos. Particular: 1 imóvel grátis. Depois você pode virar profissional.
        </p>
        <SignupForm />
      </div>
    </main>
  );
}
