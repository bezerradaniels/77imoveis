import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false } };

export default function EntrarPage() {
  return (
    <AuthShell
      eyebrow="Acesso"
      title="Entre no seu painel"
      description="Gerencie anúncios, acompanhe contatos e continue seu atendimento pelo 77imóveis."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
