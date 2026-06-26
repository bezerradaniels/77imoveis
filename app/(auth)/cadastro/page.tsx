import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = { title: 'Criar conta', robots: { index: false } };

export default function CadastroPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-14">
      <h1 className="mb-1 text-2xl font-bold">Criar conta grátis</h1>
      <p className="mb-6 text-sm text-muted">
        Anuncie seu imóvel em minutos. Particular: 1 imóvel grátis. Depois você pode virar profissional.
      </p>
      <div className="rounded-xl border border-border bg-surface p-6">
        <SignupForm />
      </div>
    </main>
  );
}
