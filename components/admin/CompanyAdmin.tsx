'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Star } from 'lucide-react';
import { adminUpdateCompany } from '@/app/admin/actions';

export function CompanyAdmin({ id, status, verified, featured }: { id: string; status: string; verified: boolean; featured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');
  const run = (patch: Record<string, any>) => start(async () => {
    setMessage('');
    const r = await adminUpdateCompany(id, patch);
    setMessage(r?.error || 'Atualizado.');
    router.refresh();
  });

  const btn = 'inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs disabled:opacity-50';
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <button disabled={pending} onClick={() => run({ is_verified: !verified })} className={`${btn} ${verified ? 'text-primary' : 'text-muted'}`}>
          <BadgeCheck size={13} /> {verified ? 'Verificada' : 'Verificar'}
        </button>
        <button disabled={pending} onClick={() => run({ is_featured: !featured })} className={`${btn} ${featured ? 'text-accent' : 'text-muted'}`}>
          <Star size={13} className={featured ? 'fill-accent' : ''} /> Destaque
        </button>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) => run({ status: e.target.value })}
          className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
        >
          {['ativo', 'pausado', 'bloqueado'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
