'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Pencil, Trash2, XCircle } from 'lucide-react';
import { adminRemoveBroker, adminSetBrokerStatus, adminUpdateBroker } from '@/app/admin/actions';
import { ANALYTICS_EVENTS, trackButtonClick, trackEvent } from '@/lib/analytics';

type Broker = {
  id: string;
  name: string;
  email?: string | null;
  creci?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  photo_url?: string | null;
  status?: string | null;
};

export function BrokerAdmin({ broker }: { broker: Broker }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  const run = (fn: () => Promise<{ ok?: true; error?: string }>, eventName?: keyof typeof ANALYTICS_EVENTS, params?: Record<string, string | boolean>) =>
    start(async () => {
      setMessage('');
      const r = await fn();
      setMessage(r?.error || 'Atualizado.');
      if (!r?.error) {
        if (eventName) trackEvent(ANALYTICS_EVENTS[eventName], { source_component: 'BrokerAdmin', ...params });
        setEditing(false);
        router.refresh();
      }
    });

  const btn = 'inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs disabled:opacity-50';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <button disabled={pending} onClick={() => {
          trackButtonClick({ button_id: 'admin_approve_broker_button', button_text: 'Aprovar', button_location: 'admin_broker_row' });
          run(() => adminSetBrokerStatus(broker.id, 'aprovado'), 'adminBrokerEdit', { new_status: 'aprovado' });
        }} className={`${btn} text-success`}>
          <BadgeCheck size={13} /> Aprovar
        </button>
        <button
          disabled={pending}
          onClick={() => { if (confirm('Rejeitar este corretor? O perfil deixará de ser elegível para exibição pública.')) {
            trackButtonClick({ button_id: 'admin_reject_broker_button', button_text: 'Rejeitar', button_location: 'admin_broker_row' });
            run(() => adminSetBrokerStatus(broker.id, 'reprovado'), 'adminBrokerEdit', { new_status: 'reprovado' });
          } }}
          className={`${btn} text-danger`}
        >
          <XCircle size={13} /> Rejeitar
        </button>
        <button disabled={pending} onClick={() => {
          trackButtonClick({ button_id: 'admin_edit_broker_button', button_text: 'Editar', button_location: 'admin_broker_row' });
          setEditing(true);
        }} className={`${btn} text-muted`}>
          <Pencil size={13} /> Editar
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm('Remover este corretor? O perfil deixará de aparecer publicamente, mas os vínculos históricos serão preservados.')) {
              trackButtonClick({ button_id: 'admin_delete_broker_button', button_text: 'Remover', button_location: 'admin_broker_row' });
              run(() => adminRemoveBroker(broker.id), 'adminBrokerDelete', { new_status: 'removido' });
            }
          }}
          className={`${btn} text-danger`}
        >
          <Trash2 size={13} /> Remover
        </button>
      </div>
      {editing && (
        <form
          className="mt-2 grid w-full min-w-[300px] gap-2 rounded-lg border border-border bg-bg p-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            run(() => adminUpdateBroker(broker.id, {
              name: String(form.get('name') || '').trim(),
              email: String(form.get('email') || '').trim() || null,
              creci: String(form.get('creci') || '').trim() || null,
              phone: String(form.get('phone') || '').trim() || null,
              whatsapp: String(form.get('whatsapp') || '').trim() || null,
              photo_url: String(form.get('photo_url') || '').trim() || null,
            } as any), 'adminBrokerEdit', { action_type: 'profile_update' });
          }}
        >
          <input name="name" required defaultValue={broker.name ?? ''} placeholder="Nome" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="email" defaultValue={broker.email ?? ''} placeholder="E-mail" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="creci" defaultValue={broker.creci ?? ''} placeholder="CRECI" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="phone" defaultValue={broker.phone ?? ''} placeholder="Telefone" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="whatsapp" defaultValue={broker.whatsapp ?? ''} placeholder="WhatsApp" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="photo_url" defaultValue={broker.photo_url ?? ''} placeholder="Foto URL" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={pending} onClick={() => trackButtonClick({ button_id: 'admin_save_broker_button', button_text: 'Salvar', button_location: 'admin_broker_edit_form' })} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50">Salvar</button>
            <button type="button" disabled={pending} onClick={() => setEditing(false)} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancelar</button>
          </div>
        </form>
      )}
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
