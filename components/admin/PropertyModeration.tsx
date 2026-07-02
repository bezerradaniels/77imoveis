'use client';
import { useState, useTransition } from 'react';
import { Check, X, Pause, Star, Trash2 } from 'lucide-react';
import { adminSetPropertyStatus, adminTogglePropertyFeatured, adminDeleteProperty } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { ANALYTICS_EVENTS, trackButtonClick, trackEvent } from '@/lib/analytics';

export function PropertyModeration({ id, status, featured }: { id: string; status: string; featured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');
  const run = (fn: () => Promise<any>, eventName?: keyof typeof ANALYTICS_EVENTS, params?: Record<string, string | boolean>) => start(async () => {
    setMessage('');
    const r = await fn();
    setMessage(r?.error || 'Atualizado.');
    if (!r?.error && eventName) trackEvent(ANALYTICS_EVENTS[eventName], { source_component: 'PropertyModeration', ...params });
    router.refresh();
  });

  const handleDelete = () => {
    if (!confirm('Remover este imóvel? Ele não aparecerá mais no site público, mas leads, fotos e histórico serão preservados.')) return;
    trackButtonClick({ button_id: 'admin_delete_property_button', button_text: 'Remover', button_location: 'admin_property_row' });
    run(() => adminDeleteProperty(id), 'adminPropertyDelete', { property_status: 'arquivado' });
  };

  const btn = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50';
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {status !== 'ativo' && (
          <button disabled={pending} onClick={() => {
            trackButtonClick({ button_id: 'admin_approve_property_button', button_text: 'Aprovar', button_location: 'admin_property_row' });
            run(() => adminSetPropertyStatus(id, 'ativo'), 'adminPropertyEdit', { new_status: 'ativo' });
          }} className={`${btn} bg-success/15 text-success`}>
            <Check size={13} /> Aprovar
          </button>
        )}
        {status !== 'pausado' && (
          <button disabled={pending} onClick={() => {
            trackButtonClick({ button_id: 'admin_pause_property_button', button_text: 'Pausar', button_location: 'admin_property_row' });
            run(() => adminSetPropertyStatus(id, 'pausado'), 'adminPropertyEdit', { new_status: 'pausado' });
          }} className={`${btn} bg-warning/15 text-warning`}>
            <Pause size={13} /> Pausar
          </button>
        )}
        {status !== 'reprovado' && (
          <button disabled={pending} onClick={() => {
            trackButtonClick({ button_id: 'admin_reject_property_button', button_text: 'Reprovar', button_location: 'admin_property_row' });
            run(() => adminSetPropertyStatus(id, 'reprovado'), 'adminPropertyEdit', { new_status: 'reprovado' });
          }} className={`${btn} bg-danger/15 text-danger`}>
            <X size={13} /> Reprovar
          </button>
        )}
        <button disabled={pending} onClick={() => {
          trackButtonClick({ button_id: 'admin_feature_property_button', button_text: featured ? 'Destaque' : 'Destacar', button_location: 'admin_property_row' });
          run(() => adminTogglePropertyFeatured(id, !featured), 'adminPropertyEdit', { featured: !featured });
        }} className={`${btn} border border-border ${featured ? 'text-accent' : 'text-muted'}`}>
          <Star size={13} className={featured ? 'fill-accent' : ''} /> {featured ? 'Destaque' : 'Destacar'}
        </button>
        {status !== 'arquivado' && (
          <button disabled={pending} onClick={handleDelete} className={`${btn} bg-danger/10 text-danger`}>
            <Trash2 size={13} /> Remover
          </button>
        )}
      </div>
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
