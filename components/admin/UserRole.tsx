'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldOff, ShieldCheck } from 'lucide-react';
import { adminSetUserRole, adminSetUserActive } from '@/app/admin/actions';

const roles = [
  { v: 'particular',   l: 'Particular' },
  { v: 'profissional', l: 'Profissional' },
  { v: 'moderador',    l: 'Moderador' },
  { v: 'admin',        l: 'Admin' },
];

export function UserRole({ id, role, isActive }: { id: string; role: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const refresh = () => router.refresh();

  const btn = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        defaultValue={role}
        disabled={pending}
        onChange={(e) => start(async () => { await adminSetUserRole(id, e.target.value); refresh(); })}
        className="rounded-md border border-border bg-surface px-2 py-1 text-sm disabled:opacity-50"
      >
        {roles.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
      </select>
      {isActive ? (
        <button
          disabled={pending}
          onClick={() => { if (confirm('Bloquear este usuário?')) start(async () => { await adminSetUserActive(id, false); refresh(); }); }}
          className={`${btn} bg-danger/10 text-danger`}
        >
          <ShieldOff size={13} /> Bloquear
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => start(async () => { await adminSetUserActive(id, true); refresh(); })}
          className={`${btn} bg-success/15 text-success`}
        >
          <ShieldCheck size={13} /> Desbloquear
        </button>
      )}
    </div>
  );
}
