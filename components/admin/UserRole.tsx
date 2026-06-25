'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminSetUserRole } from '@/app/admin/actions';

const roles = [
  { v: 'particular', l: 'Particular' },
  { v: 'profissional', l: 'Profissional' },
  { v: 'moderador', l: 'Moderador' },
  { v: 'admin', l: 'Admin' },
];

export function UserRole({ id, role }: { id: string; role: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending}
      onChange={(e) => start(async () => { await adminSetUserRole(id, e.target.value); router.refresh(); })}
      className="rounded-md border border-border bg-surface px-2 py-1 text-sm disabled:opacity-50"
    >
      {roles.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
    </select>
  );
}
