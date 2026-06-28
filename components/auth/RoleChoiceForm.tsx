'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Home, Building2 } from 'lucide-react';
import { chooseRole } from '@/app/painel/escolha-perfil/actions';

export function RoleChoiceForm() {
  const router = useRouter();
  const [busy, setBusy] = useState<'particular' | 'profissional' | null>(null);

  async function choose(target: 'particular' | 'profissional') {
    setBusy(target);
    await chooseRole(target);
    router.push(target === 'particular' ? '/painel' : '/painel/empresa');
    router.refresh();
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => choose('particular')}
        disabled={busy !== null}
        className="flex flex-col items-start gap-2 rounded-lg border border-border bg-surface p-5 text-left transition hover:border-primary disabled:opacity-50"
      >
        {busy === 'particular' ? <Loader2 size={22} className="animate-spin text-link" /> : <Home size={22} className="text-link" />}
        <span className="font-semibold">Anunciar como particular</span>
        <span className="text-sm text-muted">Anuncie 1 imóvel grátis, sem CNPJ.</span>
      </button>
      <button
        type="button"
        onClick={() => choose('profissional')}
        disabled={busy !== null}
        className="flex flex-col items-start gap-2 rounded-lg border border-border bg-surface p-5 text-left transition hover:border-primary disabled:opacity-50"
      >
        {busy === 'profissional' ? <Loader2 size={22} className="animate-spin text-link" /> : <Building2 size={22} className="text-link" />}
        <span className="font-semibold">Sou corretor, imobiliária ou empresa</span>
        <span className="text-sm text-muted">Crie o perfil da sua empresa e anuncie mais imóveis.</span>
      </button>
    </div>
  );
}
