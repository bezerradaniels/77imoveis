'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Pause, Pencil, Trash2, Archive } from 'lucide-react';
import { setPropertyStatus, deleteProperty } from '@/app/painel/actions';

// Botões de ação de um imóvel no painel (ativar/pausar/arquivar/editar/excluir).
export function PropertyActions({ id, slug, status }: { id: string; slug: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      setError('');
      const r = await fn();
      if (r?.error) setError(r.error);
      else router.refresh();
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {status !== 'ativo' ? (
          <button
            onClick={() => run(() => setPropertyStatus(id, 'ativo'))}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success hover:bg-success/20"
          >
            <Play size={13} /> Ativar
          </button>
        ) : (
          <button
            onClick={() => run(() => setPropertyStatus(id, 'pausado'))}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning hover:bg-warning/20"
          >
            <Pause size={13} /> Pausar
          </button>
        )}
        <Link
          href={`/painel/imoveis/${id}`}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-bg"
        >
          <Pencil size={13} /> Editar
        </Link>
        {status !== 'arquivado' && (
          <button
            onClick={() => run(() => setPropertyStatus(id, 'arquivado'))}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-bg"
          >
            <Archive size={13} /> Arquivar
          </button>
        )}
        <button
          onClick={() => {
            if (confirm('Excluir este anúncio? Esta ação não pode ser desfeita.'))
              run(() => deleteProperty(id));
          }}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-danger hover:bg-danger/10"
        >
          <Trash2 size={13} /> Excluir
        </button>
      </div>
      {error && <p className="text-right text-xs text-danger">{error}</p>}
    </div>
  );
}
