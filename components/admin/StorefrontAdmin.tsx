'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { adminRemoveStorefront, adminToggleStorefront } from '@/app/admin/actions';

export function StorefrontToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');
  const active = status === 'ativo';
  const btn = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50';
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        disabled={pending}
        onClick={() => start(async () => {
          setMessage('');
          const r = await adminToggleStorefront(id, !active);
          setMessage(r?.error || 'Atualizado.');
          if (!r?.error) router.refresh();
        })}
        className={`${btn} border border-border ${active ? 'text-success' : 'text-muted'}`}
      >
        {active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        {active ? 'Ativa' : 'Inativa'}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm('Remover esta vitrine? Ela será desativada e deixará de aparecer publicamente.')) {
            start(async () => {
              setMessage('');
              const r = await adminRemoveStorefront(id);
              setMessage(r?.error || 'Atualizado.');
              if (!r?.error) router.refresh();
            });
          }
        }}
        className={`${btn} border border-border text-danger`}
      >
        <Trash2 size={14} /> Remover
      </button>
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
