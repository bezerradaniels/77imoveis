import type { Metadata } from 'next';
import { RoleChoiceForm } from '@/components/auth/RoleChoiceForm';

export const metadata: Metadata = { title: 'Como você quer anunciar?', robots: { index: false } };

export default function EscolhaPerfilPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="mb-1 text-2xl font-bold">Como você quer anunciar?</h1>
      <p className="mb-6 text-sm text-muted">
        Você pode mudar isso depois — escolha o que faz mais sentido agora.
      </p>
      <RoleChoiceForm />
    </main>
  );
}
