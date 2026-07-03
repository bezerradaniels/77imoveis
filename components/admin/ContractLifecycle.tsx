'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RotateCcw, XCircle, CalendarX, RefreshCw } from 'lucide-react';
import { adminContractAction, type ContractAction } from '@/app/admin/contratos/actions';

type Btn = {
  action: ContractAction;
  label: string;
  icon: typeof Play;
  className: string;
  confirm?: string;      // pergunta de confirmação (destrutivo)
  askReason?: boolean;   // pede motivo
  askKeepEnd?: boolean;  // pergunta manter data de término
};

// Ações disponíveis conforme o status EFETIVO do contrato.
function buttonsFor(status: string): Btn[] {
  const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold disabled:opacity-50';
  const pause: Btn = { action: 'pause', label: 'Pausar', icon: Pause, className: `${base} border-warning/40 text-warning`, askReason: true };
  const renew: Btn = { action: 'renew', label: 'Renovar', icon: RefreshCw, className: `${base} border-primary/40 text-primary` };
  const cancel: Btn = { action: 'cancel', label: 'Cancelar', icon: XCircle, className: `${base} border-danger/40 text-danger`, confirm: 'Cancelar este contrato? O acesso do cliente será suspenso.', askReason: true };
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

export function ContractLifecycle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  const run = (btn: Btn) => {
    if (btn.confirm && !window.confirm(btn.confirm)) return;
    let reason: string | undefined;
    if (btn.askReason) {
      const r = window.prompt('Motivo / observação (opcional):') ?? '';
      reason = r.trim() || undefined;
    }
    let keepEndDate: boolean | undefined;
    if (btn.askKeepEnd) {
      keepEndDate = window.confirm('Manter a data de término original?\n\nOK = manter · Cancelar = gerar novo período pelos dias restantes/duração.');
    }
    setError('');
    start(async () => {
      const res = await adminContractAction(id, btn.action, { reason, keepEndDate });
      if (res.error) setError(res.error);
      else router.refresh();
    });
  };

  const btns = buttonsFor(status);
  if (!btns.length) return null;

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
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
