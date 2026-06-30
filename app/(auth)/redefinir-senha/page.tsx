import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';

export const metadata: Metadata = { title: 'Redefinir senha', robots: { index: false } };

export default function RedefinirSenhaPage() {
  return (
    <AuthShell
      eyebrow="Nova senha"
      title="Crie uma nova senha"
      description="Escolha uma senha segura para voltar a acessar seus anúncios e contatos."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
