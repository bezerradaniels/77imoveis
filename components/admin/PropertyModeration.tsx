'use client';
import { useState, useTransition } from 'react';
import { Check, X, Pause, Star, Trash2 } from 'lucide-react';
import { adminSetPropertyStatus, adminTogglePropertyFeatured, adminDeleteProperty } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

export function PropertyModeration({ id, status, featured }: { id: string; status: string; featured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');
  const run = (fn: () => Promise<any>) => start(async () => {
    setMessage('');
    const r = await fn();
    setMessage(r?.error || 'Atualizado.');
    router.refresh();
  });

  const handleDelete = () => {
    if (!confirm('Excluir este imóvel permanentemente?')) return;
    run(() => adminDeleteProperty(id));
  };

  const btn = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50';
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {status !== 'ativo' && (
          <button disabled={pending} onClick={() => run(() => adminSetPropertyStatus(id, 'ativo'))} className={`${btn} bg-success/15 text-success`}>
            <Check size={13} /> Aprovar
          </button>
        )}
        {status !== 'pausado' && (
          <button disabled={pending} onClick={() => run(() => adminSetPropertyStatus(id, 'pausado'))} className={`${btn} bg-warning/15 text-warning`}>
            <Pause size={13} /> Pausar
          </button>
        )}
        {status !== 'reprovado' && (
          <button disabled={pending} onClick={() => run(() => adminSetPropertyStatus(id, 'reprovado'))} className={`${btn} bg-danger/15 text-danger`}>
            <X size={13} /> Reprovar
          </button>
        )}
        <button disabled={pending} onClick={() => run(() => adminTogglePropertyFeatured(id, !featured))} className={`${btn} border border-border ${featured ? 'text-accent' : 'text-muted'}`}>
          <Star size={13} className={featured ? 'fill-accent' : ''} /> {featured ? 'Destaque' : 'Destacar'}
        </button>
        <button disabled={pending} onClick={handleDelete} className={`${btn} bg-danger/10 text-danger`}>
          <Trash2 size={13} /> Excluir
        </button>
      </div>
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
