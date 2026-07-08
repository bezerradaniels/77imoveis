'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Loader2 } from 'lucide-react';
import { adminSetCompanyFreeForever, adminSetBrokerFreeForever, adminSetProfileFreeForever } from '@/app/admin/actions';

type Entity = 'company' | 'broker' | 'profile';

const grantHint: Record<Entity, string> = {
  company: 'Conceder gratuidade vitalícia? A empresa terá imóveis ilimitados, assinatura ativa (cortesia), vitrine incluída e selo verificado — sem cobrança e sem expiração.',
  broker: 'Conceder gratuidade vitalícia a este corretor? Ele recebe selo verificado e cortesia permanente registrada.',
  profile: 'Conceder gratuidade vitalícia a este usuário particular? O limite de 1 imóvel ativo é removido.',
};

const action: Record<Entity, (id: string, on: boolean) => Promise<{ ok?: true; error?: string }>> = {
  company: adminSetCompanyFreeForever,
  broker: adminSetBrokerFreeForever,
  profile: adminSetProfileFreeForever,
};

export function FreeForeverToggle({ entity, id, active }: { entity: Entity; id: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');

  const toggle = () => {
    const on = !active;
    if (on && !confirm(grantHint[entity])) return;
    if (!on && !confirm('Revogar a gratuidade vitalícia? O acesso volta às regras normais de plano/pagamento.')) return;
    start(async () => {
      setMessage('');
      const r = await action[entity](id, on);
      setMessage(r?.error || 'Atualizado.');
      if (!r?.error) router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={toggle}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
          active ? 'bg-success/15 text-success hover:bg-success/25' : 'border border-border text-muted hover:text-text'
        }`}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
        {active ? 'Cortesia vitalícia ativa — revogar' : 'Conceder cortesia vitalícia'}
      </button>
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
