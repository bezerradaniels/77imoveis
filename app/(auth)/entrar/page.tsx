import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false } };

export default function EntrarPage() {
  return (
    <main className="bg-slate-100 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-sm">
        <h1 className="mb-1 text-2xl font-bold">Entrar</h1>
        <p className="mb-6 text-sm text-muted">Acesse seu painel para gerenciar anúncios e contatos.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
