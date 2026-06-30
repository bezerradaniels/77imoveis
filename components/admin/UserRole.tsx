'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, ShieldOff, ShieldCheck } from 'lucide-react';
import { adminSetUserRole, adminSetUserActive, adminUpdateUser } from '@/app/admin/actions';

type UserRoleKey = 'particular' | 'profissional' | 'admin' | 'moderador';

const roles = [
  { v: 'particular',   l: 'Particular' },
  { v: 'profissional', l: 'Profissional' },
  { v: 'moderador',    l: 'Moderador' },
  { v: 'admin',        l: 'Admin' },
] satisfies { v: UserRoleKey; l: string }[];

export function UserRole({
  id,
  role,
  isActive,
  user,
}: {
  id: string;
  role: string;
  isActive: boolean;
  user: { full_name?: string | null; email?: string | null; phone?: string | null; whatsapp?: string | null };
}) {
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

  const btn = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50';
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          defaultValue={role}
          disabled={pending}
          onChange={(e) => run(() => adminSetUserRole(id, e.target.value as UserRoleKey))}
          className="rounded-md border border-border bg-surface px-2 py-1 text-sm disabled:opacity-50"
        >
          {roles.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
        </select>
        <button disabled={pending} onClick={() => setEditing(true)} className={`${btn} border border-border text-muted`}>
          <Pencil size={13} /> Editar
        </button>
        {isActive ? (
          <button
            disabled={pending}
            onClick={() => { if (confirm('Desativar este usuário? O acesso ao painel será bloqueado, mas os dados relacionados serão preservados.')) run(() => adminSetUserActive(id, false)); }}
            className={`${btn} bg-danger/10 text-danger`}
          >
            <ShieldOff size={13} /> Desativar
          </button>
        ) : (
          <button
            disabled={pending}
            onClick={() => run(() => adminSetUserActive(id, true))}
            className={`${btn} bg-success/15 text-success`}
          >
            <ShieldCheck size={13} /> Reativar
          </button>
        )}
      </div>
      {editing && (
        <form
          className="mt-2 grid w-full min-w-[280px] gap-2 rounded-lg border border-border bg-bg p-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            run(() => adminUpdateUser(id, {
              full_name: String(form.get('full_name') || '').trim() || null,
              email: String(form.get('email') || '').trim() || null,
              phone: String(form.get('phone') || '').trim() || null,
              whatsapp: String(form.get('whatsapp') || '').trim() || null,
            }));
          }}
        >
          <input name="full_name" defaultValue={user.full_name ?? ''} placeholder="Nome" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="email" defaultValue={user.email ?? ''} placeholder="E-mail" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="phone" defaultValue={user.phone ?? ''} placeholder="Telefone" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="whatsapp" defaultValue={user.whatsapp ?? ''} placeholder="WhatsApp" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
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
