'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { adminToggleStorefront } from '@/app/admin/actions';

export function StorefrontToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const active = status === 'ativo';
  const btn = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50';
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => { await adminToggleStorefront(id, !active); router.refresh(); })}
      className={`${btn} border border-border ${active ? 'text-success' : 'text-muted'}`}
    >
      {active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
      {active ? 'Ativa' : 'Inativa'}
    </button>
  );
}
