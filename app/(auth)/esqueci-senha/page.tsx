import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Recuperar senha', robots: { index: false } };

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      eyebrow="Recuperação"
      title="Recupere sua senha"
      description="Informe o e-mail cadastrado e enviaremos um link seguro para criar uma nova senha."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
