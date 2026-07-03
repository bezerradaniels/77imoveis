'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminAddContractNote } from '@/app/admin/contratos/actions';

export function ContractNotes({ id }: { id: string }) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const add = () =>
    start(async () => {
      setError('');
      const res = await adminAddContractNote(id, note);
      if (res.error) { setError(res.error); return; }
      setNote('');
      router.refresh();
    });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <StickyNote size={16} className="text-link" /> Adicionar nota interna
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Registrar uma observação (fica no histórico)…"
        className="w-full rounded-[10px] border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={add} disabled={pending || !note.trim()}>{pending ? 'Salvando…' : 'Salvar nota'}</Button>
      </div>
    </div>
  );
}
