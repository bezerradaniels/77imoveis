import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = { title: 'Criar conta', robots: { index: false } };

export default function CadastroPage() {
  return (
    <AuthShell
      eyebrow="Conta grátis"
      title="Crie sua conta"
      description="Anuncie seu imóvel em minutos. Particular começa com 1 imóvel grátis e pode virar profissional depois."
    >
      <SignupForm />
    </AuthShell>
  );
}
