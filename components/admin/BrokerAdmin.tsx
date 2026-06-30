'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Pencil, XCircle } from 'lucide-react';
import { adminSetBrokerStatus, adminUpdateBroker } from '@/app/admin/actions';

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

  const run = (fn: () => Promise<{ ok?: true; error?: string }>) =>
    start(async () => {
      setMessage('');
      const r = await fn();
      setMessage(r?.error || 'Atualizado.');
      if (!r?.error) {
        setEditing(false);
        router.refresh();
      }
    });

  const btn = 'inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs disabled:opacity-50';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <button disabled={pending} onClick={() => run(() => adminSetBrokerStatus(broker.id, 'aprovado'))} className={`${btn} text-success`}>
          <BadgeCheck size={13} /> Aprovar
        </button>
        <button
          disabled={pending}
          onClick={() => { if (confirm('Rejeitar este corretor? O perfil deixará de ser elegível para exibição pública.')) run(() => adminSetBrokerStatus(broker.id, 'reprovado')); }}
          className={`${btn} text-danger`}
        >
          <XCircle size={13} /> Rejeitar
        </button>
        <button disabled={pending} onClick={() => setEditing(true)} className={`${btn} text-muted`}>
          <Pencil size={13} /> Editar
        </button>
        <select
          defaultValue={broker.status ?? 'ativo'}
          disabled={pending}
          onChange={(e) => run(() => adminSetBrokerStatus(broker.id, e.target.value))}
          className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
        >
          {['ativo', 'pendente', 'aprovado', 'reprovado', 'inativo', 'arquivado', 'removido'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
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
            } as any));
          }}
        >
          <input name="name" required defaultValue={broker.name ?? ''} placeholder="Nome" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="email" defaultValue={broker.email ?? ''} placeholder="E-mail" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="creci" defaultValue={broker.creci ?? ''} placeholder="CRECI" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="phone" defaultValue={broker.phone ?? ''} placeholder="Telefone" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="whatsapp" defaultValue={broker.whatsapp ?? ''} placeholder="WhatsApp" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="photo_url" defaultValue={broker.photo_url ?? ''} placeholder="Foto URL" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={pending} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50">Salvar</button>
            <button type="button" disabled={pending} onClick={() => setEditing(false)} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancelar</button>
          </div>
        </form>
      )}
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
