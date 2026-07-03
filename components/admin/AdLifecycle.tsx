'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RotateCcw, XCircle, CalendarX, RefreshCw, Trash2 } from 'lucide-react';
import { adminAdContractAction, adminDeleteAdContract, type AdAction } from '@/app/admin/publicidade/actions';

type Btn = { action: AdAction; label: string; icon: typeof Play; className: string; confirm?: string; askReason?: boolean; askKeepEnd?: boolean };

function buttonsFor(status: string): Btn[] {
  const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold disabled:opacity-50';
  const pause: Btn = { action: 'pause', label: 'Pausar', icon: Pause, className: `${base} border-warning/40 text-warning`, askReason: true };
  const renew: Btn = { action: 'renew', label: 'Renovar', icon: RefreshCw, className: `${base} border-primary/40 text-primary` };
  const cancel: Btn = { action: 'cancel', label: 'Cancelar', icon: XCircle, className: `${base} border-danger/40 text-danger`, confirm: 'Cancelar este anúncio? Ele sairá do carrossel.', askReason: true };
  const expire: Btn = { action: 'expire', label: 'Expirar', icon: CalendarX, className: `${base} border-danger/40 text-danger`, confirm: 'Marcar como expirado agora?', askReason: true };
  const resume: Btn = { action: 'resume', label: 'Retomar', icon: Play, className: `${base} border-success/40 text-success`, askKeepEnd: true };
  const reactivate: Btn = { action: 'reactivate', label: 'Reativar', icon: RotateCcw, className: `${base} border-success/40 text-success`, askKeepEnd: true };
  const activate: Btn = { action: 'activate', label: 'Ativar agora', icon: Play, className: `${base} border-success/40 text-success` };
  switch (status) {
    case 'ativo': return [pause, renew, cancel, expire];
    case 'agendado': return [activate, cancel];
    case 'pausado': return [resume, cancel];
    case 'expirado': return [reactivate, renew];
    case 'cancelado': return [reactivate];
    default: return [];
  }
}

export function AdLifecycle({ id, status, allowDelete }: { id: string; status: string; allowDelete?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  const run = (btn: Btn) => {
    if (btn.confirm && !window.confirm(btn.confirm)) return;
    let reason: string | undefined;
    if (btn.askReason) reason = (window.prompt('Motivo / observação (opcional):') ?? '').trim() || undefined;
    let keepEndDate: boolean | undefined;
    if (btn.askKeepEnd) keepEndDate = window.confirm('Manter a data de término original?\n\nOK = manter · Cancelar = novo período.');
    setError('');
    start(async () => {
      const res = await adminAdContractAction(id, btn.action, { reason, keepEndDate });
      if (res.error) setError(res.error); else router.refresh();
    });
  };

  const del = () => {
    if (!window.confirm('Excluir permanentemente este anúncio?')) return;
    setError('');
    start(async () => {
      const res = await adminDeleteAdContract(id);
      if (res.error) setError(res.error); else router.refresh();
    });
  };

  const btns = buttonsFor(status);
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1.5">
        {btns.map((b) => {
          const Icon = b.icon;
          return (
            <button key={b.action} type="button" disabled={pending} onClick={() => run(b)} className={b.className}>
              <Icon size={13} /> {b.label}
            </button>
          );
        })}
        {allowDelete && (
          <button type="button" disabled={pending} onClick={del} className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger disabled:opacity-50">
            <Trash2 size={13} /> Excluir
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
